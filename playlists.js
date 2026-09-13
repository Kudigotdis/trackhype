(function () {
  var S = window.DEMO_SONGS_DATA || [];

  function norm(value) {
    return String(value || "")
      .toLowerCase()
      .replace(/[\u2019\u2018']/g, "")
      .replace(/\s+/g, " ")
      .trim();
  }

  function findSong(title) {
    var needle = norm(title);
    for (var i = 0; i < S.length; i++) {
      if (norm(S[i].title) === needle) {
        return S[i];
      }
    }
    for (var j = 0; j < S.length; j++) {
      var parts = norm(S[j].title).split(/[\u2013\u2014]\s*/);
      if (parts[parts.length - 1] === needle) {
        return S[j];
      }
    }
    return null;
  }

  function build(spec) {
    var songs = spec.songs
      .map(findSong)
      .filter(Boolean);
    var playlist = {
      id: spec.id,
      name: spec.name,
      description: spec.description || "",
      cover: spec.cover || "",
      songs: songs
    };
    if (!playlist.cover && songs.length) {
      playlist.cover = songs[0].art;
    }
    return playlist;
  }

  var PLAYLISTS = [
    build({
      id: "wokeeyes",
      name: "Wokeeyes - Revenge of The Tear Drop Hunter",
      description: "Promo · EDM & Dancehall",
      cover: "Assets/Demo Music/WoKeeyes/Wokeeyes - Revenge of The Tear Drop Hunter.jpg",
      songs: [
        "Broken Trophies", "Composer", "Come Again", "Dawning", "Donkno", "Halo",
        "Hold Over", "Lovin My Body", "Samson's Woes", "Stone Cold"
      ]
    }),
    build({
      id: "zim-hits",
      name: "Zimbabwe Hits",
      description: "Local favourites & sounds of Zimbabwe",
      cover: "Assets/Demo Music/Zimbabwe/Playlist Cover - Zimbabwe.webp",
      songs: [
        "Uhambo", "Inhliziyo Yami", "Sleepover", "Mali", "Different Breed",
        "Bhura Dhanzi", "Muchaita Sei", "Learn Shona", "Ndiri Kushanda",
        "Pane Acha Chema", "Mudododo"
      ]
    }),
    build({
      id: "botswana-grooves",
      name: "Botswana Grooves",
      description: "AmaPiano & dance energy from Botswana",
      cover: "Assets/Demo Music/Botswana/Playlist Cover - Botswana.webp",
      songs: [
        "Mankalengkaleng Lyrics", "Stimamolelo", "Bo Lavo 10.9", "Ngwana'a Batho",
        "Insecurities", "Mmele Pelo Le Moya", "Ama Gear", "Dlala Thukzin",
        "Tjuele", "Heh Heeh", "You", "Transition", "Ama Hem Hem", "Remember",
        "Ha Tholakale", "Chomi Yaago"
      ]
    }),
    build({
      id: "international-vibes",
      name: "International Vibes",
      description: "Global sounds from the demo library",
      cover: "Assets/Demo Music/International/Playlist Cover - International.webp",
      songs: [
        "iloveitiloveitiloveit", "Addictions", "Burning Bridges", "There's no Other",
        "Take My Space", "Don't You Know", "Cocoanut Water", "Slick"
      ]
    })
  ];

  window.PLAYLISTS = PLAYLISTS;
})();
