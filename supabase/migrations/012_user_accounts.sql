-- Optional accounts.
--
-- Every device signs in anonymously (Supabase Auth) on first launch, so each
-- device owns an auth.users row. Data moves from device_id scoping to user_id
-- scoping; an e-mail can be linked to the anonymous user later, which changes
-- nothing on the data side because the uid stays the same. Restoring on a new
-- phone signs into the existing user and merges the new phone's anonymous rows.
--
-- RLS stays permissive in this phase so outdated clients keep working. Tighten
-- to user_id = auth.uid() in a follow-up once they have updated.

alter table profiles add column if not exists user_id uuid references auth.users(id) on delete cascade;
alter table games    add column if not exists user_id uuid references auth.users(id) on delete cascade;

create index if not exists idx_profiles_user_id on profiles(user_id);
create index if not exists idx_games_user_id on games(user_id);

-- One profile per (normalized name, account). Replaces the per-device index:
-- after a sign-out the same device hosts a fresh account whose players may
-- legitimately reuse the names of the previous one.
create unique index if not exists uq_profiles_name_user
  on profiles (lower(trim(name)), user_id)
  where user_id is not null;
drop index if exists uq_profiles_name_device;

grant select, insert, update, delete on
  profiles, games, game_players, score_entries, live_sessions, live_session_players
  to authenticated;
grant insert on feedback to authenticated;

-- ─── Default owner ──────────────────────────────────────────────────────────

create or replace function public.set_row_user_id()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.user_id is null then
    new.user_id := auth.uid();
  end if;
  return new;
end;
$$;

drop trigger if exists trg_profiles_user_id on profiles;
create trigger trg_profiles_user_id
  before insert on profiles
  for each row execute function public.set_row_user_id();

drop trigger if exists trg_games_user_id on games;
create trigger trg_games_user_id
  before insert on games
  for each row execute function public.set_row_user_id();

-- ─── Ownership transfer helper ──────────────────────────────────────────────
-- Moves the given profiles to p_target. A profile whose normalized name already
-- exists at the target is folded into that one (game rows re-pointed, duplicate
-- deleted) so uq_profiles_name_user holds.

create or replace function public.absorb_profiles(p_target uuid, p_source_ids uuid[])
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_target is null or coalesce(array_length(p_source_ids, 1), 0) = 0 then
    return;
  end if;

  update game_players gp
     set player_id = tgt.id
    from profiles src
    join profiles tgt
      on tgt.user_id = p_target
     and tgt.id <> src.id
     and lower(trim(tgt.name)) = lower(trim(src.name))
   where src.id = any(p_source_ids)
     and gp.player_id = src.id;

  update live_session_players lsp
     set player_id = tgt.id
    from profiles src
    join profiles tgt
      on tgt.user_id = p_target
     and tgt.id <> src.id
     and lower(trim(tgt.name)) = lower(trim(src.name))
   where src.id = any(p_source_ids)
     and lsp.player_id = src.id;

  delete from profiles src
   using profiles tgt
   where src.id = any(p_source_ids)
     and tgt.user_id = p_target
     and tgt.id <> src.id
     and lower(trim(tgt.name)) = lower(trim(src.name));

  update profiles
     set user_id = p_target
   where id = any(p_source_ids);
end;
$$;

revoke all on function public.absorb_profiles(uuid, uuid[]) from public, anon, authenticated;

-- ─── Claim legacy device rows ───────────────────────────────────────────────
-- Called on every launch. Tags rows written before accounts existed (or by an
-- outdated client) with the caller's uid. The user_id IS NULL guard makes each
-- row claimable once. device_id is a 122-bit random value known only to the
-- device that generated it.

create or replace function public.claim_device_data(p_device_id text)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid   uuid := auth.uid();
  v_ids   uuid[];
  v_games integer;
begin
  if v_uid is null or coalesce(p_device_id, '') = '' then
    return 0;
  end if;

  update games
     set user_id = v_uid
   where device_id = p_device_id
     and user_id is null;
  get diagnostics v_games = row_count;

  select coalesce(array_agg(id), '{}')
    into v_ids
    from profiles
   where device_id = p_device_id
     and user_id is null;
  perform public.absorb_profiles(v_uid, v_ids);

  return v_games + coalesce(array_length(v_ids, 1), 0);
end;
$$;

grant execute on function public.claim_device_data(text) to authenticated;

-- ─── Merge an anonymous user into an e-mail account ─────────────────────────
-- Restore flow on a device that already has anonymous data: the anonymous
-- session stages a token, the client signs into the e-mail account, then the
-- e-mail account redeems the token. Tokens are only reachable through these
-- two functions.

create table if not exists account_merges (
  token       uuid primary key default gen_random_uuid(),
  source_user uuid not null references auth.users(id) on delete cascade,
  created_at  timestamptz not null default now()
);

alter table account_merges enable row level security;
revoke all on account_merges from public, anon, authenticated;

create or replace function public.stage_account_merge()
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_token uuid;
begin
  if auth.uid() is null then
    raise exception 'not signed in';
  end if;
  if not coalesce((auth.jwt() ->> 'is_anonymous')::boolean, false) then
    raise exception 'only anonymous sessions can be merged';
  end if;

  delete from account_merges where source_user = auth.uid();
  insert into account_merges (source_user)
  values (auth.uid())
  returning token into v_token;
  return v_token;
end;
$$;

grant execute on function public.stage_account_merge() to authenticated;

create or replace function public.complete_account_merge(p_token uuid)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_target uuid := auth.uid();
  v_source uuid;
  v_ids    uuid[];
  v_games  integer;
begin
  if v_target is null then
    raise exception 'not signed in';
  end if;
  if coalesce((auth.jwt() ->> 'is_anonymous')::boolean, false) then
    raise exception 'target must be a permanent account';
  end if;

  select source_user
    into v_source
    from account_merges
   where token = p_token
     and created_at > now() - interval '30 minutes';
  if v_source is null then
    raise exception 'merge token invalid or expired';
  end if;
  delete from account_merges where token = p_token;
  if v_source = v_target then
    return 0;
  end if;

  update games
     set user_id = v_target
   where user_id = v_source;
  get diagnostics v_games = row_count;

  select coalesce(array_agg(id), '{}')
    into v_ids
    from profiles
   where user_id = v_source;
  perform public.absorb_profiles(v_target, v_ids);

  delete from auth.users
   where id = v_source
     and is_anonymous;

  return v_games + coalesce(array_length(v_ids, 1), 0);
end;
$$;

grant execute on function public.complete_account_merge(uuid) to authenticated;

-- ─── Account deletion ───────────────────────────────────────────────────────
-- Deletes the caller's auth user (cascades to profiles, games, game_players,
-- score_entries) plus any unclaimed legacy rows still keyed by device_id.

create or replace function public.delete_own_account(p_device_id text default null)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
begin
  if coalesce(p_device_id, '') <> '' then
    delete from games    where device_id = p_device_id and user_id is null;
    delete from profiles where device_id = p_device_id and user_id is null;
  end if;
  if v_uid is not null then
    delete from auth.users where id = v_uid;
  end if;
end;
$$;

grant execute on function public.delete_own_account(text) to anon, authenticated;
