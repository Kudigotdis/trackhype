# TrackHype — Commercial Market Launch & Advertising Readiness Roadmap

This document outlines the detailed technical, operational, and commercial requirements necessary to finalize **TrackHype** for market launch and start approaching corporate advertisers and brand sponsors (e.g., Telecoms, Mobile Money networks, Beverage brands, Event promoters, and Record labels).

---

## 1. Advertising System & Monetization Infrastructure
*To pitch advertisers, TrackHype must have dedicated, high-impact banner placements, ad management APIs, and impression/click tracking for Proof-of-Performance.*

- [x] **Dynamic Ad Banner UI Placements**
  - **Header/Hero Banner**: Sticky top banner on the primary feed ([index.html](file:///c:/Users/Kudzanai/Documents/2025/App%20Developments/TrackHype/index.html)). *(home slots live — `home-radio` / `home-recent` / `home-national` / `home-feed`)*
  - **In-Feed Chart Banner**: Sponsored card embedded between Chart Position #3 and #4 ([charts.html](file:///c:/Users/Kudzanai/Documents/2025/App%20Developments/TrackHype/charts.html)). *(live — `chart-feed` slot; demo campaign running)*
  - **Radio Station Sponsor Card**: "Powered by [Brand]" banner on live radio pages ([radio.html](file:///c:/Users/Kudzanai/Documents/2025/App%20Developments/TrackHype/radio.html) = `radio-charts.html` / `radio-station.html`). *(live — `radio-sponsor` slot)*
  - **Menu/Profile Showcase Banner**: Partner promotional banner on [menu.html](file:///c:/Users/Kudzanai/Documents/2025/App%20Developments/TrackHype/menu.html). *(live — `menu-showcase` slot)*
- [x] **Ad Engine API Integration**
  - Implement `API.adverts(placement)` in [js/api.js](file:///c:/Users/Kudzanai/Documents/2025/App%20Developments/TrackHype/js/api.js) to query active banner campaigns from `public.adverts` by any placement filter; `is_active` flag enforced. `TrackHype.renderAdSlots()` fills `[data-ad-slot]` containers, cycling ads per placement and keeping demo markup as fallback.
- [x] **Ad Impressions & Click-Through Tracking (Proof of Performance)**
  - Impressions (`TRACK.impression("campaign", ...)`) and taps (`TRACK.campaignClick(...)`) emit raw events to `public.analytics_events` (migration 0011) — admin `eventFeed` surfaces them; weekly reports can group by `metadata->>'placement'`. *(Tracked as analytics_events rather than counter columns on adverts; audio-player pageview + search/vote/ballot events also flow through the same pipe.)*

---

## 2. Authentication, Onboarding & Session Hardening
*Ensure smooth user sign-up, seamless email confirmation, and session persistence across all devices and domains.*

- [x] **Supabase Auth Redirect Token Handling in [js/api.js](file:///c:/Users/Kudzanai/Documents/2025/App%20Developments/TrackHype/js/api.js)**
  - Upgrade `handleAuthRedirectUrl()` with `exchangeCodeForSession(code)` and `verifyOtp({ token_hash, type })` so email confirmation links log users in automatically on `github.io` and custom domains.
- [x] **In-App Email Confirmation Sheet in [onboarding.html](file:///c:/Users/Kudzanai/Documents/2025/App%20Developments/TrackHype/onboarding.html)**
  - Replace native browser `alert()` popups with an in-app bottom sheet modal displaying the recipient's email address, a "Resend Email" button, and a "Return Home" action.
- [x] **Profile Hydration Fix in [menu.html](file:///c:/Users/Kudzanai/Documents/2025/App%20Developments/TrackHype/menu.html)**
  - Re-invoke `renderProfile()` inside `hydrate()` as soon as server profile data resolves so the UI updates immediately without requiring a page refresh.
- [x] **Onboarding Location Sync**
  - Pass `townOrCity` and `areaOrNeighbourhood` inside `meta` during `API.signUp()` so the `handle_new_user()` DB trigger populates location details on initial signup.

---

## 3. Chart Voting Credibility & Anti-Fraud Compliance
*Advertisers invest in chart platforms because they trust rankings reflect genuine listener demand.*

- [x] **Strict Voting Limits & Rate Control**
  - Verify Supabase RLS policies enforce a strict limit of `1 vote per user/device per song per week_key`.
  - Verified: `ballots` has `unique (user_id, chart_id, week_key, tier, song_id)` + RLS insert-own + server-side replace (one ballot per user/chart/week). Client enforces 1-per-24h. "Per device" is NOT enforced — no device ID is captured (same account on two phones = 2 votes).
- [x] **KYC & Phone Number Validation**
  - Enforce E.164 phone number formatting (e.g. `+263` for Zimbabwe, `+267` for Botswana) during user onboarding.
- [x] **Auditable Ballot History**
  - Maintain an immutable log of votes in `public.ballots` with user IDs, timestamps, and week keys for audited billboard accuracy.

---

## 4. Admin Management Portal & Sales Dashboard
*An operational interface to manage advertising campaigns, song entries, and artist approvals without writing code.*

- [x] **Ad Campaign Manager**
  - Upload banner graphics, configure target URLs, set campaign start/end dates, and toggle active status (`is_active`). *(live in [admin.html](file:///c:/Users/Kudzanai/Documents/2025/App%20Developments/TrackHype/admin.html) — New Campaign form + create/update/upload APIs; target window filtered by `API.adverts()`)*
- [x] **Weekly Chart Content Manager**
  - Add/edit weekly songs, update cover artwork URLs, and publish new weekly chart snapshots (`week_key`). *(live in [admin.html](file:///c:/Users/Kudzanai/Documents/2025/App%20Developments/TrackHype/admin.html) — Chart Manager editor: add/save/delete entries, publish-as-new-week, artwork update)*
- [x] **KYC & Artist Verification Queue**
  - Review submitted artist profiles and issue official verified badges.

---

## 5. Mobile PWA & Offline Performance Optimization
*Optimized for mobile users across Zimbabwe and Botswana accessing the platform on mobile browsers and cellular networks.*

- [x] **Web App Manifest (`manifest.json`)**
  - Define app name, high-resolution branding icons (192x192, 512x512), theme colors, and `display: standalone` for "Add to Home Screen" support.
- [x] **Service Worker Asset Caching**
  - Implement a lightweight Service Worker to cache core CSS, logos, and fonts for instant loading over 3G/4G networks.
- [x] **Touch Gesture Polish**
  - Ensure touch targets and bottom sheet handles are responsive on small mobile screens.

---

## 6. Social Sharing & SEO Open Graph Metadata
*Viral sharing of chart rankings and songs drives free organic user growth and increases ad impressions.*

- [x] **Open Graph (OG) Meta Tags**
  - Implement `og:title`, `og:description`, `og:image`, and `twitter:card` tags across all pages so shared links generate preview cards on WhatsApp, Facebook, and X/Twitter.
- [x] **Dynamic One-Tap Share Action**
  - Add a "Share Chart" button that generates pre-formatted text:  
    *"I just voted on TrackHype! Check out the Zimbabwe Top 20: https://trackhype.com/charts.html"*  
    *(live in [charts.html](file:///c:/Users/Kudzanai/Documents/2025/App%20Developments/TrackHype/charts.html) — Share button uses native share sheet with text+URL fallback; event logged to `analytics_events` via `TRACK.chartShare`)*

---

## 7. Legal, Privacy & Operational Compliance

- [x] **Terms of Service & Privacy Policy**
  - Privacy Policy + Terms of Use live at [privacy-policy.html](file:///c:/Users/Kudzanai/Documents/2025/App%20Developments/TrackHype/docs/info/privacy-policy.html) and [terms-of-use.html](file:///c:/Users/Kudzanai/Documents/2025/App%20Developments/TrackHype/docs/info/terms-of-use.html), linked from [settings.html](file:///c:/Users/Kudzanai/Documents/2025/App%20Developments/TrackHype/settings.html). (Plain-text sources kept in [docs/info](file:///c:/Users/Kudzanai/Documents/2025/App%20Developments/TrackHype/docs/info).)
- [ ] **Custom Domain & SSL HTTPS**
  - Connect a custom domain (e.g., `trackhype.com` or `trackhype.co.zw`) with valid SSL HTTPS encryption.
  - **DEFERRED — no domain purchased yet.** Site continues on GitHub Pages HTTPS at `https://trackhype.github.io/trackhype/` (Pages provides free TLS). When a domain is bought: add `CNAME` (or apex ALIAS at DNS provider) → enable custom domain in Pages (auto Let's Encrypt SSL) → add new origin to the Supabase Auth URL allowlist. **RED FLAG: revisit before paid ad campaigns go live.**
- [ ] **Platform Analytics Integration**
  - Custom privacy-first event layer shipped instead of GA/Plausible: [tracker.js](file:///c:/Users/Kudzanai/Documents/2025/App%20Developments/TrackHype/js/tracker.js) (`window.TRACK`) wired into all 23 app pages, emitting raw events to `public.analytics_events` (migration 0011) surfaced by admin Overview + Song Analytics + Event Feed views (session duration / MAU still a manual derivation). A GA/Plausible tag may be layered on later if the pitch kit demands third-party numbers.

---

## 8. Business Pitch Kit & Advertiser Media Kit

- [x] **2-Page Advertiser PDF / Pitch Deck**
  - **Demographics**: Target audience overview (Youth, music enthusiasts, urban and regional listeners in ZW & BW).
  - **Ad Placements**: Visual mockups of Header Banners, Mid-Feed Chart Placement, and Radio Sponsorships.
  - **Pricing Models**: Monthly sponsorship packages and CPM (Cost Per Thousand Impressions) pricing tiers.
  - *(source saved as `docs/pitch/advertiser-pitch.html` — open in a browser and print to PDF)*
- [x] **Interactive Advertiser Demo Account**
  - A staging preview demonstrating active test ad campaigns live inside the app UI.
  - *(Live: `chart-feed` slot shows the running "DemoMedia - Summer Tour" test campaign on [charts.html](file:///c:/Users/Kudzanai/Documents/2025/App%20Developments/TrackHype/charts.html); all other slots keep branded demo-fallback markup until a real campaign is booked.)*

---

## 9. Payment Gateway — DEFERRED WORK (RED FLAG)

**Status: NOT started. Do not let this drift — it must be revisited before real money is charged.**

- `submissions.payment_status` defaults to `'not_paid'` (status-only, no gateway).
- `submit-music.html` prices music at **$10 USD per track** and shows ZW mobile-money equivalents, but there is no merchant/bank account to wire a processor yet, so checkout is hand-off only.
- When a bank/merchant account exists, revisit **Paynow** (recommended for ZW: EcoCash/OneMoney + cards) or **Flutterwave** (pan-African cards + mobile money) and wire the gateway through `payment_status` / `payment_id` (migration required for `paid_at` / `payment_provider`).

---

## 10. Phased Execution Timeline

```
[ Phase 1: Auth & Session Fixes ]  ──►  [ Phase 2: Dynamic Ad Engine ]
                                                │
[ Phase 4: Media Kit & Pitching ]  ◄──  [ Phase 3: PWA, OG Tags & Legal ]
```
