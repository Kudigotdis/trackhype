-- =============================================================
-- TrackHype Phase 2 — schema + RLS + auth trigger
-- Run in Supabase SQL editor. Keeps every auth.users signup
-- producing a matching profiles row via handle_new_user().
-- =============================================================
create extension if not exists pgcrypto; -- gen_random_uuid()

-- ---- updated_at helper -----------------------------------------------
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end; $$;

-- ---- profiles --------------------------------------------------------
create table public.profiles (
  id                  uuid primary key references auth.users(id) on delete cascade,
  account_type        text not null default 'listener',
  username            text unique,
  first_name          text,
  surname             text,
  gender              text,
  date_of_birth       date,
  mobile_number       text,
  whatsapp_number     text,
  mobile_network      text,          -- Econet / NetOne / Telecel / Other
  mobile_money        text,          -- EcoCash / OneMoney / TeleCash / None
  email               text,
  region_code         text,          -- ZW / BW / ...
  region_country      text,
  town_or_city        text,
  area_or_neighbourhood text,
  profile_photo       text,          -- URL only; do not store base64 blobs here
  bio                 text,
  kyc_status          text not null default 'pending',
  is_admin            boolean not null default false,
  artist_profile      jsonb,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);
create trigger profiles_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();

-- ---- genres (parent/child) -------------------------------------------
create table public.genres (
  id         uuid primary key default gen_random_uuid(),
  name       text not null unique,
  parent_id  uuid references public.genres(id) on delete set null,
  sort_order int not null default 0
);
create table public.profile_genres (
  profile_id uuid not null references public.profiles(id) on delete cascade,
  genre_id   uuid not null references public.genres(id) on delete cascade,
  primary key (profile_id, genre_id)
);

-- ---- artists ---------------------------------------------------------
create table public.artists (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  user_id     uuid references auth.users(id) on delete set null,
  city        text,
  artist_type text,
  bio         text,
  portrait    text,
  socials     jsonb not null default '{}'::jsonb,
  created_at  timestamptz not null default now()
);

-- ---- songs -----------------------------------------------------------
create table public.songs (
  id               uuid primary key default gen_random_uuid(),
  title            text not null,
  artwork          text,
  source           text,
  language         text,
  release_date     date,
  explicit         boolean not null default false,
  youtube_url      text,
  youtube_video_id text,
  lyrics           text,
  platform_links   jsonb not null default '{}'::jsonb,
  created_at       timestamptz not null default now()
);
create table public.song_artists (
  song_id       uuid not null references public.songs(id) on delete cascade,
  artist_id     uuid not null references public.artists(id) on delete cascade,
  feature_order int not null default 1,
  is_featured   boolean not null default false,
  primary key (song_id, artist_id)
);
create table public.song_genres (
  song_id  uuid not null references public.songs(id) on delete cascade,
  genre_id uuid not null references public.genres(id) on delete cascade,
  primary key (song_id, genre_id)
);

-- ---- charts ----------------------------------------------------------
create table public.charts (
  id         uuid primary key default gen_random_uuid(),
  key        text not null unique,
  name       text not null,
  genre_id   uuid references public.genres(id) on delete set null,
  size       int not null,
  is_active  boolean not null default true,
  created_at timestamptz not null default now()
);
create table public.chart_entries (
  id         uuid primary key default gen_random_uuid(),
  chart_id   uuid not null references public.charts(id) on delete cascade,
  song_id    uuid not null references public.songs(id) on delete cascade,
  week_key   text not null,          -- ISO week e.g. '2026-W38'
  tier       text not null default 'on_top'
             check (tier in ('on_top','contenders','newest')),
  rank       int not null check (rank >= 1),
  points     numeric not null default 0,
  created_at timestamptz not null default now(),
  unique (chart_id, week_key, rank)
);

-- ---- ballots (voting) ------------------------------------------------
-- One row per ranked song. The one-ballot-per-chart-week rule is enforced
-- server-side (Phase 4): a submit REPLACES the user's prior rows for that
-- chart+week. unique(...) here prevents duplicate song rows.
create table public.ballots (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  chart_id     uuid not null references public.charts(id) on delete cascade,
  week_key     text not null,
  tier         text not null default 'on_top'
               check (tier in ('on_top','contenders','newest')),
  song_id      uuid not null references public.songs(id) on delete cascade,
  rank         int not null check (rank >= 1),
  points       int not null check (points >= 0),
  submitted_at timestamptz not null default now(),
  unique (user_id, chart_id, week_key, tier, song_id)
);

-- ---- submissions (payment is status-only) ----------------------------
create table public.submissions (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references auth.users(id) on delete cascade,
  artist_id      uuid references public.artists(id) on delete set null,
  song_id        uuid references public.songs(id) on delete set null,
  status         text not null default 'Submission Received',
  payment_id     text,
  payment_status text not null default 'not_paid',  -- status-only, no gateway yet
  review_notes   text,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);
create trigger submissions_updated_at before update on public.submissions
  for each row execute function public.set_updated_at();

-- ---- lists (playlists) + favourites ----------------------------------
create table public.lists (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  name       text not null,
  is_public  boolean not null default false,
  created_at timestamptz not null default now()
);
create table public.list_items (
  id         uuid primary key default gen_random_uuid(),
  list_id    uuid not null references public.lists(id) on delete cascade,
  song_id    uuid not null references public.songs(id) on delete cascade,
  position   int not null,
  created_at timestamptz not null default now(),
  unique (list_id, position),
  unique (list_id, song_id)
);
create table public.favourites (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  item_type  text not null check (item_type in ('song','artist','chart')),
  item_id    uuid not null,
  created_at timestamptz not null default now(),
  unique (user_id, item_type, item_id)
);

-- ---- adverts + radio_stations ----------------------------------------
create table public.adverts (
  id         uuid primary key default gen_random_uuid(),
  title      text not null,
  image      text,
  link       text,
  placement  text,
  is_active  boolean not null default true,
  created_at timestamptz not null default now()
);
create table public.radio_stations (
  id        text primary key,       -- 'radio-zimbabwe' etc.
  name      text not null,
  country   text not null,
  region    text,
  freq      text,
  logo      text,
  focus     text,
  is_active boolean not null default true
);

-- ---- indexes ----------------------------------------------------------
create index song_artists_artist_idx on public.song_artists(artist_id);
create index song_genres_genre_idx  on public.song_genres(genre_id);
create index chart_entries_week_idx on public.chart_entries(week_key);
create index chart_entries_chart_idx on public.chart_entries(chart_id, week_key);
create index ballots_user_week_idx  on public.ballots(user_id, week_key);
create index favourites_user_idx     on public.favourites(user_id);
create index list_items_list_idx     on public.list_items(list_id);
create index profile_genres_genre_idx on public.profile_genres(genre_id);

-- ---- auth trigger: auto-create profile on signup ---------------------
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (
    id, email, account_type, username, first_name, surname, gender,
    date_of_birth, mobile_number, whatsapp_number, mobile_network, mobile_money,
    region_code, region_country, artist_profile
  ) values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'accountType', 'listener'),
    new.raw_user_meta_data ->> 'username',
    new.raw_user_meta_data ->> 'firstName',
    new.raw_user_meta_data ->> 'surname',
    new.raw_user_meta_data ->> 'gender',
    (new.raw_user_meta_data ->> 'dateOfBirth')::date,
    new.raw_user_meta_data ->> 'mobileE164',
    new.raw_user_meta_data ->> 'whatsappE164',
    new.raw_user_meta_data ->> 'mobileNetwork',
    new.raw_user_meta_data ->> 'mobileMoney',
    new.raw_user_meta_data ->> 'regionCode',
    new.raw_user_meta_data ->> 'regionCountry',
    (new.raw_user_meta_data -> 'artistProfile')::jsonb
  ) on conflict (id) do nothing;
  return new;
end; $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- =============================================================
-- Row Level Security
-- =============================================================
alter table public.profiles        enable row level security;
alter table public.genres          enable row level security;
alter table public.profile_genres  enable row level security;
alter table public.artists         enable row level security;
alter table public.songs           enable row level security;
alter table public.song_artists    enable row level security;
alter table public.song_genres     enable row level security;
alter table public.charts          enable row level security;
alter table public.chart_entries   enable row level security;
alter table public.ballots         enable row level security;
alter table public.submissions     enable row level security;
alter table public.lists           enable row level security;
alter table public.list_items      enable row level security;
alter table public.favourites      enable row level security;
alter table public.adverts         enable row level security;
alter table public.radio_stations  enable row level security;

-- Public read (browsing needs no login)
create policy "public read genres"          on public.genres         for select using (true);
create policy "public read artists"         on public.artists        for select using (true);
create policy "public read songs"           on public.songs          for select using (true);
create policy "public read song_artists"    on public.song_artists   for select using (true);
create policy "public read song_genres"     on public.song_genres    for select using (true);
create policy "public read charts"          on public.charts         for select using (true);
create policy "public read chart_entries"   on public.chart_entries  for select using (true);
create policy "public read adverts"         on public.adverts        for select using (true);
create policy "public read radio_stations"  on public.radio_stations for select using (true);

-- Profiles: owner only
create policy "profiles select own" on public.profiles
  for select using (auth.uid() = id);
create policy "profiles insert own" on public.profiles
  for insert with check (auth.uid() = id);
create policy "profiles update own" on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

-- Profile genres: owner manages (delete + reinsert on save)
create policy "profile_genres select own" on public.profile_genres
  for select using (profile_id = auth.uid());
create policy "profile_genres insert own" on public.profile_genres
  for insert with check (profile_id = auth.uid());
create policy "profile_genres delete own" on public.profile_genres
  for delete using (profile_id = auth.uid());

-- Ballots: owner only
create policy "ballots select own" on public.ballots
  for select using (user_id = auth.uid());
create policy "ballots insert own" on public.ballots
  for insert with check (user_id = auth.uid());
create policy "ballots delete own" on public.ballots
  for delete using (user_id = auth.uid());

-- Favourites / lists: owner only
create policy "favourites select own" on public.favourites
  for select using (user_id = auth.uid());
create policy "favourites insert own" on public.favourites
  for insert with check (user_id = auth.uid());
create policy "favourites delete own" on public.favourites
  for delete using (user_id = auth.uid());

create policy "lists select own" on public.lists
  for select using (user_id = auth.uid());
create policy "lists insert own" on public.lists
  for insert with check (user_id = auth.uid());
create policy "lists update own" on public.lists
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "lists delete own" on public.lists
  for delete using (user_id = auth.uid());

create policy "list_items select owner" on public.list_items
  for select using (exists (
    select 1 from public.lists l where l.id = list_id and l.user_id = auth.uid()));
create policy "list_items insert owner" on public.list_items
  for insert with check (exists (
    select 1 from public.lists l where l.id = list_id and l.user_id = auth.uid()));
create policy "list_items delete owner" on public.list_items
  for delete using (exists (
    select 1 from public.lists l where l.id = list_id and l.user_id = auth.uid()));

-- Submissions: owner + admin
create policy "submissions select owner or admin" on public.submissions
  for select using (user_id = auth.uid() or exists (
    select 1 from public.profiles p where p.id = auth.uid() and p.is_admin));
create policy "submissions insert owner" on public.submissions
  for insert with check (user_id = auth.uid());
create policy "submissions update owner or admin" on public.submissions
  for update using (user_id = auth.uid() or exists (
    select 1 from public.profiles p where p.id = auth.uid() and p.is_admin))
  with check (user_id = auth.uid() or exists (
    select 1 from public.profiles p where p.id = auth.uid() and p.is_admin));

-- Catalog tables: admin write only (no public insert)
create policy "admin write artists" on public.artists
  for insert to authenticated with check (exists (
    select 1 from public.profiles p where p.id = auth.uid() and p.is_admin));
create policy "admin write songs" on public.songs
  for insert to authenticated with check (exists (
    select 1 from public.profiles p where p.id = auth.uid() and p.is_admin));
create policy "admin write charts" on public.charts
  for insert to authenticated with check (exists (
    select 1 from public.profiles p where p.id = auth.uid() and p.is_admin));
create policy "admin write chart_entries" on public.chart_entries
  for insert to authenticated with check (exists (
    select 1 from public.profiles p where p.id = auth.uid() and p.is_admin));
create policy "admin write adverts" on public.adverts
  for insert to authenticated with check (exists (
    select 1 from public.profiles p where p.id = auth.uid() and p.is_admin));
create policy "admin write radio_stations" on public.radio_stations
  for insert to authenticated with check (exists (
    select 1 from public.profiles p where p.id = auth.uid() and p.is_admin));