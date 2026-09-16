-- ============================================================
-- TrackHype migration 0014 - promote submission to catalog
-- ------------------------------------------------------------
-- Approving a submission must create real catalog records
-- (artists, songs, song_artists, song_genres) from the
-- submission metadata JSONB, then mark it approved. Previously
-- approve only flipped submissions.status.
--
-- song_artists / song_genres only had public-read policies, so
-- admin inserts were silently RLS-blocked. Adds those policies
-- plus an atomic SECURITY DEFINER RPC so the multi-table write
-- cannot half-complete.
-- All statements idempotent (safe to re-run in SQL Editor).
-- ============================================================

-- 1. Admin write policies for the catalog join tables
drop policy if exists "admin write song_artists" on public.song_artists;
create policy "admin write song_artists" on public.song_artists
  for insert to authenticated with check (
    exists (select 1 from public.profiles p
            where p.id = auth.uid() and p.is_admin));

drop policy if exists "admin write song_genres" on public.song_genres;
create policy "admin write song_genres" on public.song_genres
  for insert to authenticated with check (
    exists (select 1 from public.profiles p
            where p.id = auth.uid() and p.is_admin));

grant insert on public.song_artists to authenticated;
grant insert on public.song_genres to authenticated;

-- 2. Atomic promotion RPC (reuses submitter's existing artist)
create or replace function public.admin_promote_submission(p_submission_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid        uuid := auth.uid();
  v_sub        public.submissions%rowtype;
  v_meta       jsonb;
  v_artist     text;
  v_artist_id  uuid;
  v_track      jsonb;
  v_song_id    uuid;
  v_first_song uuid := null;
  v_genre_id   uuid;
  v_gname      text;
  v_songs      int := 0;
  v_links      int := 0;
begin
  if v_uid is null or not exists (
      select 1 from public.profiles p
      where p.id = v_uid and p.is_admin) then
    raise exception 'forbidden' using errcode = '42501';
  end if;

  select * into v_sub from public.submissions where id = p_submission_id;
  if not found then
    raise exception 'submission not found' using errcode = 'P0002';
  end if;

  if v_sub.status = 'approved' then
    return jsonb_build_object('ok', true, 'already', true,
      'artist_id', v_sub.artist_id, 'song_id', v_sub.song_id);
  end if;

  v_meta := coalesce(v_sub.metadata, '{}'::jsonb);
  v_artist := nullif(btrim(coalesce(v_meta->>'artist', '')), '');

  -- Reuse the submitter's existing artist, else create one
  select id into v_artist_id from public.artists
    where user_id = v_sub.user_id
    order by created_at asc limit 1;

  if v_artist_id is null then
    insert into public.artists (name, user_id, socials)
    values (coalesce(v_artist, 'Unknown Artist'), v_sub.user_id,
            coalesce(v_meta->'socials', '{}'::jsonb))
    returning id into v_artist_id;
  end if;

  -- Create a song per submitted track
  for v_track in select * from jsonb_array_elements(coalesce(v_meta->'tracks', '[]'::jsonb))
  loop
    insert into public.songs (title, youtube_url, source)
    values (nullif(btrim(coalesce(v_track->>'title','')), ''),
            nullif(btrim(coalesce(v_track->>'youtube','')), ''),
            'submission')
    returning id into v_song_id;

    -- link song -> artist (idempotent)
    insert into public.song_artists (song_id, artist_id, feature_order, is_featured)
    values (v_song_id, v_artist_id, 1, false)
    on conflict (song_id, artist_id) do nothing;

    -- match genres by name (case-insensitive), skip unknowns
    for v_gname in select jsonb_array_elements_text(coalesce(v_track->'genres', '[]'::jsonb))
    loop
      select id into v_genre_id from public.genres
        where lower(name) = lower(btrim(v_gname)) limit 1;
      if v_genre_id is not null then
        insert into public.song_genres (song_id, genre_id)
        values (v_song_id, v_genre_id)
        on conflict (song_id, genre_id) do nothing;
        v_links := v_links + 1;
      end if;
    end loop;

    if v_first_song is null then v_first_song := v_song_id; end if;
    v_songs := v_songs + 1;
  end loop;

  update public.submissions
    set artist_id  = v_artist_id,
        song_id    = v_first_song,
        status     = 'approved',
        updated_at = now()
    where id = p_submission_id;

  return jsonb_build_object('ok', true, 'already', false,
    'artist_id', v_artist_id, 'song_id', v_first_song,
    'songs', v_songs, 'genre_links', v_links);
end;
$$;

revoke all on function public.admin_promote_submission(uuid) from public;
grant execute on function public.admin_promote_submission(uuid) to authenticated;