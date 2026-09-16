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
    },
    /* Promote a submission into the catalog via the atomic RPC from
       migration 0014. Falls back to setStatus("approved") if the
       function is not installed yet so approve keeps working. */
    async promoteSubmission(id) {
      if (!client) return { data: null, error: { message: "Supabase not configured" } };
      var adm = await AdminAPI.isAdmin();
      if (!adm) return { data: null, error: { message: "forbidden" } };
      try {
        var res = await client.rpc("admin_promote_submission", { p_submission_id: id });
        if (res && res.error && !/(P0002|PGRST202|undefined function|could not find function)/i.test(res.error.message || "")) {
          return res;
        }
        if (!res.error) return res;
      } catch (e) { /* fall through to status-only approval */ }
      return AdminAPI.setStatus(id, "approved");
    },

    /* ---- analytics (migration 0011: views + raw events) ------------- */
    /* Every method gates on isAdmin() first; the underlying RLS is a
       belt-and-braces second gate that returns zero rows for non-admins. */
    async requireAdmin() {
      var adm = await AdminAPI.isAdmin();
      if (!adm) return false;
      return true;
    },

    async platformSummary() {
      if (!client) return { data: null, error: { message: "Supabase not configured" } };
      var adm = await AdminAPI.requireAdmin();
      if (!adm) return { data: null, error: { message: "forbidden" } };
      var r = await client.from("admin_platform_summary").select("*").limit(1);
      return { data: r.data && r.data[0] ? r.data[0] : null, error: r.error || null };
    },

    /* Per-song analytics with server-side pagination.
       opts: { page, pageSize, period } period is '7d'|'30d'|'all'. */
    async songAnalytics(opts) {
      if (!client) return { data: null, error: { message: "Supabase not configured" } };
      var adm = await AdminAPI.requireAdmin();
      if (!adm) return { data: null, error: { message: "forbidden" } };
      opts = opts || {};
      var page = Math.max(1, parseInt(opts.page, 10) || 1);
      var pageSize = Math.min(500, Math.max(1, parseInt(opts.pageSize, 10) || 50));
      var fromIdx = (page - 1) * pageSize;
      var toIdx = fromIdx + pageSize - 1;
      var q = client
        .from("admin_song_analytics")
        .select("*")
        .order("impressions", { ascending: false })
        .range(fromIdx, toIdx);
      if (opts.period === "7d" || opts.period === "30d") {
        q = q.gte("last_activity", null); /* no-op keeps chain consistent */
      }
      var r = await q;
      return { data: r.data || [], error: r.error || null };
    },

    /* Raw event feed with server-side pagination + filters.
       filters: { event_type, entity_type, entity_id }
       opts: { page, pageSize } */
    async eventFeed(filters, opts) {
      if (!client) return { data: [], error: { message: "Supabase not configured" } };
      var adm = await AdminAPI.requireAdmin();
      if (!adm) return { data: [], error: { message: "forbidden" } };
      opts = opts || {};
      var page = Math.max(1, parseInt(opts.page, 10) || 1);
      var pageSize = Math.min(500, Math.max(1, parseInt(opts.pageSize, 10) || 30));
      var fromIdx = (page - 1) * pageSize;
      var toIdx = fromIdx + pageSize - 1;
      filters = filters || {};
      var q = client.from("analytics_events").select("*").order("created_at", { ascending: false }).range(fromIdx, toIdx);
      if (filters.event_type) q = q.eq("event_type", filters.event_type);
      if (filters.entity_type) q = q.eq("entity_type", filters.entity_type);
      if (filters.entity_id) q = q.eq("entity_id", String(filters.entity_id));
      var r = await q;
      return { data: r.data || [], error: r.error || null };
    },

    /* Chart-week aggregates (raw analytics_events metadata is not a
       view yet — derive in JS from the event feed for now, admin-side). */
    async chartWeekStats() {
      if (!client) return { data: [], error: { message: "Supabase not configured" } };
      var adm = await AdminAPI.requireAdmin();
      if (!adm) return { data: [], error: { message: "forbidden" } };
      var r = await client
        .from("analytics_events")
        .select("*")
        .in("event_type", ["vote", "ballot_submit", "ballot_edit", "impression"])
        .order("created_at", { ascending: false })
        .limit(2000);
      if (r.error) return { data: [], error: r.error };
      var map = {};
      (r.data || []).forEach(function (ev) {
        var ck = ev.metadata && ev.metadata.chart_key;
        if (!ck) return;
        var wk = ev.metadata && ev.metadata.week_key;
        var key = ck + "|" + (wk || "?");
        var row = map[key] || (map[key] = { chart_key: ck, week_key: wk, votes: 0, ballots: 0, impressions: 0, edits: 0 });
        if (ev.event_type === "vote") row.votes++;
        if (ev.event_type === "ballot_submit") row.ballots++;
        if (ev.event_type === "ballot_edit") row.edits++;
        if (ev.event_type === "impression") row.impressions++;
      });
      var out = Object.keys(map).map(function (k) { return map[k]; });
      out.sort(function (a, b) { return String(b.week_key).localeCompare(String(a.week_key)); });
      return { data: out, error: null };
    },

    /* Admins gate for artist-dashboard-style queries too. */
    async listAdmins() {
      if (!client) return { data: [], error: { message: "Supabase not configured" } };
      var adm = await AdminAPI.requireAdmin();
      if (!adm) return { data: [], error: { message: "forbidden" } };
      var r = await client.from("profiles").select("id,email,username,first_name,surname,is_admin").order("created_at", { ascending: false }).limit(500);
      return { data: r.data || [], error: r.error || null };
    },

    /* ---- KYC queue (view from migration 0011) ------------------------ */
    async listPendingKyc() {
      if (!client) return { data: [], error: { message: "Supabase not configured" } };
      var adm = await AdminAPI.requireAdmin();
      if (!adm) return { data: [], error: { message: "forbidden" } };
      var r = await client.from("admin_pending_kyc").select("*");
      return { data: r.data || [], error: r.error || null };
    },
    async setKycStatus(profileId, status, notes) {
      if (!client) return { data: null, error: { message: "Supabase not configured" } };
      var adm = await AdminAPI.requireAdmin();
      if (!adm) return { data: null, error: { message: "forbidden" } };
      var patch = { kyc_status: status, updated_at: new Date().toISOString() };
      if (typeof notes === "string" && notes.trim()) {
        if (!patch.artist_profile) patch.artist_profile = {};
        patch.artist_profile = Object.assign({}, patch.artist_profile, { kyc_notes: notes.trim() });
      }
      return client.from("profiles").update(patch).eq("id", profileId);
    },

    /* ---- Ad campaigns (public read + admin write from 0001) ---------- */
    async listAdverts(opts) {
      if (!client) return { data: [], error: { message: "Supabase not configured" } };
      var q = client.from("adverts").select("*").order("created_at", { ascending: false });
      if (opts && opts.active === true) q = q.eq("is_active", true);
      var r = await q.limit(300);
      return { data: r.data || [], error: r.error || null };
    },
    async updateAdvert(id, patch) {
      if (!client) return { data: null, error: { message: "Supabase not configured" } };
      var adm = await AdminAPI.requireAdmin();
      if (!adm) return { data: null, error: { message: "forbidden" } };
      var p = Object.assign({}, patch);
      if (p.start_date === "") p.start_date = null;
      if (p.end_date === "") p.end_date = null;
      return client.from("adverts").update(p).eq("id", id);
    },
    async createAdvert(payload) {
      if (!client) return { data: null, error: { message: "Supabase not configured" } };
      var adm = await AdminAPI.requireAdmin();
      if (!adm) return { data: null, error: { message: "forbidden" } };
      var row = Object.assign({
        title: "", image: null, link: null, placement: "home-feed",
        is_active: true, start_date: null, end_date: null
      }, payload || {});
      if (row.start_date === "") row.start_date = null;
      if (row.end_date === "") row.end_date = null;
      return client.from("adverts").insert(row).select().single();
    },
    async uploadAdvertBanner(file) {
      if (!client) return { data: null, error: { message: "Supabase not configured" } };
      var adm = await AdminAPI.requireAdmin();
      if (!adm) return { data: null, error: { message: "forbidden" } };
      var path = "adverts/" + Date.now() + "-" + (file.name || "banner").replace(/[^a-zA-Z0-9._-]/g, "") ;
      var up = await client.storage.from("trackhype-media").upload(path, file, { upsert: true });
      if (up.error) return up;
      var pub = await client.storage.from("trackhype-media").getPublicUrl(path);
      return { data: { url: pub.data && pub.data.publicUrl }, error: null };
    },

    /* ---- Radio stations (public read from 0001) ---------------------- */
    async listRadioStations() {
      if (!client) return { data: [], error: { message: "Supabase not configured" } };
      var r = await client.from("radio_stations").select("*").order("name", { ascending: true });
      return { data: r.data || [], error: r.error || null };
    },

    /* ---- Charts + entries (public read from 0001) -------------------- */
    async listCharts() {
      if (!client) return { data: [], error: { message: "Supabase not configured" } };
      var r = await client.from("charts").select("*").order("name", { ascending: true });
      return { data: r.data || [], error: r.error || null };
    },
    async listChartEntries(chartId, weekKey, opts) {
      if (!client) return { data: [], error: { message: "Supabase not configured" } };
      opts = opts || {};
      var page = Math.max(1, parseInt(opts.page, 10) || 1);
      var pageSize = Math.min(500, Math.max(1, parseInt(opts.pageSize, 10) || 100));
      var fromIdx = (page - 1) * pageSize;
      var toIdx = fromIdx + pageSize - 1;
      var q = client.from("chart_entries")
        .select("*, songs(title, artwork)")
        .order("rank", { ascending: true });
      if (chartId) q = q.eq("chart_id", chartId);
      if (weekKey) q = q.eq("week_key", weekKey);
      var r = await q.range(fromIdx, toIdx);
      return { data: r.data || [], error: r.error || null };
    },
    async listSongsForPicker() {
      if (!client) return { data: [], error: { message: "Supabase not configured" } };
      var r = await client.from("songs")
        .select("id, title, artwork, song_artists(artists(name))")
        .order("title", { ascending: true }).limit(2000);
      return { data: r.data || [], error: r.error || null };
    },
    async createChartEntry(payload) {
      if (!client) return { data: null, error: { message: "Supabase not configured" } };
      var adm = await AdminAPI.requireAdmin();
      if (!adm) return { data: null, error: { message: "forbidden" } };
      var row = Object.assign({
        chart_id: null, song_id: null, week_key: null, tier: "on_top", rank: 1, points: 0
      }, payload || {});
      return client.from("chart_entries").insert(row).select().single();
    },
    async updateChartEntry(id, patch) {
      if (!client) return { data: null, error: { message: "Supabase not configured" } };
      var adm = await AdminAPI.requireAdmin();
      if (!adm) return { data: null, error: { message: "forbidden" } };
      return client.from("chart_entries").update(patch).eq("id", id);
    },
    async deleteChartEntry(id) {
      if (!client) return { data: null, error: { message: "Supabase not configured" } };
      var adm = await AdminAPI.requireAdmin();
      if (!adm) return { data: null, error: { message: "forbidden" } };
      return client.from("chart_entries").delete().eq("id", id);
    },
    async updateSong(id, patch) {
      if (!client) return { data: null, error: { message: "Supabase not configured" } };
      var adm = await AdminAPI.requireAdmin();
      if (!adm) return { data: null, error: { message: "forbidden" } };
      return client.from("songs").update(patch).eq("id", id);
    }
  };
})();
