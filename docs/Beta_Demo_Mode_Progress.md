# Beta Demo Mode — Progress

**Status:** code complete on `main` (phases 1–5 verified), pending push + live E2E.
**Roadmap:** `TrackHype_Market_Launch_And_Advertising_Roadmap.md` §10.

## Objective

Ship the TrackHype Beta as a **demo-first** experience: signed-out visitors see a fully
populated showcase; real country regions stay empty ("coming soon") until artists submit
and admin publishes. No banners or badges — the content itself is the demo.

## Model

| Concept | Storage | Meaning |
|---|---|---|
| Identity region | `localStorage["trackhype.region"]` | Set at onboarding only. The region an account user can vote in. |
| View | `sessionStorage["trackhype.view"]` | Current browsing view: `{mode:"demo"}` or `{mode:"region", region:{...}}`. Session-only. |
| Persona | derived | `localStorage["trackhype_onboarding_complete"] === "true"` → account, else browser. |

Exports from `trackhype.js`: `currentView()` / `currentMode()` / `persona()` / `canVote()` /
`votingLocked()` / `setView()` / `clearView()` / `identityRegion()` / `anyRealContent()` /
`loadPublishedChart()` / `dbChartKeyFor()`.

### Rules

1. Always default to **Browser / Demo**. A fresh visit never lands in a real region.
2. Tapping a real country shows that region's **empty** state — zero demo content.
3. Region picks for browser visitors are **session-only** and do not persist.
4. Voting is frozen until real content exists, and only inside the account's own region.
5. Demo seeds are created **only** in Demo mode (no mixing with real DB content).
6. Pages gate on **view mode**, not persona, so browser-tapped regions are also empty.

## Phases

### Phase 1 — Mode core
- `trackhype.js`: persona/mode/view/`canVote`/`votingLocked` helpers + exports.
- `buildDemoPlaylist()`: no demo priority outside Demo mode.
- Header flag is demo-aware; `territories.js regionDefault()` returns a
  `{code:"DEMO", name:"Browser"}` descriptor; `tracker.js regionCode()` returns `"DEMO"`
  for the demo view.
- Harness: 23/23 pass.

### Phase 2 — `region-selector.html`
- Removed `REGION_KEY` / `DEFAULT_REGION` / `loadRegion`.
- Orange `.rs-demo` "Browser Mode" group first; taps call `TrackHype.setView(...)` then `history.back()`.

### Phase 3 — Content switching / empty states
| Surface | Behavior |
|---|---|
| `charts.html` | `DEMO_MODE`/`REGION_NAME`/`REGION_SUFFIX` titles; `regionEmpty()`; `ensureSeed` demo-only; empty branch in `renderTierIntro` + `renderList`. |
| `index.html` | `demoMode()` + view-aware `currentRegionCountry()`; radio row filtered; `renderAllContent` empty state; region view always empty (demo-only sections). |
| `history.html` | `regionEmpty()`; `ensureSeed` demo-only; empty states in `renderChart` + `render`. |
| `playlists.html` / `new-music.html` | Demo-only catalogs; region view shows empty state, never demo. |
| `artists.html` / `search.html` | Demo-only catalogs; region view shows empty state. |
| `radio-charts.html` | View-aware country; honest empty when a region has no stations. |
| `menu.html` | `modeLine()` explains Browser vs region view. |

### Phase 4 — Voting freeze
Gate behind `canVote()` with `TrackHype.toast(reason)`:
`charts.html openBallotSheet`, `playlists.html voteSongIntoChart`, `playlist.html voteSong`,
`artist.html voteArtistSong`, plus `trackhype.js confirmVoteSheet` / `recordVote` / `submitBallot`.

### Phase 5 — Real-content bridge
- `js/api.js chartEntries()` embeds `song_artists(artist:artists(name))`.
- `trackhype.js loadPublishedChart(chartKey, weekKey, dbKey)` fetches `API.chartEntries`,
  maps rows into a **non-seed** local snapshot + tier2/tier3 submissions, and fires
  `trackhype:chart-update`. `dbChartKeyFor()` maps local chart ids → DB chart keys.
- Wired at boot on `charts.html` (when `!DEMO_MODE && regionEmpty()`) and `history.html`.
- Harness: 36/36 pass (includes bridge mapping + ingest).

### Phase 6 — PWA + docs
- `manifest.json` icons present; `rel="icon"` + `apple-touch-icon` on all root pages.
- This document + roadmap §10.

### Phase 7 — Ship (pending)
- Commit per surface, `git push`, verify live on `https://trackhype.github.io/trackhype/`.

## How to verify

Fresh browser profile:
1. Open the app → lands in **Browser / Demo** with full showcase content.
2. `region-selector.html` → tap a country → that region shows **coming soon**, no demo.
3. Reload / new session → back to Browser / Demo.
4. Sign in with an account → lands in own region (empty). Vote → blocked with reason.
5. (After admin publishes) charts/history hydrate from the DB via the bridge; voting unlocks.

## P0 DB runbook (SQL Editor — apply in order)

The bridge, ad campaigns and chart manager all read tables that require migrations
**0011–0015**. Apply them in this order (all idempotent / safe to re-run):

| # | File | Why |
|---|---|---|
| 0011 | `20260914_0011_analytics_events.sql` | event log + admin views |
| 0012 | `20260916_0012_advert_campaign_fields.sql` | advert start/end windows |
| 0013 | `20260916_0013_chart_content_manager.sql` | chart entry update/delete RLS + uniqueness guard (needs 0011) |
| 0014 | `20260916_0014_promote_submission.sql` | approve → catalog RPC (needs 0013) |
| 0015 | `20260917_0015_analytics_anon_insert.sql` | widen analytics insert policy to `anon` so signed-out events persist |

Verify after each:
```sql
select polname from pg_policy where polrelid = 'public.analytics_events'::regclass;
select * from public.admin_platform_summary;
select * from public.chart_entries limit 5;
```

### Exercise the bridge end-to-end
1. Sign in to `admin.html` with an admin profile.
2. Submissions tab → **Approve** a test submission (creates artist/song via 0014 RPC).
3. Chart Manager → pick a chart/week → add the promoted song → **Publish as new week**.
4. Open `charts.html` as an account user in that region → chart shows the **non-seed** entry
   (no demo seeds mixed) → voting unlocks (`canVote().ok === true`).

## Open work

- **P0** — apply 0011–0015, then run the bridge exercise above.
- **P1** — interactive browser E2E pass on the live site.
- **P2** — payment gateway (§9 red flag), custom domain + SSL (§7), ballots 1-per-24h/device DB constraint.
- **P3** — real-content rendering for home / new-music / artists / playlists / search; DRC + world territories.

