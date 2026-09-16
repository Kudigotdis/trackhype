/* ============================================================
   TrackHype - SADC territory registry + lazy location loader.
   No npm, no build step. Load AFTER trackhype.js (merges into
   window.TrackHype) or standalone (exposes window.TrackHypeTerritories).

   Doctrine:
   - Offline-first: never throw. Every async op resolves to
     { data, error } (mirror of js/api.js).
   - Mobile doctrine: NO territory data is preloaded. ZW/BW clone
     their root location globals on first access via a dynamic
     <script> node; the 13 SADC city files (cities-&-towns-*.geojson
     in docs/info/locations/) load lazily via fetch when a page
     first needs them (GitHub Pages / any HTTP origin; under
     file:// fetch resolves to { error, data:null } gracefully).
   - Currency rows literally mirror docs/info/world_currencies.json
     (USD base; region is display, never price).
   ============================================================ */
(function () {
  "use strict";

  var TERRITORIES = [
    { code: "AO", name: "Angola", geojson: "angola", genreKey: "angola",
      currency: { code: "AOA", label: "Angolan Kwanza", five: "4,625.00 AOA", ten: "9,250.00 AOA" } },
    { code: "BW", name: "Botswana", source: "script", script: "botswana_locations.js", global: "BOTSWANA_LOCATIONS_DATA", genreKey: "botswana",
      currency: { code: "BWP", label: "Botswanan Pula", five: "67.25 P", ten: "134.50 P" } },
    { code: "KM", name: "Comoros", geojson: "comoros", genreKey: "comoros",
      currency: { code: "KMF", label: "Comorian Franc", five: "2,150.00 KMF", ten: "4,300.00 KMF" } },
    { code: "SZ", name: "Eswatini", geojson: "eswatini", genreKey: "eswatini",
      currency: { code: "SZL", label: "Swazi Lilangeni", five: "81.00 E", ten: "162.00 E" } },
    { code: "LS", name: "Lesotho", geojson: "lesotho", genreKey: "lesotho",
      currency: { code: "LSL", label: "Lesotho Loti", five: "81.00 L", ten: "162.00 M" } },
    { code: "MG", name: "Madagascar", geojson: "madagascar", genreKey: "madagascar",
      currency: { code: "MGA", label: "Malagasy Ariary", five: "22,750.00 Ar", ten: "45,500.00 Ar" } },
    { code: "MW", name: "Malawi", geojson: "malawi", genreKey: "malawi",
      currency: { code: "MWK", label: "Malawian Kwacha", five: "8,675.00 MK", ten: "17,350.00 MK" } },
    { code: "MU", name: "Mauritius", geojson: "mauritius", genreKey: "mauritius",
      currency: { code: "MUR", label: "Mauritian Rupee", five: "232.50 \u20A8", ten: "465.00 \u20A8" } },
    { code: "MZ", name: "Mozambique", geojson: "mozambique", genreKey: "mozambique",
      currency: { code: "MZN", label: "Mozambican Metical", five: "319.50 MT", ten: "639.00 MT" } },
    { code: "NA", name: "Namibia", geojson: "namibia", genreKey: "namibia",
      currency: { code: "NAD", label: "Namibian Dollar", five: "81.00 N$", ten: "162.00 N$" } },
    { code: "SC", name: "Seychelles", geojson: "seychelles", genreKey: "seychelles",
      currency: { code: "SCR", label: "Seychellois Rupee", five: "70.00 \u20A8", ten: "140.00 \u20A8" } },
    { code: "ZA", name: "South Africa", geojson: "south-africa", genreKey: "south_africa",
      currency: { code: "ZAR", label: "South African Rand", five: "81.00 R", ten: "162.00 R" } },
    { code: "TZ", name: "Tanzania", geojson: "tanzania", genreKey: "tanzania",
      currency: { code: "TZS", label: "Tanzanian Shilling", five: "13,200.00 TSh", ten: "26,400.00 TSh" } },
    { code: "ZM", name: "Zambia", geojson: "zambia", genreKey: "zambia",
      currency: { code: "ZMW", label: "Zambian Kwacha", five: "138.00 ZK", ten: "276.00 ZK" } },
    { code: "ZW", name: "Zimbabwe", source: "script", script: "zimbabwe_locations.js", global: "ZIMBABWE_LOCATIONS_DATA", genreKey: "zimbabwe",
      currency: { code: "USD", label: "United States Dollar", five: "$5.00", ten: "$10.00" } }
  ];

  var loadedLocations = {};
  var pendingFetches = {};

  function makeGeojsonPath(territory) {
    return "docs/info/locations/cities-&-towns-" + territory.geojson + ".geojson";
  }

  function describeTerritory(t) {
    return {
      code: t.code,
      name: t.name,
      genreKey: t.genreKey,
      currency: {
        code: t.currency.code,
        label: t.currency.label,
        five: t.currency.five,
        ten: t.currency.ten
      }
    };
  }

  function getTerritories() {
    return TERRITORIES.map(describeTerritory);
  }

  function findTerritory(query) {
    if (!query) return null;
    var q = String(query).toUpperCase();
    for (var i = 0; i < TERRITORIES.length; i++) {
      var t = TERRITORIES[i];
      if (t.code === q || t.name.toUpperCase() === q || t.genreKey.toUpperCase() === q) {
        return t;
      }
    }
    return null;
  }

  function territoryFor(query) {
    var t = findTerritory(query);
    return t ? describeTerritory(t) : null;
  }

  function regionDefault() {
    var saved = null;
    try { saved = JSON.parse(localStorage.getItem("trackhype.region") || "null"); } catch (e) { saved = null; }
    var code = saved && saved.code ? saved.code : "ZW";
    return territoryFor(code) || territoryFor("ZW");
  }

  function loadScript(src, onOk) {
    var existing = document.querySelector('script[data-th-loc="' + src + '"]');
    if (existing) { onOk(); return; }
    var s = document.createElement("script");
    s.setAttribute("data-th-loc", src);
    s.src = src;
    s.onload = onOk;
    document.head.appendChild(s);
  }

  function fetchGeojson(territory, onDone) {
    var dec = describeTerritory(territory);
    if (pendingFetches[territory.code]) {
      pendingFetches[territory.code].push(onDone);
      return;
    }
    pendingFetches[territory.code] = [onDone];
    var settled = false;
    function settle(data, error) {
      if (settled) return;
      settled = true;
      var waiters = pendingFetches[territory.code] || [];
      delete pendingFetches[territory.code];
      if (data) loadedLocations[territory.code] = data;
      for (var i = 0; i < waiters.length; i++) waiters[i]({ data: data, error: error });
    }
    fetch(makeGeojsonPath(territory))
      .then(function (res) {
        if (!res.ok) throw new Error("HTTP " + res.status);
        return res.json();
      })
      .then(function (json) {
        var places = [];
        var regionNames = {};
        var features = json && Array.isArray(json.features) ? json.features : [];
        for (var i = 0; i < features.length; i++) {
          var p = features[i].properties || {};
          if (!p.name) continue;
          places.push({ name: p.name, region: p.region || "", country: p.country || dec.name });
          if (p.region) regionNames[p.region] = true;
        }
        settle({
          countries: dec.name,
          code: dec.code,
          places: places,
          regions: Object.keys(regionNames),
          features: features
        }, null);
      })
      .catch(function (err) {
        settle(null, err && err.message ? err.message : String(err));
      });
  }

  function loadTerritoryLocations(query, cb) {
    var done = typeof cb === "function" ? cb : function () {};
    var t = findTerritory(query);
    if (!t) {
      var seen = {};
      done({ data: null, error: "Unknown territory: " + query, territories: TERRITORIES.map(describeTerritory) });
      return;
    }
    if (loadedLocations[t.code]) {
      done({ data: loadedLocations[t.code], error: null });
      return;
    }
    if (t.source === "script") {
      var existingGlobal = window[t.global];
      if (existingGlobal) {
        loadedLocations[t.code] = existingGlobal;
        done({ data: existingGlobal, error: null });
        return;
      }
      loadScript(t.script, function () {
        var data = window[t.global] || null;
        if (!data) { done({ data: null, error: "Missing global " + t.global }); return; }
        loadedLocations[t.code] = data;
        done({ data: data, error: null });
      });
      return;
    }
    fetchGeojson(t, done);
  }

  /* ---- Genre pool (region-keyed from global_music_genres_195_plus.json) ---

     All 15 SADC territories share the same 34-genre pool.  The catalogue
     maps genre IDs (as used in the json's country.globalGenreIds arrays)
     to display names.  If a page loads the full json as a script that
     exposes window.TrackHypeGenreCatalogue, that takes precedence; otherwise
     the inline catalogue below is used.  Both are byte-mirrors of the json.
     --------------------------------------------------------------- */

  var INLINE_GENRE_CATALOGUE = {
    pop: "Pop",
    synth_pop_new_wave: "Synth-Pop / New Wave",
    indie_pop: "Indie Pop",
    dance_pop: "Dance-Pop",
    hip_hop: "Hip-Hop",
    rap: "Rap",
    rnb: "Contemporary R&B",
    trap: "Trap / Modern Hip-Hop",
    neo_soul: "Neo-Soul",
    rock: "Rock",
    alternative_rock: "Alternative Rock / Indie Rock",
    hard_rock_metal: "Hard Rock / Heavy Metal",
    punk: "Punk Rock",
    pop_punk: "Pop-Punk",
    house: "House",
    techno: "Techno",
    trance: "Trance / Progressive",
    drum_bass: "Drum & Bass / Jungle",
    dubstep_bass: "Dubstep / Bass Music",
    ambient_chillout: "Ambient / Chillout",
    folk: "Folk / Singer-Songwriter",
    acoustic_unplugged: "Acoustic / Unplugged",
    folklore: "Folklore / Traditional",
    classical: "Classical",
    jazz: "Jazz",
    blues: "Blues",
    film_score: "Film Score / Soundtracks",
    reggae_dub: "Reggae / Dub",
    reggaeton_latin: "Reggaeton / Latin Pop",
    afrobeats: "Afrobeats",
    kpop: "K-Pop",
    latin: "Latin / Tropical",
    gospel_spiritual: "Spiritual / Gospel / Devotional",
    electronic: "Electronic / EDM"
  };

  var SADC_GENRE_IDS = Object.keys(INLINE_GENRE_CATALOGUE);

  function getGenrePool(genreKey) {
    var catalogue = window.TrackHypeGenreCatalogue || INLINE_GENRE_CATALOGUE;
    return SADC_GENRE_IDS.map(function (id) {
      return catalogue[id] ? catalogue[id] : id.replace(/_/g, " ").replace(/\b\w/g, function (c) { return c.toUpperCase(); });
    });
  }

  var api = {
    TERRITORY_CODES: TERRITORIES.map(function (t) { return t.code; }),
    getTerritories: getTerritories,
    territoryFor: territoryFor,
    regionDefault: regionDefault,
    loadTerritoryLocations: loadTerritoryLocations,
    getGenrePool: getGenrePool
  };

  if (window.TrackHype && typeof window.TrackHype === "object") {
    for (var k in api) {
      if (Object.prototype.hasOwnProperty.call(api, k)) window.TrackHype[k] = api[k];
    }
  }
  window.TrackHypeTerritories = api;
})();