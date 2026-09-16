-- ============================================================
-- TrackHype migration 0009
-- admin pending-submission view (admin gate for approve/reject)
-- ------------------------------------------------------------
-- Applies in BOTH places:
--   1) repo:  supabase\migrations\20260914_0009_pending_submission_admin.sql
--   2) hosted: paste into Supabase SQL Editor and RUN
-- Idempotent (drop view if exists + create or replace) so it is
-- safe to re-run.
-- ============================================================

create or replace view public.admin_pending_submissions as
  select
    s.id            as submission_id,
    s.status,
    s.payment_status,
    s.payment_id,
    s.review_notes,
    s.created_at    as submitted_at,
    u.email         as submitter_email,
    ar.name         as artist_name,
    so.title        as song_title,
    so.artwork      as song_artwork
  from public.submissions s
  left join auth.users u on u.id = s.user_id
  left join public.artists ar on ar.id = s.artist_id
  left join public.songs so on so.id = s.song_id
  where s.status in ('pending', 'Submission Received')
     or s.status not in ('approved', 'rejected', 'archived');

-- admin-only read: non-admins get zero rows regardless of RLS
alter table public.submissions enable row level security;

create or replace function public.admin_pending_submissions_visible()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.is_admin
  );
$$;

drop policy if exists "admin pending submissions view read" on public.submissions;
create policy "admin pending submissions view read" on public.submissions
  for select using (public.admin_pending_submissions_visible());

grant select on public.admin_pending_submissions to authenticated;
