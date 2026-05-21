# ADR-0011 · Installable, offline-first PWA

**Status:** Accepted
**Date:** 2026-05-22

## Context

The site is a fully static Astro build — every page is a flat HTML file with inline CSS. Two affordances that would cost almost nothing are currently missing:

- **Offline**: a reload on flaky Wi-Fi (train, plane, café, conference) drops the learner into the browser's blank offline page, not the lesson they were reading 10 seconds ago.
- **Installable**: `public/manifest.webmanifest` declares one SVG icon. Chrome's install prompt needs a 192×192 raster and ideally a 512×512; iOS Safari ignores the manifest entirely and needs an `apple-touch-icon`. Result: nobody can install learn-ai today.

The pages are small, easy to cache, and the audience (people learning AI in 2026) has been trained by every other site they use to expect "add to home screen" and offline access.

## Decision

Ship a six-piece PWA:

1. **Service worker** at `/sw.js`, registered from `Layout.astro`, with a precache of the shell (home, sidebar HTML, small CSS/JS/fonts, favicon — all under 200KB total).
2. **Runtime cache strategies** layered on top of the precache:
   - HTML → stale-while-revalidate
   - CSS / JS / images → cache-first (Astro emits content-hashed filenames; treat as immutable)
   - Posters → cache-first
   - Loop videos → cache-first, populated on first hit only (don't burn bandwidth on a learner who never reaches a loop)
   - YouTube iframes → bypass (external origin)
   - RSS / sitemap / robots / llms.txt → network-first, cache as fallback
3. **Expanded manifest** with proper `192×192` + `512×512` PNG icons (`purpose: any` + `purpose: maskable`), `categories: ["education"]`, and one or two `screenshots[]` so the Chrome install dialog looks legit. Plus `apple-touch-icon` and Apple-specific meta tags in `Layout.astro` for iOS Safari.
4. **Install prompt UI** — stash `beforeinstallprompt`, surface a small "Install" chip in the header, fire the prompt on click, hide forever once accepted. iOS Safari never fires the event, so on iOS show a one-line "Tap Share → Add to Home Screen" hint instead, visible once per device.
5. **Offline fallback** at `/offline` — friendly HTML page surfaced by the SW only when a navigation misses cache and fails network. Works without JS.
6. **Update notification** — when a new SW is installed and waiting, post a message; show a "Update available · Reload" toast that sends `SKIP_WAITING` and reloads on click. At most once per session.

Versioned caches (`learn-ai-static-v1`, `learn-ai-html-v1`, `learn-ai-images-v1`); old versions deleted on `activate`. Per-cache LRU eviction caps storage (~50 HTML, ~30 images, ~10 videos).

## Alternatives considered

- **Workbox.** Industry standard, batteries-included. Rejected: it's another build-time dependency on a static site that ships zero dependencies in the page. The cache strategies we need fit in a couple of hundred lines of vanilla SW code, and we don't need Workbox's routing DSL for six asset types.
- **AppCache / manifest-only.** AppCache is dead. A manifest alone gets you nothing offline.
- **Skip installability, ship offline only.** Possible, but "Install" is what tells learners this is a thing worth keeping. Cheap to add and changes how the site feels.
- **Push notifications + background sync.** Out of scope — tutorial content doesn't change in real time, and we're not asking for the notification permission.

## Consequences

- **One new long-lived asset** (`/sw.js`) on origin. We're committing to keeping it working forever — a broken SW silently caches bad content for everyone who ever visited.
- **Deploy semantics change.** A learner who visited yesterday loads the cached HTML immediately, with the new HTML revalidating in the background. The "update available" toast is what turns the second request into the new content the same session.
- **CSP unchanged.** The current `script-src 'self' 'unsafe-inline'` allows the SW registration script; `default-src 'self'` covers `worker-src` for the SW itself. Both verified.
- **Storage limits.** Browsers grant generous quotas (50MB+ before prompting), but a runaway cache is still a bug. The eviction policy in the SW is non-optional, not nice-to-have.
- **The iOS divergence is permanent.** iOS Safari will never fire `beforeinstallprompt`. The "Share → Add to Home Screen" hint is the only way to discoverable-install on iOS, and it must be UA-sniffed (the API doesn't expose this). Document it; live with it.

## Files of note

- `public/sw.js` — the service worker
- `public/manifest.webmanifest` — expanded
- `public/icons/icon-192.png`, `icon-512.png`, `icon-512-maskable.png`, `apple-touch-icon.png` — new
- `src/layouts/Layout.astro` — registration script, apple-touch-icon link, install prompt mount point
- `src/components/InstallPrompt.astro` — the chip + iOS hint
- `src/pages/offline.astro` — the fallback page
- `src/components/UpdateToast.astro` — the update toast
- `src/scripts/pwa.ts` — registration + update orchestration

## References

- [web.dev: Stale-while-revalidate](https://web.dev/articles/stale-while-revalidate)
- [web.dev: Web app manifest](https://web.dev/learn/pwa/web-app-manifest)
- [MDN: Making PWAs installable](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Making_PWAs_installable)
- [web.dev: Update](https://web.dev/learn/pwa/update)
