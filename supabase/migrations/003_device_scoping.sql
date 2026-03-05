-- Add device_id to scope players and games per device
alter table profiles add column device_id text;
alter table games add column device_id text;

create index idx_profiles_device_id on profiles(device_id);
create index idx_games_device_id on games(device_id);
