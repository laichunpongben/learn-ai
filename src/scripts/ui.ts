/**
 * One owner per UI interaction. Imported once from Layout.astro.
 *
 *  - Theme: data-theme attribute on <html>, persisted in localStorage. The
 *    no-flash pre-paint apply is in Layout's <head> inline script.
 *  - Modal: native <dialog>. .showModal()/.close() handle visibility, focus
 *    trap, Esc key, and ::backdrop. No [hidden] attribute games.
 *  - Sidebar drawer: a single class on <html> toggles the mobile drawer.
 *
 * Buttons declare intent via data-ui-action="…". One click delegate dispatches
 * to one function. No per-component listeners, no onclick attributes.
 */

const THEME_KEY = "learn-ai.theme.v1";

type Action = "toggle-theme" | "open-search" | "close-search" | "toggle-sidebar" | "close-sidebar";

type Mode = "light" | "dark" | "auto";

function readMode(): Mode {
  try {
    const s = localStorage.getItem(THEME_KEY);
    if (s === "light" || s === "dark") return s;
  } catch {
    /* private mode */
  }
  return "auto";
}

function applyMode(m: Mode): void {
  if (m === "auto") {
    document.documentElement.removeAttribute("data-theme");
    try {
      localStorage.removeItem(THEME_KEY);
    } catch {
      /* ignore */
    }
  } else {
    document.documentElement.setAttribute("data-theme", m);
    try {
      localStorage.setItem(THEME_KEY, m);
    } catch {
      /* ignore */
    }
  }
}

const dialog = document.querySelector<HTMLDialogElement>("[data-search-dialog]");
const html = document.documentElement;

function toggleTheme(): void {
  // light → dark → auto → light
  const cur = readMode();
  applyMode(cur === "light" ? "dark" : cur === "dark" ? "auto" : "light");
}

function openSearch(): void {
  if (!dialog || dialog.open) return;
  dialog.showModal();
  (window as Window & { __searchRender?: () => void }).__searchRender?.();
}

function closeSearch(): void {
  if (dialog?.open) dialog.close();
}

function setSidebarToggleAria(open: boolean): void {
  for (const b of document.querySelectorAll<HTMLElement>("[data-ui-action='toggle-sidebar']")) {
    b.setAttribute("aria-expanded", String(open));
  }
}

function toggleSidebar(): void {
  if (html.classList.contains("sidebar-open")) closeSidebar();
  else {
    html.classList.add("sidebar-open");
    setSidebarToggleAria(true);
  }
}

function closeSidebar(): void {
  html.classList.remove("sidebar-open");
  setSidebarToggleAria(false);
}

const ACTIONS: Record<Action, () => void> = {
  "toggle-theme": toggleTheme,
  "open-search": openSearch,
  "close-search": closeSearch,
  "toggle-sidebar": toggleSidebar,
  "close-sidebar": closeSidebar,
};

document.addEventListener("click", (e) => {
  const target = e.target instanceof Element ? e.target : null;
  if (!target) return;

  // Backdrop click on the dialog (target === dialog itself, outside the panel rect).
  if (
    dialog?.open &&
    e.target === dialog &&
    !pointInside(e.clientX, e.clientY, dialog.getBoundingClientRect())
  ) {
    closeSearch();
    return;
  }

  const actionEl = target.closest<HTMLElement>("[data-ui-action]");
  const action = actionEl?.dataset.uiAction as Action | undefined;
  if (action && ACTIONS[action]) {
    e.preventDefault();
    ACTIONS[action]();
    return;
  }

  // Mobile: tapping a sidebar link closes the drawer.
  if (target.closest(".sidebar a") && window.matchMedia("(max-width: 960px)").matches) {
    closeSidebar();
  }
});

document.addEventListener("keydown", (e) => {
  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
    if (!dialog) return;
    e.preventDefault();
    if (dialog.open) closeSearch();
    else openSearch();
    return;
  }
  if (e.key === "Escape" && html.classList.contains("sidebar-open")) {
    closeSidebar();
  }
});

function pointInside(x: number, y: number, r: DOMRect): boolean {
  return x >= r.left && x <= r.right && y >= r.top && y <= r.bottom;
}
