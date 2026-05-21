# ADR-0009 · Screencasts complement simulators; they do not replace them

**Status:** Accepted
**Date:** 2026-05-21

## Context

ADR-0002 made interactive simulators (`ChatSim`, `FakeTerminal`, `CoworkSim`, `DesignSim`) the centerpiece of each product track — readers learn the *gesture* (slash menu, streaming, approval prompt) by driving a faithful imitation.

What the simulators deliberately do not show:

- **Real-product motion** in 2026 vintage — how fast Claude.ai actually streams, what a Cursor inline ghost actually animates like, what a Cowork queue transitions look like under load.
- **End-to-end outcomes** — the "from prompt to a real shipped artifact" arc that build-\* lessons describe but cannot demonstrate.

We considered:

- **A. Add long-form narrated explainer videos on every lesson.** Rejected: high production cost, content rot when real UIs shift, audio narration creates accessibility + translation surface area, and competes with the simulator for attention.
- **B. Ignore videos entirely.** Cohesive, but leaves the "is the simulator faithful?" question unanswered for every reader.
- **C. Two distinct video forms with one component.** Short silent loops (≤10s) on capability lessons; longer click-to-play walkthroughs on build-\* lessons. Both share infrastructure but serve different teaching goals.

## Decision

Take **C**. Add a single `<Screencast>` component with two modes:

- **`mode="loop"`** — autoplays, muted, loops, ≤10s, ≤800KB, self-hosted MP4 + WebM. Anchors a capability lesson to the real product's look.
- **`mode="walkthrough"`** — facade-loaded YouTube embed; iframe not requested until the user clicks the poster. Captions required (WCAG 1.2.2 A); transcript provided in a `<details>` below the player (WCAG 1.2.3 A).

Simulators remain the centerpiece. Screencasts sit below the lede and below the simulator on lessons that have both — they answer "what does it really look like?" *after* the reader has driven the imitation.

## Rationale

- **Cohesion with ADR-0002.** The simulator teaches the gesture; the loop confirms the look. Two artifacts, one teaching goal.
- **Cohesion with ADR-0006 (typography/reading).** Loops are short and below the fold; walkthroughs are facade-loaded with no iframe cost until clicked. Reading flow stays primary.
- **Performance budget.** A single self-hosted loop at 800KB ≈ the budget of one large screenshot. Walkthroughs cost nothing until clicked (the iframe + YouTube player JS load on demand, per `lite-youtube-embed` pattern).
- **Ages gracefully.** When the real Claude.ai or Cursor UI shifts in 2027, swap one MP4. Simulator + prose stay canonical.
- **Accessibility falls out.** Loops have no audio at all (bypasses SC 1.4.2 entirely). Walkthroughs have captions + transcript by construction — the registry rejects walkthroughs missing either.

## Consequences

- Two new dependencies on disk: `public/videos/loops/*.{mp4,webm,poster.png}` and the YouTube facade asset bundle. Both can be empty at first — slots render nothing when their registry entry is `status: "missing"`.
- A new content-authoring loop: recording, encoding, captioning. Documented in `CONTRIBUTING.md` (see ADR-0010 for the production workflow).
- Loops cannot carry audio. If a future lesson genuinely needs a narrated short clip, it becomes a `walkthrough`, not an extended loop.
- The simulator–screencast pair must stay consistent. If the simulator drifts from the real product faster than we re-record the loop, the loop becomes misleading. Mitigated by a `recordedAt` field in the registry — anything older than 12 months gets surfaced in `npm run videos:check`.

## Files of note

- `src/components/Screencast.astro` — the unified component
- `src/data/videos.ts` — registry of expected video slots
- `public/videos/loops/` — self-hosted loop assets
- `public/videos/posters/` — poster frames (shared by both modes)
- `scripts/verify-videos.mjs` — size + caption + transcript check
- `docs/adrs/0010-video-production-workflow.md` — the production runbook
