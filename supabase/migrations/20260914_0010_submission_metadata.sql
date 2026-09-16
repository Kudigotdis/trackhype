-- =============================================================
-- TrackHype migration 0010
-- submissions: add metadata JSONB for full form payload storage
-- Updates admin_pending_submissions view to COALESCE FK joins
-- with metadata fallbacks so submissions show data before
-- artist/song records are created during moderation.
-- =============================================================

-- 1. Add metadata column (stores full submission payload as JSONB)
ALTER TABLE public.submissions
  ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

-- 2. Update admin view to fall back to metadata fields
create or replace view public.admin_pending_submissions as
  select
    s.id            as submission_id,
    s.status,
    s.payment_status,
    s.payment_id,
    s.review_notes,
    s.created_at    as submitted_at,
    u.email         as submitter_email,
    coalesce(ar.name, s.metadata ->> 'artist')  as artist_name,
    coalesce(so.title, s.metadata ->> 'song_title') as song_title,
    so.artwork      as song_artwork,
    s.metadata
  from public.submissions s
  left join auth.users u on u.id = s.user_id
  left join public.artists ar on ar.id = s.artist_id
  left join public.songs so on so.id = s.song_id
  where s.status in ('pending', 'Submission Received')
     or s.status not in ('approved', 'rejected', 'archived');
