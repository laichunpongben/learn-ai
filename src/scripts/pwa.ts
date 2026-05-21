// Service worker registration + update orchestration. See ADR-0011.
//
// Production-only: registering a SW in dev would cache Astro's HMR-
// driven dynamic responses and produce confusing stale UI. The
// import.meta.env.PROD branch is dead code in dev (Vite eliminates it).
//
// Registration runs after `window.load` so it doesn't compete with
// first-paint resources.
//
// Update flow:
//  - When a new SW reaches `installed` state AND a controller already
//    exists (i.e. it's an update, not the first install), dispatch
//    `pwa:update-available`. UpdateToast.astro listens for it and
//    reveals the toast.
//  - When the user clicks Reload, the toast dispatches `pwa:apply-update`.
//    We postMessage SKIP_WAITING to the waiting SW.
//  - Once the new SW takes over, `controllerchange` fires and we reload.

if (import.meta.env.PROD && typeof navigator !== "undefined" && "serviceWorker" in navigator) {
  let waitingWorker: ServiceWorker | null = null;
  let reloadOnControllerChange = false;

  function announceWaiting(worker: ServiceWorker) {
    waitingWorker = worker;
    window.dispatchEvent(new Event("pwa:update-available"));
  }

  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js", { scope: "/" })
      .then((reg) => {
        // If a waiting worker is already there at registration time
        // (e.g. tab opened after deploy, before reload), announce now.
        if (reg.waiting && navigator.serviceWorker.controller) {
          announceWaiting(reg.waiting);
        }

        reg.addEventListener("updatefound", () => {
          const installing = reg.installing;
          if (!installing) return;
          installing.addEventListener("statechange", () => {
            if (installing.state === "installed" && navigator.serviceWorker.controller) {
              announceWaiting(installing);
            }
          });
        });
      })
      .catch((err) => {
        // SW registration can fail for a few reasons we can't recover from
        // (file not yet deployed; user behind an antivirus that strips SWs;
        // HTTPS broken). Logging is enough — there's nothing user-visible
        // to do here.
        console.warn("learn-ai: service worker registration failed", err);
      });
  });

  window.addEventListener("pwa:apply-update", () => {
    if (!waitingWorker) return;
    reloadOnControllerChange = true;
    waitingWorker.postMessage({ type: "SKIP_WAITING" });
  });

  navigator.serviceWorker.addEventListener("controllerchange", () => {
    if (reloadOnControllerChange) {
      reloadOnControllerChange = false;
      window.location.reload();
    }
  });
}
