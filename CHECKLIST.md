# TrackHype — Bit-by-Bit Build Checklist

Brand: `#01db8b` / `#02925e` on white, with 3 light muted greys.
Canonical shell: **new `.th-*` / `data-*`** (trackhype.css + trackhype.js). Legacy pages keep a compatibility shim in `trackhype.js`.

Zimbabwe-only: ZW, +263, USD, Econet/NetOne/Telecel, EcoCash/OneMoney/TeleCash, **$10.00 USD per song**. No Botswana / P / BWP / +267 / `.co.bw`.

Vote model (override): tap vote → modal → enter target position → song moves there, incumbent shifts down. 20→1 points. One vote per chart per 24h. Flow: user order → vote record → aggregation → published chart (single vote must NOT mutate public chart).

---

## Phase 0 — Canonical layout & shared shell
- [x] B0.1 `trackhype.css` — green/white/3-grey design system (`.th-*`)
- [x] B0.2 `trackhype.js` — confirmed API + legacy shim + idempotent init + nav-active mapping
- [x] B0.3 `Assets/` — `assets/charts/{top_40_chart,top_25_local_hip_hop,top_20_house,top_20_rnb_chart}`, `assets/logos`, `assets/icons`
- [x] B0.4 `onboarding.html` — merged (details → genres ≥8 → artists), new shell, ZW fields

## Phase 1 — Branding shell
- [x] B1.1 `index.html` (Hyped) — new shell, badge + text-logo header, artwork tiles, green, icons
- [x] B1.2 Landing/splash route — `landing.html` (TrackHype Logo Design.png on white) → Get Started / Explore

## Phase 2 — Onboarding polish (verify B0.4 vs spec) — pending

## Phase 3 — Charts page (`charts.html`)
- [x] Genre tabs (4 mapped artwork sets + placeholder for others)
- [x] Chart header (cover, heart fav via `heart_*` icons)
- [x] Rows using `assets/charts/<chart>/<n>.jpg`, 20→1 points
- [x] Expanded song detail (YouTube embed, listen links, artists, lyrics)

## Phase 4 — Voting engine (`trackhype.js`)  ← HIGH
- [x] Vote data model (chart+24h rule, position→points, user vs published)
- [x] Confirm-vote modal (openSheet): number input → validate 1..20 → move + shift down → points

## Phase 5 — Song page (`song.html`) — migrate to new shell, icons, lazy YouTube embed
- [x] Song detail: artwork, title/artist

## Phase 6 — New Music (`new-music.html`) — already new shell; verify vs spec, wire icons/filters
- [x] Copied to root, new shell, pipe stage labels verified

## Phase 7 — Artists index (`artists.html`) — A–Z, filters, Follow via state
- [x] A–Z bar, genre/status/year/sort filters, Follow buttons

## Phase 8 — Artist profile (`artist.html`) — bio, top songs, genres, chart history, links w/ icons
- [x] Profile, portrait, bio, top songs, chart history, official links w/ icons

## Phase 9 — History (`history.html`) — date + chart, Chart/Highlights/Artists tabs
- [x] Date + chart picker, tabs, generated rows (Zimdancehall typo fixed)

## Phase 10 — Search (`search.html`) — query search with tabs + icons
- [x] Query input, All/Songs/Artists/Charts tabs, result rows

## Phase 11 — Menu (`menu.html`) — profile, My TrackHype, artist CTA ($10 USD), settings
- [x] Profile card, My TrackHype links, artist CTA, settings

## Phase 12 — Playlist / Liked Songs (`playlist.html`) — favourites, play all
- [x] Favourite rows, play-all, play per track, heart removal

## Phase 13 — Submit Music (`submit-music.html`) — form + $10 USD payment (EcoCash/OneMoney/TeleCash); note payment ≠ chart
- [x] Multi-track form, genres, $10 USD total, preview, payment note

## Phase 14 — Artist Dashboard (`artist-dashboard.html`) — already new shell; verify + polish
- [x] Copied to root, new shell hooks verified

## Phase 15 — YouTube / WhatsApp / Share — share icon + WhatsApp share sheet, official embeds only
- [x] song.html: share icon + WhatsApp share sheet, lazy official embed

## Phase 16 — Data layer & QA
- [x] Seed richer demo dataset in `trackhype.js` — shared `CATALOG` (songs + artists + charts), `searchInCatalog`, wired into `search.html`; New Music artists diversified
- [x] Sweep: remove any red/#d81a1a, Pula, +267, `.co.bw` references (clean)
- [x] Verify all `Assets/` paths + icon usage everywhere (clean; chart artwork now maps real extensions)
- [x] Headless Chrome walkthrough all 14 pages (no console errors/exceptions; no 404s) — fixed `TrackHype.getState` export, music-icon placeholder, chart cover/artwork for placeholder charts, favicon links; verified scroll-hide, square toggle, vote modal flow (pos 5 → 16 pts, VOTED lock), share/WhatsApp sheet
