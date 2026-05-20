# ADR-0005 · Repurposed from "Learn Claude" to a generic AI/agent tour

**Status:** Accepted
**Date:** 2026-05-21
**Supersedes (partial):** The vendor-specific framing implied by ADR-0001, ADR-0002, ADR-0003.

## Context

The tutorial was originally scoped to **Anthropic's Claude product family** plus the open-source agents that wrap Claude. While useful, this is a vendor-locked frame: a new joiner who picks up the tutorial would walk away thinking the AI landscape is roughly "Claude and its add-ons."

In reality every category we teach has multiple healthy products:

- **Chat:** ChatGPT, Claude.ai, Gemini, Perplexity, Mistral Le Chat
- **Coding CLI / editor:** Cursor, Claude Code, Codex CLI, Windsurf, GitHub Copilot, Continue, Cline, aider
- **Cloud agents:** Devin, Claude Cowork, Copilot Workspace, Codex Cloud, OpenHands (cloud)
- **UI generators:** v0.dev, Lovable, Bolt.new, Claude Design, Galileo
- **Open-source autonomous agents:** Hermes, OpenClaw, aider, OpenHands, Goose, AutoGen, crewAI, Continue, Cline
- **LLM APIs:** OpenAI, Anthropic, Google Gemini, Mistral, DeepSeek, OpenRouter (aggregator)

We want the tutorial to be **useful regardless of which product the learner ends up using** — and to surface the fact that they have choices.

## Decision

**Reframe lessons category-first, with multiple example products per category.** Concretely:

- **Brand:** "Learn Claude" → "Learn AI". Tagline: "A hands-on tour of AI assistants."
- **Tracks renamed** from product names to categories:
  - "Claude.ai — Chat" → "Chat assistants"
  - "Claude Code — Coding" → "Coding assistants"
  - "Claude Cowork — Parallel Work" → "Cloud agents (parallel)" — new track id `cloud`
  - "Claude Design — Visual UI" → "Visual UI generators"
  - "Beyond Anthropic's apps" → "Open-source autonomous agents"
- **Each lesson** lists representative real products near the top, with a short comparison table where helpful.
- **API lesson** covers OpenAI + Anthropic + Google + Mistral + DeepSeek + OpenRouter, not just Anthropic.
- **Simulators are unchanged** — they remain category-archetype imitations (a chat UI, a CLI, a cloud-agent dashboard, a UI canvas). Specific brand details inside simulators are kept generic.

## Rationale

- **Honest framing.** Naming actual competing products is more useful than a single-vendor narrative.
- **Future-proof.** The category shapes (chat, CLI, cloud agent, UI canvas, autonomous agent) are stable; specific products will shuffle.
- **Audience-fit.** A new joiner with zero AI knowledge needs to understand the *map* first; the specific product is a downstream choice.
- **Anthropic-friendly retained.** Claude, Claude Code, Cowork, and Design are still named as headline examples in each category — we don't strip them; we contextualise them.

## Consequences

- **Some lesson IDs / slugs retain old names** (`chat-first`, `code-slash`, `cowork-flow`) for URL stability — only titles and content changed.
- **More content rot risk** in the agents-landscape and API lessons (vendors move). Mitigated by linking to canonical docs.
- **Vendor-neutral cookbook.** Each recipe now lists the category of tool ("any coding CLI", "any chat app") rather than a single brand.
- **The visual identity stays restrained and monochrome** — no need to lean on any single vendor's brand palette.

## Files of note

- `src/data/curriculum.ts` — track/lesson titles and the new `cloud` track id
- `src/layouts/Layout.astro` — brand "Learn AI"
- `src/components/ProductRow.astro` — multi-product subtext per category
- All lesson pages — rewritten to be category-first
- `src/pages/lessons/agents-api.astro` — multi-provider
- `src/pages/lessons/agents-landscape.astro` — broader ecosystem list
- `src/pages/cookbook.astro` — recipes labelled by category
