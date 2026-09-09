-- Clients released before the tie-aware Hall of Fame read top_game.player_name
-- and top_card.player_name, which 013 replaced with a names array. Installed
-- PWAs keep serving that older bundle for a while, so keep emitting a single
-- player_name alongside the array.

create or replace function public.hof_holders(p_names text[])
returns jsonb
language sql
immutable
set search_path = public
as $$
with distinct_names as (
  select distinct trim(n) as n
  from unnest(coalesce(p_names, '{}'::text[])) as n
  where coalesce(trim(n), '') <> ''
),
shown as (
  select n from distinct_names order by n limit 3
)
select jsonb_build_object(
  'names', coalesce((select jsonb_agg(n order by n) from shown), '[]'::jsonb),
  'holders', (select count(*) from distinct_names),
  'player_name', (select n from shown limit 1)
);
$$;

grant execute on function public.hof_holders(text[]) to anon, authenticated;
