
---

## SESSION END — 2025-09-16 (admin slice: pending submission moderation)

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
