-- ============================================================
-- TrackHype migration 0008
-- artist photos + social/contact persistence columns
-- ------------------------------------------------------------
-- Applies in BOTH places:
--   1) repo:  supabase\migrations\20260914_0008_artist_photos_socials.sql
--   2) hosted: paste into Supabase SQL Editor and RUN
-- Storage bucket (trackhype-media) is created in the dashboard
-- Storage page (see PROGRESS.md "REPORT 03") — do NOT run the
-- storage.buckets insert from SQL to avoid id-skew.
-- ============================================================

-- 1) profile photo refresh — Supabase turns the uploaded bytes
--    into a URL; we only ever store the URL (matches 0001's
--    "URL only, no base64 blobs" rule). No blob columns here.
alter table public.profiles
  add column if not exists whatsapp_same  boolean not null default true,
  add column if not exists photo_url       text,
  add column if not exists artist_photo_url text,
  add column if not exists socials         jsonb not null default '{}'::jsonb;

-- 2) RLS stays inherited from 0001 (public read / owner write by id).
--    New columns ride the existing policies — nothing to add here.

-- 3) Optional sanity view used during verification (SQL Editor).
create or replace view public.snapshot_artist_fields as
select first_name, surname, whatsapp_same, photo_url, artist_photo_url
from public.profiles;

-- ============================================================
-- STORAGE OBJECTS RLS (bucket: trackhype-media)
-- ------------------------------------------------------------
-- The bucket itself is created in the dashboard (Storage page)
-- as a PUBLIC bucket. These policies gate the OBJECTS inside it:
--   - public read (anyone can view)
--   - owner write (auth.uid() owns the <user-id>/... prefix)
-- ============================================================
drop policy if exists "trackhype-media public read" on storage.objects;
drop policy if exists "trackhype-media owner write" on storage.objects;

create policy "trackhype-media public read"
  on storage.objects for select using (bucket_id = 'trackhype-media');

create policy "trackhype-media owner write"
  on storage.objects for all
  using (bucket_id = 'trackhype-media'
         and (storage.foldername(name))[1] = auth.uid()::text)
  with check (bucket_id = 'trackhype-media'
              and (storage.foldername(name))[1] = auth.uid()::text);

-- ============================================================
-- STORAGE OBJECTS RLS (bucket: trackhype-media)
-- ------------------------------------------------------------
-- The bucket itself is created in the dashboard (Storage page)
-- as a PUBLIC bucket. These policies make the objects inside it
-- follow the same rule as every table: public read, and only the
-- OWNER (auth.uid() = first path segment = <user-id>) can write.
-- Path layout: <user-id>/<kind>.webp  (kind: profile | artist)
-- ============================================================
drop policy if exists "trackhype-media public read"  on storage.objects;
drop policy if exists "trackhype-media owner write"  on storage.objects;

create policy "trackhype-media public read"
  on storage.objects for select using (bucket_id = 'trackhype-media');

create policy "trackhype-media owner write"
  on storage.objects for all
  using (bucket_id = 'trackhype-media'
         and (storage.foldername(name))[1] = auth.uid()::text)
  with check (bucket_id = 'trackhype-media'
              and (storage.foldername(name))[1] = auth.uid()::text);
