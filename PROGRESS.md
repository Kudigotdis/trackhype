
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
