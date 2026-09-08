-- ─── Feedback: optional reply address ───────────────────────────────────────
-- Users may leave an e-mail so their report can be answered. Never required,
-- never read back by the app. The notification mail sets it as Reply-To.

alter table public.feedback add column if not exists email text;

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
  reply_to text;
  payload jsonb;
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

  reply_to := nullif(trim(new.email), '');

  mail_text :=
    coalesce(nullif(trim(new.message), ''), '(no message)')
    || coalesce(e'\n\n' || item_lines, '')
    || e'\n\n— reply to: ' || coalesce(reply_to, '(no address left)')
    || e'\n— language: ' || coalesce(new.language, '?')
    || ' · version: ' || coalesce(new.app_version, '?')
    || ' · device: ' || coalesce(new.device_id, '?');

  payload := jsonb_build_object(
    'from', 'Forest Shuffle Scorer <onboarding@resend.dev>',
    'to', 'lena.berw@gmail.com',
    'subject', 'Forest Shuffle Feedback (' || coalesce(new.language, '?') || ')',
    'text', mail_text
  );
  if reply_to is not null then
    payload := payload || jsonb_build_object('reply_to', reply_to);
  end if;

  perform net.http_post(
    url := 'https://api.resend.com/emails',
    headers := jsonb_build_object(
      'Authorization', 'Bearer ' || api_key,
      'Content-Type', 'application/json'
    ),
    body := payload
  );
  return new;
exception when others then
  return new;
end;
$$;
