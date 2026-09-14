/* ============================================================
   TrackHype Phase 2 — Supabase data layer (no npm).
   Load AFTER js/supabase-config.js and the supabase-js UMD CDN
   script (attaches window.supabase). Exposes window.supabaseClient
   and window.API. Wrappers mirror trackhype.js localStorage state
   so pages can migrate from local to server data, or fall back
   gracefully when Supabase is not configured / offline.
   ============================================================ */
(function () {
  var cfg = window.SUPABASE_CONFIG || null;
  var ok = !!(cfg && cfg.url && cfg.anonKey && window.supabase);
  var client = ok ? window.supabase.createClient(cfg.url, cfg.anonKey) : null;
  window.supabaseClient = client;

  /* ---- local mirrors ------------------------------------------------- */
  function readLS(key, fallback) {
    try { return localStorage.getItem(key) !== null ? JSON.parse(localStorage.getItem(key)) : fallback; }
    catch (e) { return fallback; }
  }
  function writeLS(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) {}
  }
  function localAccount() {
    return readLS("trackhype_account", null);
  }
  function pushLocalAccount(account) {
    if (!account) return;
    writeLS("trackhype_account", account);
    try {
      localStorage.setItem("trackhype_onboarding_complete", "true");
      localStorage.setItem("trackhype_user_name", (account.username || account.firstName || "").trim() || "TrackHype User");
      localStorage.setItem("trackhype_genres", JSON.stringify(account.preferredGenres || []));
      localStorage.setItem("trackhype_following_artists", JSON.stringify(account.followedArtists || []));
      localStorage.setItem("trackhype_kyc_status", account.kycStatus || "pending");
      if (account.kycStatus === "approved") {
        localStorage.setItem("trackhype_vote_eligible", "true");
      } else {
        localStorage.removeItem("trackhype_vote_eligible");
      }
    } catch (e) {}
  }

  var API = {
    ready: function () { return ok && !!client; },

    /* ---- auth --------------------------------------------------- */
    async getSession() {
      if (!client) return { data: { session: null }, error: null };
      return client.auth.getSession();
    },
    async currentUser() {
      var res = await API.getSession();
      return (res.data && res.data.session && res.data.session.user) || null;
    },
    onAuthChange(cb) {
      if (!client) return function () {};
      var res = client.auth.onAuthStateChange(function (event, session) {
        if (cb) cb(event, session);
      });
      return function () {
        if (res && res.data && res.data.subscription) res.data.subscription.unsubscribe();
      };
    },
    async signUp(email, password, meta) {
      if (!client) return { data: null, error: { message: "Supabase not configured" } };
      return client.auth.signUp({
        email: email,
        password: password,
        options: { data: meta || {} }
      });
    },
    async signIn(email, password) {
      if (!client) return { data: null, error: { message: "Supabase not configured" } };
      return client.auth.signInWithPassword({ email: email, password: password });
    },
    async signOut() {
      if (!client) return { error: null };
      return client.auth.signOut();
    },

    /* ---- profile -------------------------------------------------- */
    async getProfile() {
      var user = await API.currentUser();
      if (!client) return { data: localAccount(), error: null };
      if (!user) return { data: null, error: { message: "not signed in" } };
      return client.from("profiles").select("*").eq("id", user.id).maybeSingle();
    },
    async saveProfile(fields, genreIds) {
      var user = await API.currentUser();
      if (!client) return { data: null, error: { message: "Supabase not configured" } };
      if (!user) return { data: null, error: { message: "not signed in" } };
      var r = await client.from("profiles").upsert(
        Object.assign({ id: user.id }, fields || {}), { onConflict: "id" }
      );
      if (r.error) return r;
      if (genreIds && genreIds.length) {
        var del = await client.from("profile_genres").delete().eq("profile_id", user.id);
        if (del.error) return del;
        var ins = await client.from("profile_genres").insert(
          genreIds.map(function (g) { return { profile_id: user.id, genre_id: g }; })
        );
        if (ins.error) return ins;
      }
      return { data: { profile: r.data }, error: null };
    },
    async listGenreIds(names) {
      if (!client) return { data: [], error: null };
      var res = await client.from("genres").select("id, name").in("name", names || []);
      return res;
    },
    async profileGenres() {
      var user = await API.currentUser();
      if (!client || !user) return { data: [], error: null };
      return client.from("profile_genres")
        .select("genre_id, genres(name)")
        .eq("profile_id", user.id);
    },

    /* ---- catalog (public reads; wired from Phase 3) -------------- */
    genres() {
      if (!client) return Promise.resolve({ data: [], error: null });
      return client.from("genres").select("*, children:genres!parent_id(id, name)").order("sort_order");
    },
    songs() {
      if (!client) return Promise.resolve({ data: [], error: null });
      return client.from("songs").select("*, song_artists(artist_id), song_genres(genre_id)");
    },
    charts() {
      if (!client) return Promise.resolve({ data: [], error: null });
      return client.from("charts").select("*").eq("is_active", true);
    },
    chartEntries(chartKey, weekKey) {
      if (!client) return Promise.resolve({ data: [], error: null });
      var q = client.from("chart_entries")
        .select("*, song:songs(*)")
        .eq("charts.key", chartKey);
      if (weekKey) q = q.eq("week_key", weekKey);
      return q.order("rank");
    },

    /* ---- localStorage fallbacks mirroring trackhype.js state ------ */
    localAccount: localAccount,
    pushLocalAccount: pushLocalAccount,
    localGenreIds(names) {
      var list = [];
      for (var i = 0; i < (names || []).length; i++) {
        list.push("'" + String(names[i]).replace(/'/g, "''") + "'");
      }
      return list;
    }
  };

  window.API = API;
})();