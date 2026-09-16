-- ============================================================
-- TrackHype migration 0011 — analytics_events + admin views
-- ------------------------------------------------------------
-- Append-only event log for platform intelligence.
-- Entity-attribute-value model: store raw events first, derive
-- dashboard metrics via views so new intelligence can be added
-- later without redesigning the tracking schema.
-- ============================================================

-- ---- analytics_events table ----------------------------------------
create table if not exists public.analytics_events (
  id            uuid primary key default gen_random_uuid(),
  event_type    text not null
                check (event_type in (
                  'impression','song_view','profile_view',
                  'player_start','player_pause','player_seek',
                  'player_complete','player_replay',
                  'vote','ballot_submit','ballot_edit',
                  'like','follow','search','share',
                  'social_click','dsp_click',
                  'campaign_click','referral'
                )),
  entity_type   text,          -- song, artist, chart, profile, campaign, radio
  entity_id     text,
  entity_title  text,          -- denormalized display name
  metadata      jsonb not null default '{}'::jsonb,
  user_id       uuid references auth.users(id) on delete set null,
  region_code   text,
  created_at    timestamptz not null default now()
);

create index if not exists idx_ae_type_time  on public.analytics_events (event_type, created_at desc);
create index if not exists idx_ae_entity    on public.analytics_events (entity_type, entity_id, created_at desc);
create index if not exists idx_ae_user      on public.analytics_events (user_id, created_at desc);
create index if not exists idx_ae_region    on public.analytics_events (region_code, created_at desc);
create index if not exists idx_ae_chart_key on public.analytics_events ((metadata->>'chart_key'), created_at desc)
  where metadata->>'chart_key' is not null;
create index if not exists idx_ae_week_key  on public.analytics_events ((metadata->>'week_key'), created_at desc)
  where metadata->>'week_key' is not null;

-- ---- RLS -----------------------------------------------------------
alter table public.analytics_events enable row level security;

-- Authenticated users insert their own events (anonymous impressions allowed)
create policy "analytics insert auth or anon"
  on public.analytics_events for insert to authenticated
  with check (user_id = auth.uid() or user_id is null);

-- Admins can read all events
create or replace function public.admin_analytics_visible()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.is_admin
  );
$$;

create policy "analytics admin select all"
  on public.analytics_events for select
  using (public.admin_analytics_visible());

grant select on public.analytics_events to authenticated;
grant insert on public.analytics_events to authenticated;

-- ============================================================
-- Admin dashboard views (security definer so non-admins get
-- zero rows from RLS even if they SELECT directly)
-- ============================================================

-- Platform-wide summary (admin Overview tab)
create or replace view public.admin_platform_summary as
select
  (select count(*) from public.profiles)                          as total_users,
  (select count(*) from public.profiles
     where kyc_status = 'pending')                                as pending_kyc,
  (select count(*) from public.analytics_events
     where event_type = 'vote'
       and created_at > now() - interval '7 days')                as votes_7d,
  (select count(*) from public.analytics_events
     where event_type = 'vote'
       and created_at > now() - interval '30 days')               as votes_30d,
  (select count(*) from public.analytics_events
     where event_type like 'player_%'
       and created_at > now() - interval '7 days')                as plays_7d,
  (select count(*) from public.analytics_events
     where event_type = 'player_complete'
       and created_at > now() - interval '7 days')                as completions_7d,
  (select count(*) from public.analytics_events
     where event_type = 'follow'
       and created_at > now() - interval '30 days')               as follows_30d,
  (select count(*) from public.analytics_events
     where event_type = 'search'
       and created_at > now() - interval '7 days')                as searches_7d,
  (select count(*) from public.submissions
     where status in ('pending', 'Submission Received'))          as pending_submissions,
  (select count(*) from public.submissions
     where status = 'approved')                                   as approved_submissions,
  (select count(*) from public.submissions
     where status = 'rejected')                                   as rejected_submissions,
  (select count(*) from public.adverts
     where is_active)                                             as active_adverts,
  (select count(*) from public.radio_stations
     where is_active)                                             as active_radio_stations,
  (select count(*) from public.analytics_events
     where event_type = 'ballot_submit'
       and created_at > now() - interval '7 days')                as ballots_cast_7d;

-- Per-song analytics (admin Artist Intelligence, server-paginated)
create or replace view public.admin_song_analytics as
select
  ae.entity_id,
  ae.entity_title,
  count(*) filter (where ae.event_type = 'impression')                    as impressions,
  count(*) filter (where ae.event_type = 'song_view')                    as song_views,
  count(*) filter (where ae.event_type = 'player_start')                 as player_starts,
  count(*) filter (where ae.event_type = 'player_complete')              as completions,
  count(*) filter (where ae.event_type = 'player_replay')                as replays,
  count(*) filter (where ae.event_type = 'player_pause')                 as pauses,
  count(*) filter (where ae.event_type = 'player_seek')                  as seeks,
  count(*) filter (where ae.event_type = 'vote')                         as votes,
  count(*) filter (where ae.event_type = 'like')                         as likes,
  count(*) filter (where ae.event_type = 'follow')                       as follows,
  count(*) filter (where ae.event_type = 'share')                        as shares,
  count(*) filter (where ae.event_type = 'dsp_click')                    as dsp_clicks,
  count(*) filter (where ae.event_type = 'social_click')                 as social_clicks,
  count(*) filter (where ae.event_type = 'search')                       as searches,
  count(*) filter (where ae.event_type = 'ballot_submit')                as ballots_cast,
  count(distinct ae.user_id) filter (where ae.user_id is not null)       as unique_users,
  max(ae.created_at)                                                     as last_activity,
  min(ae.created_at)                                                     as first_activity
from public.analytics_events ae
where ae.entity_type = 'song'
group by ae.entity_id, ae.entity_title;

grant select on public.admin_platform_summary to authenticated;
grant select on public.admin_song_analytics    to authenticated;

-- ============================================================
-- Admin profile access (KYC tab) + pending-KYC view
-- ------------------------------------------------------------
-- Profile select/update is owner-only in 0001; admin needs a
-- separate security-definer policy to review KYC.
-- ============================================================
create or replace function public.profiles_admin_visible()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.is_admin
  );
$$;

drop policy if exists "profiles admin select all" on public.profiles;
create policy "profiles admin select all" on public.profiles
  for select using (public.profiles_admin_visible());

create or replace view public.admin_pending_kyc as
  select
    p.id              as profile_id,
    p.email,
    p.username,
    p.first_name,
    p.surname,
    p.gender,
    p.region_code,
    p.region_country,
    p.town_or_city,
    p.kyc_status,
    p.account_type,
    p.created_at      as signed_up_at
  from public.profiles p
  where p.kyc_status = 'pending'
  order by p.created_at asc;

grant select on public.admin_pending_kyc to authenticated;
