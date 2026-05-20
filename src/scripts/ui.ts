/**
 * One owner per UI interaction. Imported once from Layout.astro.
 *
 * Architecture:
 *  - Theme: data-theme attribute on <html>, persisted in localStorage. The
 *    no-flash pre-paint apply is in Layout's <head> inline script.
 *  - Modal: native <dialog>. .showModal()/.close() handle visibility, focus
 *    trap, Esc key, and ::backdrop. No [hidden] attribute games.
 *  - Sidebar drawer: a single class on <html> toggles the mobile drawer.
 *
 * All buttons declare intent via data-ui-action="…". This module is the only
 * place that listens for those actions — no per-component handlers, no
 * onclick attributes, no double-fire.
 */

const THEME_KEY = "learn-ai.theme.v1";

type Action = "toggle-theme" | "open-search" | "close-search" | "toggle-sidebar" | "close-sidebar";

function readTheme(): "light" | "dark" {
  try {
    const stored = localStorage.getItem(THEME_KEY);
    if (stored === "light" || stored === "dark") return stored;
  } catch {
    /* private mode */
  }
  try {
    if (window.matchMedia?.("(prefers-color-scheme: dark)").matches) return "dark";
  } catch {
    /* unsupported */
  }
  return "light";
}

function writeTheme(t: "light" | "dark"): void {
  document.documentElement.setAttribute("data-theme", t);
  try {
    localStorage.setItem(THEME_KEY, t);
  } catch {
    /* ignore */
  }
}

function toggleTheme(): void {
  writeTheme(readTheme() === "dark" ? "light" : "dark");
}

function openSearch(): void {
  const dialog = document.querySelector<HTMLDialogElement>("[data-search-dialog]");
  if (!dialog || dialog.open) return;
  dialog.showModal();
  // Result-list reset is owned by SearchPalette's own script; trigger it.
  (window as Window & { __searchRender?: () => void }).__searchRender?.();
}

function closeSearch(): void {
  const dialog = document.querySelector<HTMLDialogElement>("[data-search-dialog]");
  if (!dialog?.open) return;
  dialog.close();
}

function toggleSidebar(): void {
  const html = document.documentElement;
  if (html.classList.contains("sidebar-open")) closeSidebar();
  else {
    html.classList.add("sidebar-open");
    document.querySelectorAll<HTMLElement>("[data-ui-action='toggle-sidebar']").forEach((b) => {
      b.setAttribute("aria-expanded", "true");
    });
  }
}

function closeSidebar(): void {
  document.documentElement.classList.remove("sidebar-open");
  document.querySelectorAll<HTMLElement>("[data-ui-action='toggle-sidebar']").forEach((b) => {
    b.setAttribute("aria-expanded", "false");
  });
}

const ACTIONS: Record<Action, () => void> = {
  "toggle-theme": toggleTheme,
  "open-search": openSearch,
  "close-search": closeSearch,
  "toggle-sidebar": toggleSidebar,
  "close-sidebar": closeSidebar,
};

// Single click delegate. Buttons declare their intent via data-ui-action.
document.addEventListener("click", (e) => {
  const target = e.target instanceof Element ? e.target : null;
  if (!target) return;
  const actionEl = target.closest<HTMLElement>("[data-ui-action]");
  if (!actionEl) return;
  const action = actionEl.dataset.uiAction as Action | undefined;
  if (action && ACTIONS[action]) {
    e.preventDefault();
    ACTIONS[action]();
  }
});

// ⌘K / Ctrl+K opens (or closes) the search dialog from anywhere.
document.addEventListener("keydown", (e) => {
  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
    const dialog = document.querySelector<HTMLDialogElement>("[data-search-dialog]");
    if (!dialog) return;
    e.preventDefault();
    if (dialog.open) closeSearch();
    else openSearch();
  }
});

// Click outside the dialog's panel (i.e. on the ::backdrop area) closes it.
// `<dialog>` reports the backdrop click as a click with target === dialog itself.
document.addEventListener("click", (e) => {
  const dialog = e.target instanceof HTMLDialogElement ? e.target : null;
  if (dialog?.hasAttribute("data-search-dialog") && dialog.open) {
    // Only close if click is genuinely outside the visible panel.
    const rect = dialog.getBoundingClientRect();
    const inside =
      e.clientX >= rect.left && e.clientX <= rect.right && e.clientY >= rect.top && e.clientY <= rect.bottom;
    if (!inside) closeSearch();
  }
});

// Mobile: clicking a sidebar link closes the drawer.
document.querySelectorAll<HTMLAnchorElement>(".sidebar a").forEach((a) => {
  a.addEventListener("click", () => {
    if (window.matchMedia("(max-width: 960px)").matches) closeSidebar();
  });
});

// Esc closes the sidebar drawer (the dialog handles its own Esc natively).
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && document.documentElement.classList.contains("sidebar-open")) {
    closeSidebar();
  }
});
