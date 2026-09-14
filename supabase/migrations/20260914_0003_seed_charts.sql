-- =============================================================
-- TrackHype Phase 2 — seed: chart definitions
-- Keys mirror charts.html / submit-music.html chart list.
-- =============================================================

insert into public.charts (key, name, genre_id, size, is_active) values
  ('national-100', 'National Top 100',
     null, 100, true),
  ('hiphop-20',    'Zim Hip Hop Top 20',
     (select id from public.genres where name = 'Zim Hip Hop'), 20, true),
  ('dancehall-20', 'Zimdancehall Top 20',
     (select id from public.genres where name = 'Zimdancehall'), 20, true),
  ('gospel-20',    'Gospel Top 20',
     (select id from public.genres where name = 'Gospel'), 20, true),
  ('sungura-20',   'Sungura Top 20',
     (select id from public.genres where name = 'Sungura'), 20, true),
  ('house-20',     'Zimbabwean House Top 20',
     (select id from public.genres where name = 'Zimbabwean House'), 20, true),
  ('rnb-20',       'R&B Top 20',
     (select id from public.genres where name = 'R&B'), 20, true);