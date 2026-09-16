-- ============================================================
-- TrackHype migration 0012 - advert campaign fields + admin edit
-- ------------------------------------------------------------
-- Ad Campaign Manager (roadmap section 4): banner campaigns need
-- start/end dates so the engine can schedule placements. Also
-- fixes a real gap: adverts had public-read + admin-insert only,
-- so the admin pause/resume toggle (UPDATE) was silently blocked
-- by RLS. Adds the UPDATE policy.
-- All statements idempotent (safe to re-run in SQL Editor).
-- ============================================================

-- Campaign window (NULL = no window; active until toggled off)
alter table public.adverts
  add column if not exists start_date timestamptz,
  add column if not exists end_date   timestamptz;

-- Admin can update adverts (toggle is_active, edit dates/link/image)
drop policy if exists "admin update adverts" on public.adverts;
create policy "admin update adverts" on public.adverts
  for update to authenticated using (
    exists (select 1 from public.profiles p
            where p.id = auth.uid() and p.is_admin))
  with check (
    exists (select 1 from public.profiles p
            where p.id = auth.uid() and p.is_admin));

grant select, insert, update on public.adverts to authenticated;
