-- =============================================================
-- TrackHype Phase 2 — profiles.mobile_money_number
-- Run in Supabase SQL editor.
-- Adds the mobile money account number captured during onboarding
-- (the number tied to the selected mobile money service) and
-- extends handle_new_user() so it lands in the profiles row.
-- =============================================================

alter table public.profiles add column if not exists mobile_money_number text;

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (
    id, email, account_type, username, first_name, surname, gender,
    date_of_birth, mobile_number, whatsapp_number, mobile_network, mobile_money,
    mobile_money_number, region_code, region_country, artist_profile
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
    new.raw_user_meta_data ->> 'mobileMoneyE164',
    new.raw_user_meta_data ->> 'regionCode',
    new.raw_user_meta_data ->> 'regionCountry',
    (new.raw_user_meta_data -> 'artistProfile')::jsonb
  ) on conflict (id) do nothing;
  return new;
end; $$;