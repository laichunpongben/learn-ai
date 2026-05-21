# ADR-0008 · Lesson hero banner — remove, do not redesign

**Status:** Accepted
**Date:** 2026-05-21

## Context

Twenty of thirty lessons rendered a `<LessonHero>` block — a ~180px tall card containing one large `<ProductIcon>` (the chat/code/cowork/design/agents/ship/claude marks) over a dotted-grid background. It sat between the lede paragraph and the first real heading.

In user-test terms it was *visual noise above the fold*:

1. It conveyed no information the reader didn't already have. Track identity is already declared via the `<span class="track-pill">` on the line above the `<h1>`; the icon is the same one shown in the home-page track header.
2. It pushed the first scannable heading off the viewport on every laptop-sized screen, increasing the "where do I start?" gap on every lesson open.
3. It made every lesson page look like a marketing landing page — at odds with the rest of the site's "scannable content first" feel that ADR-0006 codifies.

We considered three responses:

- **A. Remove the banner entirely.** Track-pill stays; nothing new added.
- **B. Replace it with informational content.** Per-lesson "What you'll learn" bullets / prerequisites / time-to-complete pill. Requires content authoring on 20 lessons.
- **C. Replace it with a topical webreel.** A short HTML animation that previews the topic (e.g., a chat bubble exchange for `chat-first`, a terminal typing for `code-install`). Cheap to author the *first* one; quickly becomes 20 hand-crafted animations with their own maintenance.

## Decision

Take **A** now. Defer **B** as a possible follow-up; rule out **C**.

`LessonHero.astro` is removed. The `hero` prop on `LessonShell` is removed. All twenty lesson pages drop their `hero="…"` attribute. `ProductIcon` stays — it's still used elsewhere (sidebar, home page, ship-it cards).

## Rationale

- **A buys back ~180px of above-the-fold on every lesson** without losing any signal. The track-pill, lede, and first `<h2>` are now all visible on a 13" MacBook viewport.
- **B is the *theoretically* right answer**, but only if the bullets are real. A "What you'll learn" block populated with fluff (the lesson's own subheadings restated) is worse than nothing — it eats space and breaks reader trust. Authoring genuinely useful outcomes for 20 lessons is content work, not a build task, and isn't blocked by this PR. If we revisit, the new block goes where the hero was.
- **C — webreels — is too sharp a tool for this job.** A 20-animation library would need its own design system, performance budget per page, and per-asset accessibility (reduced-motion fallbacks). The pay-off is delight, not comprehension; the cost is real. We have `/webreel` available and might reach for it on a single high-stakes page (e.g. the home hero), but not at this scale.

## Consequences

- Lesson pages lose a visual landmark; that's the goal. Track identity remains visible via the pill.
- The 7-variant `ProductIcon` (`kind="claude" | …`) shrinks in importance but is not deleted — it's still on track headers (sidebar + home), ship-it cards, and elsewhere. Future contributors should *not* add the icon back into the lesson body without an explicit content rationale.
- Tests that snapshotted "lesson has a hero banner" must be loosened. (None today — verified via grep.)
- If the lesson body now feels too dense at the top, the right fix is a real "What you'll learn" block (Option B), not a decorative element.

## Files of note

- `src/components/LessonHero.astro` — deleted
- `src/components/LessonShell.astro` — `hero` prop removed
- `src/pages/lessons/*.astro` — twenty pages lose their `hero="…"` attribute
- `src/components/ProductIcon.astro` — unchanged

## Burn-down

- This PR — remove the hero.
- Possible follow-up — "What you'll learn" block (Option B) if user research shows the missing landmark is actively hurting comprehension. Out of scope until that signal exists.
