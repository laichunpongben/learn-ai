// Registers the service worker. See ADR-0011.
//
// Production-only: registering a SW in dev would cache Astro's HMR-
// driven dynamic responses and produce confusing stale UI. The
// import.meta.env.PROD branch is dead code in dev (Vite eliminates it).
//
// Registration runs after `window.load` so it doesn't compete with
// first-paint resources.

if (import.meta.env.PROD && typeof navigator !== "undefined" && "serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js", { scope: "/" }).catch((err) => {
      // SW registration can fail for a few reasons we can't recover from
      // (file not yet deployed; user behind an antivirus that strips SWs;
      // HTTPS broken). Logging is enough — there's nothing user-visible
      // to do here.
      console.warn("learn-ai: service worker registration failed", err);
    });
  });
}
