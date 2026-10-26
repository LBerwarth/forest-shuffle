-- Public score statistics for the /stats page: aggregates only, no names.
-- Groups under 30 games are left out: their averages are noise.

create or replace function public.score_stats()
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
with implausible_games as (
  select distinct gp.game_id
  from game_players gp
  where gp.total_score > 1000
),
filtered_games as (
  select g.id, coalesce(g.edition, 'classic') as edition, g.player_count
  from games g
  where not exists (select 1 from implausible_games ig where ig.game_id = g.id)
),
scores as (
  -- a zero total is an empty or abandoned entry, not a played forest
  select gp.game_id, gp.total_score, fg.edition, fg.player_count,
    row_number() over (partition by gp.game_id order by gp.total_score desc) = 1 as is_top
  from game_players gp
  join filtered_games fg on fg.id = gp.game_id
  where gp.total_score > 0
),
buckets as (
  select jsonb_agg(jsonb_build_object('from', b.lo, 'count', b.n) order by b.lo) as j
  from (
    select (total_score / 50) * 50 as lo, count(*)::int as n
    from scores
    group by 1
  ) b
),
by_edition as (
  select jsonb_agg(jsonb_build_object(
    'edition', e.edition, 'games', e.games, 'avg', e.avg
  ) order by e.games desc) as j
  from (
    select edition, count(distinct game_id)::int as games, round(avg(total_score))::int as avg
    from scores
    group by edition
    having count(distinct game_id) >= 30
  ) e
),
by_player_count as (
  select jsonb_agg(jsonb_build_object(
    'players', p.player_count, 'games', p.games, 'avg', p.avg, 'avg_top', p.avg_top
  ) order by p.player_count) as j
  from (
    select
      player_count,
      count(distinct game_id)::int as games,
      round(avg(total_score))::int as avg,
      round(avg(total_score) filter (where is_top))::int as avg_top
    from scores
    group by player_count
    having count(distinct game_id) >= 30
  ) p
),
top_cards as (
  -- same exclusions as the Hall of Fame card meta: no cave, no wildcards
  select jsonb_agg(jsonb_build_object('card_key', c.card_key, 'appearances', c.n) order by c.n desc) as j
  from (
    select se.card_key, count(*)::int as n
    from score_entries se
    join game_players gp on gp.id = se.game_player_id
    join filtered_games fg on fg.id = gp.game_id
    where se.card_category <> 'cave'
      and se.card_key not like '\_%'
      and se.card_key not like 'universal\_%'
    group by se.card_key
    order by n desc
    limit 10
  ) c
)
select jsonb_build_object(
  'total_games', (select count(distinct game_id) from scores),
  'total_scores', (select count(*) from scores),
  'avg', (select round(avg(total_score)) from scores),
  'median', (select percentile_disc(0.5) within group (order by total_score) from scores),
  'p90', (select percentile_disc(0.9) within group (order by total_score) from scores),
  'max', (select max(total_score) from scores),
  'pct_over_300', (select round(100.0 * count(*) filter (where total_score > 300) / nullif(count(*), 0)) from scores),
  'buckets', coalesce((select j from buckets), '[]'::jsonb),
  'by_edition', coalesce((select j from by_edition), '[]'::jsonb),
  'by_player_count', coalesce((select j from by_player_count), '[]'::jsonb),
  'top_cards', coalesce((select j from top_cards), '[]'::jsonb)
);
$$;

grant execute on function public.score_stats() to anon, authenticated;
