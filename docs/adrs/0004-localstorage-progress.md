# ADR-0004 · Progress lives in localStorage, nowhere else

**Status:** Accepted
**Date:** 2026-05-21

## Context

The tutorial has two requirements that pull in opposite directions:

- **Replayable from a fresh state** — a new joiner sitting at the same machine should get a blank curriculum.
- **Resumable for a returning learner** — coming back tomorrow, the cards they finished should still be marked done, and there should be a "Continue where you left off" affordance.

Options considered:

1. **Server-side accounts** with login — handles "different person same device" via auth, but adds a backend, auth flows, hosting cost, privacy implications. Massive overkill for a tutorial.
2. **localStorage** — instantly resumable for a returning learner on the same browser; "fresh state" obtained via an explicit Reset button (the tutorial assumes a tutor/admin clears before handing the device to a new joiner).
3. **URL-based state** — share-friendly but ugly; one URL per progress state; doesn't survive new tabs nicely.

## Decision

**Store progress in `localStorage` under a single key (`learn-ai.progress.v1`).** Shape:

```ts
{ done: string[]; lastVisited?: string; startedAt?: string }
```

A "Reset progress" button on the homepage clears the key and fires a `ct:progress` custom event so live UI repaints. Each lesson page updates `lastVisited` on load; the homepage offers "Continue where you left off" (first lesson not in `done`).

## Rationale

- **Zero backend.** The whole site is a static build.
- **Privacy by default.** Nothing leaves the browser. Good fit for a learning context where users may be exploring sensitive topics.
- **One-click replay.** A new joiner inheriting the device clicks Reset; tutorial returns to day-zero state.
- **The `v1` key suffix** lets us migrate the schema later by reading both keys.

## Consequences

- **Per-device only.** A learner who switches devices loses progress. Acceptable for a 55-minute tutorial.
- **Per-browser only.** Chrome and Safari on the same Mac don't share progress. Acceptable.
- **No analytics.** We can't observe completion rates without adding something explicit (which we won't, by default — privacy).
- **Custom event coupling.** Components that need to repaint on progress changes subscribe to `ct:progress`. This is simple but means new interactive components must remember to dispatch / listen.

## Files of note

- `src/scripts/progress.ts` (helpers — currently only used server-side / for type definitions; client code inlines the read/write to avoid extra module overhead)
- `src/components/ProgressBar.astro` (the bar + Reset button)
- `src/components/MarkDone.astro` (per-lesson toggle)
- `src/components/LessonShell.astro` (sets `lastVisited` on every lesson load)
- `src/pages/index.astro` (computes "Continue where you left off")
