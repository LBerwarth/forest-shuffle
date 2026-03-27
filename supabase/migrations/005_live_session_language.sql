-- Add language column to live_sessions so all participants share the same language
alter table live_sessions add column language text not null default 'en';
