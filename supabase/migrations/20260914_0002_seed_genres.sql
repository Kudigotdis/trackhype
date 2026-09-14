-- =============================================================
-- TrackHype Phase 2 — seed: genres (parent/child families)
-- Parents: Traditional & Indigenous, Modern, Urban, Hip-Hop &
-- Fusion, R&B/Soul/Reggae, Gospel. Children cover the onboarding
-- list, the spec's genre rails, and every genre used in
-- trackhype_song_catalog.csv (incl. Afro-Soul).
-- =============================================================

insert into public.genres (name, sort_order) values
  ('Traditional & Indigenous', 1),
  ('Modern',                   2),
  ('Urban',                    3),
  ('Hip-Hop & Fusion',         4),
  ('R&B / Soul / Reggae',      5),
  ('Gospel',                   6)
  on conflict (name) do nothing;

insert into public.genres (name, parent_id, sort_order) values
  -- Traditional & Indigenous
  ('Mbira',                  (select id from public.genres where name = 'Traditional & Indigenous'), 1),
  ('Jiti',                   (select id from public.genres where name = 'Traditional & Indigenous'), 2),
  ('Mhande',                 (select id from public.genres where name = 'Traditional & Indigenous'), 3),
  ('Mbende / Jerusarema',    (select id from public.genres where name = 'Traditional & Indigenous'), 4),
  ('Muchongoyo',             (select id from public.genres where name = 'Traditional & Indigenous'), 5),
  ('Mbakumba',               (select id from public.genres where name = 'Traditional & Indigenous'), 6),
  ('Shangare',               (select id from public.genres where name = 'Traditional & Indigenous'), 7),
  ('Amabhiza',               (select id from public.genres where name = 'Traditional & Indigenous'), 8),
  ('Kanindo',                (select id from public.genres where name = 'Traditional & Indigenous'), 9),
  -- Modern
  ('Sungura',                (select id from public.genres where name = 'Modern'), 1),
  ('Chimurenga',             (select id from public.genres where name = 'Modern'), 2),
  ('Tuku Music',             (select id from public.genres where name = 'Modern'), 3),
  ('Afro-Jazz',              (select id from public.genres where name = 'Modern'), 4),
  ('Zimbabwean Jazz',        (select id from public.genres where name = 'Modern'), 5),
  ('Imbube',                 (select id from public.genres where name = 'Modern'), 6),
  ('Zimbabwean Rumba',       (select id from public.genres where name = 'Modern'), 7),
  ('Afro-Fusion',            (select id from public.genres where name = 'Modern'), 8),
  ('Afro-Pop',               (select id from public.genres where name = 'Modern'), 9),
  ('Afro-Soul',              (select id from public.genres where name = 'Modern'), 10),
  -- Urban
  ('Zimdancehall',           (select id from public.genres where name = 'Urban'), 1),
  ('Urban Grooves',          (select id from public.genres where name = 'Urban'), 2),
  ('Zim Hip Hop',            (select id from public.genres where name = 'Urban'), 3),
  ('Amapiano',               (select id from public.genres where name = 'Urban'), 4),
  ('Zimbabwean House',       (select id from public.genres where name = 'Urban'), 5),
  ('Zim EDM',                (select id from public.genres where name = 'Urban'), 6),
  ('Zim-TrapSoul',           (select id from public.genres where name = 'Urban'), 7),
  ('House',                  (select id from public.genres where name = 'Urban'), 8),
  ('Gqom',                   (select id from public.genres where name = 'Urban'), 9),
  ('Kwaito',                 (select id from public.genres where name = 'Urban'), 10),
  -- Hip-Hop & Fusion
  ('Shona Hip Hop',          (select id from public.genres where name = 'Hip-Hop & Fusion'), 1),
  ('Ndebele Hip Hop',        (select id from public.genres where name = 'Hip-Hop & Fusion'), 2),
  ('Mbare Trap',             (select id from public.genres where name = 'Hip-Hop & Fusion'), 3),
  ('Ghetto Drill',           (select id from public.genres where name = 'Hip-Hop & Fusion'), 4),
  ('Jecha Trap',             (select id from public.genres where name = 'Hip-Hop & Fusion'), 5),
  ('Clarks Rap',             (select id from public.genres where name = 'Hip-Hop & Fusion'), 6),
  ('Bulawayo Kasi Rap',      (select id from public.genres where name = 'Hip-Hop & Fusion'), 7),
  ('Zim-Skhanda',            (select id from public.genres where name = 'Hip-Hop & Fusion'), 8),
  ('Alternative/Conscious Zim-Rap', (select id from public.genres where name = 'Hip-Hop & Fusion'), 9),
  ('Diaspora Afro-Drill',    (select id from public.genres where name = 'Hip-Hop & Fusion'), 10),
  ('Sungura Trap',           (select id from public.genres where name = 'Hip-Hop & Fusion'), 11),
  -- R&B / Soul / Reggae
  ('R&B',                    (select id from public.genres where name = 'R&B / Soul / Reggae'), 1),
  ('Soul',                   (select id from public.genres where name = 'R&B / Soul / Reggae'), 2),
  ('Dancehall',              (select id from public.genres where name = 'R&B / Soul / Reggae'), 3),
  ('Reggae',                 (select id from public.genres where name = 'R&B / Soul / Reggae'), 4),
  -- Gospel
  ('Gospel Hip Hop',         (select id from public.genres where name = 'Gospel'), 2),
  ('Trap Gospel',            (select id from public.genres where name = 'Gospel'), 3),
  ('Afro-Gospel Rap',        (select id from public.genres where name = 'Gospel'), 4),
  ('Conscious Christian Rap',(select id from public.genres where name = 'Gospel'), 5)
  on conflict (name) do nothing;