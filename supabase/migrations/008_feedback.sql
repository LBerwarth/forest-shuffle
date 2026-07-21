-- ─── Feedback ─────────────────────────────────────────────────────────────
-- User-submitted feedback: per-card translation / rule-bug reports with a
-- suggested correction each, plus an optional free-text note. Write-only from
-- the app; read via the Supabase dashboard.
--
-- items is an array of { card_key, type, proposition }, where type is
-- 'translation' or 'rule'.

create table feedback (
  id           uuid primary key default gen_random_uuid(),
  device_id    text,
  language     text,
  app_version  text,
  message      text,
  items        jsonb not null default '[]'::jsonb,
  created_at   timestamptz not null default now()
);

create index idx_feedback_created_at on feedback(created_at desc);

alter table feedback enable row level security;

-- Anonymous clients may submit feedback but never read it back.
create policy "Anyone can submit feedback" on feedback
  for insert with check (true);

-- New Supabase projects no longer auto-expose the public schema to the Data
-- API, so grant the insert explicitly to keep this future-proof.
grant insert on feedback to anon, authenticated;
