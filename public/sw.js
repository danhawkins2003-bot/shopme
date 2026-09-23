// Miabé Asi PWA Service Worker — Versioned Cache & Stale-While-Revalidate Strategy
const CACHE_NAME = "miabe-asi-v4";

const STATIC_PRECACHE = [
  "/",
  "/manifest.json?v=4",
  "/favicon.svg?v=4",
  "/favicon.png?v=4",
  "/icon-192.png?v=4",
  "/icon-512.png?v=4",
  "/icon-maskable-192.png?v=4",
  "/icon-maskable-512.png?v=4",
  "/apple-touch-icon.png?v=4",
  "/official-logo.png?v=4"
];

// Installation: Pre-cache shell assets & activate immediately
self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_PRECACHE).catch((err) => {
        console.warn("[SW] Precache partial error, will cache on fetch:", err);
      });
    })
  );
});

// Activation: Clean up old cache versions, claim clients
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => {
            console.log("[SW] Invalidation de l'ancien cache :", name);
            return caches.delete(name);
          })
      );
    }).then(() => {
      return self.clients.claim();
    })
  );
});

// Fetch Strategy:
// 1. API routes & external endpoints -> Network Only (never cache dynamically generated API data in SW)
// 2. Navigation (HTML) -> Network-First with Cache fallback for offline support
// 3. Static assets & branding icons -> Stale-While-Revalidate (serves instantly, updates in background)
self.addEventListener("fetch", (event) => {
  const request = event.request;
  const url = new URL(request.url);

  // Skip non-GET requests and browser extensions
  if (request.method !== "GET" || !url.protocol.startsWith("http")) {
    return;
  }

  // 1. Dynamic API and Auth endpoints: Always bypass SW cache
  if (url.pathname.startsWith("/api/") || url.hostname.includes("supabase.co") || url.pathname.startsWith("/auth/")) {
    event.respondWith(fetch(request));
    return;
  }

  // 2. Navigation requests (HTML documents) -> Network-First
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, responseClone));
          }
          return networkResponse;
        })
        .catch(() => {
          return caches.match(request).then((cachedResponse) => {
            return cachedResponse || caches.match("/");
          });
        })
    );
    return;
  }

  // 3. Static assets (images, icons, scripts, styles) -> Stale-While-Revalidate
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      const fetchPromise = fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, responseClone));
          }
          return networkResponse;
        })
        .catch((err) => {
          // If offline and no network, cachedResponse will be returned
          return cachedResponse;
        });

      return cachedResponse || fetchPromise;
    })
  );
});
