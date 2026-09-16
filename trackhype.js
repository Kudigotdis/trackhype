/* =========================================================
   TrackHype — Shared Application Logic
   Mobile Android portrait first: 320–430px
   ========================================================= */

(function(){
  "use strict";

  /* Hidden-iframe fragment mode: when this page is loaded inside the SPA
     router's isolated iframe viewer, skip bootstrap (no footer, no audio,
     no swipe engine) — only the TrackHype API + page scripts are needed
     for the parent to serialize the target page. */
  var FRAGMENT_MODE = (location.hash === "#__fragment");

  const STORAGE_KEY = "trackhype.state.v1";

  const PLACEHOLDER_ART = [
    "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=600&q=75",
    "https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=600&q=75",
    "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=600&q=75",
    "https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b?auto=format&fit=crop&w=600&q=75",
    "https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b?auto=format&fit=crop&w=600&q=75"
  ];

  const SONG_LYRICS = [
    "Baby, do you love me? Do you want me?",
    "Put your hands all on my body",
    "No worry, go crazy, go crazy",
    "Oh, baby, do you love me? Do you want me?",
    "Put your hands all on my body",
    "No worry, go crazy, go crazy, yeah",
    "",
    "Slick, slick, slick, slick",
    "Slick, slick, slick, slick (eh, Nwanne, how far na? Heh)",
    "",
    "Nwanne and Swagger l'ọmọ",
    "It's a banger, you already know",
    "Too many girls, oh, for my parlour",
    "Eleganza, know as e dey go (e dey go)",
    "Amanda, put on a show",
    "Give me your high notes, Wande Coal (wawa)",
    "Amanda, put on a show",
    "Atlanta, we go",
    "",
    "Slick, slick, slick, slick (swagger l'ọmọ)",
    "Slick, slick, slick, slick (stubborn)",
    "Slick, slick, slick, slick (mm-mm-mm, mm-mm-mm, lelele)",
    "Slick, slick, slick, slick (mm-mm-mm)",
    "",
    "Uh, on to the next",
    "Oh, my baby, now, on to the next",
    "Uh, she fuck with the best",
    "Oh, my baby, come show them finesse",
    "Oh, my baby, come show them finesse",
    "Girl, you sweet like sugar, hundred percent",
    "On your wrist, Van Cleef, oh, Audemars Piguet",
    "Everybody, get out the way, oh, woah",
    "",
    "Hm, she slick (she slick)",
    "And her body, biscuit",
    "I dey for Boho, wanna get lit?",
    "Bad bitches with me wanna get rich, uh-huh",
    "",
    "Baby, do you love me? Do you want me?",
    "Put your hands all on my body",
    "No worry, go crazy, go crazy",
    "Oh, baby (slick), do you love me? Do you want me?",
    "Put your hands all on my body (slick)",
    "No worry (slick), go crazy (slick)",
    "Go crazy (slick), yeah"
  ].join("\n");

  const defaultState = {
    currentTrack: null,
    isPlaying: false,
    progress: 0,
    bottomMode: "navigation",

    followingArtists: [],
    favouriteSongs: [],
    favouriteCharts: [],

    newMusicFilter: "newest",
    dashboardTab: "overview",

    artist: {
      name: "Your Artist Profile",
      handle: "@yourartist",
      genre: "Zim Hip Hop",
      city: "Zimbabwe",
      bio: "Complete your artist profile to start building your TrackHype presence.",
      portrait: PLACEHOLDER_ART[0]
    },

    submissions: [
      {
        id: "TH-000123",
        title: "Midnight in Harare",
        artist: "Your Artist Profile",
        genre: "Zim Hip Hop",
        city: "Harare",
        language: "English / Shona",
        dateAdded: "2026-08-25",
        status: "Published in New Music",
        plays: 482,
        favourites: 36,
        chartEligible: false,
        artwork: PLACEHOLDER_ART[2]
      },

      {
        id: "TH-000119",
        title: "City Lights",
        artist: "Your Artist Profile",
        genre: "Afro-Fusion",
        city: "Harare",
        language: "English",
        dateAdded: "2026-08-20",
        status: "Chart Eligible",
        plays: 793,
        favourites: 61,
        chartEligible: true,
        artwork: PLACEHOLDER_ART[1]
      },

      {
        id: "TH-000107",
        title: "Home Soil",
        artist: "Your Artist Profile",
        genre: "Sungura",
        city: "Gweru",
        language: "Shona",
        dateAdded: "2026-08-14",
        status: "Under Review",
        plays: 0,
        favourites: 0,
        chartEligible: false,
        artwork: PLACEHOLDER_ART[3]
      }
    ],

    payments: [
      {
        id: "PAY-000123",
        submissionId: "TH-000123",
        amount: 10,
        date: "2026-08-25",
        status: "Paid"
      },

      {
        id: "PAY-000119",
        submissionId: "TH-000119",
        amount: 10,
        date: "2026-08-20",
        status: "Paid"
      },

      {
        id: "PAY-000107",
        submissionId: "TH-000107",
        amount: 10,
        date: "2026-08-14",
        status: "Paid"
      }
    ],

    weekly: {
      submissions: {},
      ballots: {},
      snapshots: {},
      drafts: {}
    }
  };

  /* =========================================================
     Utility Functions
     ========================================================= */

  function deepClone(value){
    return JSON.parse(JSON.stringify(value));
  }

  function mergeState(base, extra){
    if(!extra || typeof extra !== "object"){
      return deepClone(base);
    }

    const merged = {
      ...deepClone(base),
      ...extra
    };

    merged.artist = {
      ...base.artist,
      ...(extra.artist || {})
    };

    return merged;
  }

  function getState(){
    try{
      const raw = localStorage.getItem(STORAGE_KEY);

      if(!raw){
        const fresh = deepClone(defaultState);

        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify(fresh)
        );

        return fresh;
      }

      return mergeState(
        defaultState,
        JSON.parse(raw)
      );

    }catch(error){

      console.warn(
        "TrackHype state read failed:",
        error
      );

      return deepClone(defaultState);
    }
  }

  function setState(patch){

    const current = getState();

    const next = mergeState(
      current,
      patch
    );

    try{

      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(next)
      );

    }catch(error){

      console.warn(
        "TrackHype state write failed:",
        error
      );

    }

    window.dispatchEvent(
      new CustomEvent(
        "trackhype:statechange",
        {
          detail: next
        }
      )
    );

    return next;
  }

  function updateState(mutator){

    const current = getState();

    const next = deepClone(current);

    mutator(next);

    try{

      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(next)
      );

    }catch(error){

      console.warn(
        "TrackHype state write failed:",
        error
      );

    }

    window.dispatchEvent(
      new CustomEvent(
        "trackhype:statechange",
        {
          detail: next
        }
      )
    );

    return next;
  }

  function esc(value){

    return String(value ?? "")
      .replaceAll("&","&amp;")
      .replaceAll("<","&lt;")
      .replaceAll(">","&gt;")
      .replaceAll('"',"&quot;")
      .replaceAll("'","&#039;");
  }

  function fmtMoney(value){

    return `$${Number(value || 0).toFixed(2)} USD`;
  }

  function fmtDate(value){

    if(!value){
      return "—";
    }

    const d = new Date(
      `${value}T12:00:00`
    );

    if(Number.isNaN(d.getTime())){
      return value;
    }

    return d.toLocaleDateString(
      "en-ZW",
      {
        day: "numeric",
        month: "short",
        year: "numeric"
      }
    );
  }

  function statusClass(status){

    if(
      /paid|approved|published|eligible|charting/i
        .test(status)
    ){
      return "success";
    }

    if(
      /review|received/i
        .test(status)
    ){
      return "warning";
    }

    if(
      /rejected/i
        .test(status)
    ){
      return "danger";
    }

    return "";
  }

  function getArtwork(index = 0){

    var i = Number(index) || 0;

    return PLACEHOLDER_ART[
      i % PLACEHOLDER_ART.length
    ];
  }

  /* =========================================================
     Toast
     ========================================================= */

  function toast(message){

    let node =
      document.querySelector(".th-toast");

    if(!node){

      node =
        document.createElement("div");

      node.className =
        "th-toast";

      node.style.cssText = [
        "position:fixed",
        "left:50%",
        "bottom:calc(var(--th-bottom-h) + env(safe-area-inset-bottom, 0px))",
        "transform:translateX(-50%) translateY(calc(100% + 12px))",
        "z-index:129",
        "color:#fff",
        "padding:10px 14px",
        "font-weight:800",
        "font-size:13px",
        "box-shadow:0 10px 28px rgba(0,0,0,.25)",
        "width:100%",
        "text-align:center",
        "pointer-events:none",
        "transition:transform .35s cubic-bezier(.4,0,.2,1)"
      ].join(";");

      document.body.appendChild(node);
    }

    node.textContent = message;
    void node.offsetHeight;
    node.style.transform = "translateX(-50%) translateY(0)";

    clearTimeout(node._timer);

    node._timer = setTimeout(
      () => {
        node.style.transform = "translateX(-50%) translateY(calc(100% + 12px))";
      },
      4000
    );
  }

  /* =========================================================
     Global Scroll Behaviour
     ========================================================= */

  function initialiseHeaderScroll(){

    const header =
      document.querySelector(
        "[data-app-header]"
      );

    const bottomWrap =
      document.querySelector(
        "[data-bottom-swipe]"
      );

    if(!header){
      return;
    }

    let lastY =
      window.scrollY;

    let ticking = false;

    const threshold = 10;

    function apply(){

      const currentY =
        window.scrollY;

      const delta =
        currentY - lastY;

      if(
        Math.abs(delta) >= threshold
      ){

        const goingDown =
          delta > 0 &&
          currentY > 70;

        header.classList.toggle(
          "is-hidden",
          goingDown
        );

        if(bottomWrap){

          bottomWrap.classList.toggle(
            "is-hidden",
            goingDown &&
            bottomWrap.dataset.locked !== "true"
          );

          syncBottomPanels();
        }

        const toast =
          document.querySelector(".th-toast");

        if(toast){
          if(goingDown){
            clearTimeout(toast._timer);
            toast.style.transform =
              "translateX(-50%) translateY(calc(100vh))";
          }
        }

        lastY = currentY;
      }

      ticking = false;
    }

    window.addEventListener(
      "scroll",
      () => {

        if(!ticking){

          requestAnimationFrame(
            apply
          );

          ticking = true;
        }

      },
      {
        passive: true
      }
    );
  }

  /* =========================================================
     Bottom Navigation
     ========================================================= */

  function renderBottomNavigation(active){

    const host =
      document.querySelector(
        "[data-nav-host]"
      );

    if(!host){
      return;
    }

    const SVG_HOME =
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M3.5 10.6 12 3.9l8.5 6.7V20a1 1 0 0 1-1 1h-4.6v-6H9.1v6H4.5a1 1 0 0 1-1-1z"/></svg>';
    const SVG_HISTORY =
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><circle cx="12" cy="12" r="8.5"/><path d="M12 7.4V12l3.1 1.9"/></svg>';
    const SVG_ARTISTS =
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M9 18V6.2l10-2V16"/><circle cx="6.4" cy="18" r="2.6"/><circle cx="16.4" cy="16" r="2.6"/></svg>';
    const SVG_SEARCH =
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><circle cx="11" cy="11" r="7"/><path d="m20.2 20.2-3.6-3.6"/></svg>';
    const SVG_MENU =
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M4 7h16M4 12h16M4 17h16"/></svg>';

    const items = [
      { href: "index.html",   label: "Hyped",   icon: SVG_HOME    },
      { href: "history.html", label: "History", icon: SVG_HISTORY },
      { href: "artists.html", label: "Artists", icon: SVG_ARTISTS },
      { href: "search.html",  label: "Search",  icon: SVG_SEARCH  },
      { href: "menu.html",    label: "Menu",    icon: SVG_MENU    }
    ];

    const norm = (v) => String(v || "").toLowerCase().replace(/\.html$/,"");
    const activeKey = norm(active);

    const pageUrl = (href) => {
      try{
        return new URL(href, document.baseURI).href;
      }catch(error){
        return href;
      }
    };

    host.innerHTML =
      items
        .map(
          (item) => {

            const isActive =
              norm(item.href) === activeKey ||
              norm(item.label) === activeKey;

            return `
              <a
                class="bottom-nav-item ${isActive ? "is-active" : ""}"
                href="${esc(pageUrl(item.href))}"
                aria-current="${isActive ? "page" : "false"}"
                aria-label="${esc(item.label)}"
                title="${esc(item.label)}"
              >
                ${item.icon}
              </a>
            `;

          }
        )
        .join("");
  }

  /* =========================================================
     Global Player
     ========================================================= */

/* Where the current song lives on the Promo-Playlist page:
      maps to the single curated playlist that contains it. */
  function resolvePlaylistId(track){
    if(!track){
      return "";
    }
    const playlists = window.PLAYLISTS || [];
    const inPl = (f) => {
      const p = playlists.find(p2 => (p2.songs || []).some(f));
      return p ? p.id : "";
    };
    let id = inPl(s => s.src && track.src && s.src === track.src);
    if(!id){
      id = inPl(s => s.title && track.title &&
        s.title === track.title &&
        (s.artist || "") === (track.artist || ""));
    }
    if(!id){
      id = inPl(s => s.title && track.title && s.title === track.title);
    }
    if(id){
      return id;
    }
    const data = window.DEMO_SONGS_DATA || [];
    const found = data.find(t =>
      (t.src && track.src && t.src === track.src) ||
      (t.title && track.title && t.title === track.title));
    if(found){
      if(String(found.artist || "").toLowerCase() === "wokeeyes"){
        return "wokeeyes";
      }
      const idMap = { Zimbabwe: "zim-hits", Botswana: "botswana-grooves", International: "international-vibes" };
      return idMap[found.region || "Zimbabwe"] || "zim-hits";
    }
    return "wokeeyes";
  }

  function currentPlaylistTarget(){
    const track = getState().currentTrack || {};
    const playlists = window.PLAYLISTS || [];
    if(track.fromPlaylist && playlists.some(p => p.id === track.fromPlaylist)){
      return "playlist.html?id=" + encodeURIComponent(track.fromPlaylist);
    }
    const resolved = resolvePlaylistId(track);
    if(resolved){
      return "playlist.html?id=" + encodeURIComponent(resolved);
    }
    const match = playlists.find(p => p.songs && p.songs.some(s => s.src === track.src));
    if(match){
      return "playlist.html?id=" + encodeURIComponent(match.id);
    }
    const data = window.DEMO_SONGS_DATA || [];
    const found = data.find(t => t.src === track.src);
    if(found){
      if((found.artist || "").toLowerCase() === "wokeeyes"){
        return "playlist.html?id=wokeeyes";
      }
      const region = found.region || "Zimbabwe";
      const idMap = { Zimbabwe: "zim-hits", Botswana: "botswana-grooves", International: "international-vibes" };
      return "playlist.html?id=" + encodeURIComponent(idMap[region] || "zim-hits");
    }
    return "playlist.html?id=wokeeyes";
  }

  function renderPlayer(){

    const player =
      document.querySelector(
        "[data-player]"
      );

    if(!player){
      return;
    }

    const state =
      getState();

    const track =
      state.currentTrack ||
      {
        artist: "TrackHype",
        title: "Choose a song",
        artwork: getArtwork(0)
      };

    const progress =
      Math.max(
        0,
        Math.min(
          100,
          Number(state.progress) || 0
        )
      );

    const scaleX = (progress / 100).toFixed(4);
    const isPlaying = !!state.isPlaying;

    player.innerHTML = `
      <div class="promo-player-inner">

        <div
          class="promo-progress"
          data-seek
          data-action="seek"
          role="slider"
          aria-label="Track progress"
          aria-valuemin="0"
          aria-valuemax="100"
          aria-valuenow="${Math.round(progress)}"
        >
          <span
            class="promo-progress-fill"
            style="transform:scaleX(${scaleX})"
          ></span>
        </div>

        <div class="promo-main">

          <a
            class="promo-art"
            href="playlists.html"
            aria-label="Open playlists"
          >
            <img
              alt=""
              width="46"
              height="46"
              decoding="async"
              src="${esc(track.artwork || getArtwork(0))}"
            >
          </a>

          <a
            class="promo-meta"
            href="${currentPlaylistTarget()}"
            aria-label="Open promo playlist"
          >
            <span class="promo-artist">${esc(track.artist)}</span>
            <span class="promo-title">${esc(track.title)}</span>
          </a>

          <button
            class="promo-toggle ${isPlaying ? "is-playing" : ""}"
            type="button"
            data-action="player-toggle"
            aria-label="${isPlaying ? "Pause" : "Play"}"
            aria-pressed="${isPlaying ? "true" : "false"}"
          >
            <img
              class="player-toggle-icon"
              src="Assets/icons/${isPlaying ? "pause_button" : "play_button"}.webp"
              alt=""
            >
          </button>

        </div>
      </div>
    `;
  }

  function setProgressFromEvent(bar, event){
    const rect =
      bar.getBoundingClientRect();

    const ratio =
      rect.width > 0
        ? (event.clientX - rect.left) / rect.width
        : 0;

    const progress =
      Math.max(
        0,
        Math.min(100, ratio * 100)
      );

    updateState(
      state => {
        state.progress =
          progress;
      }
    );

    const a =
      getAudioElement();

    if(
      a &&
      a.duration &&
      Number.isFinite(a.duration)
    ){

      a.currentTime =
        (progress / 100) * a.duration;
    }

    updateProgressUI(
      progress
    );
  }

  function bindSeekDrag(){

    const player =
      document.querySelector(
        "[data-player]"
      );

    if(!player){
      return;
    }

    let dragging = false;

    const handleMove = (event) => {
      if(!dragging){
        return;
      }
      const bar =
        player.querySelector(
          "[data-seek]"
        );
      if(bar){
        setProgressFromEvent(
          bar,
          event
        );
      }
    };

    player.addEventListener(
      "pointerdown",
      (event) => {

        const bar =
          event.target.closest(
            "[data-seek]"
          );

        if(!bar){
          return;
        }

        dragging = true;
        bar.setPointerCapture(
          event.pointerId
        );
        setProgressFromEvent(
          bar,
          event
        );
      }
    );

    player.addEventListener(
      "pointermove",
      handleMove
    );

    const end = () => {
      dragging = false;
    };

    player.addEventListener(
      "pointerup",
      end
    );

    player.addEventListener(
      "pointercancel",
      end
    );
  }

  /* =========================================================
     Real Audio Demo Player
     ========================================================= */

  let demoAudio = null;
  let demoPlaylist = [];
  let demoIndex = -1;
  var loadTrackId = 0;
  var resumeFallbackTimer = 0;

  /* ---------------------------------------------------------
     Playback persistence
     We keep a small snapshot of the currently playing track in
     localStorage so that navigating between pages (static HTML,
     each page re-executes this file) can resume the exact same
     song at the same position instead of stopping or restarting.
     On a fresh app open we start a random demo track instead.
     --------------------------------------------------------- */
  const PLAYBACK_KEY = "trackhype.playback.v1";
  let lastSnapshotSave = 0;

  function readPlaybackSnapshot(){
    try{
      const raw = localStorage.getItem(PLAYBACK_KEY);
      if(!raw){
        return null;
      }
      const s = JSON.parse(raw);
      if(!s || !s.src){
        return null;
      }
      return s;
    }catch(e){
      return null;
    }
  }

  function savePlaybackSnapshot(extra){
    const cur = getState().currentTrack || {};
    try{
      const src = extra && extra.src ? extra.src : cur.src;
      if(!src){
        localStorage.removeItem(PLAYBACK_KEY);
        return;
      }
      const el = demoAudio;
      const snapshot = {
        src: src,
        title: extra && extra.title ? extra.title : (cur.title || ""),
        artist: extra && extra.artist ? extra.artist : (cur.artist || ""),
        artwork: extra && extra.artwork ? extra.artwork : (cur.artwork || ""),
        index: typeof (extra && extra.index) === "number"
          ? extra.index
          : (demoIndex >= 0 ? demoIndex : 0),
        currentTime: el && Number.isFinite(el.currentTime)
          ? el.currentTime
          : 0,
        ts: Date.now()
      };
      localStorage.setItem(PLAYBACK_KEY, JSON.stringify(snapshot));
    }catch(e){}
  }

  function clearPlaybackSnapshot(){
    try{
      localStorage.removeItem(PLAYBACK_KEY);
    }catch(e){}
  }

  function getAudioElement(){
    if(demoAudio){
      return demoAudio;
    }
    const el = document.createElement("audio");
    el.preload = "auto";
    document.body.appendChild(el);
    el.addEventListener("timeupdate", onAudioTime);
    el.addEventListener("ended", onAudioEnded);
    el.addEventListener("play", () => {
      if(!getState().isPlaying){
        updateState(s => { s.isPlaying = true; });
      }
      syncPlayerToggleIcon();
      trackPlaybackEvent("player_start", el);
    });
    el.addEventListener("pause", () => {
      if(getState().isPlaying){
        updateState(s => { s.isPlaying = false; });
      }
      syncPlayerToggleIcon();
      savePlaybackSnapshot();
      trackPlaybackEvent("player_pause", el);
    });
    el.addEventListener("seeked", () => {
      trackPlaybackEvent("player_seek", el);
    });
    demoAudio = el;
    return el;
  }

  function currentTrackId(){
    const t = getState().currentTrack || {};
    return t.id || t.songId || t.title || t.src || null;
  }

  function trackPlaybackEvent(type, el){
    if(!window.TRACK || typeof window.TRACK.event !== "function"){ return; }
    try{
      const meta = { title: (getState().currentTrack || {}).title || "" };
      if(el && el.duration && Number.isFinite(el.duration)){
        meta.progress_pct = Math.round((el.currentTime / el.duration) * 100);
      }
      window.TRACK.event(type, "song", currentTrackId(), meta);
    }catch(e){}
  }

  function matchRegion(name, code){
    const n = String(name || "").toLowerCase();
    const c = String(code || "").toLowerCase();
    if(c === "bw" || n.includes("botswana")){
      return "Botswana";
    }
    if(c === "zw" || n.includes("zimbabwe")){
      return "Zimbabwe";
    }
    return "International";
  }

  function buildDemoPlaylist(){
    const data = window.DEMO_SONGS_DATA || [];
    if(!data.length){
      return [];
    }
    if(currentMode() === "demo"){
      return data.slice();
    }
    let saved = null;
    try{
      saved = JSON.parse(
        localStorage.getItem("trackhype.region") || "null"
      );
    }catch(error){
      saved = null;
    }
    const savedRegion = matchRegion(saved && saved.name, saved && saved.code);
    const rankOf = (region) => {
      if(savedRegion && region === savedRegion){
        return 0;
      }
      return region === "International"
        ? 2
        : 1;
    };
    return data
      .slice()
      .sort((a, b) => rankOf(a.region) - rankOf(b.region));
  }

  function currentPlaylist(){
    if(!demoPlaylist.length){
      demoPlaylist = buildDemoPlaylist();
    }
    return demoPlaylist;
  }

  function loadTrack(index){
    const list = currentPlaylist();
    if(!list.length){
      return false;
    }
    demoIndex = index >= 0
      ? index % list.length
      : 0;
    const t = list[demoIndex];
    const prev = getState().currentTrack || {};
    updateState(s => {
      s.currentTrack = {
        title: t.title,
        artist: t.artist,
        artwork: t.art || getArtwork(demoIndex),
        src: t.src,
        fromPlaylist: ""
      };
      s.isPlaying = false;
      s.progress = 0;
    });
    const el = getAudioElement();
    loadTrackId++;
    clearTimeout(resumeFallbackTimer);
    el.onloadedmetadata = null;
    el.src = t.src;
    el.load();
    renderPlayer();
    return true;
  }

  function updateProgressUI(progress){
    const value = Math.max(0, Math.min(100, Number(progress) || 0));
    const player = document.querySelector("[data-player]");
    if(!player){
      return;
    }
    const fill = player.querySelector(".promo-progress-fill");
    const slider = player.querySelector("[data-seek]");
    if(fill){
      fill.style.transform = "scaleX(" + (value / 100).toFixed(4) + ")";
    }
    if(slider){
      slider.setAttribute("aria-valuenow", String(Math.round(value)));
    }
  }

  function syncPlayerToggleIcon(){
    const player = document.querySelector("[data-player]");
    if(!player){
      return;
    }
    const btn = player.querySelector("[data-action='player-toggle']");
    if(btn){
      const img = btn.querySelector("img");
      const playing = getState().isPlaying;
      if(img){
        img.src = playing
          ? "Assets/icons/pause_button.webp"
          : "Assets/icons/play_button.webp";
      }
      btn.classList.toggle("is-playing", playing);
      btn.setAttribute("aria-pressed", playing ? "true" : "false");
      btn.setAttribute("aria-label", playing ? "Pause" : "Play");
    }
  }

  function onAudioTime(){
    const el = demoAudio;
    if(!el || !el.duration || !Number.isFinite(el.duration)){
      return;
    }
    const progress = (el.currentTime / el.duration) * 100;
    updateProgressUI(progress);
    const now = Date.now();
    if(now - lastSnapshotSave > 1000){
      lastSnapshotSave = now;
      savePlaybackSnapshot();
    }
  }

  function onAudioEnded(){
    try{
      if(window.TRACK && typeof window.TRACK.event === "function"){
        window.TRACK.event("player_complete", "song", currentTrackId(), { title: (getState().currentTrack || {}).title || "" });
      }
    }catch(e){}
    const list = currentPlaylist();
    if(!list.length){
      updateState(s => { s.isPlaying = false; });
      syncPlayerToggleIcon();
      clearPlaybackSnapshot();
      return;
    }
    loadTrack(demoIndex + 1);
    const el = getAudioElement();
    el.currentTime = 0;
    savePlaybackSnapshot({ index: demoIndex });
    el.play().catch(() => {});
  }

  function toggleAudioPlayback(){
    const list = currentPlaylist();
    if(list.length){
      const el = getAudioElement();
      if(!el.src && el.paused){
        unlockPlayback();
        return;
      }
      if(el.paused){
        unlockPlayback();
      }else{
        el.pause();
        updateState(s => { s.isPlaying = false; });
        syncPlayerToggleIcon();
      }
      return;
    }
    updateState(s => { s.isPlaying = !s.isPlaying; });
    renderPlayer();
  }

  const AUTOSTART_WINDOW_MS = 10 * 60 * 1000;

  /* Decide which track to start. If a playback snapshot exists and
     is recent, we are navigating between pages -> resume that exact
     song at its position. Otherwise it is a fresh app open -> pick a
     random demo track. Returns { index, resumeFrom } or null. */
  function chooseAutostartTrack(){
    const list = currentPlaylist();
    if(!list.length){
      return null;
    }
    const snap = readPlaybackSnapshot();
    if(snap){
      const recent = (Date.now() - (snap.ts || 0)) < AUTOSTART_WINDOW_MS;
      if(recent){
        let idx = list.findIndex(t => t.src === snap.src);
        if(idx < 0 && typeof snap.index === "number" &&
           snap.index >= 0 && snap.index < list.length){
          idx = snap.index;
        }
        if(idx >= 0){
          return { index: idx, resumeFrom: Number(snap.currentTime) || 0 };
        }
      }
    }
    const randomIdx = Math.floor(Math.random() * list.length);
    return { index: randomIdx, resumeFrom: null };
  }

  function unlockPlayback(){
    const el = getAudioElement();
    if(!el.src){
      const decision = chooseAutostartTrack();
      if(!decision){
        updateState(s => { s.isPlaying = false; });
        syncPlayerToggleIcon();
        return;
      }
      loadTrack(decision.index);
      if(decision.resumeFrom != null && decision.resumeFrom > 0){
        const restore = Number(decision.resumeFrom);
        const expectedTrackId = loadTrackId;
        clearTimeout(resumeFallbackTimer);
        el.onloadedmetadata = function onReady(){
          if(loadTrackId !== expectedTrackId) return;
          el.onloadedmetadata = null;
          if(Number.isFinite(restore)){
            el.currentTime = Math.min(restore, Number.isFinite(el.duration) ? el.duration : restore);
          }
          updateState(s => { s.isPlaying = true; });
          syncPlayerToggleIcon();
          savePlaybackSnapshot({ index: demoIndex });
          const p = el.play();
          if(p && p.catch){ p.catch(() => {}); }
        };
        resumeFallbackTimer = setTimeout(function(){
          if(loadTrackId === expectedTrackId && el.onloadedmetadata){
            el.onloadedmetadata = null;
            if(el.readyState >= 2){
              if(Number.isFinite(restore)){
                el.currentTime = Math.min(restore, Number.isFinite(el.duration) ? el.duration : restore);
              }
              updateState(s => { s.isPlaying = true; });
              syncPlayerToggleIcon();
              const p = el.play();
              if(p && p.catch){ p.catch(() => {}); }
            }
          }
        }, 4000);
        return;
      }
    }
    /* Never try to play without a source (NoExplicitSrc). */
    if(!el.src) return;
    const promise = el.play();
    if(promise && promise.catch){
      promise.catch(() => {});
    }
    updateState(s => { s.isPlaying = true; });
    syncPlayerToggleIcon();
    savePlaybackSnapshot({ index: demoIndex });
  }

  /* Auto-play a song on every page load: resume the last track at its
     saved position, or pick a random demo track on a fresh open. If the
     browser blocks autoplay, retry on the first user interaction. */
  function attemptAutoResume(){
    unlockPlayback();
    var el = demoAudio;
    if(!el || !el.paused){
      return;
    }
    var EVENTS = ["pointerdown", "touchstart", "keydown", "click"];
    function resumeOnce(){
      for(var i = 0; i < EVENTS.length; i++){
        document.removeEventListener(EVENTS[i], resumeOnce, true);
      }
      if(el && el.paused && el.src){
        var p = el.play();
        if(p && p.catch){ p.catch(function(){}); }
        updateState(s => { s.isPlaying = true; });
        syncPlayerToggleIcon();
      }
    }
    for(var j = 0; j < EVENTS.length; j++){
      document.addEventListener(EVENTS[j], resumeOnce, true);
    }
  }

  /* =========================================================
     Bottom Swipe (player ⇄ navigation)
     Per-panel absolute seating — each panel translated individually.
     ========================================================= */

  var MODE_NAV    = "navigation";
  var MODE_PLAYER = "player";
  var AXIS_LOCK   = 8;
  var SWIPE_MIN   = 48;
  var FLING_V     = 0.35;
  var FLING_D     = 12;
  var TRANSITION  = 280;
  var GUARD_MS    = 500;

  var swipeState  = {
    mode: MODE_NAV,
    tracking: false,
    axis: null,
    startX: 0,
    startY: 0,
    lastDelta: 0,
    samples: [],
    activePointerId: null,
    captured: false,
    clickGuard: false,
    guardTimer: 0,
    downTarget: null,
    settleTimer: 0,
    resized: false,
    wheelAcc: 0,
    wheelTimer: 0,
    lastWheelSwitch: 0,
    wheelLockedUntil: 0,
    wheelUnit: "",
    wheelLastEvent: 0
  };

  function viewportWidth(){
    var wrap = document.querySelector("[data-bottom-swipe]");
    if(!wrap) return window.innerWidth;
    var r = wrap.getBoundingClientRect();
    return r.width || wrap.clientWidth || window.innerWidth;
  }

  function currentPanel(){
    var sel = swipeState.mode === MODE_PLAYER ? "[data-player]" : "[data-bottom]";
    return document.querySelector(sel);
  }

  function incomingPanel(){
    var sel = swipeState.mode === MODE_PLAYER ? "[data-bottom]" : "[data-player]";
    return document.querySelector(sel);
  }

  function panelSetX(el, x){
    if(!el) return;
    el.style.transform = "translate3d(" + (Math.round(x * 100) / 100) + "px,0,0)";
  }

  function seat(){
    var wrap = document.querySelector("[data-bottom-swipe]");
    if(!wrap) return;
    if(swipeState.tracking || swipeState.settleTimer) return;
    var w = viewportWidth();
    var nav = wrap.querySelector("[data-bottom]");
    var pl  = wrap.querySelector("[data-player]");
    wrap.classList.add("no-anim");
    panelSetX(nav, swipeState.mode === MODE_NAV    ? 0 : -w);
    panelSetX(pl,  swipeState.mode === MODE_PLAYER ? 0 :  w);
    void wrap.offsetWidth;
    wrap.classList.remove("no-anim");
  }

  function applyDrag(d){
    var wrap = document.querySelector("[data-bottom-swipe]");
    if(!wrap) return;
    var w = viewportWidth();
    panelSetX(currentPanel(), d);
    panelSetX(incomingPanel(), (d < 0 ? w : -w) + d);
  }

  function settlePanels(shouldSwitch, d){
    var wrap = document.querySelector("[data-bottom-swipe]");
    if(!wrap) return;
    var w        = viewportWidth();
    var outgoing = currentPanel();
    var incoming = incomingPanel();

    wrap.classList.remove("is-dragging");
    void wrap.offsetWidth;

    if(shouldSwitch){
      swipeState.mode = (swipeState.mode === MODE_NAV) ? MODE_PLAYER : MODE_NAV;
      updateState(s => { s.bottomMode = swipeState.mode; });
      panelSetX(incoming, 0);
      panelSetX(outgoing, d < 0 ? -w : w);
    }else{
      panelSetX(outgoing, 0);
      panelSetX(incoming, d < 0 ? w : -w);
    }

    clearTimeout(swipeState.settleTimer);
    swipeState.settleTimer = setTimeout(function(){
      swipeState.settleTimer = null;
      seat();
    }, TRANSITION + 60);
  }

  function recordSample(x, y){
    var t = (window.performance && performance.now) ? performance.now() : Date.now();
    swipeState.samples.push({ x: x, y: y, t: t });
    while(swipeState.samples.length > 2 && t - swipeState.samples[0].t > 120){
      swipeState.samples.shift();
    }
    if(swipeState.samples.length > 8) swipeState.samples.shift();
  }

  function velocity(){
    var s = swipeState.samples;
    if(s.length < 2) return 0;
    var a  = s[0];
    var b  = s[s.length - 1];
    var dt = b.t - a.t;
    if(dt <= 0) return 0;
    return (swipeState.axis === "y" ? (b.y - a.y) : (b.x - a.x)) / dt;
  }

  function armClickGuard(){
    swipeState.clickGuard = true;
    clearTimeout(swipeState.guardTimer);
    swipeState.guardTimer = setTimeout(function(){
      swipeState.clickGuard = false;
    }, GUARD_MS);
  }

  function clearClickGuard(){
    swipeState.clickGuard = false;
    clearTimeout(swipeState.guardTimer);
  }

  function bindBottomSwipe(){
    var wrap = document.querySelector("[data-bottom-swipe]");
    if(!wrap) return;

    var navPanel    = wrap.querySelector("[data-bottom]");
    var playerPanel = wrap.querySelector("[data-player]");
    if(!navPanel || !playerPanel) return;

    /* --- pointer events --------------------------------------------------- */
    function onPointerDown(e){
      if(e.isPrimary === false) return;
      if(e.pointerType === "mouse" && e.button !== 0) return;
      if(e.target.closest("[data-seek]")) return;
      if(swipeState.tracking) return;
      clearClickGuard();
      swipeState.downTarget = e.target;
      swipeState.activePointerId = e.pointerId;
      gestureStart(e.clientX, e.clientY);
    }

    function onPointerMove(e){
      if(e.pointerId !== swipeState.activePointerId) return;
      gestureMove(e.clientX, e.clientY);
      if(swipeState.axis === "x" && !swipeState.captured &&
         Math.abs(swipeState.lastDelta) >= SWIPE_MIN){
        try{
          wrap.setPointerCapture(e.pointerId);
          swipeState.captured = true;
        }catch(error){}
      }
      if(swipeState.axis === "x" && e.cancelable){
        e.preventDefault();
      }
    }

    function onPointerUp(e){
      if(e.pointerId !== swipeState.activePointerId) return;
      swipeState.activePointerId = null;
      gestureEnd(false);
      if(swipeState.captured){
        swipeState.captured = false;
        try{
          wrap.releasePointerCapture(e.pointerId);
        }catch(error){}
      }
    }

    function onPointerCancel(e){
      if(e.pointerId !== swipeState.activePointerId) return;
      swipeState.activePointerId = null;
      gestureEnd(true);
      if(swipeState.captured){
        swipeState.captured = false;
        try{
          wrap.releasePointerCapture(e.pointerId);
        }catch(error){}
      }
    }

    /* --- touch events ----------------------------------------------------- */
    function onTouchStart(e){
      if(e.touches.length !== 1 || swipeState.tracking) return;
      var t = e.touches[0];
      if(e.target && e.target.closest && e.target.closest("[data-seek]")) return;
      clearClickGuard();
      swipeState.downTarget = e.target;
      gestureStart(t.clientX, t.clientY);
    }

    function onTouchMove(e){
      var t = e.touches[0];
      if(!t) return;
      gestureMove(t.clientX, t.clientY);
      if(swipeState.axis === "x" && e.cancelable) e.preventDefault();
    }

    function onTouchEnd(){    gestureEnd(false); }
    function onTouchCancel(){ gestureEnd(true); }

    /* --- mouse events ----------------------------------------------------- */
    function onMouseDown(e){
      if(e.button !== 0 || swipeState.tracking) return;
      clearClickGuard();
      swipeState.downTarget = e.target;
      gestureStart(e.clientX, e.clientY);
    }
    function onMouseMove(e){ gestureMove(e.clientX, e.clientY); }
    function onMouseUp(){    gestureEnd(false); }

    /* --- gesture core ----------------------------------------------------- */
    function gestureStart(x, y){
      if(swipeState.tracking) return;
      swipeState.tracking  = true;
      swipeState.axis      = null;
      swipeState.startX    = x;
      swipeState.startY    = y;
      swipeState.lastDelta = 0;
      swipeState.samples   = [];
      recordSample(x, y);
      clearTimeout(swipeState.settleTimer);
      swipeState.settleTimer = null;
    }

    function gestureMove(x, y){
      if(!swipeState.tracking) return;
      var dx = x - swipeState.startX;
      var dy = y - swipeState.startY;

      if(swipeState.axis === null){
        var adx = Math.abs(dx);
        var ady = Math.abs(dy);
        if(adx > AXIS_LOCK && adx > ady){
          swipeState.axis = "x";
          wrap.classList.add("is-dragging");
        }else if(ady > AXIS_LOCK){
          swipeState.axis = "y";
        }else{
          return;
        }
      }

      if(swipeState.axis === "y"){
        swipeState.lastDelta = dy;
        recordSample(x, y);
        return;
      }

      swipeState.lastDelta = dx;
      recordSample(x, y);
      applyDrag(dx);
    }

    /* Resolves a dock link tapped without a swipe. Returns an absolute URL
       string, or null when the pressed element is not a dock link. */
    function dockTapHref(node){
      var link = (node && node.closest)
        ? node.closest(".bottom-nav-item, .promo-art, .promo-meta")
        : null;
      if(!link || !wrap.contains(link)) return null;
      if(link.target && link.target !== "_self" && link.target !== "") return null;
      if(link.hasAttribute("download")) return null;
      var href = (link.getAttribute("href") || "").replace(/^\s+/, "");
      if(!href || /^(#|mailto:|tel:|javascript:|data:|about:)/i.test(href)) return null;
      try{
        return new URL(href, document.baseURI).href;
      }catch(error){
        return null;
      }
    }

    function gestureEnd(cancelled){
      if(!swipeState.tracking) return;
      swipeState.tracking = false;

      var switched = false;
      if(swipeState.axis === "x"){
        var v = velocity();
        var shouldSwitch =
          Math.abs(swipeState.lastDelta) >= SWIPE_MIN ||
          (Math.abs(v) >= FLING_V && Math.abs(swipeState.lastDelta) >= FLING_D);
        switched = shouldSwitch;
        settlePanels(shouldSwitch, swipeState.lastDelta);
        if(shouldSwitch){
          armClickGuard();
        }
      }else if(wrap.classList.contains("is-dragging")){
        wrap.classList.remove("is-dragging");
      }

      /* A tap-release on a dock link navigates directly from the pointerup.
         This beats unreliable touch-click synthesis — thumb drift can make the
         browser discard the synthetic click entirely. Dock links route through
         the SPA loader so the <audio> element survives and playback is
         seamless; a real panel-switching swipe is exempt, and the armed guard
         swallows the redundant click so it never fires twice. */
      if(!cancelled && !switched){
        var tapHref = dockTapHref(swipeState.downTarget);
        swipeState.downTarget = null;
        if(tapHref){
          armClickGuard();
          navigate(tapHref);
        }
      }

      swipeState.axis = null;
    }

    /* --- bind events ------------------------------------------------------ */
    if(window.PointerEvent){
      wrap.addEventListener("pointerdown", onPointerDown);
      window.addEventListener("pointermove", onPointerMove, { passive: false });
      window.addEventListener("pointerup", onPointerUp);
      window.addEventListener("pointercancel", onPointerCancel);
      window.addEventListener("pointerdown", clearClickGuard, true);
    }else{
      wrap.addEventListener("touchstart", onTouchStart, { passive: true });
      window.addEventListener("touchmove", onTouchMove, { passive: false });
      window.addEventListener("touchend", onTouchEnd);
      window.addEventListener("touchcancel", onTouchCancel);
      wrap.addEventListener("mousedown", onMouseDown);
      window.addEventListener("mousemove", onMouseMove);
      window.addEventListener("mouseup", onMouseUp);
      window.addEventListener("touchstart", clearClickGuard, true);
      window.addEventListener("mousedown", clearClickGuard, true);
    }

    /* --- click guard ------------------------------------------------------ */
    wrap.addEventListener("click", function(e){
      if(!swipeState.clickGuard) return;
      swipeState.clickGuard = false;
      clearTimeout(swipeState.guardTimer);
      e.preventDefault();
      e.stopImmediatePropagation();
    }, true);

    /* --- dock-link backstop ----------------------------------------------
       Routes promo-art / promo-meta / bottom-nav-item clicks through the
       SPA on the SAME bubble path as the (working) player toggle, but only
       when the capture-phase router did not already handle the click. */
    wrap.addEventListener("click", function(e){
      if(e.defaultPrevented) return;
      if(swipeState.clickGuard) return;
      var node = e.target;
      var link = (node && node.closest)
        ? node.closest(".bottom-nav-item, .promo-art, .promo-meta")
        : null;
      if(!link || !wrap.contains(link)) return;
      var href = link.getAttribute("href") || "";
      if(!href || /^(#|mailto:|tel:|javascript:|data:|about:)/i.test(href.replace(/^\s+/, ""))){
        return;
      }
      if(!isInternalAppUrl(href)) return;
      e.preventDefault();
      navigate(new URL(href, document.baseURI).href);
    });

    /* --- resize re-seat --------------------------------------------------- */
    var resizeTimer = 0;
    window.addEventListener("resize", function(){
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function(){
        if(!swipeState.tracking) seat();
      }, 120);
    });

    /* --- trackpad wheel: 2-finger swipe / upward flick -------------------- */
    function onWheel(e){
      if(swipeState.tracking || swipeState.settleTimer) return;
      if(e.target && e.target.closest && e.target.closest("[data-seek]")) return;

      var ax = Math.abs(e.deltaX);
      var ay = Math.abs(e.deltaY);

      if(ax > 0 && ax >= ay * 1.05){
        var now = Date.now();
        var delta = e.deltaMode === 1 ? e.deltaX * 16 : e.deltaX;
        var gap = now - swipeState.wheelLastEvent;
        if(gap > 260){
          swipeState.wheelAcc = 0;
        }
        swipeState.wheelLastEvent = now;
        if(now < swipeState.wheelLockedUntil){
          swipeState.wheelLockedUntil = now + 360;
          return;
        }
        swipeState.wheelAcc += delta;
        clearTimeout(swipeState.wheelTimer);
        swipeState.wheelTimer = setTimeout(function(){ swipeState.wheelAcc = 0; }, 280);
        if(Math.abs(swipeState.wheelAcc) >= 28){
          swipeState.lastWheelSwitch = now;
          swipeState.wheelLockedUntil = now + 600;
          swipeState.wheelAcc = 0;
          settlePanels(true, delta < 0 ? -1 : 1);
        }
        return;
      }
      /* Vertical wheel is deliberately ignored: switching is left/right only. */
    }
    wrap.addEventListener("wheel", onWheel, { passive: false });

    /* --- nav click: update active state ----------------------------------- */
    navPanel.addEventListener("click", function(e){
      var node = e.target;
      var link = (node && node.closest) ? node.closest(".bottom-nav-item") : null;
      if(!link || !navPanel.contains(link)) return;
      var items = navPanel.querySelectorAll(".bottom-nav-item");
      for(var i = 0; i < items.length; i++){
        items[i].removeAttribute("aria-current");
        items[i].classList.remove("is-active");
      }
      link.setAttribute("aria-current", "page");
      link.classList.add("is-active");
    });

    /* --- boot seating: restore the panel mode you last left ----------------- */
    swipeState.mode = (getState().bottomMode === MODE_PLAYER)
      ? MODE_PLAYER
      : MODE_NAV;
    seat();
  }

  function syncBottomPanels(){
    seat();
  }

  function playDemoTrack(query){
    const source = currentPlaylist().length
      ? currentPlaylist()
      : (window.DEMO_SONGS_DATA || []);

    if(!source.length){
      return false;
    }

    let index = -1;

    if(typeof query === "number"){
      index = query;
    }else if(query && typeof query === "object"){
      if(query.src){
        index = source.findIndex(t => t.src === query.src);
      }
      if(index < 0 && query.title){
        index = source.findIndex(t => t.title === query.title);
      }
      if(index < 0 && query.artist){
        index = source.findIndex(t => t.artist === query.artist);
      }
    }else if(typeof query === "string"){
      const q = String(query).toLowerCase();
      index = source.findIndex(t =>
        String(t.title || "").toLowerCase() === q ||
        String(t.artist || "").toLowerCase() === q
      );
    }

    if(index < 0){
      index = 0;
    }

    const track = source[index];
    if(!track){
      return false;
    }

    demoIndex = index;
    demoPlaylist = source;

    let fromPlaylist = (query && query.fromPlaylist) || "";
    if(fromPlaylist && !(window.PLAYLISTS || []).some(p => p.id === fromPlaylist)){
      fromPlaylist = "";
    }
    if(!fromPlaylist){
      fromPlaylist = resolvePlaylistId(track);
    }
    if(!fromPlaylist){
      fromPlaylist = (getState().currentTrack || {}).fromPlaylist || "";
    }

    updateState(s => {
      s.currentTrack = {
        title: track.title,
        artist: track.artist,
        artwork: track.art || getArtwork(index),
        src: track.src,
        fromPlaylist: fromPlaylist
      };
      s.isPlaying = true;
      s.progress = 0;
    });

    const el = getAudioElement();
    el.src = track.src;
    el.load();

    const promise = el.play();
    if(promise && promise.catch){
      promise.catch(() => {});
    }

    syncPlayerToggleIcon();
    savePlaybackSnapshot({ index: index });
    if(document.querySelector("[data-player]")){
      renderPlayer();
    }
    return true;
  }

  function initialiseGlobalPlayer(){

    document.addEventListener(
      "click",
      (event) => {

        const action =
          event.target
            .closest("[data-action]")
            ?.dataset.action;

        if(!action){
          return;
        }

        /* -----------------------------------------
           Player Play / Pause
           ----------------------------------------- */

        if(
          action === "player-toggle"
        ){

          toggleAudioPlayback();

          return;
        }

        /* -----------------------------------------
           Open Song Info (from player art)
           ----------------------------------------- */

        if(
          action === "open-song-info"
        ){

          const t =
            getState().currentTrack;

          if(
            t &&
            t.title
          ){

            const params =
              new URLSearchParams();

            params.set(
              "title",
              t.title
            );

            if(
              t.artist
            ){
              params.set(
                "artist",
                t.artist
              );
            }

            if(
              t.artwork
            ){
              params.set(
                "art",
                t.artwork
              );
            }

            navigate("song.html?" + params.toString());

          }else{

            toast(
              "No song selected"
            );
          }

          return;
        }

        /* -----------------------------------------
           Open Detail Songs (playlist) from player
           ----------------------------------------- */

        if(
          action === "open-detail-songs"
        ){

          let id =
            "wokeeyes";

          const t =
            getState().currentTrack;

          const lists =
            typeof window.PLAYLISTS !==
              "undefined"
              ? window.PLAYLISTS
              : [];

          if(
            t &&
            t.title &&
            lists.length
          ){

            const needle =
              String(t.title)
                .toLowerCase();

            const match =
              lists.find(
                p =>
                  (p.songs || [])
                    .some(
                      s =>
                        String(
                          s.title || ""
                        )
                        .toLowerCase() ===
                        needle
                    )
              );

            if(
              match
            ){
              id =
                match.id;
            }
          }

          navigate("playlists.html?open=" + encodeURIComponent(id));

          return;
        }


        /* -----------------------------------------
           Seek / Progress
           ----------------------------------------- */

        if(
          action === "seek" ||
          event.target.closest("[data-seek]")
        ){

          const bar =
            event.target.closest(
              "[data-seek]"
            );

          if(
            !bar ||
            bar.closest("[data-action='seek']") !== bar
          ){
            return;
          }

          setProgressFromEvent(
            bar,
            event
          );

          return;
        }

        /* -----------------------------------------
           Play Track
           ----------------------------------------- */

        if(
          action === "play-track"
        ){

          const el =
            event.target.closest(
              "[data-action='play-track']"
            );

          if(!el){
            return;
          }

          const track = {

            id:
              el.dataset.id,

            title:
              el.dataset.title,

            artist:
              el.dataset.artist,

            artwork:
              el.dataset.artwork

          };

          updateState(
            state => {

              state.currentTrack =
                track;

              state.isPlaying =
                true;

              state.progress =
                0;

            }
          );

          renderPlayer();

          toast(
            `${track.title}`
          );

          return;
        }

        /* -----------------------------------------
           Favourite Song
           ----------------------------------------- */

        if(
          action === "favourite-song"
        ){

          const el =
            event.target.closest(
              "[data-action='favourite-song']"
            );

          if(!el){
            return;
          }

          const id =
            el.dataset.id;

          updateState(
            state => {

              state.favouriteSongs =
                state.favouriteSongs ||
                [];

              const index =
                state.favouriteSongs
                  .indexOf(id);

              if(index >= 0){

                state.favouriteSongs
                  .splice(
                    index,
                    1
                  );

              }else{

                state.favouriteSongs
                  .push(id);

              }

            }
          );

          el.textContent =
            getState()
              .favouriteSongs
              .includes(id)
              ? "♥"
              : "♡";
        }

      }
    );

    renderPlayer();

    bindSeekDrag();

    bindBottomSwipe();

    syncBottomPanels();
  }

  /* =========================================================
     Modal Bottom Sheet
     ========================================================= */

  function openSheet({
    title,
    text,
    html,
    actions = []
  }){

    const backdrop =
      document.querySelector(
        "[data-modal]"
      );

    if(!backdrop){
      return;
    }

    const body =
      backdrop.querySelector(
        "[data-modal-body]"
      );

    const titleNode =
      backdrop.querySelector(
        "[data-modal-title]"
      );

    const actionsNode =
      backdrop.querySelector(
        "[data-modal-actions]"
      );

    titleNode.textContent =
      title || "";

    body.innerHTML =
      html ||
      `<p>${esc(text || "")}</p>`;

    actionsNode.innerHTML =
      actions
        .map(
          action => {

            return `
              <button
                class="th-btn ${
                  action.primary
                    ? "primary"
                    : ""
                }"
                type="button"
                data-modal-action="${esc(
                  action.id
                )}"
              >
                ${esc(
                  action.label
                )}
              </button>
            `;
          }
        )
        .join("");

    backdrop.classList.add(
      "is-open"
    );

    document.body.style.overflow =
      "hidden";
  }

  function closeSheet(){

    const backdrop =
      document.querySelector(
        "[data-modal]"
      );

    if(!backdrop){
      return;
    }

    backdrop.classList.remove(
      "is-open"
    );

    document.body.style.overflow =
      "";
  }

  function initialiseModal(){

    const backdrop =
      document.querySelector(
        "[data-modal]"
      );

    if(!backdrop){
      return;
    }

    backdrop.addEventListener(
      "click",
      (event) => {

        if(
          event.target === backdrop ||
          event.target.closest(
            "[data-modal-close]"
          )
        ){

          closeSheet();

          return;
        }

        const action =
          event.target.closest(
            "[data-modal-action]"
          )?.dataset
            .modalAction;

        if(
          action === "dismiss"
        ){

          closeSheet();
        }

      }
    );
  }

  /* =========================================================
     Demo / Prototype New Music Dataset
     ========================================================= */

  function makeNewMusicData(){

    return [

      {
        id: "song-101",
        title: "Mbare After Dark",
        artist: "JAZZWRLD",
        genre: "Zim Hip Hop",
        city: "Harare",
        language: "Shona",
        dateAdded: "2026-08-27",
        plays: 1240,
        favourites: 108,
        artwork: getArtwork(2),
        youtube: "dQw4w9WgXcQ"
      },

      {
        id: "song-102",
        title: "Night Bus",
        artist: "Holy Ten",
        genre: "Zimdancehall",
        city: "Chitungwiza",
        language: "Shona / English",
        dateAdded: "2026-08-26",
        plays: 904,
        favourites: 83,
        artwork: getArtwork(1),
        youtube: "dQw4w9WgXcQ"
      },

      {
        id: "song-103",
        title: "Golden Hour",
        artist: "Feli Nandi",
        genre: "Afro-Fusion",
        city: "Bulawayo",
        language: "English",
        dateAdded: "2026-08-25",
        plays: 788,
        favourites: 74,
        artwork: getArtwork(3),
        youtube: "dQw4w9WgXcQ"
      },

      {
        id: "song-104",
        title: "Homecoming",
        artist: "Alick Macheso",
        genre: "Sungura",
        city: "Gweru",
        language: "Shona",
        dateAdded: "2026-08-23",
        plays: 640,
        favourites: 91,
        artwork: getArtwork(4),
        youtube: "dQw4w9WgXcQ"
      },

      {
        id: "song-105",
        title: "As We Rise",
        artist: "Winky D",
        genre: "Gospel Hip Hop",
        city: "Mutare",
        language: "English",
        dateAdded: "2026-08-22",
        plays: 611,
        favourites: 52,
        artwork: getArtwork(0),
        youtube: "dQw4w9WgXcQ"
      },

      {
        id: "song-106",
        title: "Kasi Motion",
        artist: "MT Tinashe",
        genre: "Amapiano",
        city: "Bulawayo",
        language: "Ndebele",
        dateAdded: "2026-08-21",
        plays: 570,
        favourites: 46,
        artwork: getArtwork(2),
        youtube: "dQw4w9WgXcQ"
      }

    ];
  }

  /* =========================================================
     Shared Demo Catalog
     Richer dataset used by search and browse surfaces.
     ========================================================= */

  const CATALOG = (function buildCatalog(){
    const songs = [
      ["Mbare After Dark","Example Artist","Zim Hip Hop","Shona","song-101"],
      ["Night Bus","Example Artist","Zimdancehall","Shona / English","song-102"],
      ["Golden Hour","Example Artist","Afro-Fusion","English","song-103"],
      ["Homecoming","Example Artist","Sungura","Shona","song-104"],
      ["As We Rise","Example Artist","Gospel Hip Hop","English","song-105"],
      ["Kasi Motion","Example Artist","Amapiano","Ndebele","song-106"],
      ["uValo","JAZZWRLD","Afro-Fusion","Shona / English","song-201"],
      ["Zim Dreams","Feli Nandi","Afro-Soul","English","song-202"],
      ["Mambo","Mambo Dhuterere","Zimdancehall","Shona","song-203"],
      ["Musarovha","Killer T","Zimdancehall","Shona","song-204"],
      ["Worroro","Holy Ten","Zim Hip Hop","Shona / English","song-205"],
      ["Rokita","Killer T","Zimdancehall","Shona","song-206"],
      ["Number Lelo","Killer T","Zimdancehall","Shona / English","song-207"],
      ["Bleed","IKabod","Zim Hip Hop","English","song-208"],
      ["Makomana","Chikwata","Zim Hip Hop","Shona","song-209"],
      ["Dear Haters","Voltz JT","Urban Grooves","Shona / English","song-210"],
      ["Floeky","Junior Music","Amapiano","English","song-211"],
      ["John Vuli Gate","Voltz JT","Amapiano","Shona / English","song-212"],
      ["Nhaka Yedu","Feli Nandi","Afro-Soul","Shona","song-213"],
      ["Ropa Dzangu","Feli Nandi","Afro-Fusion","Shona","song-214"],
      ["Zvakaitika","Somandla Ndebele","Imbube","Ndebele","song-215"],
      ["Nkande","MT Tinashe","Amapiano","Shona","song-216"],
      ["Tsano Wangu","MT Tinashe","Zim Hip Hop","Shona","song-217"],
      ["Yewo","MT Tinashe","Afro-Pop","Shona","song-218"],
      ["Heat Free","Hwinza","Zim Hip Hop","Shona","song-219"],
      ["Season Maroja","Hwinza","Zim Hip Hop","Shona","song-220"]
    ];

    const artists = [
      ["Winky D","Zimdancehall","Harare","artist-1"],
      ["Holy Ten","Zim Hip Hop","Harare","artist-2"],
      ["Feli Nandi","Afro-Soul","Harare","artist-3"],
      ["Alick Macheso","Sungura","Bindura","artist-4"],
      ["Jah Prayzah","Afro-Fusion","Makoni","artist-5"],
      ["Killer T","Zimdancehall","Harare","artist-6"],
      ["Voltz JT","Zim Hip Hop","Harare","artist-7"],
      ["MT Tinashe","Zim Hip Hop","Harare","artist-8"],
      ["Hwinza","Zim Hip Hop","Harare","artist-9"],
      ["JAZZWRLD","Afro-Fusion","Harare","artist-10"],
      ["Somandla Ndebele","Imbube","Bulawayo","artist-11"],
      ["Mambo Dhuterere","Zimdancehall","Harare","artist-12"],
      ["Mustapha Mughal","Ghazal","Bulawayo","artist-13"],
      ["Zivuya","Zimdancehall","Chitungwiza","artist-14"],
      ["Chicco Nguruve","Sungura","Gweru","artist-15"],
      ["Knowley D","Urban Grooves","Bulawayo","artist-16"],
      ["Doc Shebeleza","Amapiano","Johannesburg / Zim","artist-17"],
      ["Squash","Zim Hip Hop","Harare","artist-18"],
      ["X.O","Zim Hip Hop","Harare","artist-19"],
      ["Poptain","Zim Hip Hop","Harare","artist-20"],
      ["Asaph","Gospel","Harare","artist-21"],
      ["Tamy Moyo","Afro-Pop","Harare","artist-22"],
      ["Gemma Griffiths","Afro-Fusion","Harare","artist-23"],
      ["Freeman","Urban Grooves","Kwekwe","artist-24"],
      ["Seh Calaz","Zimdancehall","Harare","artist-25"]
    ];

    const genres = [
      "Mbira","Jiti","Mhande","Mbende / Jerusarema","Muchongoyo","Mbakumba","Shangare","Amabhiza",
      "Sungura","Chimurenga","Tuku Music","Afro-Jazz","Zimbabwean Jazz","Imbube","Kanindo",
      "Zimbabwean Rumba","Afro-Fusion","Afro-Pop","Zimdancehall","Urban Grooves","Zim Hip Hop",
      "Amapiano","Zimbabwean House","Zim EDM","Zim-TrapSoul","R&B","Soul","Gospel","Reggae",
      "Dancehall","House","Gqom","Kwaito","Gospel Hip Hop","Trap Gospel","Afro-Gospel Rap"
    ];

    return {
      songs: songs.map(s => ({
        id: s[4], title: s[0], artist: s[1], genre: s[2], language: s[3],
        kind: "Song", lyrics: SONG_LYRICS, artwork: getArtwork(parseInt(s[4].slice(-1), 10) || 0)
      })),
      artists: artists.map(a => ({
        id: a[3], name: a[0], genre: a[1], city: a[2], kind: "Artist"
      })),
      genres: genres.map(g => ({
        id: "genre-" + chartId(g), title: g, kind: "Genre"
      }))
    };
  })();

  function searchInCatalog(query, type){
    const q = String(query || "").toLowerCase().trim();
    const kinds = type === "all" ? ["Song", "Artist", "Chart", "Genre"] : [kindFromType(type)];
    const items = [];
    if(kinds.includes("Song")){
      for(const s of CATALOG.songs){
        if(!q || (s.title + " " + s.artist + " " + s.genre + " " + s.language + " " + (s.lyrics || "")).toLowerCase().includes(q)){
          items.push(s);
        }
      }
    }
    if(kinds.includes("Artist")){
      for(const a of CATALOG.artists){
        if(!q || (a.name + " " + a.genre + " " + a.city).toLowerCase().includes(q)){
          items.push(a);
        }
      }
    }
    if(kinds.includes("Chart")){
      const CHART_NAMES = ["National Top 100","Zim Hip Hop Top 20","Zimdancehall Top 20","Zimbabwe Gospel Top 20","Sungura Top 20","Zimbabwean House Top 20","R&B Top 20"];
      for(const name of CHART_NAMES){
        if(!q || name.toLowerCase().includes(q)){
          items.push({ id: "chart-" + chartId(name), title: name, kind: "Chart" });
        }
      }
    }
    if(kinds.includes("Genre")){
      for(const g of CATALOG.genres){
        if(!q || g.title.toLowerCase().includes(q)){
          items.push(g);
        }
      }
    }
    return items;
  }

  function kindFromType(t){
    if(t === "songs"){ return "Song"; }
    if(t === "artists"){ return "Artist"; }
    if(t === "charts"){ return "Chart"; }
    if(t === "genres"){ return "Genre"; }
    return "Song";
  }

  /* =========================================================
     Legacy / Progressive-Enhancement Adapters
     These let the earlier prototype pages open directly from
     their own HTML while the new shell initialises in the
     background. Every access is guarded so nothing crashes if
     a legacy hook or element is missing.
     ========================================================= */

  function readFavs(key){
    try{
      return JSON.parse(localStorage.getItem(key) || "[]");
    }catch(error){
      return [];
    }
  }

  window.TrackHypeShell = {
    esc,
    init: function(activeNav){
      window.TrackHype?.init({activeNav});
    }
  };

  window.initShell = function(activeNav){
    window.TrackHype?.init({activeNav});
  };

  window.nav = function(href){
    navigate(href);
  };

  window.esc = function(value){
    return esc(value);
  };

  window.togglePlay = function(){
    const state = getState();
    updateState(s => { s.isPlaying = !s.isPlaying; });
    renderPlayer();
    if(!state.isPlaying){
      return;
    }
  };

  window.playAll = function(){
    toast("Play all is ready from your Playlist.");
  };

  window.closePlaylist = function(){
    const overlay = document.getElementById("playlistOverlay");
    if(overlay){
      overlay.style.display = "none";
    }
  };

  window.openPlaylist = function(){
    const overlay = document.getElementById("playlistOverlay");
    if(overlay){
      overlay.style.display = "flex";
    }
  };

  window.setPlayer = function(title, artist, artwork){
    const list = currentPlaylist();
    let src = "";
    let index = -1;
    if(list.length){
      const wantTitle = String(title || "").toLowerCase();
      const wantArtist = String(artist || "").toLowerCase();
      for(let i = 0; i < list.length; i++){
        const t = list[i];
        if(
          (wantTitle && String(t.title || "").toLowerCase() === wantTitle) ||
          (wantArtist && String(t.artist || "").toLowerCase() === wantArtist)
        ){
          src = t.src;
          index = i;
          break;
        }
      }
    }
    updateState(s => {
      s.currentTrack = {
        title,
        artist,
        artwork,
        src
      };
      s.isPlaying = true;
      s.progress = 0;
    });
    if(src){
      demoIndex = index;
      const el = getAudioElement();
      el.src = src;
      el.load();
    }
    savePlaybackSnapshot({ index: demoIndex, src: src, title: title, artist: artist, artwork: artwork });
    renderPlayer();
    syncPlayerToggleIcon();
  };

  window.fav = function(category, id){
    const KEY = "trackhype:" + String(category);
    const arr = readFavs(KEY);
    const index = arr.indexOf(id);
    if(index >= 0){
      arr.splice(index, 1);
    }else{
      arr.push(id);
    }
    try{
      localStorage.setItem(KEY, JSON.stringify(arr));
    }catch(error){}
    return arr.includes(id);
  };

  /* =========================================================
     Voting Engine
     Vote flow (override): tap a song's vote → open the vote
     modal → enter target position (1..max) → song moves there,
     incumbent shifts down one. Points are 20→1 by final
     position. One vote per chart per 24h.
     The FULL pipeline is: user order → vote record →
     aggregation → published chart. A single vote must never
     mutate the published chart directly.
     ========================================================= */

  function todayKey(){
    return new Date().toISOString().slice(0,10);
  }

  function chartId(name){
    return String(name || "").toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"") || "chart";
  }

  /* Local chartId -> DB charts.key mapping for the published-chart bridge.
     Keys mirror supabase/migrations/20260914_0003_seed_charts.sql. */
  function dbChartKeyFor(local){
    const s = String(local || "").toLowerCase();
    const map = {
      "national-top-100": "national-100",
      "zim-hip-hop-top-20": "hiphop-20",
      "zimdancehall-top-20": "dancehall-20",
      "gospel-top-20": "gospel-20",
      "sungura-top-20": "sungura-20",
      "zimbabwean-house-top-20": "house-20",
      "r-b-top-20": "rnb-20"
    };
    if(map[s]){ return map[s]; }
    const byName = {
      "national top 100": "national-100",
      "zim hip hop top 20": "hiphop-20",
      "zimdancehall top 20": "dancehall-20",
      "gospel top 20": "gospel-20",
      "sungura top 20": "sungura-20",
      "zimbabwean house top 20": "house-20",
      "r&b top 20": "rnb-20"
    };
    return byName[s] || (map[chartId(s)] || "");
  }

  function defaultChartOrder(max = 20){
    const base = {
      "national-top-100": "top_40_chart",
      "zim-hip-hop": "top_25_local_hip_hop",
      "zimbabwean-house": "top_20_house",
      "house": "top_20_house",
      "r-b": "top_20_rnb_chart",
      "rnb": "top_20_rnb_chart"
    };
    return base[chartId(max)] || "";
  }

  function buildChartDataset(chartName){
    const dir = defaultChartOrder(chartName);
    const max = maxForChart(chartName);
    const items = [];
    for(let i = 1; i <= max; i++){
      items.push({
        id: "entry-" + chartId(chartName) + "-" + i,
        rank: i,
        title: "Track " + i,
        artist: chartName,
        plays: 0,
        artwork: dir ? "Assets/charts/" + dir + "/" + (i % 20 || 20) + (Math.random() < 0.12 ? ".webp" : ".jpg") : ""
      });
    }
    return items;
  }

  function maxForChart(chartName){
    const key = chartId(chartName);
    if(key.charAt(0) === "n") return 100;
    return 20;
  }

  function pointsForPosition(pos){
    if(!pos || pos < 1 || pos > 20){
      return 1;
    }
    return 21 - pos;
  }

  function positionFromPoints(points){
    const p = Math.max(1, Math.min(20, Math.round(points)));
    return 21 - p;
  }

  function hasVotedToday(chartName, chartKey){
    const state = getState();
    const key = chartKey || chartId(chartName);
    const records = (state.votes || []).filter(v => v.chart === key && v.date === todayKey());
    window.TrackHype._lastHasVoted = records;
    return records;
  }

  function isSingleVote(chartName){
    const state = getState();
    const records = hasVotedToday(chartName);
    return records.length > 0 ? records[0] : null;
  }

  function recordVote(chartName, song, targetPos){
    var voteGate = canVote();
    if(!voteGate.ok){
      toast(voteGate.reason);
      return null;
    }
    const key = chartId(chartName);
    const vote = {
      id: "vote-" + Date.now(),
      chart: key,
      date: todayKey(),
      songId: song.id,
      songTitle: song.title,
      fromRank: song.rank,
      targetPos,
      points: pointsForPosition(targetPos)
    };
    updateState(s => {
      s.votes = (s.votes || []).filter(v => !(v.chart === key && v.date === todayKey()));
      s.votes.push(vote);
    });
    return vote;
  }

  function confirmVoteSheet(chartName, song, max){
    var vote = canVote();
    if(!vote.ok){
      toast(vote.reason);
      return;
    }
    const key = chartId(chartName);
    const chartMax = maxForChart(chartName);
    const limit = (max && max > 0) ? max : chartMax;

    const existing = isSingleVote(chartName);
    if(existing){
      const msg = existing.songTitle
        ? ("You already voted for " + existing.songTitle + " at position " + existing.targetPos + " on this chart today.")
        : "You have already voted on this chart today.";
      TrackHypeAlert({ title: "Already voted", text: msg });
      return;
    }

    openSheet({
      title: "Vote · " + chartName,
      text: "Rank \"" + (song && song.title ? song.title : "this song") + "\" by entering a target position (1–" + limit + "). The song moves there and the incumbent shifts down one.",
      actions: [
        { id: "cancel-vote-" + key, label: "Cancel" }
      ]
    });

    const body = document.querySelector("[data-modal-body]");
    const actions = document.querySelector("[data-modal-actions]");
    if(!body || !actions){
      return;
    }

    body.innerHTML = `
      <form id="vote-form" style="margin-top:6px">
        <label class="ob-label" style="font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:.5px;color:var(--th-muted)">Target position</label>
        <input class="th-input" id="vote-pos" type="number" min="1" max="${max}" inputmode="numeric" placeholder="Position 1–${max}" required>
        <p style="margin-top:8px;color:var(--th-muted);font-size:12px;line-height:1.5">Points by position: #1 → 20 … → #20 → 1. One vote per chart per day.</p>
      </form>
    `;

    actions.innerHTML = `
      <button class="th-btn secondary" type="button" data-modal-action="cancel-vote-${key}">Cancel</button>
      <button class="th-btn primary" type="button" data-vote-confirm>Confirm</button>
    `;

    const confirmBtn = actions.querySelector("[data-vote-confirm]");
    confirmBtn.onclick = () => {
      const input = document.getElementById("vote-pos");
      const val = parseInt((input && input.value) || "", 10);
      if(!val || val < 1 || val > max){
        if(input){ input.focus(); }
        toast("Enter a position between 1 and " + max + ".");
        return;
      }
      const rec = recordVote(chartName, song, val);
      if(!rec){
        closeSheet();
        return;
      }
      window.TrackHype._lastVote = rec;
      document.dispatchEvent(new CustomEvent("trackhype:chart-update", {
        detail: {
          chart: chartName,
          songId: song.id,
          targetPos: val,
          points: pointsForPosition(val),
          vote: rec
        }
      }));
      toast("Vote ranked #" + val + " (" + pointsForPosition(val) + " pts). Public chart updates after aggregation.");
    };

    const cancelBtn = actions.querySelector('[data-modal-action="cancel-vote-' + key + '"]');
    if(cancelBtn){
      cancelBtn.onclick = () => { closeSheet(); };
    }
  }

  function moveSong(order, songId, targetPos){
    const source = Array.isArray(order) ? order.slice() : [];
    const pos = Math.max(1, Math.min(source.length, Math.round(Number(targetPos) || 1)));
    const idx = source.findIndex(x => x.id === songId);
    if(idx < 0){
      return source;
    }
    const [song] = source.splice(idx, 1);
    const insertAt = Math.max(0, Math.min(pos - 1, source.length));
    source.splice(insertAt, 0, song);
    return source.map((x, i) => Object.assign({}, x, { rank: i + 1, points: pointsForPosition(i + 1) }));
  }

  function publishChart(){
    window.TrackHype._lastPublishedChart = true;
    toast("Chart published for " + todayKey() + ".");
    return window.TrackHype._lastVoteResult || [];
  }

  function aggregateVotes(chartName){
    return window.TrackHype._lastVoteResult || buildChartDataset(chartName);
  }

  function TrackHypeAlert({ title, text }){
    openSheet({
      title: title || "TrackHype",
      text: text || "",
      actions: [] // no-actions sheet; backdrop tap closes via the modal handler
    });
    const actions = document.querySelector("[data-modal-actions]");
    if(actions){
      actions.innerHTML = '<button class="th-btn primary" type="button" data-modal-action="dismiss">OK</button>';
    }
  }

  /* =========================================================
     Weekly Ballot Engine (3-Tier)
     Weekly competition: Tier 1 = last week's top, Tier 2 =
     one-week contenders, Tier 3 = approved Newest discoveries.
     One unified ballot lists On Top + Contenders + Newest under
     tier headings. Users rank their personal TOP 10 — points are
     a FIXED 10-point scale (#1 = 10 … #10 = 1, unranked = 0),
     not the number of songs they happened to pick.
     Voting runs Monday 00:00 → Sunday 23:59 Africa/Harare; the
     week boundary is Monday 00:00 Africa/Harare. A ballot never
     mutates the published chart — the chart comes only from
     aggregation over stored ballots at the weekly close.
     ========================================================= */

  const MAX_RANKED_PICKS = 10;
  const DEFAULT_TIMEZONE = "Africa/Harare";

  const CHART_SIZES = {
    "national-top-100": 100,
    "zim-hip-hop": 20,
    "zimdancehall": 20,
    "zimbabwean-house": 20,
    "r-b": 20,
    "gospel": 20,
    "sungura": 20
  };

  function chartSizeFor(chartKey){
    const n = Number(CHART_SIZES[String(chartKey || "").toLowerCase()] || 0);
    return n >= 10 ? n : 20;
  }

  function defaultChartConfig(chartKey){
    return {
      size: chartSizeFor(chartKey),
      contenderSlots: 10,
      newestWindowWeeks: 4,
      closeWeekday: 0,
      closeTime: "23:59",
      timezone: DEFAULT_TIMEZONE,
      maxRankedPicks: MAX_RANKED_PICKS
    };
  }

  function chartConfigFor(chartKey){
    return defaultChartConfig(chartKey);
  }

  function getMaxRankedPicks(){
    return MAX_RANKED_PICKS;
  }

  function zonedParts(date, timeZone){
    const fmt = new Intl.DateTimeFormat("en-CA", {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23"
    });
    const parts = {};
    fmt.formatToParts(date).forEach(p => {
      if(p.type !== "literal" && p.value){ parts[p.type] = p.value; }
    });
    return {
      year: Number(parts.year),
      month: Number(parts.month),
      day: Number(parts.day),
      hour: Number(parts.hour) || 0,
      minute: Number(parts.minute) || 0
    };
  }

  function wallClockToUtcMs(year, month, day, hour, minute, timeZone){
    let guess = Date.UTC(year, month - 1, day, hour, minute);
    for(let i = 0; i < 3; i++){
      const p = zonedParts(new Date(guess), timeZone);
      if(p.year === year && p.month === month && p.day === day && p.hour === hour && p.minute === minute){
        break;
      }
      const delta = (p.year - year) * 31557600000 +
        (p.month - month) * 2592000000 +
        (p.day - day) * 86400000 +
        (p.hour - hour) * 3600000 +
        (p.minute - minute) * 60000;
      guess -= delta;
    }
    return guess;
  }

  /* Inverse of mondayOfWeek: encodes the UTC-Monday instant back into the
     same ISO-style "YYYY-Www" key that mondayOfWeek()/shiftWeekKey() use,
     so the two never disagree across a Jan reset. The Thursday of the week
     selects the year (ISO convention). */
  function isoWeekKeyForMonday(mondayUtcMs){
    const d = new Date(mondayUtcMs);
    const thursday = new Date(d.getTime() + 3 * 86400000);
    const year = thursday.getUTCFullYear();
    const jan4 = new Date(Date.UTC(year, 0, 4));
    const janDay = jan4.getUTCDay() || 7;
    const week1Monday = jan4.getTime() - (janDay - 1) * 86400000;
    const weekNo = Math.floor((d.getTime() - week1Monday) / (7 * 86400000)) + 1;
    return year + "-W" + String(weekNo).padStart(2, "0");
  }

  function currentWeekKey(timeZone){
    const tz = timeZone || DEFAULT_TIMEZONE;
    const p = zonedParts(new Date(), tz);
    const dow = new Date(Date.UTC(p.year, p.month - 1, p.day)).getUTCDay() || 7;
    const daysSinceMonday = dow - 1;
    /* The Monday of the zoned week, kept in the same "UTC midnight date"
       space mondayOfWeek() round-trips through, so
       mondayOfWeek(currentWeekKey(tz)) reproduces the same Monday. */
    const mondayAsUtcDate = Date.UTC(p.year, p.month - 1, p.day - daysSinceMonday);
    return isoWeekKeyForMonday(mondayAsUtcDate);
  }

  function weeksBetween(aKey, bKey){
    const a = mondayOfWeek(aKey);
    const b = mondayOfWeek(bKey);
    return Math.max(0, Math.round(Math.abs(a.getTime() - b.getTime()) / (7 * 86400000)));
  }

  function closeMsForWeek(weekKey, timeZone){
    const tz = timeZone || DEFAULT_TIMEZONE;
    const monday = mondayOfWeek(weekKey);
    /* Monday of the FOLLOWING week as a zoned wall-clock date, then forced
       to 00:00 in that zone — i.e. the very start of the next chart week.
       (Close = Monday 00:00 Africa/Harare.) */
    const nextMondayUtc = new Date(monday.getTime() + 7 * 86400000);
    const p = zonedParts(nextMondayUtc, tz);
    return wallClockToUtcMs(p.year, p.month, p.day, 0, 0, tz);
  }

  function mondayOfWeek(weekKey){
    const m = String(weekKey || "").match(/^(\d{4})-W(\d{1,2})$/);
    if(!m){ return new Date(); }
    const year = Number(m[1]);
    const week = Number(m[2]);
    const jan4 = new Date(Date.UTC(year, 0, 4));
    const day = jan4.getUTCDay() || 7;
    const week1Monday = jan4.getTime() - (day - 1) * 86400000;
    return new Date(week1Monday + (week - 1) * 7 * 86400000);
  }

  function shiftWeekKey(weekKey, delta){
    const base = mondayOfWeek(weekKey);
    const m = new Date(base.getTime() + (delta || 0) * 7 * 86400000);
    const year = m.getUTCFullYear();
    const jan4 = new Date(Date.UTC(year, 0, 4));
    const day = jan4.getUTCDay() || 7;
    const week1Monday = jan4.getTime() - (day - 1) * 86400000;
    const week = Math.floor((m.getTime() - week1Monday) / (7 * 86400000)) + 1;
    return year + "-W" + String(week).padStart(2, "0");
  }

  function weekKeyToDateRange(weekKey){
    const start = mondayOfWeek(weekKey);
    const end = new Date(start.getTime() + 6 * 86400000);
    const ms = start.toLocaleString("en-US", { month: "short", timeZone: "UTC" });
    const ds = start.getUTCDate();
    const me = end.toLocaleString("en-US", { month: "short", timeZone: "UTC" });
    const de = end.getUTCDate();
    return ms === me
      ? ms + " " + ds + "–" + de
      : ms + " " + ds + " – " + me + " " + de;
  }

  function getNextResetTime(config){
    const cfg = config || {};
    const tz = cfg.timezone || DEFAULT_TIMEZONE;
    const now = new Date();
    const p = zonedParts(now, tz);
    const dow = new Date(Date.UTC(p.year, p.month - 1, p.day)).getUTCDay() || 7;
    let ms = wallClockToUtcMs(p.year, p.month, p.day - (dow - 1) + 7, 0, 0, tz);
    if(ms <= now.getTime()){ ms += 7 * 86400000; }
    return ms;
  }

  function weekCountdownText(ms){
    if(!ms || ms <= 0){ return ""; }
    const d = Math.floor(ms / 86400000);
    const h = Math.floor((ms % 86400000) / 3600000);
    const m = Math.floor((ms % 3600000) / 60000);
    if(d > 0){ return d + "d " + h + "h " + m + "m"; }
    if(h > 0){ return h + "h " + m + "m"; }
    return Math.max(1, Math.round(ms / 60000)) + "m";
  }

  function subTierKey(chartKey, weekKey, tier){
    return chartKey + "::" + (weekKey || currentWeekKey()) + "::t" + tier;
  }

  function ballotStoreKey(chartKey, weekKey){
    return chartKey + "::" + (weekKey || currentWeekKey());
  }

  function getWeekSubmissions(chartKey, weekKey){
    const store = getState().weekly.submissions;
    return {
      1: store[subTierKey(chartKey, weekKey, 1)] || [],
      2: store[subTierKey(chartKey, weekKey, 2)] || [],
      3: store[subTierKey(chartKey, weekKey, 3)] || []
    };
  }

  function getSubmissionsForTier(chartKey, weekKey, tier){
    return getWeekSubmissions(chartKey, weekKey)[tier] || [];
  }

  function saveSubmissionsForTier(chartKey, weekKey, tier, arr){
    updateState(s => {
      s.weekly.submissions[subTierKey(chartKey, weekKey, tier)] = arr || [];
    });
  }

  function seedCuratedCatalog(chartKey, items){
    const weekKey = currentWeekKey();
    const existing = getSubmissionsForTier(chartKey, weekKey, 1);
    if(existing.length){ return existing; }
    const seeded = (items || []).map((item, i) => ({
      id: "seed-" + chartKey + "-" + (i + 1),
      chartKey,
      weekKey,
      tier: 1,
      songId: item.id,
      title: item.title,
      artistName: item.artist,
      featured: item.featured,
      artwork: item.artwork || "",
      submittedAt: 0,
      status: "active",
      upvotes: 0,
      isSeed: true,
      seedRank: i + 1,
      approvedForChartAt: (i + 1) * 1000,
      newestEnteredWeekKey: weekKey
    }));
    saveSubmissionsForTier(chartKey, weekKey, 1, seeded);
    return seeded;
  }

  function seedCatalogTiers(chartKey, groups){
    const weekKey = currentWeekKey();
    const seeded = {};
    [1, 2, 3].forEach(tier => {
      const items = (groups && groups[tier]) || [];
      const arr = items.map((item, i) => ({
        id: "seed-" + chartKey + "-t" + tier + "-" + (i + 1),
        chartKey,
        weekKey,
        tier,
        songId: item.id != null ? item.id : item.title,
        title: item.title,
        artistName: item.artist,
        featured: item.featured,
        artwork: item.artwork || "",
        submittedAt: 0,
        status: "active",
        upvotes: tier === 3 ? (Number(item.upvotes) || 0) : 0,
        isSeed: true,
        seedRank: tier === 1 ? (i + 1) : null,
        approvedForChartAt: (tier * 1000 + (i + 1)) * 1000,
        newestEnteredWeekKey: weekKey
      }));
      saveSubmissionsForTier(chartKey, weekKey, tier, arr);
      seeded[tier] = arr;
    });
    return seeded;
  }

  function clearChartWeekly(chartKey){
    updateState(s => {
      const w = s.weekly;
      Object.keys(w.submissions).forEach(k => {
        if(k.indexOf(chartKey + "::") === 0){ delete w.submissions[k]; }
      });
      Object.keys(w.snapshots).forEach(k => {
        if((w.snapshots[k] || {}).chartKey === chartKey){ delete w.snapshots[k]; }
      });
      Object.keys(w.ballots).forEach(k => {
        if(k.indexOf(chartKey + "::") === 0){ delete w.ballots[k]; }
      });
    });
  }

  function seedWeeklySnapshots(chartKey, weeks){
    const paths = (weeks || []).filter(w => w && w.entries && w.entries.length).slice(-13);
    if(!paths.length){ return paths; }
    updateState(s => {
      paths.forEach(w => {
        const wk = String(w.weekKey);
        const rankings = (w.entries || []).map(r => ({
          submissionId: String(r.submissionId),
          title: r.title,
          artistName: r.artistName,
          artwork: r.artwork || "",
          isSeed: true,
          totalPoints: Number(r.votes) || 0,
          voteCount: Number(r.votes) || 0,
          rank: Number(r.rank) || 0,
          pickRate: Number(w.pickRate) || 0,
          movement: r.movement == null ? null : Number(r.movement)
        }));
        s.weekly.snapshots[chartKey + "::" + wk] = {
          id: "snapshot-" + chartKey + "-" + wk,
          chartKey,
          weekKey: wk,
          publishedAt: Date.now(),
          rankings
        };
      });
    });
    return paths;
  }

  function submitSongToChart(chartKey, meta){
    const weekKey = currentWeekKey();
    const sub = {
      id: "sub-" + Date.now(),
      chartKey,
      weekKey,
      tier: 3,
      songId: meta.songId || meta.title,
      title: meta.title,
      artistName: meta.artistName || "Your Artist Profile",
      artwork: meta.artwork || "",
      releaseDate: meta.releaseDate || null,
      submittedAt: Date.now(),
      status: "active",
      upvotes: 0,
      isSeed: false,
      approvedForChartAt: Date.now(),
      newestEnteredWeekKey: weekKey
    };
    const arr = getSubmissionsForTier(chartKey, weekKey, 3);
    arr.push(sub);
    saveSubmissionsForTier(chartKey, weekKey, 3, arr);
    document.dispatchEvent(new CustomEvent("trackhype:song-submitted", {
      detail: { chartKey, weekKey, submission: sub }
    }));
    return sub;
  }

  function getMainPool(chartKey){
    const wk = currentWeekKey();
    return getSubmissionsForTier(chartKey, wk, 1).concat(getSubmissionsForTier(chartKey, wk, 2));
  }

  function ballotLengthFor(chartKey){
    const pool = getMainPool(chartKey);
    return pool.length;
  }

  function pointsForRank(rank){
    const r = Math.max(1, Math.min(MAX_RANKED_PICKS, Math.round(Number(rank) || 1)));
    return MAX_RANKED_PICKS + 1 - r;
  }

  function getWeekBallots(chartKey, weekKey){
    const store = getState().weekly.ballots;
    return store[ballotStoreKey(chartKey, weekKey)] || [];
  }

  function getBallot(chartKey, weekKey){
    return getWeekBallots(chartKey, weekKey)[0] || null;
  }

  function hasBallotThisWeek(chartKey){
    return getWeekBallots(chartKey, currentWeekKey()).length > 0;
  }

  function hasDiscoveryThisWeek(chartKey){
    const store = getState().weekly.ballots;
    const key = chartKey + "::" + currentWeekKey() + "::discovery";
    return (store[key] || []).length > 0;
  }

  /* Published-chart bridge (Phase 5): when a region has real DB
     chart_entries (populated by admin/migration), pull them into the
     local weekly store as a non-seed snapshot so every public page
     (charts, history, index) lights up automatically in region mode. */
  function loadPublishedChart(chartKey, weekKey, dbKey){
    if(!window.API || typeof window.API.chartEntries !== "function"){
      return Promise.resolve({ ok:false, reason:"api-unavailable" });
    }
    var key = chartKey;
    if(typeof dbChartKeyFor === "function" && !dbKey){
      dbKey = dbChartKeyFor(chartKey);
    }
    if(!dbKey){ return Promise.resolve({ ok:false, reason:"no-db-key" }); }
    var wk = weekKey || currentWeekKey();
    return window.API.chartEntries(dbKey, wk).then(function(res){
      var rows = (res && res.data) || [];
      if(!rows.length){ return { ok:false, reason:"empty", weekKey:wk }; }
      var snapshot = getSnapshotFor(key, wk);
      if(snapshot && (snapshot.rankings || []).some(function(r){ return !r.isSeed; })){
        return { ok:true, count:rows.length, weekKey:wk, already:true };
      }
      var entries = rows.map(function(e, i){
        var song = e.song || {};
        var artist = "";
        if(song.song_artists && song.song_artists.length){
          artist = song.song_artists.map(function(sa){ return (sa.artist && sa.artist.name) || ""; }).filter(Boolean).join(" ft ");
        }
        if(!artist && song.artist_name){ artist = song.artist_name; }
        return {
          submissionId: e.id || ("db-" + key + "-" + (e.rank || i + 1)),
          songId: e.song_id || (song.id || null),
          title: song.title || "Untitled",
          artistName: artist || "Unknown Artist",
          artwork: song.artwork || "",
          rank: Number(e.rank) || i + 1,
          points: Number(e.points) || 0,
          tier: e.tier || "on_top",
          isSeed: false,
          weekKey: wk,
          published: true,
          fromDb: true
        };
      });
      var topEntries = entries.filter(function(e){ return e.tier === "on_top"; });
      var contenderEntries = entries.filter(function(e){ return e.tier === "contenders"; });
      var newestEntries = entries.filter(function(e){ return e.tier === "newest"; });
      var snapshotEntries = topEntries.length ? topEntries : entries;
      updateState(function(s){
        var store = s.weekly.snapshots;
        store[key + "::" + wk] = {
          id: "snapshot-" + key + "-" + wk,
          chartKey: key,
          weekKey: wk,
          publishedAt: Date.now(),
          rankings: snapshotEntries.map(function(e, i){
            return {
              submissionId: e.submissionId,
              songId: e.songId,
              title: e.title,
              artistName: e.artistName,
              artwork: e.artwork,
              rank: e.rank || i + 1,
              points: e.points,
              movement: 0,
              isSeed: false,
              published: true,
              fromDb: true
            };
          })
        };
      });
      var subStore = getState().weekly.submissions;
      var tierKey3 = subTierKey(key, wk, 3);
      var tierKey2 = subTierKey(key, wk, 2);
      if(!(subStore[tierKey3] || []).some(function(x){ return !x.isSeed; })){
        updateState(function(s){
          s.weekly.submissions[tierKey3] = newestEntries.map(function(e){
            return { id: e.submissionId, songId: e.songId, title: e.title, artistName: e.artistName,
              artwork: e.artwork, tier: 3, isSeed: false, weekKey: wk, published: true, fromDb: true };
          });
        });
      }
      if(!(subStore[tierKey2] || []).some(function(x){ return !x.isSeed; })){
        updateState(function(s){
          s.weekly.submissions[tierKey2] = contenderEntries.map(function(e){
            return { id: e.submissionId, songId: e.songId, title: e.title, artistName: e.artistName,
              artwork: e.artwork, tier: 2, isSeed: false, weekKey: wk, published: true, fromDb: true };
          });
        });
      }
      try{
        document.dispatchEvent(new CustomEvent("trackhype:chart-update", { detail: { chartKey: key, weekKey: wk, source: "db" } }));
      }catch(e){}
      return { ok:true, count:rows.length, weekKey:wk };
    }).catch(function(){
      return { ok:false, reason:"error" };
    });
  }

  function submitBallot(chartKey, picks){
    var voteGate = canVote();
    if(!voteGate.ok){
      return { ok: false, error: voteGate.reason };
    }
    const weekKey = currentWeekKey();
    const config = chartConfigFor(chartKey);
    const closed = Date.now() >= closeMsForWeek(weekKey, config.timezone);
    if(closed){
      return { ok: false, error: "Voting closed for this week — the chart has been finalised." };
    }
    const pool = getMainPool(chartKey).concat(getSubmissionsForTier(chartKey, weekKey, 3));
    if(!pool.length){
      return { ok: false, error: "No songs are competing on this chart yet." };
    }
    const clean = (picks || [])
      .map(p => ({ submissionId: String(p.submissionId), rank: Math.round(Number(p.rank)) }))
      .filter(p => p.submissionId && p.rank >= 1);
    if(!clean.length){
      return { ok: false, error: "Rank at least one song on your ballot." };
    }
    const allowed = clean.slice(0, MAX_RANKED_PICKS);
    const ids = allowed.map(p => p.submissionId);
    if(new Set(ids).size !== ids.length){
      return { ok: false, error: "Each song can appear once on your ballot." };
    }
    const poolIds = new Set(pool.map(p => p.id));
    if(!allowed.every(p => poolIds.has(p.submissionId))){
      return { ok: false, error: "Your ballot contains songs that aren't on this chart." };
    }
    const byId = {};
    pool.forEach(p => { byId[p.id] = p; });
    const existing = getBallot(chartKey, weekKey);
    const ballot = {
      id: existing ? existing.id : "ballot-" + Date.now(),
      chartKey,
      weekKey,
      submittedAt: Date.now(),
      picks: allowed.map(p => ({
        submissionId: p.submissionId,
        title: byId[p.submissionId].title,
        artistName: byId[p.submissionId].artistName,
        rank: p.rank,
        points: pointsForRank(p.rank)
      }))
    };
    updateState(s => {
      s.weekly.ballots[ballotStoreKey(chartKey, weekKey)] = [ballot];
    });
    document.dispatchEvent(new CustomEvent("trackhype:ballot-submitted", {
      detail: { chartKey, weekKey, ballot, replaced: !!existing }
    }));
    return { ok: true, ballot, replaced: !!existing };
  }

  function submitDiscoveryBallot(chartKey, upvoteIds){
    const weekKey = currentWeekKey();
    if(hasDiscoveryThisWeek(chartKey)){
      return { ok: false, error: "You already voted to advance this week." };
    }
    const ids = [...new Set((upvoteIds || []).map(String))];
    if(!ids.length){
      return { ok: false, error: "Upvote at least one new drop." };
    }
    const cap = 5;
    if(ids.length > cap){
      return { ok: false, error: "You can upvote up to " + cap + " songs." };
    }
    const votes = {
      id: "discovery-" + Date.now(),
      chartKey,
      weekKey,
      submittedAt: Date.now(),
      upvotes: ids
    };
    updateState(s => {
      const store = s.weekly.ballots;
      store[chartKey + "::" + weekKey + "::discovery"] = [votes];
      ids.forEach(id => {
        const sub = (s.weekly.submissions[subTierKey(chartKey, weekKey, 3)] || []).find(x => x.id === id);
        if(sub){ sub.upvotes = (sub.upvotes || 0) + 1; }
      });
    });
    document.dispatchEvent(new CustomEvent("trackhype:discovery-vote-submitted", {
      detail: { chartKey, weekKey, votes }
    }));
    return { ok: true, votes };
  }

  function aggregatePool(chartKey, weekKey, tiers){
    const wk = weekKey || currentWeekKey();
    const pool = (tiers || [1, 2]).reduce((acc, t) => acc.concat(getSubmissionsForTier(chartKey, wk, t)), []);
    const ballots = getWeekBallots(chartKey, wk);
    const prev = getMovementMap(chartKey, wk);
    const scores = {};
    pool.forEach(sub => {
      scores[sub.id] = {
        submissionId: sub.id,
        title: sub.title,
        artistName: sub.artistName,
        artwork: sub.artwork,
        isSeed: !!sub.isSeed,
        approvedForChartAt: sub.approvedForChartAt != null ? Number(sub.approvedForChartAt) : null,
        newestEnteredWeekKey: sub.newestEnteredWeekKey || sub.weekKey,
        totalPoints: 0,
        voteCount: 0
      };
    });
    let ballotsUsed = 0;
    (ballots || []).forEach(b => {
      ballotsUsed++;
      (b.picks || []).forEach(p => {
        const s = scores[p.submissionId];
        if(s){
          s.totalPoints += Number(p.points) || 0;
          s.voteCount++;
        }
      });
    });
    const tieBreak = (a, b) => {
      if(b.totalPoints !== a.totalPoints){ return b.totalPoints - a.totalPoints; }
      if(b.voteCount !== a.voteCount){ return b.voteCount - a.voteCount; }
      const pa = a.submissionId == null ? null : prev[a.submissionId];
      const pb = b.submissionId == null ? null : prev[b.submissionId];
      if((pa == null) !== (pb == null)){ return pa == null ? 1 : -1; }
      if(pa != null && pa !== pb){ return pa - pb; }
      const aa = a.approvedForChartAt == null ? Number.MAX_SAFE_INTEGER : a.approvedForChartAt;
      const ab = b.approvedForChartAt == null ? Number.MAX_SAFE_INTEGER : b.approvedForChartAt;
      if(aa !== ab){ return aa - ab; }
      const la = String(a.submissionId || "");
      const lb = String(b.submissionId || "");
      return la < lb ? -1 : (la > lb ? 1 : 0);
    };
    return Object.keys(scores)
      .map(k => scores[k])
      .sort(tieBreak)
      .map((item, idx) => ({
        ...item,
        rank: idx + 1,
        pickRate: ballotsUsed ? Math.round((item.voteCount / ballotsUsed) * 1000) / 10 : 0
      }));
  }

  function aggregateMainChart(chartKey, weekKey){
    return aggregatePool(chartKey, weekKey, [1, 2]);
  }

  function aggregateNewest(chartKey, weekKey){
    return aggregatePool(chartKey, weekKey, [3]);
  }

  function prevSnapshot(chartKey, weekKey){
    const wk = weekKey || currentWeekKey();
    const store = getState().weekly.snapshots;
    let prev = null;
    Object.keys(store).forEach(k => {
      const snap = store[k];
      if(snap.chartKey === chartKey && snap.weekKey < wk){
        if(!prev || snap.weekKey > prev.weekKey){ prev = snap; }
      }
    });
    return prev;
  }

  /* Returns { submissionId: previousRank } from the newest snapshot
     older than weekKey. Only ranks — the meaning of movement is
     decided by computeMovement(), not here. */
  function getMovementMap(chartKey, weekKey){
    const prev = prevSnapshot(chartKey, weekKey);
    const map = {};
    if(prev){
      (prev.rankings || []).forEach(r => { map[r.submissionId] = r.rank; });
    }
    return map;
  }

  /* -----------------------------------------------------------
     Shared movement semantics — the ONLY definition.
     positive N   → climbed N places      (prevRank - currentRank)
     negative N   → dropped N places
     0            → steady (same rank as previous snapshot)
     "new"        → first time on chart (not a seed)
     null         → no comparable prior placement (seed w/o history)
     ----------------------------------------------------------- */
  function computeMovement(currentRank, prevRank, isSeed){
    const cur = Number(currentRank);
    if(prevRank != null){
      return Number(prevRank) - cur;
    }
    if(!isSeed){
      return "new";
    }
    return null;
  }

  function getMovementFor(chartKey, weekKey, submissionId, currentRank, isSeed){
    const map = getMovementMap(chartKey, weekKey);
    const prev = map[submissionId];
    return computeMovement(currentRank, prev == null ? null : prev, isSeed);
  }

  function getSnapshots(chartKey){
    const store = getState().weekly.snapshots;
    return Object.keys(store)
      .filter(k => store[k].chartKey === chartKey)
      .map(k => store[k])
      .sort((a, b) => (a.weekKey < b.weekKey ? 1 : -1));
  }

  function getSnapshotFor(chartKey, weekKey){
    return getState().weekly.snapshots[chartKey + "::" + weekKey] || null;
  }

  function publishWeeklySnapshotFor(chartKey, weekKey){
    const existing = getSnapshotFor(chartKey, weekKey);
    if(existing){ return existing; }
    const config = chartConfigFor(chartKey);
    const rankings = aggregateMainChart(chartKey, weekKey);
    const prevMap = getMovementMap(chartKey, weekKey);
    const snapshot = {
      id: "snapshot-" + chartKey + "-" + weekKey,
      chartKey,
      weekKey,
      publishedAt: Date.now(),
      rankings: rankings.slice(0, config.size).map(r => {
        const movement = computeMovement(
          r.rank,
          prevMap[r.submissionId] == null ? null : prevMap[r.submissionId],
          r.isSeed
        );
        return { ...r, movement };
      })
    };
    updateState(s => {
      const store = s.weekly.snapshots;
      store[chartKey + "::" + weekKey] = snapshot;
      const keys = Object.keys(store).filter(k => store[k].chartKey === chartKey).sort();
      while(keys.length > 13){
        const oldest = keys.shift();
        if(store[oldest] && store[oldest].weekKey !== weekKey){
          delete store[oldest];
        }
      }
    });
    document.dispatchEvent(new CustomEvent("trackhype:weekly-reset", {
      detail: { chartKey, weekKey, snapshot }
    }));
    return snapshot;
  }

  function publishWeeklySnapshot(chartKey){
    return publishWeeklySnapshotFor(chartKey, currentWeekKey());
  }

  /* One full weekly cycle for a chart:
       1. aggregate On Top + Contenders ballots  → next On Top = top `size`
       2. Contenders (10 slots) = reserved split:
            half: highest-scoring songs that fell out of On Top
            half: highest-scoring eligible Newest songs
            if either group has <half, remaining slots go to the other group
       3. Contenders get ONE chance — any contender not reaching On Top exits.
       4. Newest promotes by ranking points only; non-kind, non-promoted
          songs retire after a one-month presence — four chart cycles
          (can stay on New Music).
       5. publish an immutable snapshot for the week. */
  function finalizeChartCycle(chartKey, weekKey, config){
    const cfg = config || chartConfigFor(chartKey);
    const size = Math.max(1, Number(cfg.size) || 20);
    const slots = Math.max(1, Number(cfg.contenderSlots) || 10);
    const windowWeeks = Math.max(1, Number(cfg.newestWindowWeeks) || 2);
    const wkNext = shiftWeekKey(weekKey, 1);

    const rankedPool = aggregatePool(chartKey, weekKey, [1, 2]);
    const rankedNewest = aggregatePool(chartKey, weekKey, [3]);
    const t1 = getSubmissionsForTier(chartKey, weekKey, 1);
    const t2 = getSubmissionsForTier(chartKey, weekKey, 2);
    const t3 = getSubmissionsForTier(chartKey, weekKey, 3);

    const poolById = {};
    t1.concat(t2).concat(t3).forEach(s => { poolById[s.id] = s; });

    const nextTopIds = new Set(rankedPool.slice(0, size).map(r => r.submissionId));

    /* Group A — songs that fell out of On Top, best-points first. */
    const groupA = rankedPool
      .filter(r => !nextTopIds.has(r.submissionId) && t1.some(s => s.id === r.submissionId));

    /* Group B — eligible Newest songs ranked only against other Newest. */
    const eligibleNewestIds = new Set();
    t3.forEach(s => {
      if(s.isSeed){ eligibleNewestIds.add(s.id); return; }
      const entered = s.newestEnteredWeekKey || s.weekKey;
      if(weeksBetween(entered, weekKey) < windowWeeks){ eligibleNewestIds.add(s.id); }
    });
    const groupB = rankedNewest.filter(r => eligibleNewestIds.has(r.submissionId));

    const half = Math.floor(slots / 2);
    const contenders = [];
    const used = new Set();
    const takeFrom = (arr, cap) => {
      let n = 0;
      for(const s of arr){
        if(n >= cap){ break; }
        if(used.has(s.submissionId)){ continue; }
        contenders.push(s);
        used.add(s.submissionId);
        n++;
      }
    };
    takeFrom(groupA, half);
    takeFrom(groupB, half);
    const rest = groupA.concat(groupB).filter(s => !used.has(s.submissionId));
    takeFrom(rest, slots - contenders.length);

    const nextT1 = rankedPool.slice(0, size)
      .map(r => {
        const sub = poolById[r.submissionId];
        return sub ? Object.assign({}, sub, { tier: 1, weekKey: wkNext, seedRank: r.rank }) : null;
      })
      .filter(Boolean);

    const nextT2 = contenders
      .map(r => {
        const sub = poolById[r.submissionId];
        return sub ? Object.assign({}, sub, { tier: 2, weekKey: wkNext, seedRank: null }) : null;
      })
      .filter(Boolean);

    /* Newest: promoted → Contenders; first-cycle non-promoted keep a
       second cycle; second-cycle non-promoted retire unless seeds. */
    const promotedIds = new Set(nextT2.map(s => s.id));
    const nextT3 = t3
      .filter(s => {
        if(promotedIds.has(s.id)){ return false; }
        if(s.isSeed){ return true; }
        const entered = s.newestEnteredWeekKey || s.weekKey;
        return weeksBetween(entered, weekKey) < windowWeeks - 1;
      })
      .map(s => Object.assign({}, s, { weekKey: wkNext }));

    saveSubmissionsForTier(chartKey, wkNext, 1, nextT1);
    saveSubmissionsForTier(chartKey, wkNext, 2, nextT2);
    saveSubmissionsForTier(chartKey, wkNext, 3, nextT3);

    const snapshot = publishWeeklySnapshotFor(chartKey, weekKey);
    document.dispatchEvent(new CustomEvent("trackhype:weekly-reset-done", {
      detail: { chartKey, weekKey, snapshot }
    }));
    return snapshot;
  }

  function executeWeeklyReset(chartKey){
    return finalizeChartCycle(chartKey, currentWeekKey());
  }

  /* Prototype auto-reset: on page load, finalise any recent week whose
     close (Monday 00:00 Africa/Harare) has passed but has no immutable
     snapshot yet. The same finalizeChartCycle() runs from a scheduled
     backend job in production — the browser is a viewer, never the
     authority that finalises a chart. */
  function maybeRunAutoReset(chartKey){
    const config = chartConfigFor(chartKey);
    const tz = config.timezone;
    let wk = currentWeekKey(tz);
    for(let i = 0; i < 3; i++){
      const candidate = shiftWeekKey(wk, -i);
      const closed = Date.now() >= closeMsForWeek(candidate, tz);
      const finalised = !!getSnapshotFor(chartKey, candidate);
      const hasBallots = getWeekBallots(chartKey, candidate).length > 0;
      if(closed && hasBallots && !finalised){
        const flag = "trackhype.autoReset." + chartKey + "." + candidate;
        try{
          if(localStorage.getItem(flag)){ return null; }
        }catch(e){ /* ignore */ }
        const snapshot = finalizeChartCycle(chartKey, candidate, config);
        try{ localStorage.setItem(flag, "1"); }catch(e){ /* ignore */ }
        return snapshot;
      }
    }
    return null;
  }

  /* =========================================================
     Home Charts (curated genre sections on the home screen)
     ==========================================================*/

  const HOME_CHARTS_KEY = "trackhype.homeCharts.v1";

  const HOME_GENRES = [
    "Sungura","Zimdancehall","Soul","Afro-Fusion","Amapiano","Urban Grooves","Dancehall",
    "Chimurenga","Mbira","Jiti","Mhande","Mbende","Muchongoyo","Mbakumba",
    "Shangare","Amabhiza","Tuku Music","Afro-Jazz","Zimbabwean Jazz",
    "Imbube","Kanindo","Zimbabwean Rumba","Afro-Pop","Zim Hip Hop",
    "Zimbabwean House","Zim EDM","Zim-TrapSoul","R&B","Gospel","Reggae","House"
  ];

  function defaultHomeCharts(){
    return {
      order: HOME_GENRES.slice(),
      enabled: HOME_GENRES.reduce((m, g) => { m[g] = true; return m; }, {})
    };
  }

  function getHomeCharts(){
    const def = defaultHomeCharts();
    try{
      const raw = JSON.parse(localStorage.getItem(HOME_CHARTS_KEY) || "null");
      if(raw && Array.isArray(raw.order)){
        const order = raw.order.filter(g => HOME_GENRES.indexOf(g) !== -1);
        HOME_GENRES.forEach(g => { if(order.indexOf(g) === -1){ order.push(g); } });
        const enabled = {};
        HOME_GENRES.forEach(g => {
          enabled[g] = (raw.enabled && typeof raw.enabled[g] === "boolean")
            ? raw.enabled[g]
            : true;
        });
        return { order, enabled };
      }
    }catch(error){ /* ignore */ }
    return def;
  }

  function setHomeCharts(prefs){
    const cur = getHomeCharts();
    const order = (prefs && Array.isArray(prefs.order)) ? prefs.order.slice() : cur.order;
    const enabled = Object.assign({}, cur.enabled, (prefs && prefs.enabled) || {});
    try{
      localStorage.setItem(HOME_CHARTS_KEY, JSON.stringify({ order, enabled }));
    }catch(error){ /* ignore */ }
    return { order, enabled };
  }

  /* =========================================================
Web Router — gapless in-app navigation (SPA)
      Target pages are fetched rather than loaded through a full
      page navigation:
      HTTP(S): fetched via fetch()/DOMParser (resolves on the HTML
      bytes, before images/audio arrive).
      file:// (dev fallback): read through a hidden same-origin
      iframe finishing at DOMContentLoaded/interactive, not onload.
      Either way the target's <main> + header + page styles + inline
      scripts are swapped into THIS document, so the shell — and the
      <audio> element, where the music actually lives — is never
      destroyed and playback continues across page changes. A full
      navigation happens ONLY when both loaders fail, and playback
      then resumes from the saved snapshot.
      ========================================================= */

  var PRE_SHELL_PAGES =
    (function(){
      var map = {};
      ["landing.html", "region-selector.html"].forEach(function(name){ map[name] = 1; });
      return map;
    })();

  var router = {
    loading: false,
    reqId: 0,
    pagePath: "",
    scrollKey: "trackhype.scrollmap",
    timerPages: []
  };

  function isInternalAppUrl(url){
    try{
      var u = new URL(url, document.baseURI);
      if(u.protocol !== "http:" && u.protocol !== "https:" && u.protocol !== "file:"){
        return false;
      }
      if((u.origin || "null") !== (location.origin || "null")){
        return false;
      }
      var name = u.pathname.split("/").pop() || "";
      if(!/\.html$/i.test(name)){
        return false;
      }
      if(PRE_SHELL_PAGES[name]){
        return false;
      }
      return true;
    }catch(error){
      return false;
    }
  }

  /* Fingerprints the SPA "path" (pathname + querystring) of a URL. */
  function routerPath(url){
    var u = new URL(url, document.baseURI);
    return u.pathname + u.search;
  }

  /* Main navigation entry point used by every funnel below and by
     rewritten onclick="location.href=…" handlers. */
  function navigate(url){
    if(FRAGMENT_MODE){
      window.location = url;
      return;
    }
    if(router.loading){
      return;
    }
    if(!isInternalAppUrl(url)){
      savePlaybackSnapshot();
      window.location = url;
      return;
    }
    var parsed;
    var path;
    try{
      parsed = new URL(url, document.baseURI);
      path = routerPath(url);
    }catch(error){
      savePlaybackSnapshot();
      window.location = url;
      return;
    }
    if(path === router.pagePath){
      try{
        if(parsed.hash && swipeState.mode === MODE_PLAYER){
          settlePanels(true, 1);
        }
        var el = parsed.hash ? document.querySelector(parsed.hash) : null;
        if(el){
          el.scrollIntoView({ behavior: "auto", block: "start" });
        }else{
          window.scrollTo(0, 0);
        }
      }catch(error){}
      return;
    }
    /* Capture the playback position at the moment of navigation so a
       full-load fallback can resume from here (not up to a second stale). */
    savePlaybackSnapshot();
    try{
      loadPage(path, false, parsed.hash);
    }catch(error){
      router.loading = false;
      console.error("[TrackHype] SPA navigation failed, doing a full navigation:", error);
      window.location = new URL(path, location.href).href;
    }
  }

  /* =========================================================
     SPA loader — async, race-safe.
     HTTP/HTTPS: read the page via fetch() (resolves on the HTML
       bytes, before images/audio arrive) through DOMParser.
     file:// (dev fallback): hidden same-origin iframe finishing at
       DOMContentLoaded / interactive — NOT onload, which would wait
       for every slow image/media download and force the old 3s
       timeout → full reload, destroying the <audio> element.
     Only when both fail (document inaccessible, target unreadable)
     do we fall back to a full navigation; savePlaybackSnapshot()
     keeps the position recoverable afterwards.
     A monotonically increasing router.reqId guarantees a stale
     fetch/iframe result can never swap over a newer navigation or
     Back press. window.__thRouter records the last attempt for
     on-device triage.
     ========================================================= */

  /* Last SPA load attempt, for device triage:
     { target, source:"fetch"|"iframe"|"full-nav", ms, fallbackReason }. */
  function recordRouter(entry){
    try{
      window.__thRouter = entry;
    }catch(error){}
  }

  function routerIsCurrent(reqId){
    return router.reqId === reqId;
  }

  function toFullUrl(path){
    try{ return new URL(path, location.href).href; }
    catch(error){ return path; }
  }

  function loadPage(path, replace, hash){
    router.loading = true;
    saveCurrentScroll();

    var reqId = ++router.reqId;
    var startedAt = Date.now();
    var targetUrl = toFullUrl(path);

    if((location.protocol === "http:" || location.protocol === "https:") &&
       typeof fetch === "function"){
      loadByFetch(path, replace, hash, reqId, startedAt, targetUrl);
    }else{
      loadByIframe(path, replace, hash, reqId, startedAt, targetUrl);
    }
  }

  function loadByFetch(path, replace, hash, reqId, startedAt, targetUrl){
    var controller =
      (typeof AbortController !== "undefined") ? new AbortController() : null;
    var finished = false;
    var timer = setTimeout(function(){
      /* Aborting fires the catch() below; on "fetch-timeout" it falls
         through to the iframe loader rather than reloading the page. */
      if(controller){
        try{ controller.abort(); }catch(error){}
      }
    }, 8000);

    var opts = controller ? { signal: controller.signal } : {};
    opts.cache = "no-store";
    fetch(targetUrl, opts)
      .then(function(response){
        if(!response.ok){
          throw new Error("fetch-http-error " + response.status);
        }
        return response.text();
      })
      .then(function(html){
        if(finished){ return; }
        finished = true;
        clearTimeout(timer);
        if(!routerIsCurrent(reqId)){
          recordRouter({ target: targetUrl, source: "fetch",
            ms: Date.now() - startedAt, fallbackReason: "stale-request" });
          return;
        }
        var doc = null;
        try{ doc = new DOMParser().parseFromString(html, "text/html"); }
        catch(error){ doc = null; }
        if(!doc || !doc.documentElement){
          recordRouter({ target: targetUrl, source: "fetch",
            ms: Date.now() - startedAt, fallbackReason: "parse-error" });
          loadByIframe(path, replace, hash, reqId, startedAt, targetUrl);
          return;
        }
        recordRouter({ target: targetUrl, source: "fetch",
          ms: Date.now() - startedAt, fallbackReason: null });
        applyPage(html, path, replace, hash);
      })
      .catch(function(error){
        if(finished){ return; }
        finished = true;
        clearTimeout(timer);
        if(!routerIsCurrent(reqId)){
          recordRouter({ target: targetUrl, source: "fetch",
            ms: Date.now() - startedAt, fallbackReason: "stale-request" });
          return;
        }
        var reason = (error && error.name === "AbortError") ? "fetch-timeout"
          : String((error && error.message) || error || "fetch-error");
        recordRouter({ target: targetUrl, source: "fetch",
          ms: Date.now() - startedAt, fallbackReason: reason });
        console.warn("[TrackHype] SPA fetch failed (" + reason + "), using iframe loader");
        loadByIframe(path, replace, hash, reqId, startedAt, targetUrl);
      });
  }

  function loadByIframe(path, replace, hash, reqId, startedAt, targetUrl){
    var iframe = document.createElement("iframe");
    iframe.setAttribute("aria-hidden", "true");
    iframe.setAttribute("tabindex", "-1");
    iframe.style.cssText =
      "position:absolute;left:-99999px;top:0;width:40px;height:40px;" +
      "border:0;visibility:hidden;pointer-events:none";

    var done = false;
    var pollTimer = null;
    var domReadyHook = null;
    /* file iframes finish parse almost immediately (tiny local files); a
       shorter ceiling gives a snappy full-nav fallback when file access is
       blocked. HTTP keeps a generous ceiling for network latency. */
    var ceiling = location.protocol === "file:" ? 3000 : 8000;
    var timeout = setTimeout(function(){
      finish(null, "iframe-timeout");
    }, ceiling);

    /* The iframe is ready when its document is accessible, points at the
       requested page, and parsing has passed "loading" (i.e. it reached
       DOMContentLoaded territory). This does NOT wait for slow images,
       artwork or audio downloads the way iframe.onload would. */
    function sameTarget(doc){
      try{
        var u = new URL(doc.location.href, document.baseURI);
        var t = new URL(targetUrl, document.baseURI);
        /* Compare decoded pathnames: the iframe document reports its file
           URL percent-encoded, while location.href here is decoded. */
        var up;
        var tp;
        try{ up = decodeURIComponent(u.pathname); }catch(e){ up = u.pathname; }
        try{ tp = decodeURIComponent(t.pathname); }catch(e){ tp = t.pathname; }
        return up === tp && u.search === t.search;
      }catch(error){
        return false;
      }
    }

    function poll(){
      if(done){ return; }
      var frameDoc = null;
      try{ frameDoc = iframe.contentDocument; }catch(error){ frameDoc = null; }
      if(!frameDoc || !frameDoc.documentElement){
        pollTimer = setTimeout(poll, 120);
        return;
      }
      if(!sameTarget(frameDoc)){
        pollTimer = setTimeout(poll, 120);
        return;
      }
      if(frameDoc.readyState === "loading"){
        if(!domReadyHook){
          /* DOMContentLoaded may fire while a file iframe is still
             transiently unreadable from the parent; the hook just re-polls
             so the poll loop itself reads the document moments later. */
          domReadyHook = function(){ poll(); };
          frameDoc.addEventListener("DOMContentLoaded", domReadyHook);
        }
        pollTimer = setTimeout(poll, 200);
        return;
      }
      var html = null;
      try{
        if(frameDoc.documentElement){
          html = frameDoc.documentElement.outerHTML;
        }
      }catch(error){ html = null; }
      if(!html){
        /* Transient unreadable state — keep polling; the ceiling is the
           hard stop. Never conclude a failure on a momentary hiccup. */
        pollTimer = setTimeout(poll, 120);
        return;
      }
      finish(iframe, null, html);
    }

    function finish(frame, reason, readyHtml){
      if(done){ return; }
      done = true;
      clearTimeout(timeout);
      if(pollTimer){ clearTimeout(pollTimer); pollTimer = null; }
      domReadyHook = null;
      try{
        if(frame && frame.parentNode){ iframe.parentNode.removeChild(iframe); }
      }catch(error){}

      if(!routerIsCurrent(reqId)){
        recordRouter({ target: targetUrl, source: "iframe",
          ms: Date.now() - startedAt, fallbackReason: "stale-request" });
        return;
      }

      if(typeof readyHtml === "string" && readyHtml){
        recordRouter({ target: targetUrl, source: "iframe",
          ms: Date.now() - startedAt, fallbackReason: null });
        applyPage(readyHtml, path, replace, hash);
        return;
      }

      /* Only reached on a hard failure: the ceiling elapsed without a
         readable document (e.g. file:// iframe access is blocked). */
      if(reason === "iframe-timeout" && frame){
        reason = "doc === null";
      }
      recordRouter({ target: targetUrl, source: "iframe",
        ms: Date.now() - startedAt, fallbackReason: reason });
      console.warn("[TrackHype] SPA iframe load failed (" + reason +
        "), doing a full navigation");
      router.loading = false;
      savePlaybackSnapshot();
      window.location = targetUrl;
    }

    var src;
    try{
      src = targetUrl.split("#")[0] + "#__fragment";
    }catch(error){
      finish(null, "invalid-target");
      return;
    }
    iframe.src = src;
    document.body.appendChild(iframe);
    poll();
  }

  function applyPage(html, path, replace, hash){
    router.loading = false;
    router.pagePath = path;

    var fullUrl;
    try{
      fullUrl = new URL(path, location.href).href;
    }catch(error){
      fullUrl = path;
    }

    if(!html){
      window.location = fullUrl;
      return;
    }

    flushPageTimers();
    clearTimeout(resumeFallbackTimer);

    var doc;
    try{
      doc = new DOMParser().parseFromString(html, "text/html");
    }catch(error){
      window.location = fullUrl;
      return;
    }

    if(doc.title){
      document.title = doc.title;
    }

    var activeNav = "";
    if(doc.body && doc.body.dataset.activeNav){
      activeNav = doc.body.dataset.activeNav;
    }
    if(document.body){
      document.body.setAttribute("data-active-nav", activeNav);
    }

    /* --- page styles (per-page <style> blocks) ------------------- */
    var styleText = [];
    var styles = doc.querySelectorAll("style");
    for(var i = 0; i < styles.length; i++){
      styleText.push(styles[i].textContent || "");
    }
    ensurePageStyleElement().textContent = styleText.join("\n");

    /* --- <main> swap --------------------------------------------- */
    var liveMain = document.querySelector("main");
    var freshMain = doc.querySelector("main");
    if(freshMain && liveMain){
      var mainHtml = rewriteNavAttrs(buildMainHtml(freshMain));
      var holder = document.createElement("div");
      holder.innerHTML = mainHtml;
      var parsedMain = holder.firstElementChild;
      if(parsedMain){
        liveMain.parentNode.replaceChild(parsedMain, liveMain);
      }
    }

    /* --- header swap --------------------------------------------- */
    var liveHeader = document.querySelector("[data-app-header]");
    var freshHeader = doc.querySelector("[data-app-header]");
    if(liveHeader && freshHeader){
      liveHeader.innerHTML = freshHeader.innerHTML;
    }

    /* Update the location bar BEFORE running the target page's inline
       scripts: pages read location.search / location.hash at script time
       (e.g. ?station=, ?artist=, ?id=, ?chart=). Creating the history entry
       first means those lookups see the destination URL, not the previous one. */
    try{
      if(replace){
        history.replaceState({ thPath: path }, "", path);
      }else{
        history.pushState({ thPath: path }, "", path);
      }
    }catch(error){ /* file:// may reject history updates — stay in-page */ }

    /* --- load missing external <script src> dependencies ---------- */
    try{
      var liveLoaded = {};
      var liveScripts = document.scripts || document.getElementsByTagName("script");
      for(var si = 0; si < liveScripts.length; si++){
        var liveSrc = liveScripts[si].getAttribute && liveScripts[si].getAttribute("src");
        if(liveSrc){
          try{ liveLoaded[new URL(liveSrc, location.href).href] = true; }catch(ex){}
        }
      }
      var extDeps = doc.querySelectorAll("script[src]");
      for(var di = 0; di < extDeps.length; di++){
        var extSrc = extDeps[di].getAttribute("src");
        if(!extSrc){ continue; }
        var resolved;
        try{ resolved = new URL(extSrc, fullUrl).href; }catch(ex){ continue; }
        if(liveLoaded[resolved]){ continue; }
        try{
          var xhr = new XMLHttpRequest();
          xhr.open("GET", resolved, false);
          xhr.send(null);
          if(xhr.status >= 200 && xhr.status < 300){
            var sc = document.createElement("script");
            sc.textContent = xhr.responseText;
            (document.head || document.documentElement).appendChild(sc);
            if(sc.parentNode) sc.parentNode.removeChild(sc);
            liveLoaded[resolved] = true;
          }
        }catch(ex){}
      }
    }catch(error){}

    /* --- run the target page's inline scripts -------------------- */
    var blocks = doc.querySelectorAll("script:not([src])");
    withTrackedTimers(function(){
      for(var j = 0; j < blocks.length; j++){
        runPageScript(blocks[j].textContent || "");
      }
    });

    /* --- refresh shell state after the swap ---------------------- */
    try{
      renderBottomNavigation(activeNav);
      swipeState.mode = (getState().bottomMode === MODE_PLAYER)
        ? MODE_PLAYER
        : MODE_NAV;
      seat();
      syncBottomPanels();
    }catch(error){
      console.error("[TrackHype] shell refresh failed after SPA swap:", error);
    }

    var saved = savedScrollFor(path);
    if(hash){
      var el = document.querySelector(hash);
      if(el){
        el.scrollIntoView({ behavior: "auto", block: "start" });
      }else{
        window.scrollTo(0, saved >= 0 ? saved : 0);
      }
    }else{
      window.scrollTo(0, saved >= 0 ? saved : 0);
    }
  }

  function buildMainHtml(main){
    var out = "<main";
    var attrs = main.attributes;
    for(var i = 0; i < attrs.length; i++){
      var attr = attrs[i];
      out += " " + attr.name + '="' + esc(attr.value) + '"';
    }
    out += ">" + main.innerHTML + "</main>";
    return out;
  }

  /* Converts baked-in onclick="location.href='x'" (and window.location
     variants, plus "song.html?" + expr() concat forms) to
     TrackHype.navigate(...) so the SPA routes them. RHS must be a quoted
     string literal (optionally + concat tail) — the dominant pattern. */
  function rewriteNavAttrs(text){
    return String(text).replace(
      /([\s\"'`(){}\[\]:;,>=])((?:window\.)?location\.href)\s*=\s*((?:"[^"]*"|'[^']*'|`[^`]*`)(?:\s*\+\s*[^;\n]+)?)/g,
      function(whole, prefix, name, rhs){
        return prefix + "TrackHype.navigate(" + rhs + ")";
      }
    );
  }

  /* Runs a page's inline script in the shell document. const/let become var,
     and the whole script runs inside a local scope box so a page that shares
     top-level names with the boot page's own global consts (or with a previous
     visit) never triggers "already declared". The page's own top-level names
     are copied onto window afterwards so inline onclick/oninput handlers and
     later sister script blocks can still reach them. */
  /* Collects top-level function/class/var names declared directly in an inline
     page script (depth-0 only), so runPageScript can export them to window. */
  function pageTopLevelNames(code){
    var names = [];
    var seen = {};
    function add(n){
      if(!seen[n]){ seen[n] = 1; names.push(n); }
    }
    var i = 0;
    var len = code.length;
    var depth = 0;
    function skipQuoted(idx, q){
      idx++;
      while(idx < len){
        if(code[idx] === "\\"){ idx += 2; continue; }
        if(code[idx] === q){ return idx + 1; }
        idx++;
      }
      return len;
    }
    function isWord(c){ return /[A-Za-z0-9_$]/.test(c); }
    function collectVar(rest){
      var k = 0;
      var n = rest.length;
      var d = 0;
      var rhs = false;
      while(k < n){
        var c = rest[k];
        if(c === '"' || c === "'" || c === "`"){
          var q = c; k++;
          while(k < n && rest[k] !== q){ if(rest[k] === "\\"){ k++; } k++; }
          k++;
          continue;
        }
        if(c === "{"){ d++; k++; continue; }
        if(c === "["){ d++; k++; continue; }
        if(c === "("){ d++; k++; continue; }
        if(c === "}" || c === "]" || c === ")"){ d = Math.max(0, d - 1); k++; continue; }
        if(d === 0){
          if(c === "="){ rhs = true; k++; continue; }
          if(c === ";"){ return; }
          if(c === ","){ rhs = false; k++; continue; }
          if(!rhs && /[A-Za-z_$]/.test(c)){
            var m = /^([A-Za-z_$][\w$]*)/.exec(rest.slice(k));
            if(m){ add(m[1]); k += m[1].length; continue; }
          }
        }
        k++;
      }
    }
    while(i < len){
      var c = code[i];
      if(c === '"' || c === "'" || c === "`"){ i = skipQuoted(i, c); continue; }
      if(c === "/" && code[i + 1] === "/"){ while(i < len && code[i] !== "\n"){ i++; } continue; }
      if(c === "/" && code[i + 1] === "*"){
        i += 2;
        while(i < len && !(code[i] === "*" && code[i + 1] === "/")){ i++; }
        i = Math.min(len, i + 2);
        continue;
      }
      if(c === "(" || c === "[" || c === "{"){ depth++; i++; continue; }
      if(c === ")" || c === "]" || c === "}"){ depth = Math.max(0, depth - 1); i++; continue; }
      if(depth > 0){ i++; continue; }
      if(isWord(c)){
        var head = /^(function|class|var)\b/.exec(code.slice(i));
        if(head){
          var after = i + head[1].length;
          if(head[1] === "var"){
            collectVar(code.slice(after));
          }else{
            var idm = /^[\s*]*([A-Za-z_$][\w$]*)/.exec(code.slice(after));
            if(idm){ add(idm[1]); }
          }
          i = after;
          continue;
        }
        while(i < len && isWord(code[i])){ i++; }
        continue;
      }
      i++;
    }
    return names;
  }
  function runPageScript(code){
    if(!code){ return; }
    try{
      code = rewriteNavAttrs(code)
        .replace(/^[ \t]*"use strict";?/m, "")
        .replace(/\bconst\s+/g, "var ")
        .replace(/\blet\s+/g, "var ");
      var exportedNames = pageTopLevelNames(code).map(function(n){
        return "box[" + JSON.stringify(n) + "]=" + n + ";";
      }).join("\n");
      code += "\n" + exportedNames;
      var box = {};
      /* new Function bodies are sloppy by default, so the with-scoped eval
         can keep the page's own top-level declarations local to the box and
         never collide with the boot page's globals. */
      var run = new Function(
        "box", "code",
        "with(box){ eval(code); }"
      );
      run(box, code);
      for(var key in box){
        if(!(key in window) || (key in box && !(key in TrackHype))){
          window[key] = box[key];
        }
      }
    }catch(error){
      console.error("[TrackHype] page script failed:", error);
    }
  }

  function ensurePageStyleElement(){
    var el = document.getElementById("th_pagestyles");
    if(el){ return el; }
    el = document.createElement("style");
    el.id = "th_pagestyles";
    el.setAttribute("data-th-pagestyles", "1");
    (document.head || document.documentElement).appendChild(el);
    return el;
  }

  /* Timer isolation: timers (and animation frame handles) created by a
     page's scripts are flushed when the user navigates away, so nothing
     from a previous page can fire against the swapped-in DOM. */
  function withTrackedTimers(fn){
    var page = { ints: {}, tos: {}, raf: {} };
    var savedSetInterval    = window.setInterval;
    var savedSetTimeout     = window.setTimeout;
    var savedClearInterval  = window.clearInterval;
    var savedClearTimeout   = window.clearTimeout;
    var savedRAF            = window.requestAnimationFrame;
    var savedCancelRAF      = window.cancelAnimationFrame;
    window.setInterval = function(f, t){
      var id = savedSetInterval(f, t);
      page.ints[id] = true;
      return id;
    };
    window.setTimeout = function(f, t){
      var id = savedSetTimeout(f, t);
      page.tos[id] = true;
      return id;
    };
    window.clearInterval = function(id){
      delete page.ints[id];
      savedClearInterval(id);
    };
    window.clearTimeout = function(id){
      delete page.tos[id];
      savedClearTimeout(id);
    };
    window.requestAnimationFrame = function(f){
      var id = savedRAF(f);
      page.raf[id] = true;
      return id;
    };
    window.cancelAnimationFrame = function(id){
      delete page.raf[id];
      savedCancelRAF(id);
    };
    try{
      fn();
    }finally{
      window.setInterval          = savedSetInterval;
      window.setTimeout           = savedSetTimeout;
      window.clearInterval        = savedClearInterval;
      window.clearTimeout         = savedClearTimeout;
      window.requestAnimationFrame = savedRAF;
      window.cancelAnimationFrame  = savedCancelRAF;
    }
    router.timerPages.push(page);
  }

  function flushPageTimers(){
    for(var i = 0; i < router.timerPages.length; i++){
      var page = router.timerPages[i];
      for(var k in page.ints){ try{ clearInterval(parseInt(k, 10)); }catch(e){} }
      for(var j in page.tos){  try{ clearTimeout(parseInt(j, 10));  }catch(e){} }
      for(var r in page.raf){  try{ cancelAnimationFrame(parseInt(r, 10)); }catch(e){} }
    }
    router.timerPages.length = 0;
  }

  function savedScrollFor(path){
    try{
      var map = JSON.parse(sessionStorage.getItem(router.scrollKey) || "{}");
      var value = map[path];
      return (typeof value === "number" && value >= 0) ? value : -1;
    }catch(error){
      return -1;
    }
  }

  function saveCurrentScroll(){
    try{
      var map = JSON.parse(sessionStorage.getItem(router.scrollKey) || "{}");
      map[router.pagePath] = (window.pageYOffset || 0);
      sessionStorage.setItem(router.scrollKey, JSON.stringify(map));
    }catch(error){}
  }

  /* Capture-phase click routing for <a href> links (header, nav, content). */
  function bindGlobalNavigation(){
    document.addEventListener("click", function(event){
      var target = event.target;
      var link = (target && target.closest) ? target.closest("a[href]") : null;
      if(!link){ return; }
      if(swipeState.clickGuard){
        swipeState.clickGuard = false;
        clearTimeout(swipeState.guardTimer);
        event.preventDefault();
        return;
      }
      if(event.defaultPrevented){ return; }
      if(event.metaKey || event.ctrlKey || event.shiftKey || event.altKey){ return; }
      if(event.button && event.button !== 0){ return; }
      if(link.target && link.target !== "_self" && link.target !== ""){ return; }
      if(link.hasAttribute("download")){ return; }
      var href = link.getAttribute("href") || "";
      if(/^(#|mailto:|tel:|javascript:|data:|about:)/i.test(href.replace(/^\s+/, ""))){
        return;
      }
      if(!isInternalAppUrl(href)){ return; }
      event.preventDefault();

      /* Dock links (bottom nav, promo art/meta) route through the SPA loader
         like interior links, so the shell — and the <audio> element — is
         never destroyed and playback continues seamlessly. A genuine SPA
         failure falls back to a full page load inside navigate(). */
      console.log("[TrackHype] clicking link: " + href);
      navigate(new URL(href, document.baseURI).href);
    }, true);
  }

  window.addEventListener("popstate", function(){
    var path = location.pathname + location.search;
    if(path === router.pagePath){
      return;
    }
    if(!isInternalAppUrl(path)){
      return;
    }
    loadPage(path, true, location.hash || "");
  });

  /* =========================================================
     Bottom Footer Boot
     The bottom nav + player are painted by JS into empty host
     containers. Paint them FIRST and isolate every wiring step so
     a single failure can never blank the footer again.
     ========================================================= */

  let shellBooted = false;

  function bootShell(activeNav){

    if(FRAGMENT_MODE){
      return;
    }

    const active =
      activeNav ||
      (document.body && document.body.dataset.activeNav) ||
      "";

    const paint = (name, fn) => {
      try{
        fn();
      }catch(err){
        console.error("[TrackHype] " + name + " failed:", err);
      }
    };

    paint("renderBottomNavigation", () => renderBottomNavigation(active));
    paint("renderPlayer", renderPlayer);

    if(shellBooted){
      return;
    }
    shellBooted = true;

    paint("syncBottomPanels", syncBottomPanels);
    paint("initialiseHeaderScroll", initialiseHeaderScroll);
    paint("initialiseGlobalPlayer", initialiseGlobalPlayer);
    paint("initialiseModal", initialiseModal);
    paint("attemptAutoResume", attemptAutoResume);
    paint("bindGlobalNavigation", bindGlobalNavigation);

    if(document.body){
      document.body.dataset.trackhypeBoot = "ok";
    }
    console.log("[TrackHype] shell booted");
  }

  /* =========================================================
     Auth Gate — TrackHype.requireProfile()
     Every interactive feature that needs a real signed-in
     profile guards itself with requireProfile(featureName).
     It returns a profile row (or a { local: true } fallback
     when the API is offline) or null — callers bail on null.
     Sign-in happens in place via the shared bottom sheet, so
     the audio player and any page state (e.g. a ballot draft)
     are never disturbed.
     ========================================================= */

  function promptAuth(label){
    return new Promise(function(resolve){
      var backdrop = document.querySelector("[data-modal]");
      if(!backdrop){
        resolve(null);
        return;
      }

      openSheet({
        title: "Sign in to " + label,
        actions: []
      });

      var done = false;
      var lastEmail = "";

      function cleanup(){
        if(backdrop){ backdrop.removeEventListener("click", onBackdrop, true); }
        if(document.querySelector("[data-modal-body]")){
          document.querySelector("[data-modal-body]").classList.remove("ballot-body");
        }
      }

      function finish(profile){
        if(done){ return; }
        done = true;
        cleanup();
        closeSheet();
        resolve(profile);
      }

      function onBackdrop(e){
        if(e.target === backdrop){ finish(null); }
      }

      function renderSignInView(){
        var body = backdrop.querySelector("[data-modal-body]");
        var actions = backdrop.querySelector("[data-modal-actions]");
        if(!body || !actions){ finish(null); return; }
        var titleEl = backdrop.querySelector("[data-modal-title]");
        if(titleEl){ titleEl.textContent = "Sign in to " + label; }
        body.classList.add("ballot-body");
        body.innerHTML = `
          <p style="margin:0 0 10px;color:var(--th-muted);font-size:12px;line-height:1.5">Sign in with your TrackHype account to ${esc(label)}. Your ballot draft stays saved for when you return.</p>
          <label style="display:block;font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:.5px;color:var(--th-muted);margin-bottom:6px">Email address</label>
          <input class="th-input" id="reqauth-email" type="email" inputmode="email" autocomplete="email" placeholder="Email address">
          <div style="height:10px"></div>
          <label style="display:block;font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:.5px;color:var(--th-muted);margin-bottom:6px">Password</label>
          <input class="th-input" id="reqauth-password" type="password" autocomplete="current-password" placeholder="Password">
          <div style="display:flex;justify-content:flex-end">
            <button type="button" data-reqauth-forgot style="background:transparent;border:0;padding:8px 0 2px;margin-left:auto;color:var(--th-primary-dark);font-size:12px;font-weight:800;cursor:pointer">Forgot password?</button>
          </div>
          <p id="reqauth-error" style="display:none;color:#b91c1c;font-size:12px;line-height:1.4;margin:8px 0 0"></p>
        `;

        actions.innerHTML = `
          <button class="th-btn secondary" type="button" data-reqauth-menu>Open menu</button>
          <button class="th-btn secondary" type="button" data-reqauth-cancel>Cancel</button>
          <button class="th-btn primary" type="button" data-reqauth-go style="flex:1">Log in</button>
        `;

        var emailInput = body.querySelector("#reqauth-email");
        var pwInput = body.querySelector("#reqauth-password");
        var errorEl = body.querySelector("#reqauth-error");
        var busy = false;

        function showError(msg){
          errorEl.textContent = msg;
          errorEl.style.display = "block";
        }

        function setBusy(b){
          busy = b;
          var go = actions.querySelector("[data-reqauth-go]");
          if(go){
            go.disabled = b;
            go.textContent = b ? "Signing in…" : "Log in";
          }
        }

        function submit(){
          if(busy){ return; }
          var email = (emailInput.value || "").trim();
          var pw = pwInput.value || "";
          if(!email || !pw){
            showError("Enter your email and password.");
            return;
          }
          if(!window.API || typeof window.API.signIn !== "function"){
            showError("Sign-in isn't available right now — reconnect and try again.");
            return;
          }
          setBusy(true);
          window.API.signIn(email, pw)
            .then(async function(res){
              if(res && res.error){
                setBusy(false);
                var msg = res.error.message || "Sign in failed.";
                if(/invalid login credentials/i.test(msg)){
                  msg = "Incorrect email or password.";
                }
                showError(msg);
                return;
              }
              var profile = null;
              try{
                var pr = await window.API.getProfile();
                if(pr && pr.data && !pr.error){ profile = pr.data; }
              }catch(err){ profile = null; }
              try{
                var name = "";
                if(profile){
                  name = ((profile.first_name || "") + " " + (profile.surname || "")).trim();
                  if(!name){ name = (profile.username || "").trim(); }
                }
                if(!name){ name = email; }
                localStorage.setItem("trackhype_user_name", name);
                localStorage.setItem("trackhype_onboarding_complete", "true");
                if(profile && profile.kyc_status === "approved"){
                  localStorage.setItem("trackhype_vote_eligible", "true");
                }else{
                  localStorage.removeItem("trackhype_vote_eligible");
                }
              }catch(err){}
              finish(profile || { local: true });
            })
            .catch(function(err){
              setBusy(false);
              showError((err && err.message) || "Sign in failed.");
            });
        }

        emailInput.addEventListener("keydown", function(e){
          if(e.key === "Enter"){ pwInput.focus(); }
        });
        pwInput.addEventListener("keydown", function(e){
          if(e.key === "Enter"){ submit(); }
        });
        actions.querySelector("[data-reqauth-go]").addEventListener("click", submit);
        actions.querySelector("[data-reqauth-cancel]").addEventListener("click", function(){ finish(null); });
        actions.querySelector("[data-reqauth-menu]").addEventListener("click", function(){
          finish(null);
          window.location.href = "menu.html";
        });
        body.querySelector("[data-reqauth-forgot]").addEventListener("click", function(){
          lastEmail = (emailInput.value || "").trim();
          renderResetView();
        });
      }

      function renderResetView(){
        var body = backdrop.querySelector("[data-modal-body]");
        var actions = backdrop.querySelector("[data-modal-actions]");
        if(!body || !actions){ finish(null); return; }
        var titleEl = backdrop.querySelector("[data-modal-title]");
        if(titleEl){ titleEl.textContent = "Reset your password"; }
        body.classList.add("ballot-body");
        body.innerHTML = `
          <p style="margin:0 0 10px;color:var(--th-muted);font-size:12px;line-height:1.5">Enter your account email and we'll send you a link to reset your password.</p>
          <label style="display:block;font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:.5px;color:var(--th-muted);margin-bottom:6px">Email address</label>
          <input class="th-input" id="reqauth-reset-email" type="email" inputmode="email" autocomplete="email" placeholder="Email address" value="${esc(lastEmail)}">
          <p id="reqauth-reset-error" style="display:none;color:#b91c1c;font-size:12px;line-height:1.4;margin:8px 0 0"></p>
        `;

        actions.innerHTML = `
          <button class="th-btn secondary" type="button" data-reqauth-reset-back>Back</button>
          <button class="th-btn primary" type="button" data-reqauth-reset-go style="flex:1">Send reset link</button>
        `;

        var em = body.querySelector("#reqauth-reset-email");
        var err = body.querySelector("#reqauth-reset-error");
        var busy = false;

        function showError(msg){
          err.textContent = msg;
          err.style.display = "block";
        }

        function send(){
          if(busy){ return; }
          var email = (em.value || "").trim();
          if(!email || !/\S+@\S+\.\S+/.test(email)){
            showError("Enter the email address you signed up with.");
            return;
          }
          if(!window.API || typeof window.API.resetPassword !== "function"){
            showError("This isn't available right now — reconnect and try again.");
            return;
          }
          busy = true;
          var go = actions.querySelector("[data-reqauth-reset-go]");
          if(go){ go.disabled = true; go.textContent = "Sending…"; }
          window.API.resetPassword(email)
            .then(function(res){
              busy = false;
              if(go){ go.disabled = false; go.textContent = "Send reset link"; }
              if(res && res.error){
                showError(res.error.message || "Could not send the reset link.");
                return;
              }
              renderSentView(email);
            })
            .catch(function(e){
              busy = false;
              if(go){ go.disabled = false; go.textContent = "Send reset link"; }
              showError((e && e.message) || "Could not send the reset link.");
            });
        }

        em.focus();
        em.addEventListener("keydown", function(e){
          if(e.key === "Enter"){ send(); }
        });
        actions.querySelector("[data-reqauth-reset-go]").addEventListener("click", send);
        actions.querySelector("[data-reqauth-reset-back]").addEventListener("click", renderSignInView);
      }

      function renderSentView(email){
        var body = backdrop.querySelector("[data-modal-body]");
        var actions = backdrop.querySelector("[data-modal-actions]");
        if(!body || !actions){ finish(null); return; }
        var titleEl = backdrop.querySelector("[data-modal-title]");
        if(titleEl){ titleEl.textContent = "Check your inbox"; }
        body.classList.add("ballot-body");
        body.innerHTML = `
          <p style="margin:0 0 10px;color:var(--th-muted);font-size:12px;line-height:1.5">Check <strong>${esc(email)}</strong> for a reset link. Set a new password there, then come back and sign in.</p>
        `;

        actions.innerHTML = `
          <button class="th-btn secondary" type="button" data-reqauth-sent-back>Back to sign in</button>
          <button class="th-btn primary" type="button" data-reqauth-sent-done style="flex:1">Done</button>
        `;

        actions.querySelector("[data-reqauth-sent-back]").addEventListener("click", renderSignInView);
        actions.querySelector("[data-reqauth-sent-done]").addEventListener("click", function(){ finish(null); });
      }

      renderSignInView();
      backdrop.addEventListener("click", onBackdrop, true);
    });
  }

  async function requireProfile(featureName){
    var label = featureName || "use this feature";
    var api = window.API;
    var apiUsable = !!(api && typeof api.ready === "function" && api.ready() &&
      typeof api.currentUser === "function" && typeof api.getProfile === "function");

    if(apiUsable){
      var user = null;
      try{ user = await api.currentUser(); }catch(e){ user = null; }
      if(user){
        var profile = null;
        try{
          var pr = await api.getProfile();
          if(pr && pr.data && !pr.error){ profile = pr.data; }
        }catch(e){ profile = null; }
        if(!profile){
          toast("Finish setting up your profile to " + label + ".");
          setTimeout(function(){ TrackHype.navigate("onboarding.html"); }, 1200);
          return null;
        }
        return profile;
      }
      return await promptAuth(label);
    }

    var onboarded = false;
    try{ onboarded = localStorage.getItem("trackhype_onboarding_complete") === "true"; }catch(e){}
    if(onboarded){
      return { local: true };
    }
    toast("Sign in to " + label + ".");
    setTimeout(function(){ TrackHype.navigate("menu.html?auth=1"); }, 1200);
    return null;
  }

  /* =========================================================
     Beta mode core (Browser Demo vs Account regions)
     =========================================================
     LocalStorage "trackhype.region" is the IDENTITY / voting region
     (written by onboarding; meaningful only for account users).
     SessionStorage "trackhype.view" is the CURRENT browsing view:
       { mode:"demo" }                                  -> demo showcase
       { mode:"region", region:{code,name,flag} }       -> a region view
     Fresh visits re-default: browsers -> demo, account users -> their
     identity region. View picks never change the identity region.
     ========================================================= */

  function ISODNS_KEY(){
    return "trackhype.view";
  }

  function persona(){
    var onboarded = false;
    try{ onboarded = localStorage.getItem("trackhype_onboarding_complete") === "true"; }catch(e){}
    return onboarded ? "account" : "browser";
  }

  function identityRegion(){
    try{ return JSON.parse(localStorage.getItem("trackhype.region") || "null"); }catch(e){ return null; }
  }

  function readView(){
    try{ return JSON.parse(sessionStorage.getItem(ISODNS_KEY()) || "null"); }catch(e){ return null; }
  }

  function setView(v){
    try{ sessionStorage.setItem(ISODNS_KEY(), JSON.stringify(v || { mode:"demo" })); }catch(e){}
  }

  function clearView(){
    try{ sessionStorage.removeItem(ISODNS_KEY()); }catch(e){}
  }

  function demoDescriptor(){
    return { mode:"demo", region:null, code:"DEMO", name:"Browser" };
  }

  function currentView(){
    var v = readView();
    if(v && v.mode === "region" && v.region && v.region.code){
      return { mode:"region", region: v.region, code: v.region.code, name: v.region.name || v.region.code };
    }
    if(v && v.mode === "demo"){ return demoDescriptor(); }
    if(persona() === "account"){
      var id = identityRegion();
      if(id && id.code){
        return { mode:"region", region: id, code: id.code, name: id.name || id.code };
      }
    }
    return demoDescriptor();
  }

  function currentMode(){
    return currentView().mode;
  }

  function anyRealContent(){
    try{
      var s = getState();
      var weekly = (s && s.weekly) || {};
      var subs = weekly.submissions || {};
      for(var k in subs){
        var arr = subs[k] || [];
        for(var i = 0; i < arr.length; i++){
          if(arr[i] && !arr[i].isSeed) return true;
        }
      }
      var snaps = weekly.snapshots || {};
      for(var k2 in snaps){
        var rk = (snaps[k2] && snaps[k2].rankings) || [];
        for(var j = 0; j < rk.length; j++){
          if(rk[j] && !rk[j].isSeed) return true;
        }
      }
    }catch(e){}
    return false;
  }

  function canVote(){
    if(persona() !== "account"){
      return { ok:false, reason:"Create an account to vote." };
    }
    var v = currentView();
    if(v.mode !== "region" || !v.region || !v.region.code){
      return { ok:false, reason:"Voting happens inside your own region. Pick yours in the region selector." };
    }
    var id = identityRegion();
    if(!id || !id.code || String(id.code).toUpperCase() !== String(v.region.code).toUpperCase()){
      return { ok:false, reason:"You can only vote within your own region." };
    }
    if(!anyRealContent()){
      return { ok:false, reason:"Voting is on hold until artists from your region submit music." };
    }
    return { ok:true, reason:"" };
  }

  function votingLocked(){
    return !canVote().ok;
  }

  /* =========================================================
     Public TrackHype API
     ==========================================================*/

  window.TrackHype = {

setState,

    updateState,

    getState,

    esc,

    navigate,

    requireProfile,

    persona,
    identityRegion,
    readView,
    setView,
    clearView,
    currentView,
    currentMode,
    anyRealContent,
    canVote,
    votingLocked,
    loadPublishedChart,
    dbChartKeyFor,

    fmtMoney,

    fmtDate,

    statusClass,

    getArtwork,

    toast,

    HOME_GENRES,
    getHomeCharts,
    setHomeCharts,

    DEMO_PLAYLIST: (function(){
      return window.DEMO_SONGS_DATA || [];
    })(),

    playDemo: function(query){
      return playDemoTrack(query);
    },

    togglePlayback: function(){
      return toggleAudioPlayback();
    },

    SONG_LYRICS,

    openSheet,

    closeSheet,

    makeNewMusicData,

    CATALOG,
    searchInCatalog,

    chartId,
    buildChartDataset,
    maxForChart,
    pointsForPosition,
    positionFromPoints,
    hasVotedToday,
    isSingleVote,
    recordVote,
    confirmVoteSheet,
    moveSong,
    publishChart,
    aggregateVotes,

    currentWeekKey,
    shiftWeekKey,
    weeksBetween,
    mondayOfWeek,
    weekKeyToDateRange,
    getNextResetTime,
    weekCountdownText,
    getWeekSubmissions,
    getSubmissionsForTier,
    seedCuratedCatalog,
    seedCatalogTiers,
    clearChartWeekly,
    seedWeeklySnapshots,
    submitSongToChart,
    getMainPool,
    ballotLengthFor,
    pointsForRank,
    getMaxRankedPicks,
    getWeekBallots,
    getBallot,
    hasBallotThisWeek,
    hasDiscoveryThisWeek,
    submitBallot,
    submitDiscoveryBallot,
    aggregatePool,
    aggregateMainChart,
    aggregateNewest,
    getMovementMap,
    computeMovement,
    getMovementFor,
    getSnapshots,
    getSnapshotFor,
    publishWeeklySnapshot,
    publishWeeklySnapshotFor,
    finalizeChartCycle,
    maybeRunAutoReset,
    executeWeeklyReset,
    chartConfigFor,
    defaultChartConfig,
    closeMsForWeek,

    /* ---- ad engine (banner placements) --------------------------------
       Renders active adverts (API.adverts) into [data-ad-slot] containers.
       Each container keeps its existing markup (e.g. demo promo) until a
       DB advert is available for that placement; adverts cycle across
       containers of the same placement. Impressions are recorded via
       TRACK.impression("campaign", ...) and clicks via
       TRACK.campaignClick(...) so admin analytics sees campaign_click
       events. Never throws. */
    renderAdSlots: async function () {
      try {
        if (!window.API || typeof window.API.adverts !== "function") return;
        var slots = Array.prototype.slice.call(document.querySelectorAll("[data-ad-slot]"));
        if (!slots.length) return;

        var groups = {};
        slots.forEach(function (s) {
          var p = s.getAttribute("data-ad-slot") || "";
          (groups[p] = groups[p] || []).push(s);
        });

        var placements = Object.keys(groups);
        if (!placements.length) return;

        var idx = {};
        for (var i = 0; i < placements.length; i++) idx[placements[i]] = 0;

        for (var k = 0; k < placements.length; k++) {
          var placement = placements[k];
          var res = await window.API.adverts(placement);
          var list = (res && res.data) || [];
          if (!list.length) continue;
          groups[placement].forEach(function (slot) {
            var ad = list[idx[placement]++ % list.length];
            if (!ad) return;
            var title = ad.title || "";
            var a = document.createElement("a");
            a.href = ad.link || "#";
            a.rel = "noopener";
            if (ad.link && ad.link.indexOf("#") !== 0) a.target = "_blank";
            a.setAttribute("aria-label", "Advert: " + title);
            a.style.display = "block";
            var img = document.createElement("img");
            img.src = ad.image || "";
            img.alt = title;
            img.loading = "lazy";
            img.style.display = "block";
            img.style.width = "100%";
            img.style.height = "auto";
            a.appendChild(img);
            slot.innerHTML = "";
            slot.appendChild(a);

            var adId = ad.id;
            var slotPlacement = placement;
            a.addEventListener("click", function () {
              try {
                if (window.TRACK && window.TRACK.campaignClick) {
                  window.TRACK.campaignClick(adId, { placement: slotPlacement, title: title });
                }
              } catch (e) {}
            });
            (function (adId2, slotPlacement2, title2) {
              try {
                if (!window.TRACK || !window.TRACK.impression) return;
                var io = new IntersectionObserver(function (entries) {
                  entries.forEach(function (en) {
                    if (!en.isIntersecting) return;
                    io.disconnect();
                    window.TRACK.impression("campaign", adId2, { placement: slotPlacement2, title: title2 });
                  });
                }, { threshold: 0.3 });
                io.observe(a);
              } catch (e) {}
            })(ad.id, slotPlacement, title);
          });
        }
      } catch (e) {}
    },

init: function({
      activeNav
    } = {}){
      bootShell(activeNav);
    }

  };

  /* =========================================================
     Immediate shell paint
     Scripts load at the end of <body>, so the footer host
     containers already exist here. Paint the bottom nav + player
     right away — independent of DOMContentLoaded — so they appear
     even if a later script or boot step fails. The DOMContentLoaded
     handler below re-invokes init() as a safe idempotent repaint;
     wiring itself runs only once via shellBooted.
     ========================================================= */

  if(document.body && !FRAGMENT_MODE){
    window.TrackHype.init({
      activeNav: document.body.dataset.activeNav
    });
  }

  /* =========================================================
     Automatic Initialisation
     ========================================================= */

  document.addEventListener(
    "DOMContentLoaded",
    () => {

      window.TrackHype?.init();
      window.TrackHype?.renderAdSlots();

      var view = currentView();
      var headerFlag = document.getElementById("headerFlag");
      if(headerFlag){
        var code = (view && view.mode === "region" && view.code) ? view.code : (view && view.code === "DEMO" ? "DEMO" : "ZW");
        headerFlag.textContent = String(code).toUpperCase();
        headerFlag.setAttribute("aria-label", (view && view.name ? view.name : "Zimbabwe") + " — select region");
        if(view && view.name){ headerFlag.title = view.name; }
      }

    }
  );

})();