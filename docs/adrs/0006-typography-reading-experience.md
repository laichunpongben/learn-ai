# ADR-0006 · Typography & reading experience

**Status:** Accepted
**Date:** 2026-05-21

## Context

The site is read by people who are new to AI and may be new to the conventions of technical reading. They open a lesson, scan for structure, then read sequentially. Two failure modes hurt their experience:

1. **Walls of undifferentiated text** — paragraphs run too wide, headings don't visually pop out of body text, so readers can't scan to orient before reading.
2. **Visual density on first impression** — the home page shows ~30 lesson cards across 8 tracks at once. New visitors don't know which card to start with; returning visitors don't need to see everything every time.

We need typography defaults that *minimize concurrent cognitive load* — let the reader process one concept at a time and find their place easily.

Before this ADR, the site shipped with a serviceable but unsystematic stack: Inter variable font, fluid base size, but a compressed heading scale (h3 = body) and a too-wide reading measure (~84 chars/line at 18px).

## Decision

Adopt the following typography defaults, applied via `src/styles/global.css`:

### Scale — modular, ratio ≈ 1.2 (minor third)

| Element | Size | Use |
|---|---|---|
| h1 | ~1.875rem (30px) | Page title, one per page |
| h2 | ~1.5rem (24px) | Major section |
| h3 | ~1.25rem (20px) | Sub-section, visibly bigger than body |
| h4 | ~1.0625rem (17px) | Minor heading, slightly heavier than body |
| body | 1rem (~16–18px fluid) | Anchor |

Body stays the anchor; every heading is unambiguously larger than the text it titles.

### Reading measure — 65 characters per line

`--read-w: 640px` (was 760px), giving ~67 chars at 18px and ~75 chars at 16px. Both endpoints sit inside Bringhurst's 45–75 character target, with the ideal value of 66 captured at the large-viewport endpoint.

Widgets (ChatSim, FakeTerminal, CoworkSim, code blocks, tables) sit outside the prose constraint and keep using the wider `main` width (1100px). They are reference material, not reading text.

### Vertical rhythm — proportional to size

Space-before each heading scales with its size:

| Element | Above | Below |
|---|---|---|
| p | 0.75rem | 0.75rem |
| h4 | 1.75rem | 0.4rem |
| h3 | 2rem | 0.4rem |
| h2 | 2.75rem | 0.6rem |
| h1 | 0.75rem | 0.4rem |

Paragraph margin (0.75rem) sits just above the heading-below margin (0.4rem) so consecutive paragraphs feel like one block, but the transition into a heading clearly resets the section.

### Color & contrast — already strong; UI vs prose distinction held

Token contrast against backgrounds (measured via WCAG relative-luminance):

| Token | Light | Dark |
|---|---|---|
| `--ink` | 19.1:1 | 17.2:1 |
| `--ink-soft` | 7.6:1 | 9.7:1 |
| `--ink-faint` | 5.2:1 | 5.6:1 |

All pass AA (4.5:1). `--ink-faint` is reserved for UI chrome (sidebar dots, footer labels, metadata pills) — not prose body. Long-form text uses `--ink` (full strength) or `--ink-soft` (the lede, captions).

### Font features — already optimal

`font-feature-settings: "cv11", "ss01", "ss03"` stays as-is:
- `cv11` — single-storey 'a' (slightly more legible at small sizes)
- `ss01`, `ss03` — Inter stylistic sets that smooth letterforms

No change; documented here so future contributors don't strip these accidentally.

### Home-page density — accordion track sections

Tracks the user hasn't started should collapse by default. **Start Here** and any track containing their next undone lesson stays open. Returning users keep their active tracks open. (Tracked separately in #65 — needs a small design pass before code.)

## Rationale

- **Readers scan, then read.** Without a hierarchy of size + space, scanning fails. The compressed scale (h3 ≡ body) forced readers to *read* to find structure. The 1.2 modular scale restores at-a-glance hierarchy.
- **Line length compounds with cognitive load.** Wider lines work for fiction or marketing copy where the reader is in flow. For technical learning, the reader is parsing each clause; shorter lines limit how much horizontal travel between thoughts.
- **Spacing matches hierarchy.** Paragraph spacing slightly larger than line-height (×1.1–1.2) gives the eye visible "blocks" of meaning, which the existing 0.6rem broke.
- **Don't touch what works.** Inter, the fluid base size, the dark-mode token system, and the OpenType stylistic sets are all sound choices made by the original author. The ADR records them so they don't drift away.

## Consequences

- Lessons will look slightly more "spacious" — same content, fewer pixels wasted.
- Long single-paragraph lessons may grow taller because of paragraph spacing — the trade is intentional: visual breathing room over screen real estate.
- Components that hardcoded their own `font-size: 0.9rem` / `0.85rem` will look slightly smaller relative to the new headings; that's intentional and matches the "widgets are secondary" framing.
- Anyone changing `--read-w` should re-measure characters per line at both font-size endpoints (`clamp(15.5px, …, 19px)`) and stay inside 50–75ch.

## Files of note

- `src/styles/global.css` — all of the above lives here
- `src/pages/index.astro` — home-page accordion (separate work)
- `src/components/LessonShell.astro` — wraps lesson body; relies on the scale

## Burn-down

- #62 — Type scale (modular 1.2)
- #63 — Reading measure (640px)
- #64 — Vertical rhythm
- #65 — Home page accordion (design pass first)
