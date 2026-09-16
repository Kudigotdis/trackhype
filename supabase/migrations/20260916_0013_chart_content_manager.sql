-- ============================================================
-- TrackHype migration 0013 - chart content manager write path
-- ------------------------------------------------------------
-- Weekly Chart Content Manager (roadmap section 4): the admin
-- dashboard needs to add/edit weekly song entries, update song
-- cover artwork, and publish week snapshots. chart_entries had
-- public-read + admin-insert only, so edits and deletes were
-- silently blocked by RLS. Adds admin UPDATE/DELETE policies,
-- an admin UPDATE policy for songs (artwork URLs), and a
-- uniqueness guard matching ballots semantics (one row per
-- song per chart/week/tier).
-- All statements idempotent (safe to re-run in SQL Editor).
-- ============================================================

-- Uniqueness guard: one entry per song per chart/week/tier
create unique index if not exists uq_chart_entries_song_week
  on public.chart_entries (chart_id, week_key, tier, song_id);

-- Admin can edit chart entries (re-rank, change tier, fix points)
drop policy if exists "admin update chart_entries" on public.chart_entries;
create policy "admin update chart_entries" on public.chart_entries
  for update to authenticated using (
    exists (select 1 from public.profiles p
            where p.id = auth.uid() and p.is_admin))
  with check (
    exists (select 1 from public.profiles p
            where p.id = auth.uid() and p.is_admin));

-- Admin can remove chart entries
drop policy if exists "admin delete chart_entries" on public.chart_entries;
create policy "admin delete chart_entries" on public.chart_entries
  for delete to authenticated using (
    exists (select 1 from public.profiles p
            where p.id = auth.uid() and p.is_admin));

-- Admin can update song artwork URLs + metadata (Chart Content Manager)
drop policy if exists "admin update songs" on public.songs;
create policy "admin update songs" on public.songs
  for update to authenticated using (
    exists (select 1 from public.profiles p
            where p.id = auth.uid() and p.is_admin))
  with check (
    exists (select 1 from public.profiles p
            where p.id = auth.uid() and p.is_admin));

grant update on public.chart_entries to authenticated;
grant delete on public.chart_entries to authenticated;
grant update on public.songs to authenticated;