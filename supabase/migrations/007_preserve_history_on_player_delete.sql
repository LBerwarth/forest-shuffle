-- Stop deleting a player from wiping their game history.
--
-- game_players.player_id was declared ON DELETE CASCADE (migration 001), so
-- deleting a profile silently removed that player from every past game — the
-- cause of the "3-player game shows 2" rows. Since game_players already stores
-- player_name and the full score_breakdown, the historical record does not need
-- the profile to survive. Switch the FK to ON DELETE SET NULL: deleting a player
-- now leaves their game rows intact (still shown in history) and only removes
-- them from the leaderboard/stats, which join through profiles.

alter table game_players alter column player_id drop not null;

alter table game_players drop constraint game_players_player_id_fkey;

alter table game_players
  add constraint game_players_player_id_fkey
  foreign key (player_id) references profiles(id) on delete set null;
