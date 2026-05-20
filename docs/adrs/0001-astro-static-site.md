# ADR-0001 · Astro as the static site framework

**Status:** Accepted
**Date:** 2026-05-21

## Context

We needed a web-based tutorial for Claude products targeting learners with zero AI knowledge. The site needs to be:

- Lightweight (low complexity, fast loading, easy to host anywhere)
- Replayable from a fresh state for a new joiner
- Resumable with saved progress for a returning learner
- Easy to extend with new lessons over time

Plausible options considered: plain HTML/CSS/JS, Vite + vanilla JS, Astro, Next.js, SvelteKit.

## Decision

**Astro 5.x as the static site framework.** No client-side routing, no SSR, no heavyweight client framework. Pages are server-rendered to static HTML at build time; client interactivity is provided by per-component inline `<script>` tags.

## Rationale

- **Content-first.** Astro is designed for mostly-static content sites with sprinkles of interactivity. Our lessons are exactly that.
- **No client framework tax.** Astro ships zero JS by default. Each page only loads the small interactive bits it actually uses.
- **MPA model fits.** Each lesson is its own page. Progress lives in localStorage so SPA navigation isn't needed.
- **Markdown/MDX optional.** We currently use `.astro` files but can adopt `.md`/`.mdx` for purely textual lessons later without rewriting.
- **Easy to host.** `npm run build` produces a `dist/` folder droppable on any static host (Cloudflare Pages, Netlify, Vercel, GitHub Pages).

## Consequences

- We pay a small upfront cost: a build step, a `node_modules`, an Astro learning curve.
- We get: type-checked components, a clean component model, and trivial deployment.
- We're constrained to per-page JS; large stateful flows would feel awkward — but the tutorial doesn't have those.
- The `define:vars` script directive requires `is:inline` for our use case (see component implementations).

## Files of note

- `astro.config.mjs`, `tsconfig.json`, `package.json`
- `src/layouts/Layout.astro` (single shared layout)
