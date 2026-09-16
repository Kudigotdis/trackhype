
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
