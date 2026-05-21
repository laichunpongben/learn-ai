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
  if (m === "auto") document.documentElement.removeAttribute("data-theme");
  else document.documentElement.setAttribute("data-theme", m);
  try {
    if (m === "auto") localStorage.removeItem(THEME_KEY);
    else localStorage.setItem(THEME_KEY, m);
  } catch {
    /* private mode / disabled storage */
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

function isTypingTarget(t: EventTarget | null): boolean {
  const el = t instanceof Element ? t : null;
  if (!el) return false;
  if (el.closest("input, textarea, select, [contenteditable='true']")) return true;
  return false;
}

function navigateTo(selector: string): void {
  const link = document.querySelector<HTMLAnchorElement>(selector);
  if (link?.href) window.location.assign(link.href);
}

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
    return;
  }

  // Plain-key shortcuts only fire when the user isn't typing into a field
  // and no modifiers are held — keeps them out of the way of system bindings.
  if (e.metaKey || e.ctrlKey || e.altKey || isTypingTarget(e.target)) return;
  if (dialog?.open) return;

  if (e.key === "n") navigateTo("[data-nav-next]");
  else if (e.key === "p") navigateTo("[data-nav-prev]");
  else if (e.key === "/" && dialog) {
    e.preventDefault();
    openSearch();
  }
});

function pointInside(x: number, y: number, r: DOMRect): boolean {
  return x >= r.left && x <= r.right && y >= r.top && y <= r.bottom;
}

const progressFill = document.querySelector<HTMLElement>("[data-read-progress] > span");
if (progressFill) {
  let raf = 0;
  function paintProgress(): void {
    raf = 0;
    const doc = document.documentElement;
    const max = doc.scrollHeight - doc.clientHeight;
    const pct = max > 0 ? Math.min(100, (doc.scrollTop / max) * 100) : 0;
    progressFill!.style.width = `${pct}%`;
  }
  function schedule(): void {
    if (raf) return;
    raf = requestAnimationFrame(paintProgress);
  }
  document.addEventListener("scroll", schedule, { passive: true });
  window.addEventListener("resize", schedule);
  paintProgress();
}
