# Learn AI — codebase architecture

Notes for future contributors (human or AI). These rules exist because
breaking them caused real production bugs that took multiple rounds to find.

## UI architecture rules

### 1. CSS that depends on a *global* attribute belongs in `global.css`

The `[data-theme="dark"]` attribute lives on `<html>`. Astro's CSS scoping
appends a per-component scope marker (`[data-astro-cid-xxx]`) to every
selector in a `<style>` block. That breaks rules like:

```css
/* In a component <style> — Astro turns this into                     */
[data-theme="dark"] .icon { display: none; }
/* ↓                                                                  */
[data-astro-cid-xxx][data-theme="dark"] .icon[data-astro-cid-xxx] { ... }
/* The <html> element has [data-theme="dark"] but NOT the scope marker, */
/* so the rule never matches. Bug confirmed in production.            */
```

**Rule:** anything that selects on `[data-theme]`, `html.<class>`, or any
other global state attribute lives in `src/styles/global.css`. Component
`<style>` blocks should only contain rules that scope to the component's
own DOM.

### 2. Modals use the native `<dialog>` element

Do **not** roll a custom modal with `position: fixed; inset: 0` and a
`hidden` attribute. The UA stylesheet's `[hidden] { display: none }` and
your `display: flex` have **equal specificity** — source order wins, and
your custom rule comes later, so the "hidden" overlay quietly absorbs
every click on the page. This was a real bug.

`<dialog>` solves it for free:
- `.showModal()` / `.close()` toggle visibility correctly.
- UA stylesheet handles `display: none` when closed.
- ESC closes it. Focus is trapped.
- `::backdrop` styles the dim area.

See `src/components/SearchPalette.astro` for the pattern.

### 3. One UI interaction = one handler. Always.

Buttons declare intent with `data-ui-action="…"`. The single delegate in
`src/scripts/ui.ts` listens for clicks on `[data-ui-action]` and dispatches
to the matching function.

**Do not** also add an `onclick="…"` attribute on the same button. Do not
add a per-component `addEventListener("click", …)` for the same button.
Multiple handlers on the same effect = double-toggle = the effect appears
to not work at all.

### 4. No-flash inline script does ONE thing

The inline `<script is:inline>` in `<head>` only applies the stored theme
attribute. It must run before paint to avoid a flash, but it must not
contain any of the interaction logic — that belongs in `ui.ts` which is
bundled, type-checked, and lint-checked.

## File layout

```
src/
├── data/curriculum.ts           — single source of truth for lessons + tracks
├── styles/global.css            — ALL global rules (theme vars, dark mode overrides,
│                                  layout, print, header, sidebar, hamburger, toggle)
├── scripts/
│   ├── ui.ts                    — owner of every UI interaction
│   └── progress.ts              — localStorage progress helpers
├── components/
│   ├── *.astro                  — markup + component-local styles
│   └── (no component owns a global interaction)
├── layouts/Layout.astro         — app shell. <head> = no-flash; <body> ends with
│                                  <script>import "../scripts/ui";</script>
└── pages/                       — one file per route
```

## Testing the UI

For any UI-state bug (theme, modal, sidebar, focus, hidden visibility):
**verify in a real browser, not happy-dom**. happy-dom and jsdom do not
faithfully apply the UA stylesheet or run native element behaviors.

`scripts/verify-ui.mjs` is the canonical harness — connect to a Chrome
running with `--remote-debugging-port=9333`, drive the actual buttons,
assert post-state. `document.elementFromPoint()` inside that script
catches click-occlusion bugs that `[hidden]` rules can't express. Run
with `npm run smoke` after `npm run preview &`.

## CI

- `npm run check` — `astro check` types
- `npm run lint` — Biome
- `npm run test` — Vitest unit tests
- `npm run build` — production build
- `npm run ci` — all four locally

CI workflow in `.github/workflows/ci.yml` runs all four in parallel on
every push and PR. Deploy to Cloudflare Pages is gated on CI success
(`.github/workflows/deploy.yml` uses `workflow_run`).
