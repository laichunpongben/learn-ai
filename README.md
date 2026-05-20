# Learn AI

A hands-on, replayable tour of modern AI assistants — for someone with zero AI knowledge.

Sixteen short lessons across the major categories:

- **Foundations** — CLI, git, MCP
- **Chat assistants** — ChatGPT, Claude.ai, Gemini, Perplexity
- **Coding assistants** — Cursor, Claude Code, Codex CLI, aider
- **Cloud agents** — Devin, Cowork, Copilot Workspace
- **Visual UI generators** — v0.dev, Lovable, Bolt
- **Open-source autonomous agents** — Hermes, OpenClaw, aider, OpenHands

Each lesson centres on a **faithful, playable imitation** of the real product (chat / terminal / task dashboard / canvas) and ends with a "now try it in the real thing" link. The capstone has three **guided end-to-end builds** — a custom writing assistant, a live webpage, or a personal Python CLI — each a step-by-step walkthrough with copy-pasteable prompts.

## Run it

```sh
npm install
npm run dev      # http://localhost:4321
npm run build    # static output → dist/
```

Requires Node 18+. The site is a fully static Astro 5 build — drop `dist/` on any host.

## How progress works

- Progress is saved per browser in `localStorage` under `learn-ai.progress.v1` (lessons) and `learn-ai.build.<id>.v1` (per-build step state).
- **Replayable.** A "Reset progress" button on the homepage clears state for a new joiner.
- **Resumable.** A returning learner sees a "Continue where you left off" button pointing at the first lesson not yet done.
- Nothing leaves the browser.

## Project layout

```
src/
  data/curriculum.ts          # tracks + lessons (single source of truth)
  layouts/Layout.astro        # app shell: sticky header, sidebar, footer
  components/
    Sidebar.astro             # full curriculum nav with progress dots
    ChatSim.astro             # claude.ai-style chat imitation
    FakeTerminal.astro        # coding-CLI imitation, arrow-nav slash menu
    CoworkSim.astro           # cloud-agent task dashboard
    DesignSim.astro           # UI generator (prompt → canvas)
    BuildStepper.astro        # checklist component for guided builds
    Step.astro                # individual step card
    PromptCopy.astro          # copy-to-clipboard prompt block
    OpenIn.astro              # "open this real tool" link tile
    ...
  pages/
    index.astro               # curriculum + progress
    cookbook.astro            # copy-paste recipes
    lessons/
      welcome.astro
      capabilities.astro
      concept-cli.astro
      concept-git.astro
      concept-mcp.astro
      chat-first.astro · chat-projects.astro · chat-artifacts.astro
      code-what.astro · code-install.astro · code-slash.astro
      cowork-what.astro · cowork-flow.astro
      design-first.astro · design-iterate.astro
      agents-landscape.astro · agents-api.astro · agents-setup.astro
      ship-it.astro             # capstone chooser
      build-writing.astro       # guided build A — writing assistant
      build-webpage.astro       # guided build B — webpage with deploy
      build-script.astro        # guided build C — Python CLI via coding CLI
docs/adrs/                    # architecture decision records
```

## Architecture decisions

Captured in [`docs/adrs/`](docs/adrs/):

1. [Astro static site](docs/adrs/0001-astro-static-site.md)
2. [Product imitations as the core of each lesson](docs/adrs/0002-product-imitations-as-core.md)
3. [Open-source agents in scope](docs/adrs/0003-open-source-agents-in-scope.md)
4. [Progress in localStorage only](docs/adrs/0004-localstorage-progress.md)
5. [Repurposed to generic AI/agent scope](docs/adrs/0005-generic-ai-scope.md)

## License

MIT.
