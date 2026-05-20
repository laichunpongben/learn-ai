# ADR-0003 · Open-source agents on top of Claude are in scope

**Status:** Accepted
**Date:** 2026-05-21

## Context

The initial tutorial scope was "Anthropic's four polished products" (chat, code, cowork, design). User feedback during development surfaced a gap: a non-trivial fraction of the audience will need to set up open-source agents that use Claude under the hood — Hermes Agent (Nous Research), OpenClaw, aider, OpenHands, Continue, Cline, Goose. These wrap the Claude API with different surfaces: background daemons, multi-agent runtimes, IDE plugins, persistent-memory assistants.

A learner who only learns Anthropic's apps will be blocked the moment they hit a use case the apps don't cover well — e.g. "I need an agent that runs on a schedule and remembers things across sessions."

## Decision

**Add a dedicated track ("Beyond Anthropic's apps — Open-source agents") with three lessons:**

1. **`agents-landscape`** — what each project is, when to pick which, decision rules.
2. **`agents-api`** — the Claude API basics, so the learner understands what *every* third-party setup is wiring up under the hood.
3. **`agents-setup`** — a worked installation of Hermes Agent (since it has a clear two-path install: as a Claude Code plugin, or standalone via curl), with OpenClaw mentioned as a parallel.

## Rationale

- **One API teaches all setups.** Once you understand "get a key, set an env var, optionally pick a model," every third-party agent's docs become trivial. We use that as the spine of the track.
- **Hermes was the cleanest worked example.** Two install paths (plugin and curl), clear setup wizard, well-documented, and uses Claude Code's credential store on the plugin path.
- **We named projects by name** (OpenClaw, Hermes, aider, OpenHands, Continue, Cline, Goose) rather than describing them generically. The names move fast, but specificity is more useful than vagueness for a learner.
- **We did not deep-dive each project.** That would balloon the tutorial. We give enough to pick one and follow its README.

## Consequences

- The track adds ~14 minutes to the total tour (~55 min total).
- We accept some content-rot risk: setup commands for fast-moving open-source projects may drift. We mitigate by linking to canonical docs (`docs.openclaw.ai`, `github.com/NousResearch/hermes-agent`) and explicitly saying "see the project's docs for the current install command."
- We avoid endorsing any single project as "the" choice — they serve different use cases.

## Files of note

- `src/data/curriculum.ts` (track + 3 lessons added)
- `src/pages/lessons/agents-landscape.astro`
- `src/pages/lessons/agents-api.astro`
- `src/pages/lessons/agents-setup.astro`
