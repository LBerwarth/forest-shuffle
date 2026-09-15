-- Renaming a player must reach their game history.
--
-- game_players.player_name is a denormalized copy taken at save time (history
-- survives profile deletion, migration 007). History, leaderboard stats and the
-- Hall of Fame all read that copy, so fixing a typo on the profile alone would
-- leave the old spelling everywhere it is actually shown. Mirror the new name
-- onto every game row still linked to the profile. Rows already detached
-- (player_id null, profile deleted) keep the name they were saved with.

create or replace function public.sync_game_player_name()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update game_players
     set player_name = new.name
   where player_id = new.id
     and player_name is distinct from new.name;
  return new;
end;
$$;

drop trigger if exists trg_profiles_sync_game_player_name on profiles;
create trigger trg_profiles_sync_game_player_name
  after update of name on profiles
  for each row
  when (old.name is distinct from new.name)
  execute function public.sync_game_player_name();
