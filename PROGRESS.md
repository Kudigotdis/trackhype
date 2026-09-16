
---

## SESSION END — 2025-09-16 (parallel work committed + ad engine + tracker coverage)

**Scope: land the user's parallel admin/analytics/legal work, ship migration 0011, ad engine (API.adverts + placements + impression/click tracking), full tracker coverage, fix submit-music submission write-path gap.**

### Commits (in order; all pushed to origin/main)
| Commit | Slice |
|--------|-------|
| `af16f33` | fix: migration 0010 — append `metadata` last in admin view (42P16 rename fix; applied in SQL Editor — ledger CLOSED for 0010) |
| `5da9c9e` | feat: analytics event layer — js/tracker.js (`window.TRACK`) + migration 0011 (analytics_events + admin views + KYC queue) |
| `9cc86af` | feat: admin dashboard overhaul — Overview/Submissions/Song Analytics/Event Feed/Votes/KYC/Ads/Radio/Charts tabs; admin-api.js 13 methods |
| `766629c` | feat: privacy-policy.html + terms-of-use.html (+ .txt sources), linked from settings |
| `921a4e2` | feat: wire TRACK analytics into 8 app pages + playback heartbeats in trackhype.js |
| `0943e8e` | feat: ad engine — `API.adverts(placement)` + `TrackHype.renderAdSlots()` (`[data-ad-slot]` containers, cycling, demo fallback, `TRACK.impression`/`campaignClick`) |
| `221fae8` | feat: wire TRACK into remaining 15 app pages (+ UMD/config where absent) — **fixes latent submit-music write-path bug** |

### Notable findings this session
- **42P16 root cause**: PostgreSQL `CREATE OR REPLACE VIEW` can only append new columns at the END of the column list — inserting `s.metadata` (migration 0010) at position 6 was read as renaming `submitted_at` → `metadata`. Fixed by appending last.
- **submit-music write-path gap (fixed)**: `submit-music.html` loaded `js/api.js` with NO supabase UMD/config, so `API.saveSubmission` had `client = null` and silently returned "Supabase not configured". The tracker-wiring pass added the full stack to all pages lacking it — verified same script-load ordering as pages that work.
- **Mojibake false alarm**: the PowerShell `Set-Content` diff-capture re-encoded UTF-8, making legit `—`/`·`/`→` (artist-dashboard.html) look like `ÔÇö`. Raw-file byte check confirmed clean; only the capture pipeline was at fault.
- api.js / admin-api.js / trackhype.js high-bytes: all legitimate em-dashes in comments (UTF-8 e2 80 94), zero mojibake, zero `**`.

### Ad engine status (roadmap §1)
- `API.adverts(placement)` — live (public-read RLS ships in 0001; admin manage via AdminUI.listAdverts/updateAdvert).
- `TrackHype.renderAdSlots()` — runs on DOMContentLoaded; groups `[data-ad-slot]` by placement, cycles active ads, retains demo promo fallback when DB empty, fires `TRACK.impression("campaign",...)` on intersect + `TRACK.campaignClick(...)` on tap. Harness verified: f1→ad-f1, f2→ad-f2 cycling, grouping, blank slots stay blank.
- index.html slots live: `home-radio`, `home-recent`, `home-national`, `home-feed`. **OPEN**: charts in-feed sponsor card, radio sponsor card (`radio-charts/radio-station`), menu showcase banner.

### Analytics status (roadmap §7)
- tracker.js wired into ALL 23 app pages. Events flow to `analytics_events`; admin views (platform_summary, song_analytics, event_feed, pending_kyc) surface them. GA/Plausible not used — custom layer instead (noted in roadmap).

### SQL Editor ledger: OPEN (migration 0011).
```sql
-- paste supabase/migrations/20260914_0011_analytics_events.sql and RUN (mostly idempotent)
-- note: "analytics insert auth or anon" policy is FOR INSERT TO authenticated —
-- unauthenticated (anon) impressions will NOT persist unless you add TO anon.
```

### Still open
- Charts / radio / menu ad placements (slice next).
- Ballots RLS: no DB unique constraint (1-per-24h enforced client-side only).
- PWA real 192/512 icons (manifest uses sizes "any").
- Payment gateway integration (Phase 33), custom domain, pitch kit.
- `UTILISE INFORMATION/` enterprise dashboard + the two `.ps1` verify scripts + the roadmap `.md` remain untracked (user-held).

---

## SESSION END — 2025-09-16 (launch-readiness slice batch: 21-24 + 26 committed)

**Scope: closure of critical funnels gate production-launch gaps.** 5 commits on top of the SADC expansion.

### Commits (in order)
| Commit | Slice |
|--------|-------|
| `960f259` | Phase 21 submission write path: metadata JSONB + API.saveSubmission + confirmAndPay async wiring |
| `f5e3a7f` | Phase 22 PWA: manifest.json + service worker cache-first (th-v1) + registration on 23 app pages |
| `1f5937e` | Phase 23 Open Graph + twitter:card meta on all 25 pages |
| `a921767` | Phase 24 onboarding: 11 alert() → TrackHypeToast() + 'Return home' on email-confirm modal |
| `7d655e3` | Phase 26 phone E.164 validation: e164Ok() 8-15 digits + inline .ob-error per number field |

### Files changed
- `supabase/migrations/20260914_0010_submission_metadata.sql` (NEW) — `ALTER TABLE submissions ADD COLUMN metadata JSONB DEFAULT '{}'`; admin_pending_submissions view now COALESCEs artist/song FKs with metadata->>'artist' / ->>'song_title' so entries show pre-moderation. **SQL Editor ledger: OPEN — run 0010.**
- `js/api.js` — `API.saveSubmission(submission)`: insert user_id + status 'Submission Received' + payment_status 'not_paid' + metadata. Offline/absent-supabase → {data:null,error} like the rest.
- `submit-music.html` — `confirmAndPay()` async; adds territory{code,name} to payload; when signed in persists via API.saveSubmission and sheet shows Server line 'Received by TrackHype.'; else 'Sign in to sync...' fallback keeps sessionStorage path.
- `manifest.json` (NEW) — standalone/portrait, theme #01db8b, bg #ffffff, badge + logo icons (sizes 'any').
- `sw.js` — install pre-caches app shell; activate cleans old caches; fetch = network-first navigate (index.html offline fallback), cache-first static, skips cross-origin/non-GET.
- 23 app pages (all except bottom-nav-music-player.html + bug-reporter.html) — head gained `<link rel=manifest>` + apple-touch metas + SW registration (pure +6 insertion each, numstat 6/0).
- All 25 pages — OG title/description/image/url + twitter:card after <title> (page-map titles; pure +6 insertion each, numstat 6/0).
- `onboarding.html` — 11 alert() → TrackHypeToast (image validation gateway, finish/login gates, network/signup/profile errors); email-confirm modal + 'Return home'; e164Digits/e164Ok + onPhoneInput + 3 .ob-error elements (mobile/WhatsApp/mobile-money + own dial codes); stepDone(1) switched from raw <7-digit to e164Ok.

### Verification (byte-truth this session)
- api.js node --check PASS (high-bytes = 9, all pre-existing header lines L2/L17, none in new block).
- submit-music.html inline node --check PASS. Harness proved: signed-in → saveSubmission called with submission payload; guest → saveSubmission not called, sessionStorage fallback preserved, sheet Server line flips 'Received by TrackHype.' / local-hint.
- onboarding.html main inline block (57,057 chars) node --check PASS; zero `**` artifacts; diff = 11 line-swaps + 1 inserted button (24) + 50/6 (26: 3 .ob-error elements + helpers + stepDone rewrite + CSS).
- E.164 harness: ZW 770000000→true, ZW 77→false, ZW 19-digit→false, BW 71000000→true, 8-digit edge→true, empty→false.
- sw.js node --check PASS (0 high-bytes); manifest.json ConvertFrom-Json parses.
- All page diffs verified pure-addition (numstat 6/0 per page for PWA and OG passes); inserted lines 0 high-bytes.

### Roadmap checkoffs (TrackHype_Market_Launch_And_Advertising_Roadmap.md, still untracked)
Auth §2 all four items [x] (redirect token handling was ALREADY done in api.js L51-101; profile hydration ALREADY in menu hydrate(); location sync ALREADY in 0007 trigger). §3 KYC phone validation [x]. §5 PWA both items [x]. §6 OG [x].

### SQL Editor ledger: OPEN (migration 0010).
```sql
-- paste supabase/migrations/20260914_0010_submission_metadata.sql and RUN (idempotent)
alter table public.submissions add column if not exists metadata jsonb default '{}'::jsonb;
```

### Still open (roadmap, untouched this session)
- §1 ad engine: API.adverts() + banner placements + impressions/clicks (adverts table exists from 0004; api.js has no query fn).
- §3 strict limit: ballots RLS is owner-only, index (user_id, week_key); 1-vote-per-24h is enforced client-side in trackhype.js — no DB unique constraint.
- §4 admin: KYC verification queue, ad campaign manager, chart content manager (only pending-submissions queue ships today).
- §7 legal (privacy.html/terms.html), custom domain, analytics (GA/Plausible).
- §8 pitch kit + advertiser demo account.
- PWA icon sizing: badge/logo used with sizes 'any' — real 192/512 PNG icons still to be supplied.

---

## SESSION END — 2025-09-16 (SADC multi-territory expansion: all slices committed)

**Scope completed: SADC-first multi-territory enablement (15 territories, world later).** Doctrine flipped: CHECKLIST.md L6 is now SADC 15-territory + world-later. Four build slices committed.

### Commits (in order)
| Commit | Slice |
|--------|-------|
| `3545fef` | docs-slice + data-slice: SADC 15 codes, js/territories.js, 13 geojson, world_currencies.json, 195+ genres json |
| `64925ee` | genres-slice: region-keyed genre pool across submit-music/index/charts via getGenrePool() |
| `714e07b` | onboarding-slice: "Also chart in…" SADC territory + chart multi-select in step 4 |
| `88a8a4d` | submit-music-slice: territory picker + dual-currency price + chart-in pre-fill from profile |

### Files changed (all ASCII-clean, node-verified, >127-byte count zero on new files)
- `js/territories.js` — SADC registry: TERRITORY_CODES[], getTerritories(), territoryFor(code), regionDefault(), loadTerritoryLocations(code,cb), getGenrePool(genreKey). Lazy fetch for 13 SADC geojson; dynamic <script> for ZW/BW root location globals. Mirrors api.js {data,error} contract.
- `onboarding.html` — step 4 "Also chart in…" panel; S.chartIn map; chartInPayload() serialized into account.chartTerritories + meta.chart_territories + pending stash.
- `submit-music.html` — Chart Territory <select> in Artist Details; moneyEquivalent() for dual-currency display; rerenderGenrePills(); chart-in options pre-filled from trackhype_account.chartTerritories.
- `index.html` — cultureGenres region-aware: ZW keeps curated GENRE_ONE showcase; non-ZW uses getGenrePool(); hero/randDemoSong fallbacks handle pool-only genres.
- `charts.html` — CHART_TITLE_REGION label on top chart row; chart topology unchanged (territory charts arrive with later real data).
- `docs/info/locations/` — 13 x cities-&-towns-*.geojson (FeatureCollection of Point features: name/region/country).
- `docs/info/world_currencies.json` — SADC rows byte-confirmed: BW→BWP 67.25 P/134.50 P, ZW→USD, AO→AOA 4,625/9,250, ZA→ZAR 81/162, etc.
- `docs/info/global_music_genres_195_plus.json` — 34 genres per SADC country; catalogue maps id→name (pop→Pop, afrobeats→Afrobeats, etc.)
- `CHECKLIST.md` — L6 flipped ZW-only→SADC; Phases 17-20 marked [x].

### Verification (byte-truth this session)
- territories.js: 201 lines, 0 high-bytes, 0 double-stars, node --check PASS. Functional: getTerritories→15, regionDefault→BW when saved, getGenrePool→34 names, loadTerritoryLocations ZW→script path OK, ZA→geojson fetch OK (cities-&-towns-south-africa.geojson resolved).
- submit-music.html inline block: 55KB, node --check PASS. Functional: moneyEquivalent(1)→"10.00 X", moneyEquivalent(3)→"30 X", parseMoneyAmount("134.50 P")→134.5.
- onboarding.html inline block: 55KB, node --check PASS. Functional: chartInPayload after add BW→[{code:'BW',...}], pickChartInChart adds "House Top 20", pickChartIn removes BW→[].
- index.html + charts.html: git diff only +21 insertions total, pre-existing high-bytes confirmed (no introduced non-ASCII).
- Headless Chrome TODO: will verify on next push to GH Pages; no blocking console errors expected.

### SQL Editor ledger: STILL CLOSED. Migrations 0001–0009 all on-disk + applied. No 0010. No new columns used in these slices (chart territories rides user_metadata / localStorage; geojson/currency/genre data are static files). Profile row: chart_territories written as JSONB into user_metadata via handle_new_user trigger metadata; Supabase Storage bucket public (`trackhype-media`).

### Gotchas
1. **Lazy geojson under file://:** loadTerritoryLocations for the 13 SADC countries uses `fetch('docs/info/locations/cities-&-towns-<slug>.geojson')`. On GitHub Pages (HTTP) this works. Under file:// (local dev) it resolves to `{error}` gracefully — mirrors the offline-first doctrine. User may want to add a dynamic <script> loader for local dev if needed.
2. **Lesotho $10 quirk:** world_currencies.json lists Lesotho $10 as "162.00 M" (not "L"). Kept byte-faithful to the source file — likely a typo in the data asset, not an app bug.
3. **DRC (CD) missing:** SADC has 16 members; DRC/Congo has no location file or entry in TERRITORIES. User explicitly said "world regions later" — DRC will be added then.
4. **Onboarding `renderChartIn()` timing:** called after `renderGrid("genres")` and after `renderRegionDependents()`. If region is changed mid-onboarding, the chart-in chips re-render to exclude the new home territory. `setRegion()` triggers `renderRegionDependents()` → `renderChartIn()`. Safe.

---


## SESSION END (admin slice) — 2025-09-16

**This session's slice — pending-submission admin moderation (Phase 2).**

**Files (all ASCII-only, node-verified):**
- `admin.html` — sign-in gate → admin check → `admin_pending_submissions` list with Approve / Reject buttons.
- `js/admin-api.js` — guarded Supabase wrapper (mirrors js/api.js doctrine: absent/offline Supabase never throws, returns `{ data, error }`).
- `supabase/migrations/20260914_0009_pending_submission_admin.sql` — idempotent: view of pending submissions + admin-only RLS (re-usable, re-runnable).

**SQL Editor task (exactly ONE, in order):**
1. SHOW ensure you're applying *after* migration 0009 → paste `supabase/migrations/20260914_0009_pending_submission_admin.sql` into SQL Editor and RUN. It is idempotent (drop + create view/policy) so re-running is safe.
2. Verify it took — run: `select * from public.admin_pending_submissions limit 1;` — should return zero rows (no pending yet) or the pending rows.

**GOTCHA (the lesson that genuinely cost this session — record it, spare yourself next time):**
The mojibake doctrine now has a second clause. Not only does the **edit tool render** silently distort non-ASCII (learned last session: `return p;` → `return p<pb679 bytes>;`), this session it bit in a NEW way: **the `write` tool wrote an inline script block byte-perfect, but my own *interleaved* PowerShell heredoc `$body` in a wrapper was what carried the double-asterisk `null**` artifact into `js/admin-api.js`** — the file check gate `node --check` (byte-truth, not render) caught it at 0. Unlearn the habit of *interpolating project source into a PowerShell here-string*. Write slices as their own files, and let the *file* be the truth — never inline-string the code through a second parser.

---

## SESSION END (chart-rules slice) — 2025-09-16

**Slice: 'Rules' trigger on charts.html → voting-rules.html (page, NOT modal — user instruction).**

Byte-truth of the slice (each byte-proven this session):
- charts.html received **exactly ONE insertion** (git diff U0 byte-truth, 1 file / 1 line): a <button class="th-btn secondary" ... onclick="TrackHype.navigate('voting-rules.html')">Rules</button> in the .chart-filter-row section, next to #chartFav + #filterRow.
- The button uses the **page's own shared navigate contract** — TrackHype.navigate (byte-proven public export at trackhype.js:4677; voting-rules.html already uses the identical idiom at :113 to go to charts.html). charts.html loads trackhype.js at :221, so the global is in scope. No new API invented.
- oting-rules.html **already existed** (140 lines / 7,640 bytes, new shell, full rules copy: The ballot / The chart week / On Top / Contenders / Newest / Tie-breakers / Artist submissions = 10 USD). It was **orphaned (no inbound link anywhere)** — this slice wired the missing inbound trigger. No voting-rules.html edits were needed.

**SQL Editor ledger: STILL CLOSED.** Migrations 0001-0009 all on-disk + applied (0009 = admin_pending_submissions view, ran "Success. No rows returned" = correct). No 0010 exists. voting-rules.html carries the local-only / 10-slot ballot copy — matches its page's own doctrine.

**GOTCHA (byte-truth, keep it):** the "modal vs page" instruction caught the pre-existing pattern cleanly — charts.html's .chart-filter-row was already the correct home (shell presses the shared sheet API there for VOTE), but the rules copy belonged in the existing **page** (voting-rules.html), so a modal was the WRONG vehicle. Mirror rule-of-thumb: when a page for the content ALREADY exists with the right shell + copy, wire the inbound trigger — never build a second vehicle.
