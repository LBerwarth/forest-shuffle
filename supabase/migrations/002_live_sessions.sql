-- ─── Live Sessions ──────────────────────────────────────────────────────────

create type live_session_status as enum ('waiting', 'scoring', 'completed');
create type live_player_status  as enum ('joined', 'scoring', 'done');

create table live_sessions (
  id              uuid primary key default gen_random_uuid(),
  code            text not null unique,
  edition         text not null default 'classic',
  expansions      jsonb not null default '["base"]'::jsonb,
  status          live_session_status not null default 'waiting',
  host_player_id  uuid not null,
  created_at      timestamptz not null default now()
);

create table live_session_players (
  id                    uuid primary key default gen_random_uuid(),
  session_id            uuid not null references live_sessions(id) on delete cascade,
  player_id             uuid not null,
  player_name           text not null,
  status                live_player_status not null default 'joined',
  card_counts           jsonb not null default '{}'::jsonb,
  card_metadata         jsonb not null default '{}'::jsonb,
  fully_occupied_trees  int not null default 0,
  submitted_at          timestamptz
);

create index idx_live_session_players_session on live_session_players(session_id);
create index idx_live_sessions_code on live_sessions(code);

-- ─── RLS ────────────────────────────────────────────────────────────────────

alter table live_sessions enable row level security;
alter table live_session_players enable row level security;

create policy "Allow all on live_sessions" on live_sessions
  for all using (true) with check (true);

create policy "Allow all on live_session_players" on live_session_players
  for all using (true) with check (true);

-- ─── Realtime ───────────────────────────────────────────────────────────────

alter publication supabase_realtime add table live_sessions;
alter publication supabase_realtime add table live_session_players;
