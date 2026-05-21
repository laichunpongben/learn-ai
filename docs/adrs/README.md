# Architecture Decision Records

Why we built this tutorial the way we did. One file per decision. Decisions accumulate; we don't rewrite history when the context changes — we add a superseding ADR.

## Format

Each ADR is a short Markdown file with:

- **Status:** Proposed / Accepted / Superseded by ADR-NNNN
- **Context:** the problem and constraints when the decision was made
- **Decision:** what we chose
- **Consequences:** what becomes easier, harder, or different as a result

## Index

| #    | Title                                          | Status     |
|------|------------------------------------------------|------------|
| 0001 | [Astro static site, no build framework beyond it](./0001-astro-static-site.md) | Accepted |
| 0002 | [Tutorial centered on product imitations](./0002-product-imitations-as-core.md) | Accepted (supersedes part of 0001) |
| 0003 | [Scope includes open-source agents on top of Claude](./0003-open-source-agents-in-scope.md) | Accepted |
| 0004 | [Progress persisted in localStorage only](./0004-localstorage-progress.md) | Accepted |
| 0005 | [Repurposed to generic AI/agent scope](./0005-generic-ai-scope.md) | Accepted (supersedes Claude-only framing of 0001–0003) |
| 0006 | [Typography & reading experience](./0006-typography-reading-experience.md) | Accepted |
| 0007 | [Learning curve & critical path](./0007-learning-curve-critical-path.md) | Accepted |
| 0008 | [Lesson hero banner — remove, do not redesign](./0008-lesson-hero-banner.md) | Accepted |
| 0009 | [Screencasts complement simulators](./0009-screencast-strategy.md) | Accepted |
| 0010 | [Video production: loops + YouTube facade](./0010-video-production-workflow.md) | Accepted |
| 0011 | [Installable, offline-first PWA](./0011-pwa-offline-first.md) | Accepted |
