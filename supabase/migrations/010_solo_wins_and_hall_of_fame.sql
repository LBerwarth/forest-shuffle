-- Solo games have no winner: rank 1 is guaranteed for a lone player, so
-- is_winner=true on solo rows inflated wins, win rates and streaks.
update game_players gp
set is_winner = false
from games g
where g.id = gp.game_id
  and g.player_count = 1
  and gp.is_winner;

-- Hall of Fame aggregates, computed server-side over the full dataset.
-- Replaces the client-side aggregation over the top-500-by-score rows, whose
-- counts ("games/players worldwide") were sample-based and therefore wrong.
create or replace function public.hall_of_fame(
  p_player_count int default null,  -- exact player count (1 = solo); null = no constraint
  p_group boolean default false,    -- true = any multiplayer game (overrides p_player_count)
  p_edition text default null       -- 'classic' | 'dartmoor'; null = all editions
)
returns jsonb
language sql
stable
security invoker
set search_path = public
as $$
with filtered_games as (
  select g.id, g.played_at
  from games g
  where (p_edition is null or coalesce(g.edition, 'classic') = p_edition)
    and (
      (p_group and g.player_count >= 2)
      or (not p_group and (p_player_count is null or g.player_count = p_player_count))
    )
),
filtered_players as (
  select gp.id, gp.player_id, gp.player_name, gp.total_score, fg.played_at
  from game_players gp
  join filtered_games fg on fg.id = gp.game_id
)
select jsonb_build_object(
  'total_games', (select count(*) from filtered_games),
  'total_players', (
    select count(distinct player_id) from filtered_players where player_id is not null
  ),
  'top_game', (
    select to_jsonb(t) from (
      select player_name, total_score, played_at
      from filtered_players
      order by total_score desc, played_at asc
      limit 1
    ) t
  ),
  'top_card', (
    -- legacy synthetic aggregate entries ("_bat_set", ...) are not real cards
    select to_jsonb(t) from (
      select fp.player_name, se.card_key, se.points, fp.played_at
      from score_entries se
      join filtered_players fp on fp.id = se.game_player_id
      where se.card_key not like '\_%' and se.points > 0
      order by se.points desc, fp.played_at asc
      limit 1
    ) t
  )
);
$$;

-- New Supabase projects no longer auto-grant to the Data API roles.
grant execute on function public.hall_of_fame(int, boolean, text) to anon, authenticated;
