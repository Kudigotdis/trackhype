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
  var client = ok ? window.supabase.createClient(cfg.url, cfg.anonKey, { auth: { flowType: "pkce" } }) : null;
  window.supabaseClient = client;

  /* ---- auth redirect handling -------------------------------------
     Email-confirmation / OTP / PKCE redirects land back on the SPA with
     tokens in the URL hash (#access_token=…) or query (?code=…). Capture
     them deterministically so the session persists before any page script
     reads it, then strip the tokens from the URL bar. */
  var authRedirectHandled = false;
  var authRecoveryCb = null;
  var authRecoveryDetected = false;
  var authRecoveryNavDone = false;

  function cleanAuthRedirectUrl() {
    try {
      var search = location.search
        .replace(/[?&]code=[^&#]*/i, "")
        .replace(/[?&]token_hash=[^&#]*/i, "")
        .replace(/[?&]type=[^&#]*/i, "")
        .replace(/[?&]access_token=[^&#]*/i, "")
        .replace(/[?&]refresh_token=[^&#]*/i, "")
        .replace(/[?&]expires_in=[^&#]*/i, "")
        .replace(/[?&]token_type=[^&#]*/i, "")
        .replace(/[?&]error=[^&#]*/i, "")
        .replace(/[?&]error_description=[^&#]*/i, "")
        .replace(/[?&]reset=1/gi, "")
        .replace(/[?&]$/, "");
      history.replaceState(null, "", location.pathname + search);
    } catch (e) {}
  }

  function goRecoveryUi() {
    if (authRecoveryNavDone) return;
    if (/(menu\.html)([?#]|$)/.test(location.pathname)) return;
    authRecoveryNavDone = true;
    var base = location.pathname.replace(/[^\/]*$/, "");
    window.location.href = location.origin + base + "menu.html?reset=1";
  }

  async function handleAuthRedirectUrl() {
    if (authRedirectHandled || !client) return;

    var queryParams = new URLSearchParams(location.search || "");
    var hashParams = new URLSearchParams((location.hash || "").replace(/^#/, ""));

    var accessToken = hashParams.get("access_token") || queryParams.get("access_token");
    var refreshToken = hashParams.get("refresh_token") || queryParams.get("refresh_token");
    var pkceCode = queryParams.get("code");
    var tokenHash = queryParams.get("token_hash");
    var authType = queryParams.get("type") || hashParams.get("type") || "";
    var isRecovery = /recovery/i.test(authType) || queryParams.has("reset") || hashParams.has("reset");

    if (!(accessToken || refreshToken || pkceCode || tokenHash)) {
      if (isRecovery) { goRecoveryUi(); }
      return;
    }
    authRedirectHandled = true;

    try {
      if (accessToken) {
        await client.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken || undefined
        });
        await client.auth.getUser();
      } else if (pkceCode) {
        if (typeof client.auth.exchangeCodeForSession === "function") {
          await client.auth.exchangeCodeForSession(pkceCode);
        } else if (typeof client.auth.initialize === "function") {
          await client.auth.initialize();
        }
      } else if (tokenHash && typeof client.auth.verifyOtp === "function") {
        await client.auth.verifyOtp({
          token_hash: tokenHash,
          type: authType || "email"
        });
      }
      if (isRecovery) {
        authRecoveryDetected = true;
        goRecoveryUi();
        if (authRecoveryCb) { try { authRecoveryCb(); } catch (ignored) {} }
      }
    } catch (e) {
      try { console.warn("Auth redirect handling failed:", e); } catch (ignored) {}
    }
    cleanAuthRedirectUrl();
  }

  if (ok) handleAuthRedirectUrl();
  if (ok) window.addEventListener("pageshow", function () { handleAuthRedirectUrl(); });

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
    async resetPassword(email) {
      if (!client) return { data: null, error: { message: "Supabase not configured" } };
      var base = location.pathname.replace(/[^\/]*$/, "");
      var redirectTo = location.origin + base + "menu.html";
      return client.auth.resetPasswordForEmail((email || "").trim(), { redirectTo: redirectTo });
    },
    async updatePassword(newPassword) {
      if (!client) return { data: null, error: { message: "Supabase not configured" } };
      return client.auth.updateUser({ password: newPassword });
    },
    onPasswordRecovery(cb) {
      authRecoveryCb = cb;
      if (authRecoveryDetected && cb) {
        try { cb(); } catch (e) {}
      }
      return function () {
        if (authRecoveryCb === cb) authRecoveryCb = null;
      };
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