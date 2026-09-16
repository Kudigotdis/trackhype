self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open("th-v1").then((cache) =>
      cache.addAll([
        "trackhype.css",
        "trackhype.js",
        "demo-playlist.js",
        "js/territories.js",
        "js/api.js",
        "manifest.json",
        "Assets/logos/TrackHype Logo Design Badge.webp",
        "Assets/logos/TrackHype Logo Design.png",
        "Assets/logos/track-hype-text-logo.webp",
        "Assets/logos/TrackHype-Logo-192.png",
        "Assets/logos/TrackHype-Logo-512.png"
      ]).catch(() => {})
    )
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== "th-v1")
          .map((key) => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);

  if (url.origin !== self.location.origin) return;

  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open("th-v1").then((cache) => cache.put(req, copy)).catch(() => {});
          return res;
        })
        .catch(() => caches.match(req).then((hit) => hit || caches.match("index.html")))
    );
    return;
  }

  event.respondWith(
    caches.match(req).then((hit) => {
      if (hit) return hit;
      return fetch(req)
        .then((res) => {
          if (res.ok && url.origin === self.location.origin) {
            const copy = res.clone();
            caches.open("th-v1").then((cache) => cache.put(req, copy)).catch(() => {});
          }
          return res;
        })
        .catch(() => hit);
    })
  );
});