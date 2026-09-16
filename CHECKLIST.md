# TrackHype — Bit-by-Bit Build Checklist

Brand: `#01db8b` / `#02925e` on white, with 3 light muted greys.
Canonical shell: **new `.th-*` / `data-*`** (trackhype.css + trackhype.js). Legacy pages keep a compatibility shim in `trackhype.js`.

SADC-first (15 territories now, world later): ZW, BW, AO, KM, SZ, LS, MG, MW, MU, MZ, NA, SC, ZA, TZ, ZM. Each territory keys its own currency + mobile networks via `docs/info/world_currencies.json` + `docs/info/locations/`. **$10.00 USD per song** (anchor currency — region is display, not price). Payment via EcoCash/OneMoney/TeleCash (ZW) or territory-equivalent mobile money.

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

## Phase 2 — Onboarding polish (verify B0.4 vs spec) ✓ verified 2025-09-16

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

## Phase 17 — SADC territory data loader (`js/territories.js`)
- [x] Lazy-load `docs/info/locations/<code>_locations.js` on first access (script injection, avoids 650KB+ preload for mobile doctrine)
- [x] `TrackHype.territoryFor(code)` → { name, locations, currency{code, rate} (from `world_currencies.json`), genres } exposed as public API
- [x] Register all 15 SADC codes (ZW, BW, AO, KM, SZ, LS, MG, MW, MU, MZ, NA, SC, ZA, TZ, ZM)

## Phase 18 — Onboarding territory picker (onboarding.html)
- [x] "Also chart in…" multi-select step after genres (SADC territories list from `js/territories.js`)
- [x] Per selected territory: chart-type picker (which charts within that territory)
- [x] Save selected territories to profile (Supabase + fallback to localStorage)
- [x] ≥8 ZW home-genre gate stays; SADC territories use region genre pool (Phase 19)

## Phase 19 — Genre pool region-keying (index/charts/submit-music + any region-keyed page)
- [x] Genre selector reads from `global_music_genres_195_plus.json` keyed by user's home territory
- [x] Charts page filter tabs: region-specific genre list (not hardcoded 4)
- [x] index.html genre sections: dynamic per region
- [x] submit-music.html: genre picker uses territory pool from `js/territories.js`

## Phase 20 — Submit-music region picker
- [x] Territory selector (from profile or manual pick) flips currency to `world_currencies.json` display (BW→BWP, ZW→USD)
- [x] Territory genre pool applied to genre picker
- [x] Chart-in selection (from onboarding profile) pre-filled, editable per submission
- [x] $10 USD anchor price always shown; territory display = equivalent in local currency
