# ADR-0007 · Learning curve & critical path

**Status:** Accepted
**Date:** 2026-05-21

## Context

The site targets people new to AI assistants — explicitly per ADR-0001 ("learners with zero AI knowledge"). The curriculum has grown to 30 lessons across 8 tracks totalling ~3 hours of read-time before the first "Ship something" build. The default home-page flow (Start the tour → Continue → Continue) walks the learner through every lesson in source order.

For a true zero-knowledge beginner, that's the wrong scale of commitment to ask for upfront. They want to *try* AI tools first and decide whether to invest hours later. Several specific frictions:

1. **Foundations track is bloated.** It contains 9 lessons (~43 min) including advanced concepts like RAG, evals, multimodal, MCP. The track's own tagline only promises three. (Issue #86.)
2. **No "30-minute path" signposted.** Critical-path lessons (welcome, capabilities, prompt, safety, chat-first, build-writing) get the same visual weight as advanced ones (concept-rag, agents-setup). (Issue #87.)
3. **Lede uses jargon.** "Coding CLI, cloud agent, self-hosted agent" — terms a beginner does not know. (Issue #88.)
4. **Track order is advanced-mid, easy-late.** Cloud (parallel agents) and Agents (self-hosted) sit between Code and Design; Design and Ship are after both. (Issue #89.)
5. **Build paths don't telegraph difficulty.** Five paths from 10–30 min, ranging "writing in a chat app" to "Cowork Pro/Max", listed equally. (Issue #90.)

We need an explicit framing that distinguishes the *minimum viable tour* from the *complete reference curriculum*.

## Decision

Adopt a **two-tier learning path model**:

### Tier 1 — Critical path (~30 min including a real build)

A named, ordered sequence of 6-7 lessons that gets a zero-knowledge beginner from "what is AI?" to "I shipped a small thing":

```
welcome → capabilities → concept-prompt → concept-safety
  → chat-first → ship-it → build-writing
```

This is what the home page *advertises* and what the "Continue →" button prefers to advance. The full curriculum stays available for deep exploration but isn't the default narrative.

### Tier 2 — Full curriculum (~3 hours + builds)

Everything else. Tracks reordered to ease the learner up the difficulty curve:

```
Start Here → Foundations → Chat → Code → Design
  → Going deeper → Cloud → Agents → Ship
```

- **Foundations** slimmed to truly foundational lessons (prompt, safety, CLI/git when going to code). (Issue #86.)
- **Going deeper** is a new track holding MCP, cost, multimodal, RAG, evals — placed after the easy interactive tracks where it functions as "now that you've used the tools, here's the theory." (Issue #86, #89.)
- **Cloud and Agents** move to the end of the curriculum, where their assumed prerequisites are met. (Issue #89.)
- **Ship Something** stays terminal, with its 5 build paths ranked by friction so the recommended first build is obvious. (Issue #90.)

### Tier 3 — Anti-tier (out of scope)

We do not build:
- Branching paths beyond the critical-path / full-curriculum split. Two tiers is the cognitive limit before the home page becomes a UX puzzle.
- Per-user progress AI that recommends what to do next. The "Continue →" button is the recommendation; smarter recommendations are a research project, not a tutorial.
- Pre-tests / placement quizzes. Nobody who self-identifies as zero-knowledge wants to take a test before starting.

## Rationale

- **Two tiers, not a tree.** Branching curricula are hard to maintain and confuse learners. A single named "critical path" plus an "or, browse everything" affordance preserves agency without sprawl.
- **Foundations means foundational.** RAG and evals are theory for builders; a learner who has never used a chat app does not need them. They earn the "deeper" label.
- **Track order is a recommendation.** Even with the home page accordion (PR #76) collapsing tracks, source order signals priority. Ordering by friction respects that.
- **The shortest route still includes a build.** The critical path ends at `build-writing` (10 min, no install). Reading lessons alone doesn't satisfy a learner; making something does.

## Consequences

- **Curriculum data needs a `criticalPath: LessonId[]` array** that the home page reads.
- **TRACKS gets a new entry** (`going-deeper`) and one reordering pass.
- **Several lessons change tracks** (`concept-mcp`, `-cost`, `-multimodal`, `-rag`, `-evals` move from `concepts` → `going-deeper`). Their `slug:` stays the same, so existing URLs and search results don't break.
- **Sidebar order changes** automatically once the track array is reordered; no separate edit needed.
- **The "Continue →" button** still works lesson-by-lesson but should respect the critical path when the user is on it (and hasn't deviated). The simplest first cut: if the next-undone lesson is in `criticalPath` and the user hasn't completed the path yet, label the button "Continue critical path →" instead of "Continue →".
- **Existing lesson content stays untouched.** This ADR is about *navigation*, not rewriting lessons.

## Files of note

- `src/data/curriculum.ts` — TRACKS reorder, track-id reassignments, new `CRITICAL_PATH` constant
- `src/pages/index.astro` — surface the critical path
- `src/pages/lessons/ship-it.astro` — order build paths by friction (Issue #90)
- `src/components/Sidebar.astro` — picks up new track order from data, no edit needed

## Burn-down

- #86 — Split Foundations into Foundations + Going deeper
- #87 — Critical-path callout on home page
- #88 — Beginner-friendlier lede
- #89 — Track order rework (depends on #86)
- #90 — Rank build paths by friction in ship-it
