/* =========================================================
   TrackHype — Shared Application Logic
   Mobile Android portrait first: 320–430px
   ========================================================= */

(function(){
  "use strict";

  const STORAGE_KEY = "trackhype.state.v1";

  const PLACEHOLDER_ART = [
    "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=600&q=75",
    "https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=600&q=75",
    "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=600&q=75",
    "https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b?auto=format&fit=crop&w=600&q=75",
    "https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b?auto=format&fit=crop&w=600&q=75"
  ];

  const defaultState = {
    currentTrack: null,
    isPlaying: false,
    progress: 0,
    bottomMode: "player",

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
    ]
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

    return PLACEHOLDER_ART[
      index % PLACEHOLDER_ART.length
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
        "bottom:94px",
        "transform:translateX(-50%)",
        "z-index:1400",
        "background:#111",
        "color:#fff",
        "padding:10px 14px",
        "border-radius:10px",
        "font-weight:800",
        "font-size:13px",
        "box-shadow:0 10px 28px rgba(0,0,0,.25)",
        "max-width:calc(100vw - 32px)",
        "text-align:center",
        "opacity:0",
        "pointer-events:none",
        "transition:opacity .2s ease"
      ].join(";");

      document.body.appendChild(node);
    }

    node.textContent = message;
    node.style.opacity = "1";

    clearTimeout(node._timer);

    node._timer = setTimeout(
      () => {
        node.style.opacity = "0";
      },
      2400
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

    const bottom =
      document.querySelector(
        "[data-bottom]"
      );

    const player =
      document.querySelector(
        "[data-player]"
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

        if(bottom){

          bottom.classList.toggle(
            "is-hidden",
            goingDown &&
            bottom.dataset.locked !== "true"
          );
        }

        if(player){

          player.classList.toggle(
            "is-hidden",
            goingDown &&
            player.dataset.locked !== "true"
          );
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

    const items = [

      [
        "index.html",
        "Hyped",
        "⌂"
      ],

      [
        "history.html",
        "History",
        "◷"
      ],

      [
        "artists.html",
        "Artists",
        "♬"
      ],

      [
        "search.html",
        "Search",
        "⌕"
      ],

      [
        "menu.html",
        "Menu",
        "☰"
      ]

    ];

    host.innerHTML =
      items
        .map(
          (
            [
              href,
              label,
              symbol
            ]
          ) => {

            return `
              <a
                class="th-nav-item ${
                  active === label.toLowerCase()
                    ? "is-active"
                    : ""
                }"
                href="${href}"
                aria-label="${esc(label)}"
              >
                <span class="nav-symbol">
                  ${symbol}
                </span>

                <span>
                  ${esc(label)}
                </span>
              </a>
            `;

          }
        )
        .join("");
  }

  /* =========================================================
     Global Player
     ========================================================= */

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

    player.innerHTML = `

      <div class="th-player-progress">
        <span
          style="
            width:${Math.max(
              0,
              Math.min(
                100,
                Number(state.progress) || 0
              )
            )}%
          "
        ></span>
      </div>

      <div class="th-player-inner">

        <img
          class="th-player-art"
          src="${esc(
            track.artwork ||
            getArtwork(0)
          )}"
          alt=""
        >

        <div class="th-player-main">

          <span class="th-artist-name">
            ${esc(track.artist)}
          </span>

          <div class="th-song-title">
            ${esc(track.title)}
          </div>

        </div>

        <button
          class="th-mini-btn"
          type="button"
          data-action="player-toggle"
          aria-label="Play or pause"
        >
          ${
            state.isPlaying
              ? "Ⅱ"
              : "▶"
          }
        </button>

        <button
          class="th-toggle-square"
          type="button"
          data-action="toggle-bottom"
          aria-label="Switch player and navigation"
        >
          □
        </button>

      </div>
    `;
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

          updateState(
            state => {

              state.isPlaying =
                !state.isPlaying;

            }
          );

          renderPlayer();

          return;
        }

        /* -----------------------------------------
           Toggle Bottom Player / Navigation
           ----------------------------------------- */

        if(
          action === "toggle-bottom"
        ){

          const state =
            getState();

          const nextMode =
            state.bottomMode === "player"
              ? "navigation"
              : "player";

          updateState(
            s => {

              s.bottomMode =
                nextMode;

            }
          );

          const bottom =
            document.querySelector(
              "[data-bottom]"
            );

          const player =
            document.querySelector(
              "[data-player]"
            );

          if(bottom){

            bottom.style.display =
              nextMode === "navigation"
                ? ""
                : "none";
          }

          if(player){

            player.style.display =
              nextMode === "player"
                ? ""
                : "none";
          }

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
            `Playing ${track.title}`
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

    const state =
      getState();

    const bottom =
      document.querySelector(
        "[data-bottom]"
      );

    const player =
      document.querySelector(
        "[data-player]"
      );

    if(
      bottom &&
      player
    ){

      const navigation =
        state.bottomMode ===
        "navigation";

      bottom.style.display =
        navigation
          ? ""
          : "none";

      player.style.display =
        navigation
          ? "none"
          : "";
    }
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
        artist: "Example Artist",
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
        artist: "Example Artist",
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
        artist: "Example Artist",
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
        artist: "Example Artist",
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
        artist: "Example Artist",
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
        artist: "Example Artist",
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
     Public TrackHype API
     ========================================================= */

  window.TrackHype = {

    getState,

    setState,

    updateState,

    esc,

    fmtMoney,

    fmtDate,

    statusClass,

    getArtwork,

    toast,

    openSheet,

    closeSheet,

    makeNewMusicData,

    init: function({
      activeNav
    } = {}){

      renderBottomNavigation(
        activeNav ||
        document.body.dataset.activeNav ||
        ""
      );

      initialiseHeaderScroll();

      initialiseGlobalPlayer();

      initialiseModal();
    }

  };

  /* =========================================================
     Automatic Initialisation
     ========================================================= */

  document.addEventListener(
    "DOMContentLoaded",
    () => {

      window.TrackHype?.init();

    }
  );

})();