# ADR-0002 · Product imitations are the center of each lesson

**Status:** Accepted
**Date:** 2026-05-21
**Supersedes (partial):** The original ADR-0001 framing of "lessons are mostly prose with a small interactive sprinkle."

## Context

After an initial pass with prose-heavy lessons and modest interactive widgets, we observed two issues:

1. **The tutorial described products instead of teaching the user to use them.** A new joiner could finish all lessons and still feel uncertain about what claude.ai or Claude Code actually felt like in practice.
2. **Real interfaces have specific muscle memory** — slash menus, streaming, artifact panels, approval prompts. Reading about them is not the same as driving them.

We want learners to leave with the *feel* of each product, so when they open the real thing the interaction model is already familiar.

## Decision

**Each product track is anchored on a playable imitation of the real UI.** Prose is supporting material; the simulator is the centerpiece.

Concretely:

- `ChatSim.astro` — claude.ai imitation: sidebar of past chats, centered conversation, streaming token-by-token replies, suggestion chips, artifact panel that opens on the right when the prompt asks for something self-contained.
- `FakeTerminal.astro` — Claude Code imitation: working-directory line, streaming output, slash menu with arrow-key navigation + filtering, "Claude wants to do this — Allow / Deny" approval prompts.
- `CoworkSim.astro` — Cowork imitation: task list with status pills, parallel "Run all" with state transitions (queued → running → done → merged), inline diff viewer, approve/comment/discard actions.
- `DesignSim.astro` — Claude Design imitation: prompt textarea, variant chips, live preview canvas, style switcher (warm/dark/brutalist), "copy code" affordance.

## Rationale

- **Imitation is the highest-bandwidth teaching for UI muscle memory.** Reading a screenshot description teaches nothing about how a streaming response feels; clicking through one teaches everything.
- **Reproducible and offline-friendly.** No API calls, no rate limits, no auth — the tutorial works for a brand-new joiner who hasn't created an account yet.
- **Lower content-rot risk.** When the real products change, our prose ages — but the gross shape (slash menu, artifacts, diffs, canvas) is far more stable than specific UI text.

## Consequences

- The simulators are non-trivial to build and maintain. We accept the cost because of the teaching leverage.
- Each simulator must be honest: we keep the gestures real, even when the underlying logic is canned pattern-matched responses.
- Prose now serves the simulator: "try this; here's why it matters; here's what the real app adds."
- If a real product UI evolves significantly, the imitation needs an update. We've kept simulators in self-contained `.astro` components to make this easy.

## Files of note

- `src/components/ChatSim.astro`, `FakeTerminal.astro`, `CoworkSim.astro`, `DesignSim.astro`
- Lessons that prominently use them: `chat-first`, `chat-artifacts`, `code-slash`, `cowork-flow`, `design-first`, `welcome`
