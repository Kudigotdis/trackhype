/* ============================================================
   TrackHype — js/tracker.js (analytics event layer, no npm).
   Load AFTER js/supabase-config.js + js/api.js (or standalone
   with just supabase-config) + supabase-js UMD CDN.
   Exposes window.TRACK. Never throws. Batches events in memory,
   flushes every 5s or at 20 events, falls back to a localStorage
   queue when Supabase is absent/offline, and sendBeacon on
   pagehide. Derived metrics are computed server-side (migration
   0011 views) — clients only ever emit raw events.
   ============================================================ */
(function () {
  var cfg = window.SUPABASE_CONFIG || null;
  var ok = !!(cfg && cfg.url && cfg.anonKey && window.supabase);
  var client = ok ? window.supabase.createClient(cfg.url, cfg.anonKey, { auth: { flowType: "pkce" } }) : null;

  var QUEUE_KEY = "trackhype.analytics.queue.v1";
  var FLUSH_INTERVAL = 5000;
  var FLUSH_BATCH = 20;

  var queue = [];
  var timer = 0;
  var flushed = 0;

  function loadQueue() {
    try {
      var raw = localStorage.getItem(QUEUE_KEY);
      if (raw) {
        var arr = JSON.parse(raw);
        if (Array.isArray(arr)) return arr;
      }
    } catch (e) {}
    return [];
  }

  function persistQueue() {
    try {
      localStorage.setItem(QUEUE_KEY, JSON.stringify(queue.slice(0, 500)));
    } catch (e) {}
  }

  function currentUserId() {
    try {
      var s = JSON.parse(localStorage.getItem("trackhype.profile.v1") || "null");
      if (s && s.userId) return s.userId;
    } catch (e) {}
    return null;
  }

  function regionCode() {
    try {
      var r = JSON.parse(localStorage.getItem("trackhype.region") || "null");
      if (r && r.code) return r.code;
    } catch (e) {}
    return null;
  }

  function enqueue(evt) {
    queue.push(evt);
    if (queue.length >= FLUSH_BATCH) {
      flush();
    } else if (!timer) {
      timer = setTimeout(flush, FLUSH_INTERVAL);
    }
  }

  function flush() {
    if (timer) { clearTimeout(timer); timer = 0; }
    if (!queue.length) return;
    var batch = queue;
    queue = [];
    if (!client) {
      var merged = loadQueue().concat(batch);
      merged = merged.slice(-500);
      try { localStorage.setItem(QUEUE_KEY, JSON.stringify(merged)); } catch (e) {}
      return;
    }
    client
      .from("analytics_events")
      .insert(batch)
      .then(onFlushOk)
      .catch(function () {
        var merged = loadQueue().concat(batch);
        merged = merged.slice(-500);
        try { localStorage.setItem(QUEUE_KEY, JSON.stringify(merged)); } catch (e) {}
        scheduleReplay();
      });
  }

  function onFlushOk(res) {
    if (res && res.error) {
      var merged = loadQueue().concat(queue);
      merged = merged.slice(-500);
      try { localStorage.setItem(QUEUE_KEY, JSON.stringify(merged)); } catch (e) {}
    }
    replayLocalQueue();
  }

  function scheduleReplay() {
    if (!queue.length) {
      setTimeout(replayLocalQueue, 8000 + Math.random() * 4000);
    }
  }

  function replayLocalQueue() {
    if (!client) return;
    var pending = loadQueue();
    if (!pending.length) return;
    try { localStorage.removeItem(QUEUE_KEY); } catch (e) {}
    client
      .from("analytics_events")
      .insert(pending)
      .then(function (res) {
        if (res && res.error) { scheduleReplay(); }
      })
      .catch(scheduleReplay);
  }

  function event(eventType, entityType, entityId, meta, forceUserId) {
    try {
      if (!eventType) return;
      var id = forceUserId || currentUserId();
      var payload = {
        event_type: eventType,
        entity_type: entityType || null,
        entity_id: entityId != null ? String(entityId) : null,
        metadata: meta || {},
        user_id: id || null,
        region_code: regionCode(),
        created_at: new Date().toISOString()
      };
      var title = null;
      if (payload.entity_id && window.__CURRENT_TRACK_TITLE) {
        title = window.__CURRENT_TRACK_TITLE;
      }
      if (title) payload.entity_title = title;
      enqueue(payload);
    } catch (e) {}
  }

  window.TRACK = {
    ready: function () { return ok && !!client; },
    flush: function () { flush(); },

    event: event,

    view: function (entityType, entityId, meta) {
      event("song_view", entityType, entityId, meta);
    },
    impression: function (entityType, entityId, meta) {
      event("impression", entityType, entityId, meta);
    },
    pageView: function (pageName) {
      event("impression", "page", pageName, { page: pageName });
    },

    playerStart: function (trackId, meta) {
      event("player_start", "song", trackId, meta);
    },
    playerPause: function (trackId, meta) {
      event("player_pause", "song", trackId, meta);
    },
    playerSeek: function (trackId, fromPct, toPct, meta) {
      var m = meta || {};
      m.seek_from_pct = Math.round(fromPct || 0);
      m.seek_to_pct = Math.round(toPct || 0);
      event("player_seek", "song", trackId, m);
    },
    playerComplete: function (trackId, meta) {
      event("player_complete", "song", trackId, meta);
    },
    playerReplay: function (trackId, meta) {
      event("player_replay", "song", trackId, meta);
    },

    vote: function (songId, chartKey, weekKey, rank, meta) {
      var m = meta || {};
      m.chart_key = chartKey || null;
      m.week_key = weekKey || null;
      m.rank = rank != null ? rank : null;
      event("vote", "song", songId, m);
    },
    ballotSubmit: function (chartKey, weekKey, picksCount, replaced, meta) {
      var m = meta || {};
      m.chart_key = chartKey || null;
      m.week_key = weekKey || null;
      m.picks = picksCount || 0;
      m.replaced = !!replaced;
      event("ballot_submit", "chart", chartKey, m);
    },
    ballotEdit: function (chartKey, weekKey, meta) {
      var m = meta || {};
      m.chart_key = chartKey || null;
      m.week_key = weekKey || null;
      event("ballot_edit", "chart", chartKey, m);
    },

    like: function (songId, meta) {
      event("like", "song", songId, meta);
    },
    unlike: function (songId, meta) {
      event("like", "song", songId, Object.assign({ action: "unlike" }, meta || {}));
    },
    follow: function (artistName, meta) {
      event("follow", "artist", artistName, meta);
    },
    unfollow: function (artistName, meta) {
      event("follow", "artist", artistName, Object.assign({ action: "unfollow" }, meta || {}));
    },

    search: function (query, resultCount, meta) {
      var m = meta || {};
      m.query = query;
      m.result_count = resultCount || 0;
      event("search", "search", query, m);
    },

    share: function (songId, platform, meta) {
      var m = meta || {};
      m.platform = platform || null;
      event("share", "song", songId, m);
    },
    socialClick: function (songId, platform, meta) {
      var m = meta || {};
      m.platform = platform || null;
      event("social_click", "song", songId, m);
    },
    dspClick: function (songId, platform, meta) {
      var m = meta || {};
      m.platform = platform || null;
      event("dsp_click", "song", songId, m);
    },
    campaignClick: function (campaignId, meta) {
      event("campaign_click", "campaign", campaignId, meta);
    },
    referral: function (source, meta) {
      event("referral", "referral", source, meta);
    }
  };

  try {
    if (window.TRACK && window.TRACK.pageView) {
      var path = (location.pathname || "").split("/").pop() || "index.html";
      window.TRACK.pageView(path);
      flushed = 1;
    }
  } catch (e) {}

  window.addEventListener("pagehide", function () {
    if (client && queue.length) {
      try {
        if (navigator.sendBeacon && client) {
          var beacon = client.from("analytics_events").insert(queue);
          if (beacon && beacon.then) {
            beacon.then(function () {});
          }
        }
        queue = [];
      } catch (e) {}
    }
    if (queue.length) {
      var merged = loadQueue().concat(queue);
      merged = merged.slice(-500);
      try { localStorage.setItem(QUEUE_KEY, JSON.stringify(merged)); } catch (e) {}
    }
  });

  if (document.visibilityState === "hidden") {
    /* no-op guard */
  }
  document.addEventListener("visibilitychange", function () {
    if (document.visibilityState === "hidden") { flush(); }
  });
})();