-- ============================================================
-- TrackHype migration 0015 - analytics insert for anonymous users
-- ------------------------------------------------------------
-- 0011 created the "analytics insert auth or anon" policy as
-- FOR INSERT TO authenticated only, and granted insert to
-- authenticated only. Signed-out (Browser/Demo) visitors could
-- therefore never persist impressions, player events, searches
-- or campaign clicks - the event layer silently dropped them.
--
-- This migration widens the insert surface to anon while keeping
-- the ownership check: an anon row must have user_id is null (it
-- has no auth.uid()); an authed row may only set itself as owner.
-- Reads remain admin-only (unchanged from 0011).
--
-- Idempotent: safe to re-run in the SQL Editor.
-- ============================================================

-- ---- widen the insert policy to anon + authenticated ---------------
drop policy if exists "analytics insert auth or anon" on public.analytics_events;
create policy "analytics insert auth or anon"
  on public.analytics_events for insert to anon, authenticated
  with check (user_id is null or user_id = auth.uid());

-- ---- grant insert to anon (authenticated granted in 0011) ----------
grant insert on public.analytics_events to anon;

-- ============================================================
-- Verify (run manually):
--   select polname, polroles::regrole[]
--   from pg_policy
--   where polrelid = 'public.analytics_events'::regclass;
--   -- expect "analytics insert auth or anon" to include {anon,authenticated}
-- ============================================================
