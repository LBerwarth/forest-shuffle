-- Prevent duplicate player profiles on the same device.
--
-- Until now createPlayer() always inserted a fresh row, so the same person
-- could be added more than once on one device (case/whitespace variations
-- included). This index enforces one profile per (normalized name, device)
-- so the duplication can't recur at the data layer, regardless of which UI
-- path does the insert.
--
-- Matching is trim + case-insensitive: "Jimmy", "jimmy", and "Jimmy " collapse
-- to the same player. Display case is preserved (the index only normalizes
-- for comparison). Legacy rows with device_id IS NULL are left untouched —
-- NULLs are distinct in a unique index, and the index is partial anyway.

create unique index if not exists uq_profiles_name_device
  on profiles (lower(trim(name)), device_id)
  where device_id is not null;
