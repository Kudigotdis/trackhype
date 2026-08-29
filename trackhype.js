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

    const NAV_ACTIVE = {
      "index.html": "hyped",
      "history.html": "history",
      "artists.html": "artists",
      "search.html": "search",
      "menu.html": "menu"
    };

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
                  (NAV_ACTIVE[active] || active) === label.toLowerCase()
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

    const progress =
      Math.max(
        0,
        Math.min(
          100,
          Number(state.progress) || 0
        )
      );

    player.innerHTML = `

      <div
        class="th-player-progress"
        data-seek
        data-action="seek"
        role="slider"
        aria-label="Seek"
        aria-valuemin="0"
        aria-valuemax="100"
        aria-valuenow="${Math.round(progress)}"
      >
        <span
          class="th-player-progress-fill"
          style="width:${progress}%"
        ></span>
        <i
          class="th-player-dot"
          style="left:${progress}%"
        ></i>
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

        <a
          class="th-mini-btn th-player-playlist"
          href="playlist.html"
          aria-label="Open playlist"
          title="Playlist"
        >
          ♫
        </a>

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

    renderPlayer();

    const filled =
      getState().isPlaying;
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

    bindSeekDrag();

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
    window.location.href = href;
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
    updateState(s => {
      s.currentTrack = { title, artist, artwork };
      s.isPlaying = true;
      s.progress = 0;
    });
    renderPlayer();
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
      window.TrackHype._lastVote = rec;
      closeSheet();
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
     Public TrackHype API
     ==========================================================*/

  window.TrackHype = {

setState,

    updateState,

    getState,

    esc,

    fmtMoney,

    fmtDate,

    statusClass,

    getArtwork,

    toast,

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

    init: function({
      activeNav
    } = {}){

      let booted = false;

      function ensureBoot(){
        if(booted){
          return;
        }
        booted = true;
        initialiseHeaderScroll();
        initialiseGlobalPlayer();
        initialiseModal();
      }

      ensureBoot();

      renderBottomNavigation(
        activeNav ||
        document.body.dataset.activeNav ||
        ""
      );
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