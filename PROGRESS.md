# TrackHype — Progress & Roadmap

## What TrackHype is
Music discovery/voting web app. Static frontend (HTML/CSS/JS, no build step), hosted on GitHub Pages, backed by Supabase (auth + Postgres + RLS).

- **Live site:** `https://kudigotdis.github.io/trackhype/` — auto-deploys from `main`, ~1 min.
- **Local dev:** `Start TrackHype.bat` → `py serve.py --open` → `http://localhost:8080`.
- **Supabase:** project `xtjbaaawzwzwiewzkrsa`. Anon key in `js/supabase-config.js` (publishable by design; RLS is the real protection).
- **Shared shell:** `trackhype.js` (`TrackHype.navigate`, `.toast`, `.esc`, sheet/modals). Supabase JS client loaded from CDN before `js/api.js`.

## Decisions locked (2026-09-15)
- **Artist identity:** self-declared. Owner needs an **admin approval dashboard** (legal will confirm the artist list) before an artist profile is "verified/represented".
- **Login required to vote and to follow** (fan actions). Browsing charts/music stays public; login is required at the confirm step.
- **Votes move to Supabase** (real, per-profile vote history); localStorage stays as a warm local cache fallback.
- **Profile page:** new `profile.html` (view + edit; preferences editable there).
- **Public browsing:** keep charts/music/song/artist pages readable before signup.

## What's done

### Auth infra — `js/api.js` + `js/supabase-config.js`
- Config committed and loaded before `api.js` on all relevant pages.
- `API` wrapper: `ready`, `getSession`, `currentUser`, `signInWithEmail`, `signUp`, `signOut`, `resendConfirmation`, `emailConfirmed`, `getProfile`, `saveProfile`, `profileGenres`, `syncPendingProfile`, auth-change + flow hooks.
- Redirect capture (`handleAuthRedirectUrl`): handles tokens in URL query, hash, PKCE `?code`, and `?token_hash` (incl. `type=recovery`); runs on load + `pageshow`, then strips tokens from the URL bar.
- Password reset: `resetPassword`, `updatePassword` (8+ chars, confirm match), `onPasswordRecovery(cb)`.
- **Recovery landing fix** (`c3798eb`): `resetPassword` uses deterministic `?reset=1` marker; non-`menu` recovery landings auto-route to `menu.html?reset=1` (all non-`menu` paths incl. root → no more dead-end at `/trackhype/`).
- **Auth gate + PKCE reset** (`a188fde`):
  - Client now uses `flowType: "pkce"` (api.js:12); email-link redirects land with `?code=` and are exchanged via `exchangeCodeForSession` (api.js:77).
  - `TrackHype.requireProfile(feature)` (trackhype.js:4628): signed-in+profile check; if signed out, prompts an **in-sheet** sign-in with "Forgot password?" → "Send reset link" → "Check your inbox" views, so page state/audio player is never disturbed. Returns the profile row (or deprecation guard offline).
  - Charts ballot gated at the confirm step: `openBallotSheet()` is now async and awaits `TrackHype.requireProfile("vote")` (charts.html).
  - Router lazy-loads missing external `<script src>` deps (Supabase CDN, config, api.js) during in-SPA navigation so gated pages work without a full reload.
  - History seeding fixed: `ensureSeed()` checks `getSnapshots(c)` instead of a per-week submissions map; `TH_SEED_REV` bumped to 5 (charts + history).

### Onboarding — `onboarding.html`
- 6 steps: personal info → music preferences → region → account (email/password) → verify → create profile.
- Email confirmation ON, with an in-app overlay (no browser `alert()`).
- `finish()` builds profile (username, location, bio, mobile money number), stores a pending profile locally, `syncPendingProfile()` pushes once the session is live.
- Real region data: `docs/info/countries_mobile_networks.js`, `docs/info/mobile_money_banking_services.js`.
- Vet/artist self-declare flag captured; KYC status stored.

### Sign-in — `menu.html` popup
- "Sign In / Sign Up" floating popup (choice + log-in form), inline validation, Enter-to-submit, in-popup errors.
- Signed-in card (initials, name, "Logged in as", Log out).
- `renderProfile()` hydrates from Supabase + mirrors to localStorage; `hydrate()` syncs genres/preferences.
- Mobile double-tap close bug fixed (grace window, `touch-action:manipulation`, double-submit guard).

### Database (Supabase, SQL applied in editor — "Success. No rows returned.")
- `profiles` keyed to `auth.users.id`; RLS on.
- Migrations committed + applied:
  - `0006_add_mobile_money_number.sql` → `profiles.mobile_money_number`
  - `0007_auth_location_fields.sql` → `profiles.location` + `bio`, rebuilt `handle_new_user()` trigger (auto-creates `profiles` row on signup, maps location/bio/mobile money).

### Deployed (all on `main`)
`85e0cba` config + redirect capture + confirmation overlay + pending profile + migrations
`422a392` hardened redirect handling + menu signed-in card/logout
`1f81968` sign-in popup
`5b5c9e0` double-tap fixes
`0ea8138` full password-reset flow (api + menu + onboarding link)
`c3798eb` recovery-landing `?reset=1` fix
`a188fde` voting auth gate (`requireProfile`) + PKCE email-link flow

## Current status — needs a final check
1. **Reset end-to-end (PKCE):** built and pushed. **`resetPassword` redirect bug fixed** (`charts.html&reset=1` malformed URL — search params were dropped; email links now always target `menu.html?reset=1`). Testing needs a **fresh** reset link (the last one also showed `otp_expired`). Reset links redirect to `origin + path + menu.html?reset=1&code=…`.
2. **Supabase Dashboard → Authentication → URL Configuration** (owner action):
   - **Site URL:** `https://kudigotdis.github.io/trackhype`
   - **Redirect URLs:** add `http://localhost:8080/**` and `https://kudigotdis.github.io/trackhype/**`
3. Account `ambitious450@gmail.com` exists, **email-confirmed**. Current password unknown → reset is the path back in.
4. **localStorage is per-origin.** Profiles created on `localhost:8080` won't appear on the hosted site until signed in there (then it syncs from Supabase). Verify on the hosted origin.
5. **Untracked (do not stage accidentally):** `PROGRESS.md`, `TrackHype_Market_Launch_And_Advertising_Roadmap.md`. (All code from the auth-gate work is committed in `a188fde`.)

## Roadmap — gating behind valid profile / artist profile

### Phase A — foundation
- ~~Auth gate helper in `trackhype.js`: `TrackHype.requireProfile(feature)`~~ → **done** (`a188fde`); wired into the charts ballot.
- Finish the reset-password end-to-end test (PKCE — needs Supabase URL config + a fresh reset link).

### Phase B — view profile + preferences
- Build `profile.html`: signed-in card, bio/location/mobile money/genres — read + edit via `API.saveProfile()` + genre tables; keep localStorage mirror in sync.
- `menu.html` profile card/shell links to it.
- Gate: only reachable signed in.

### Phase C — lock interactive features
- Wire `requireProfile()` into:
  - **Voting** (`recordVote`, `confirmVoteSheet`, `submitDiscoveryBallot`, `hasVotedToday`, `aggregateVotes` in `trackhype.js`) at the confirm step.
  - **Following** (genres, songs, artists, charts) — new `follows` table keyed by profile id.
- **Migrate votes to Supabase:** new `votes`/`discovery_ballots` tables (user id, chart, song, position/points/upvotes, date/week); reads on `history.html`/`charts.html` switch from localStorage to the DB; keep localStorage as cache.
- **Notifications** (`notifications.html`): gate + populate from real events (votes/follows on your songs/subs).

### Phase D — artist identity + admin approval
- Self-declare as artist → `kyc_status = pending` (already captured at onboarding).
- **Admin approval dashboard** (owner-only, e.g. `admin.html`): lists pending artists from legal, approve/reject → flips a verified/"represented" flag; approved artists unlock `artist-dashboard.html` + are listed on artist pages.
- Decide the exact "represented" marker (e.g. `profiles.role = 'artist'` + `artist_approved = true`).

## Working notes / gotchas
- **Never commit without checking `git status`**: untracked files right now are `PROGRESS.md` and `TrackHype_Market_Launch_And_Advertising_Roadmap.md`; all code is committed.
- GitHub Pages deploys root of `main`; verify each auth change on the hosted origin (hard refresh Ctrl+Shift+R).
- Validate scripts with `node --check` on extracted inline scripts + `js/api.js` before pushing.
- Reset links are PKCE: fresh link required (old/expired clicks fail with `otp_expired`). `resetPassword` builds `origin + dirname(pathname) + "menu.html?reset=1"` deterministically — this avoids the old bug where a non-empty `location.search` produced a malformed `pathname&reset=1` redirect.

## Test checklist (release-ready)
- [ ] Reset email → link (fresh, PKCE `?code=`) → "Set a new password" popup → save → signed in card updates.
- [ ] Guest taps Vote on charts → in-sheet sign-in → ballot continues where it was.
- [ ] Sign-in on hosted origin hydrates profile card + preferences.
- [ ] Vote recorded to Supabase, 1/chart/day enforced, visible in vote history.
- [ ] Follows saved per profile, reflected on song/artist/chart pages.
- [ ] Artist self-declares → appears in admin dashboard → approve → artist dashboard unlocks.
- [ ] Notifications reflect real events for the signed-in user.