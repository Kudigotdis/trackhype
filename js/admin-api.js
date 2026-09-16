/* ============================================================
   TrackHype Phase 2 - admin API wrapper (no npm).
   Load AFTER js/supabase-config.js and the supabase-js UMD CDN
   script (same order as js/api.js). Reuses the exact guard
   doctrine from js/api.js: an absent/offline Supabase must
   never throw - it returns { data: null, error } and the page
   degrades to a friendly offline banner.
   ============================================================ */
(function () {
  var cfg = window.SUPABASE_CONFIG || null;
  var ok = !!(cfg && cfg.url && cfg.anonKey && window.supabase);
  var client = ok ? window.supabase.createClient(cfg.url, cfg.anonKey, { auth: { flowType: "pkce" } }) : null;
  window.AdminAPI = {
    ready: function () { return ok && !!client; },

    /* ---- current user + admin gate ----------------------------- */
    async currentUser() {
      if (!client) return null;
      var r = await client.auth.getUser();
      return (r.data && r.data.user) || null;
    },
    async hasSession() {
      if (!client) return false;
      var r = await client.auth.getSession();
      return !!(r.data && r.data.session);
    },
    /* Admin is decided by profiles.is_admin (migration 0001). The
       submissions RLS in 0001 already lets an admin update any
       submission, so the frontend only needs to read/write the
       pending list - no extra policies required for approve/reject. */
    async isAdmin() {
      var user = await AdminAPI.currentUser();
      if (!client || !user) return false;
      var p = await client.from("profiles").select("is_admin").eq("id", user.id).maybeSingle();
      return !!(p.data && p.data.is_admin);
    },

    /* ---- pending submissions (view from migration 0009) -------- */
    async listPending() {
      if (!client) return { data: [], error: { message: "Supabase not configured" } };
      var adm = await AdminAPI.isAdmin();
      if (!adm) return { data: [], error: { message: "forbidden" } };
      return client.from("admin_pending_submissions").select("*").order("submitted_at", { ascending: false });
    },
    async setStatus(id, status, reviewNotes) {
      if (!client) return { data: null, error: { message: "Supabase not configured" } };
      var adm = await AdminAPI.isAdmin();
      if (!adm) return { data: null, error: { message: "forbidden" } };
      var patch = { status: status, updated_at: new Date().toISOString() };
      if (typeof reviewNotes === "string" && reviewNotes.trim()) {
        patch.review_notes = reviewNotes.trim();
      }
      return client.from("submissions").update(patch).eq("id", id);
    }
  };
})();
