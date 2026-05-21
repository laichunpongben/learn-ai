// Service worker for learn-ai. See ADR-0011.
//
// This file is plain JS (no bundler) — it's served from /sw.js and runs
// in the service-worker global scope. Don't import from src/.
//
// Versions: bump *_VERSION constants whenever a cache's contents or
// shape changes; the matching cache name will be new, and the activate
// handler deletes any old `learn-ai-*` caches not in OWNED_CACHES.

const SHELL_VERSION = "v1";
const HTML_VERSION = "v1";
const STATIC_VERSION = "v1";
const IMAGES_VERSION = "v1";
const VIDEOS_VERSION = "v1";

const SHELL_CACHE = `learn-ai-shell-${SHELL_VERSION}`;
const HTML_CACHE = `learn-ai-html-${HTML_VERSION}`;
const STATIC_CACHE = `learn-ai-static-${STATIC_VERSION}`;
const IMAGES_CACHE = `learn-ai-images-${IMAGES_VERSION}`;
const VIDEOS_CACHE = `learn-ai-videos-${VIDEOS_VERSION}`;

const OWNED_CACHES = new Set([
  SHELL_CACHE,
  HTML_CACHE,
  STATIC_CACHE,
  IMAGES_CACHE,
  VIDEOS_CACHE,
]);

// Per-cache LRU-ish caps. Cache Storage preserves insertion order, so a
// plain FIFO eviction (delete the first key when over cap) behaves like
// LRU for a normal navigation pattern: revisiting a page re-puts it,
// moving it back to the end.
const CACHE_CAPS = {
  [HTML_CACHE]: 50,
  [STATIC_CACHE]: 80,
  [IMAGES_CACHE]: 30,
  [VIDEOS_CACHE]: 10,
};

const SHELL_ASSETS = ["/", "/favicon.svg", "/manifest.webmanifest"];

// -----------------------------------------------------------------------
// Install / activate
// -----------------------------------------------------------------------

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(SHELL_CACHE);
      await cache.addAll(SHELL_ASSETS);
      await self.skipWaiting();
    })(),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const names = await caches.keys();
      await Promise.all(
        names
          .filter((n) => n.startsWith("learn-ai-") && !OWNED_CACHES.has(n))
          .map((n) => caches.delete(n)),
      );
      await self.clients.claim();
    })(),
  );
});

// -----------------------------------------------------------------------
// Routing
// -----------------------------------------------------------------------

function routeFor(request, url) {
  // Bypass anything not GET (POST/PUT etc. don't belong in caches).
  if (request.method !== "GET") return { strategy: "bypass" };
  // Cross-origin: never touch. YouTube embeds, font CDN, etc.
  if (url.origin !== self.location.origin) return { strategy: "bypass" };

  const path = url.pathname;
  const accept = request.headers.get("accept") || "";

  // HTML navigations
  if (request.mode === "navigate" || accept.includes("text/html")) {
    return { strategy: "swr", cache: HTML_CACHE };
  }

  // Feeds + crawl-facing files: prefer fresh, fall back to cache
  if (
    path === "/rss.xml" ||
    path === "/sitemap-index.xml" ||
    path === "/sitemap-0.xml" ||
    path === "/robots.txt" ||
    path === "/llms.txt"
  ) {
    return { strategy: "network-first", cache: HTML_CACHE };
  }

  // Self-hosted loop videos: cache-first, populated on first hit only.
  if (path.startsWith("/videos/loops/")) {
    return { strategy: "cache-first", cache: VIDEOS_CACHE };
  }

  // Posters + favicon + og.png + manifest + any other image
  if (
    path.startsWith("/videos/posters/") ||
    path.startsWith("/icons/") ||
    path.endsWith(".svg") ||
    path.endsWith(".png") ||
    path.endsWith(".jpg") ||
    path.endsWith(".webp") ||
    path === "/manifest.webmanifest"
  ) {
    return { strategy: "cache-first", cache: IMAGES_CACHE };
  }

  // Astro emits hashed filenames under /_astro/ — safe to treat as immutable.
  // Other JS / CSS likewise.
  if (
    path.startsWith("/_astro/") ||
    path.endsWith(".js") ||
    path.endsWith(".css") ||
    path.endsWith(".woff") ||
    path.endsWith(".woff2")
  ) {
    return { strategy: "cache-first", cache: STATIC_CACHE };
  }

  // Anything else: SWR against HTML cache (safe default).
  return { strategy: "swr", cache: HTML_CACHE };
}

// -----------------------------------------------------------------------
// Cache strategies
// -----------------------------------------------------------------------

async function trimCache(name) {
  const cap = CACHE_CAPS[name];
  if (!cap) return;
  const cache = await caches.open(name);
  const keys = await cache.keys();
  // Cache.keys() returns in insertion order. The oldest entries are at
  // the front; trim from there.
  const excess = keys.length - cap;
  if (excess <= 0) return;
  for (let i = 0; i < excess; i++) {
    await cache.delete(keys[i]);
  }
}

async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  const networkPromise = fetch(request)
    .then(async (response) => {
      if (response && response.ok) {
        await cache.put(request, response.clone());
        await trimCache(cacheName);
      }
      return response;
    })
    .catch(() => undefined);
  // Cached → return immediately; revalidate in the background.
  if (cached) {
    networkPromise.catch(() => {}); // don't unhandle-reject
    return cached;
  }
  // No cached version → wait on the network. If it fails, fall through
  // to the offline page (#124 will install one). For now, rethrow so
  // the browser shows its own offline page.
  const fresh = await networkPromise;
  if (fresh) return fresh;
  throw new Error("offline");
}

async function networkFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  try {
    const response = await fetch(request);
    if (response && response.ok) {
      await cache.put(request, response.clone());
      await trimCache(cacheName);
    }
    return response;
  } catch {
    const cached = await cache.match(request);
    if (cached) return cached;
    throw new Error("offline");
  }
}

async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  if (response && response.ok) {
    await cache.put(request, response.clone());
    await trimCache(cacheName);
  }
  return response;
}

// -----------------------------------------------------------------------
// Fetch dispatcher
// -----------------------------------------------------------------------

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  const route = routeFor(event.request, url);

  if (route.strategy === "bypass") return;

  switch (route.strategy) {
    case "swr":
      event.respondWith(staleWhileRevalidate(event.request, route.cache));
      break;
    case "network-first":
      event.respondWith(networkFirst(event.request, route.cache));
      break;
    case "cache-first":
      event.respondWith(cacheFirst(event.request, route.cache));
      break;
  }
});
