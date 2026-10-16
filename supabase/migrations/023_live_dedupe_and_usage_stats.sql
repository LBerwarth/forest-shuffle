-- Live sessions are saved once per device. live_session_id ties those copies
-- together so global stats count the game once; usage_stats feeds the public
-- games-per-version table.

alter table public.games add column if not exists live_session_id uuid;
create index if not exists idx_games_live_session_id on public.games(live_session_id);

-- Copies saved before this column existed: same edition and players/scores,
-- saved within 10 minutes of each other.
with sig as (
  select
    g.id,
    g.played_at,
    coalesce(g.edition, 'classic') as edition,
    string_agg(gp.player_name || ':' || gp.total_score, ',' order by gp.player_name, gp.total_score) as players
  from public.games g
  join public.game_players gp on gp.game_id = g.id
  where g.live_session_id is null
  group by g.id
),
gaps as (
  select
    sig.*,
    case
      when played_at - lag(played_at) over w <= interval '10 minutes' then 0
      else 1
    end as starts_group
  from sig
  window w as (partition by edition, players order by played_at, id)
),
grouped as (
  select
    gaps.*,
    sum(starts_group) over (partition by edition, players order by played_at, id) as grp
  from gaps
),
roots as (
  select
    id,
    first_value(id) over (partition by edition, players, grp order by played_at, id) as root,
    count(*) over (partition by edition, players, grp) as copies
  from grouped
)
update public.games g
set live_session_id = r.root
from roots r
where g.id = r.id and r.copies > 1;

create or replace function public.usage_stats(
  p_expansion_cards jsonb default '{}'::jsonb  -- {edition: {expansion: [card_key, ...]}}
)
returns jsonb
language sql
stable
security invoker
set search_path = public
as $$
with unique_games as (
  select distinct on (coalesce(g.live_session_id, g.id))
    g.id,
    g.played_at,
    coalesce(g.edition, 'classic') as edition
  from games g
  order by coalesce(g.live_session_id, g.id), g.played_at
),
stored as (
  -- expansions chosen in the wizard, saved since 1.0.15
  select distinct on (gp.game_id)
    gp.game_id,
    array(
      select e from jsonb_array_elements_text(gp.score_breakdown -> 'input' -> 'expansions') e
      where e not in ('base', 'dartmoor_base', 'smoky_base')
      order by e
    ) as expansions
  from game_players gp
  join unique_games ug on ug.id = gp.game_id
  where jsonb_typeof(gp.score_breakdown -> 'input' -> 'expansions') = 'array'
),
inferred as (
  -- older games: an expansion counts as played when any of its cards was scored
  select ug.id as game_id, array_agg(distinct x.key order by x.key) as expansions
  from unique_games ug
  join game_players gp on gp.game_id = ug.id
  join score_entries se on se.game_player_id = gp.id
  join lateral jsonb_each(coalesce(p_expansion_cards -> ug.edition, '{}'::jsonb)) x(key, cards)
    on x.cards ? se.card_key
  group by ug.id
),
versions as (
  select
    ug.edition,
    coalesce(s.expansions, i.expansions, '{}'::text[]) as expansions,
    ug.played_at
  from unique_games ug
  left join stored s on s.game_id = ug.id
  left join inferred i on i.game_id = ug.id
),
counts as (
  select
    edition,
    expansions,
    count(*) filter (where played_at >= date_trunc('week', now() at time zone 'utc') at time zone 'utc') as week,
    count(*) filter (where played_at >= date_trunc('month', now() at time zone 'utc') at time zone 'utc') as month,
    count(*) filter (where played_at >= date_trunc('year', now() at time zone 'utc') at time zone 'utc') as year,
    count(*) as total
  from versions
  group by edition, expansions
)
select coalesce(jsonb_agg(jsonb_build_object(
  'edition', edition,
  'expansions', to_jsonb(expansions),
  'week', week,
  'month', month,
  'year', year,
  'total', total
) order by total desc, edition, expansions), '[]'::jsonb)
from counts;
$$;

grant execute on function public.usage_stats(jsonb) to anon, authenticated;

-- Hall of Fame: unchanged from 022 except live-session copies count once.

create or replace function public.hall_of_fame(
  p_player_count int default null,   -- exact player count (1 = solo); null = no constraint
  p_group boolean default false,     -- true = any multiplayer game (overrides p_player_count)
  p_edition text default null,       -- 'classic' | 'dartmoor' | 'smoky'; null = all editions
  p_since timestamptz default null,  -- window start; null = all-time
  p_my_score int default null,       -- caller's best score, for the percentile
  p_device_id text default null      -- matches legacy games not yet claimed by an account
)
returns jsonb
language sql
stable
security invoker
set search_path = public
as $$
with implausible_games as (
  -- Scores this far above the tail are data-entry practice, not games. The
  -- whole game goes, so its table total and win margin don't survive either.
  select distinct gp.game_id
  from game_players gp
  where gp.total_score > 1000
),
filtered_games as (
  -- every device in a live session saves its own copy; count the game once
  select distinct on (coalesce(g.live_session_id, g.id))
    g.id,
    g.played_at,
    g.user_id,
    g.device_id,
    coalesce(
      (g.user_id is not null and g.user_id = auth.uid())
        or (p_device_id is not null and g.device_id = p_device_id),
      false
    ) as is_mine
  from games g
  where not exists (select 1 from implausible_games ig where ig.game_id = g.id)
    and (p_edition is null or coalesce(g.edition, 'classic') = p_edition)
    and (p_since is null or g.played_at >= p_since)
    and (
      (p_group and g.player_count >= 2)
      or (not p_group and (p_player_count is null or g.player_count = p_player_count))
    )
  order by
    coalesce(g.live_session_id, g.id),
    ((g.user_id is not null and g.user_id = auth.uid())
      or (p_device_id is not null and g.device_id = p_device_id)) desc nulls last,
    g.played_at
),
device_owners as (
  -- an account that has claimed one game on a device owns that device's older,
  -- still unclaimed rows too, so they count as the same player
  select g.device_id, min(g.user_id::text) as owner
  from games g
  where g.device_id is not null and g.user_id is not null
  group by g.device_id
),
filtered_players as (
  select
    gp.id,
    gp.game_id,
    gp.player_name,
    gp.total_score,
    fg.played_at,
    fg.is_mine,
    fg.user_id,
    fg.device_id
  from game_players gp
  join filtered_games fg on fg.id = gp.game_id
),
entries as (
  -- legacy synthetic aggregate entries ("_bat_set", ...) are not real cards
  select
    se.card_key,
    se.card_category,
    se.count as card_count,
    se.points,
    fp.id as game_player_id,
    fp.player_name,
    fp.played_at,
    fp.is_mine
  from score_entries se
  join filtered_players fp on fp.id = se.game_player_id
  where se.card_key not like '\_%'
),
scores_ranked as (
  select distinct fp.total_score
  from filtered_players fp
  order by fp.total_score desc
  limit 3
),
top_game_top as (
  -- players tied on a score share one line, so three lines can name more
  -- than three people rather than cutting a tie in half
  select jsonb_agg(x.j order by x.total_score desc) as j
  from (
    select
      fp.total_score,
      public.hof_holders(array_agg(fp.player_name)) || jsonb_build_object(
        'total_score', fp.total_score,
        'played_at', min(fp.played_at),
        'is_mine', bool_or(fp.is_mine)
      ) as j
    from filtered_players fp
    join scores_ranked sr on sr.total_score = fp.total_score
    group by fp.total_score
  ) x
),
top_game as (
  select public.hof_holders(array_agg(fp.player_name)) || jsonb_build_object(
    'total_score', max(fp.total_score),
    'played_at', min(fp.played_at),
    'is_mine', bool_or(fp.is_mine)
  ) as j
  from filtered_players fp
  where fp.total_score = (select max(total_score) from filtered_players)
  having count(*) > 0
),
table_totals as (
  select
    fp.game_id,
    sum(fp.total_score)::int as total,
    min(fp.played_at) as played_at,
    bool_or(fp.is_mine) as is_mine,
    count(*)::int as players
  from filtered_players fp
  group by fp.game_id
),
top_table_top as (
  select jsonb_agg(x.j order by x.total desc, x.played_at asc) as j
  from (
    select
      tt.total,
      tt.played_at,
      jsonb_build_object(
        'total_score', tt.total,
        'players', tt.players,
        'played_at', tt.played_at,
        'is_mine', tt.is_mine
      ) as j
    from table_totals tt
    order by tt.total desc, tt.played_at asc
    limit 3
  ) x
),
top_table as (
  select jsonb_build_object(
    'total_score', tt.total,
    'players', tt.players,
    'played_at', tt.played_at,
    'is_mine', tt.is_mine
  ) as j
  from table_totals tt
  order by tt.total desc, tt.played_at asc
  limit 1
),
ranked as (
  select
    fp.game_id,
    fp.player_name,
    fp.played_at,
    fp.is_mine,
    row_number() over (partition by fp.game_id order by fp.total_score desc) as rn,
    fp.total_score
      - lead(fp.total_score) over (partition by fp.game_id order by fp.total_score desc) as margin
  from filtered_players fp
),
margins_ranked as (
  select distinct r.margin
  from ranked r
  where r.rn = 1 and r.margin > 0
  order by r.margin desc
  limit 3
),
top_margin_top as (
  select jsonb_agg(x.j order by x.margin desc) as j
  from (
    select
      r.margin,
      public.hof_holders(array_agg(r.player_name)) || jsonb_build_object(
        'margin', r.margin,
        'played_at', min(r.played_at),
        'is_mine', bool_or(r.is_mine)
      ) as j
    from ranked r
    join margins_ranked mr on mr.margin = r.margin
    where r.rn = 1
    group by r.margin
  ) x
),
top_margin as (
  select public.hof_holders(array_agg(r.player_name)) || jsonb_build_object(
    'margin', max(r.margin),
    'played_at', min(r.played_at),
    'is_mine', bool_or(r.is_mine)
  ) as j
  from ranked r
  where r.rn = 1
    and r.margin > 0
    and r.margin = (select max(margin) from ranked where rn = 1)
  having count(*) > 0
),
card_picks as (
  -- the same card at two different scores is two records, so the ranking is
  -- over card and score together rather than over the score alone
  select e.card_key, e.points, min(e.played_at) as first_at
  from entries e
  where e.points > 0
  group by e.card_key, e.points
  order by e.points desc, first_at asc
  limit 3
),
top_card_top as (
  select jsonb_agg(x.j order by x.points desc, x.first_at asc) as j
  from (
    select
      p.points,
      p.first_at,
      public.hof_holders(array_agg(e.player_name)) || jsonb_build_object(
        'card_key', p.card_key,
        'points', p.points,
        'played_at', min(e.played_at),
        'is_mine', bool_or(e.is_mine)
      ) as j
    from card_picks p
    join entries e on e.card_key = p.card_key and e.points = p.points
    group by p.card_key, p.points, p.first_at
  ) x
),
top_card_pick as (
  select e.card_key, e.points
  from entries e
  where e.points > 0
  order by e.points desc, e.played_at asc
  limit 1
),
top_card as (
  select public.hof_holders(array_agg(e.player_name)) || jsonb_build_object(
    'card_key', p.card_key,
    'points', p.points,
    'played_at', min(e.played_at),
    'is_mine', bool_or(e.is_mine)
  ) as j
  from top_card_pick p
  join entries e on e.card_key = p.card_key and e.points = p.points
  group by p.card_key, p.points
),
category_pick as (
  select distinct on (e.card_category) e.card_category, e.card_key, e.points
  from entries e
  where e.points > 0
  order by e.card_category, e.points desc, e.played_at asc
),
category_picks as (
  select
    g.card_category,
    g.card_key,
    g.points,
    row_number() over (
      partition by g.card_category order by g.points desc, g.first_at asc
    ) as rn
  from (
    -- the same card at two different scores is two records, so the ranking is
    -- over card and score together rather than over the score alone
    select e.card_category, e.card_key, e.points, min(e.played_at) as first_at
    from entries e
    where e.points > 0
    group by e.card_category, e.card_key, e.points
  ) g
),
category_bests_top as (
  select jsonb_agg(x.j order by x.card_category, x.rn) as j
  from (
    select
      cp.card_category,
      cp.rn,
      public.hof_holders(array_agg(e.player_name)) || jsonb_build_object(
        'card_category', cp.card_category,
        'card_key', cp.card_key,
        'points', cp.points,
        'played_at', min(e.played_at),
        'is_mine', bool_or(e.is_mine)
      ) as j
    from category_picks cp
    join entries e
      on e.card_category = cp.card_category
     and e.card_key = cp.card_key
     and e.points = cp.points
    where cp.rn <= 3
    group by cp.card_category, cp.card_key, cp.points, cp.rn
  ) x
),
category_bests as (
  select jsonb_agg(x.j order by x.card_category) as j
  from (
    select
      cp.card_category,
      public.hof_holders(array_agg(e.player_name)) || jsonb_build_object(
        'card_category', cp.card_category,
        'card_key', cp.card_key,
        'points', cp.points,
        'played_at', min(e.played_at),
        'is_mine', bool_or(e.is_mine)
      ) as j
    from category_pick cp
    join entries e
      on e.card_category = cp.card_category
     and e.card_key = cp.card_key
     and e.points = cp.points
    group by cp.card_category, cp.card_key, cp.points
  ) x
),
forests as (
  select
    e.game_player_id,
    min(e.player_name) as player_name,
    min(e.played_at) as played_at,
    bool_or(e.is_mine) as is_mine,
    sum(e.card_count)::int as cards
  from entries e
  group by e.game_player_id
),
forests_ranked as (
  select distinct f.cards
  from forests f
  where f.cards > 0
  order by f.cards desc
  limit 3
),
top_forest_top as (
  select jsonb_agg(x.j order by x.cards desc) as j
  from (
    select
      f.cards,
      public.hof_holders(array_agg(f.player_name)) || jsonb_build_object(
        'cards', f.cards,
        'played_at', min(f.played_at),
        'is_mine', bool_or(f.is_mine)
      ) as j
    from forests f
    join forests_ranked fr on fr.cards = f.cards
    group by f.cards
  ) x
),
top_forest as (
  select public.hof_holders(array_agg(f.player_name)) || jsonb_build_object(
    'cards', max(f.cards),
    'played_at', min(f.played_at),
    'is_mine', bool_or(f.is_mine)
  ) as j
  from forests f
  where f.cards = (select max(cards) from forests) and f.cards > 0
  having count(*) > 0
),
card_plays as (
  -- Ranked by the number of player-games a card turns up in, not by summed
  -- counts: for a cave card the count is how many cards are stored in the
  -- cave, so summing it dwarfs every real card. The cave itself is the pile
  -- rather than a card you play, so it stays out of the card meta entirely.
  select
    e.card_key,
    count(*)::int as appearances,
    sum(e.card_count)::int as plays,
    round(sum(e.points)::numeric / count(*), 1) as avg_points
  from entries e
  where e.card_category <> 'cave'
    -- the universal moor and river are wildcards standing in for a category,
    -- so they are logged constantly while scoring nothing
    and e.card_key not like 'universal\_%'
  group by e.card_key
),
player_games as (
  -- same identity rule as total_players: one account (or device) plus one name
  select
    coalesce(fp.user_id::text, dow.owner, fp.device_id, fp.game_id::text)
      || '|' || lower(trim(fp.player_name)) as player_key,
    min(trim(fp.player_name)) as player_name,
    count(distinct fp.game_id)::int as games,
    max(fp.played_at) as played_at,
    bool_or(fp.is_mine) as is_mine
  from filtered_players fp
  left join device_owners dow on dow.device_id = fp.device_id
  where coalesce(trim(fp.player_name), '') <> ''
  group by 1
),
games_ranked as (
  select distinct pg.games
  from player_games pg
  where pg.games > 1
  order by pg.games desc
  limit 3
),
most_games_top as (
  -- players tied on a count share one line, so three lines can name more
  -- than three people rather than cutting a tie in half
  select jsonb_agg(x.j order by x.games desc) as j
  from (
    select
      pg.games,
      public.hof_holders(array_agg(pg.player_name)) || jsonb_build_object(
        'games', pg.games,
        'played_at', max(pg.played_at),
        'is_mine', bool_or(pg.is_mine)
      ) as j
    from player_games pg
    join games_ranked gr on gr.games = pg.games
    group by pg.games
  ) x
),
most_games as (
  select public.hof_holders(array_agg(pg.player_name)) || jsonb_build_object(
    'games', max(pg.games),
    'played_at', max(pg.played_at),
    'is_mine', bool_or(pg.is_mine)
  ) as j
  from player_games pg
  where pg.games = (select max(games) from player_games)
    -- everyone ties at one game before anyone has a streak; not a record yet
    and pg.games > 1
  having count(*) > 0
),
me as (
  select jsonb_build_object(
    'best_score', p_my_score,
    'rank', 1 + count(*) filter (where fp.total_score > p_my_score),
    'total', count(*),
    'better_than_pct',
      round(100.0 * count(*) filter (where fp.total_score < p_my_score) / count(*))
  ) as j
  from filtered_players fp
  where p_my_score is not null
  having count(*) > 0
)
select jsonb_build_object(
  'since', p_since,
  'total_games', (select count(*) from filtered_games),
  'total_players', (
    -- profiles are per device, so the same name within one account counts once
    -- rather than once per device profile row.
    select count(distinct
      coalesce(fp.user_id::text, dow.owner, fp.device_id, fp.game_id::text)
      || '|' || lower(trim(fp.player_name)))
    from filtered_players fp
    left join device_owners dow on dow.device_id = fp.device_id
    where coalesce(trim(fp.player_name), '') <> ''
  ),
  'me', (select j from me),
  'top_game', (select j from top_game),
  'top_game_top', coalesce((select j from top_game_top), '[]'::jsonb),
  'top_table', (select j from top_table),
  'top_table_top', coalesce((select j from top_table_top), '[]'::jsonb),
  'top_card', (select j from top_card),
  'top_card_top', coalesce((select j from top_card_top), '[]'::jsonb),
  'top_margin', (select j from top_margin),
  'top_margin_top', coalesce((select j from top_margin_top), '[]'::jsonb),
  'top_forest', (select j from top_forest),
  'top_forest_top', coalesce((select j from top_forest_top), '[]'::jsonb),
  'most_games', (select j from most_games),
  'most_games_top', coalesce((select j from most_games_top), '[]'::jsonb),
  'category_bests', coalesce((select j from category_bests), '[]'::jsonb),
  'category_bests_top', coalesce((select j from category_bests_top), '[]'::jsonb),
  'card_meta', jsonb_build_object(
    'most_played', (
      select jsonb_build_object(
        'card_key', card_key, 'appearances', appearances, 'plays', plays
      )
      from card_plays order by appearances desc, card_key limit 1
    ),
    'most_played_top', coalesce((
      select jsonb_agg(t.j order by t.appearances desc, t.card_key)
      from (
        select
          card_key,
          appearances,
          jsonb_build_object(
            'card_key', card_key, 'appearances', appearances, 'plays', plays
          ) as j
        from card_plays order by appearances desc, card_key limit 3
      ) t
    ), '[]'::jsonb),
    'best_average', (
      -- a minimum play count keeps one lucky high-scoring card out of the slot
      select jsonb_build_object('card_key', card_key, 'avg_points', avg_points, 'appearances', appearances)
      from card_plays where appearances >= 10 order by avg_points desc, card_key limit 1
    ),
    'best_average_top', coalesce((
      select jsonb_agg(t.j order by t.avg_points desc, t.card_key)
      from (
        select
          card_key,
          avg_points,
          jsonb_build_object(
            'card_key', card_key, 'avg_points', avg_points, 'appearances', appearances
          ) as j
        from card_plays where appearances >= 10 order by avg_points desc, card_key limit 3
      ) t
    ), '[]'::jsonb)
  )
);
$$;

grant execute on function public.hall_of_fame(int, boolean, text, timestamptz, int, text) to anon, authenticated;
