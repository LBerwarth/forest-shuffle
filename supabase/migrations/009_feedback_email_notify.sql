-- ─── Feedback e-mail notification ───────────────────────────────────────────
-- E-mails every new feedback row to Lena via Resend. The API key is read from
-- the Vault secret 'resend_api_key' (create once in the dashboard with:
--   select vault.create_secret('<key>', 'resend_api_key');
-- ). Missing key or send failure is a silent no-op — inserts are never blocked.

create extension if not exists pg_net;

create or replace function public.notify_feedback_email()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  api_key text;
  item_lines text;
  mail_text text;
begin
  select decrypted_secret into api_key
    from vault.decrypted_secrets
   where name = 'resend_api_key'
   limit 1;
  if api_key is null then
    return new;
  end if;

  select string_agg(
           '- ' || coalesce(i->>'cardKey', '?')
           || ' [' || coalesce(i->>'type', '?') || ']'
           || coalesce(': ' || nullif(trim(i->>'proposition'), ''), ''),
           e'\n')
    into item_lines
    from jsonb_array_elements(new.items) as i;

  mail_text :=
    coalesce(nullif(trim(new.message), ''), '(no message)')
    || coalesce(e'\n\n' || item_lines, '')
    || e'\n\n— language: ' || coalesce(new.language, '?')
    || ' · version: ' || coalesce(new.app_version, '?')
    || ' · device: ' || coalesce(new.device_id, '?');

  perform net.http_post(
    url := 'https://api.resend.com/emails',
    headers := jsonb_build_object(
      'Authorization', 'Bearer ' || api_key,
      'Content-Type', 'application/json'
    ),
    body := jsonb_build_object(
      'from', 'Forest Shuffle Scorer <onboarding@resend.dev>',
      'to', 'lena.berw@gmail.com',
      'subject', 'Forest Shuffle Feedback (' || coalesce(new.language, '?') || ')',
      'text', mail_text
    )
  );
  return new;
exception when others then
  return new;
end;
$$;

create trigger trg_feedback_email_notify
  after insert on public.feedback
  for each row
  execute function public.notify_feedback_email();
