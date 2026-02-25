-- Forest Shuffle Companion - Database Schema

-- Players / Profiles
create table if not exists profiles (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  color text not null default '#4a7c59',
  created_at timestamptz not null default now()
);

-- Games
create table if not exists games (
  id uuid primary key default gen_random_uuid(),
  played_at timestamptz not null default now(),
  player_count int not null,
  notes text
);

-- Game-player associations with scores
create table if not exists game_players (
  id uuid primary key default gen_random_uuid(),
  game_id uuid not null references games(id) on delete cascade,
  player_id uuid not null references profiles(id) on delete cascade,
  total_score int not null default 0,
  rank int not null default 0,
  is_winner boolean not null default false,
  score_breakdown jsonb
);

create index if not exists idx_game_players_game_id on game_players(game_id);
create index if not exists idx_game_players_player_id on game_players(player_id);

-- Normalized score entries for analytics
create table if not exists score_entries (
  id uuid primary key default gen_random_uuid(),
  game_player_id uuid not null references game_players(id) on delete cascade,
  card_key text not null,
  card_category text not null,
  count int not null default 0,
  points int not null default 0
);

create index if not exists idx_score_entries_game_player on score_entries(game_player_id);

-- Leaderboard view
create or replace view leaderboard as
select
  p.id as player_id,
  p.name,
  p.color,
  count(distinct gp.game_id) as games_played,
  count(distinct case when gp.is_winner then gp.game_id end) as wins,
  round(avg(gp.total_score)) as avg_score,
  max(gp.total_score) as best_score,
  case
    when count(distinct gp.game_id) > 0
    then round(count(distinct case when gp.is_winner then gp.game_id end)::numeric / count(distinct gp.game_id) * 100)
    else 0
  end as win_rate
from profiles p
left join game_players gp on gp.player_id = p.id
group by p.id, p.name, p.color;

-- Player strategy view (avg points by card category)
create or replace view player_strategy as
select
  gp.player_id,
  se.card_category,
  round(avg(se.points)) as avg_points,
  sum(se.points) as total_points,
  count(*) as times_played
from score_entries se
join game_players gp on gp.id = se.game_player_id
group by gp.player_id, se.card_category;

-- RLS: permissive anonymous access for MVP
alter table profiles enable row level security;
alter table games enable row level security;
alter table game_players enable row level security;
alter table score_entries enable row level security;

create policy "Allow all on profiles" on profiles for all using (true) with check (true);
create policy "Allow all on games" on games for all using (true) with check (true);
create policy "Allow all on game_players" on game_players for all using (true) with check (true);
create policy "Allow all on score_entries" on score_entries for all using (true) with check (true);
