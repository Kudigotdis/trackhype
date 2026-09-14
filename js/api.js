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

  /* ---- auth redirect handling -------------------------------------
     Email-confirmation / OTP / PKCE redirects land back on the SPA with
     tokens in the URL hash (#access_token=…) or query (?code=…). Capture
     them deterministically so the session persists before any page script
     reads it, then strip the tokens from the URL bar. */
  var authRedirectHandled = false;

  function cleanAuthRedirectUrl() {
    try {
      var search = location.search.replace(/[?&]code=[^&#]*/i, "").replace(/[?&]$/, "");
      history.replaceState(null, "", location.pathname + search);
    } catch (e) {}
  }

  async function handleAuthRedirectUrl() {
    if (authRedirectHandled || !client) return;
    authRedirectHandled = true;

    var hashParams = new URLSearchParams((location.hash || "").replace(/^#/, ""));
    var queryParams = new URLSearchParams(location.search || "");

    var accessToken = hashParams.get("access_token");
    var pkceCode = queryParams.get("code");

    if (!accessToken && !pkceCode) return;

    try {
      if (accessToken) {
        await client.auth.setSession({
          access_token: accessToken,
          refresh_token: hashParams.get("refresh_token") || undefined
        });
        await client.auth.getUser();
      } else if (typeof client.auth.initialize === "function") {
        await client.auth.initialize();
      }
    } catch (e) {}
    cleanAuthRedirectUrl();
  }

  if (ok) handleAuthRedirectUrl();

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
    async resendConfirmation(email) {
      if (!client) return { data: null, error: { message: "Supabase not configured" } };
      return client.auth.resend({ type: "signup", email: email });
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

    /* ---- pending-profile sync -----------------------------------------
       When email confirmation is ON, signup has no session, so saveProfile
       cannot run. We cache the signed-up profile in localStorage
       (trackhype_pending_profile). The first time a session exists we
       upload it (location fields + genre rows) then clear the cache. */
    async syncPendingProfile() {
      if (!client) return { data: null, error: { message: "Supabase not configured" } };
      var user = await API.currentUser();
      if (!user) return { data: null, error: null };
      var pending = null;
      try { pending = JSON.parse(localStorage.getItem("trackhype_pending_profile") || "null"); } catch (e) {}
      if (!pending || !pending.profile) return { data: null, error: null };

      var idsRes = await API.listGenreIds(pending.preferredGenres || []);
      var genreIds = ((idsRes && idsRes.data) || []).map(function (g) { return g.id; });
      var saved = await API.saveProfile(pending.profile, genreIds);
      if (!saved.error) {
        try { localStorage.removeItem("trackhype_pending_profile"); } catch (e) {}
        API.pushLocalAccount({
          accountType: pending.profile.account_type || "listener",
          username: pending.profile.username || "",
          firstName: pending.profile.first_name || "",
          surname: pending.profile.surname || "",
          dateOfBirth: pending.profile.date_of_birth || "",
          email: pending.email || pending.profile.email || "",
          mobileNumber: pending.profile.mobile_number || "",
          mobileNetwork: pending.profile.mobile_network || "",
          mobileMoney: pending.profile.mobile_money || "",
          kycStatus: pending.profile.kyc_status || "pending",
          preferredGenres: pending.preferredGenres || []
        });
      }
      return saved;
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