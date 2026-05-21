// Service worker for learn-ai. See ADR-0011.
//
// This file is plain JS (no bundler) — it's served from /sw.js and runs
// in the service-worker global scope. Don't import from src/.
//
// Versions: bump SHELL_VERSION whenever the precache list changes.
// Runtime caches (html, static, images, videos) are added in #121.

const SHELL_VERSION = "v1";
const SHELL_CACHE = `learn-ai-shell-${SHELL_VERSION}`;

// All `learn-ai-*` caches we recognise. Anything outside this list and
// owned by us is stale and gets deleted on `activate`.
const OWNED_CACHES = new Set([SHELL_CACHE]);

// Precache: small set of always-loaded resources. Total under 200KB —
// don't precache lesson pages (lazy-cached at runtime in #121) or videos
// (lazy-cached on first hit in #121).
const SHELL_ASSETS = [
  "/",
  "/favicon.svg",
  "/manifest.webmanifest",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(SHELL_CACHE);
      await cache.addAll(SHELL_ASSETS);
      // Activate immediately on first install so first navigation is
      // controlled (otherwise the SW doesn't control the page until
      // the next visit, which delays offline support by one session).
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
      // Take control of any existing clients (open tabs) right away,
      // so they start serving from the new caches without a manual
      // reload.
      await self.clients.claim();
    })(),
  );
});

// Runtime fetch handling lands in #121. Until then, the network handles
// every request — the precache only matters for `caches.match()` calls
// the rest of the system makes (e.g. the offline page, when it ships).
