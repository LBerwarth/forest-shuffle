-- Adds a games-scored-today count to usage_stats.

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
    count(*) filter (where played_at >= date_trunc('day', now() at time zone 'utc') at time zone 'utc') as today,
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
  'today', today,
  'week', week,
  'month', month,
  'year', year,
  'total', total
) order by total desc, edition, expansions), '[]'::jsonb)
from counts;
$$;

grant execute on function public.usage_stats(jsonb) to anon, authenticated;
