export type TrackId =
  | "start"
  | "concepts"
  | "going-deeper"
  | "chat"
  | "code"
  | "cloud"
  | "design"
  | "agents"
  | "ship";

export interface Lesson {
  id: string;
  slug: string;
  title: string;
  blurb: string;
  minutes: number;
  track: TrackId;
}

export interface Track {
  id: TrackId;
  title: string;
  tagline: string;
  accent: string;
}

// Tracks are ordered to ease the learner up the difficulty curve:
// easy interactive tracks (chat → code → design) come before the more
// theoretical "going-deeper" and advanced agent tracks. See ADR-0007.
export const TRACKS: Track[] = [
  {
    id: "start",
    title: "Start Here",
    tagline: "What modern AI assistants are, and what you can build with them.",
    accent: "#f0a05a",
  },
  {
    id: "concepts",
    title: "Foundations",
    tagline: "What every AI tutorial assumes you know — prompt, CLI, git, safety.",
    accent: "#b07a3a",
  },
  {
    id: "chat",
    title: "Chat assistants",
    tagline: "ChatGPT, Claude.ai, Gemini, Perplexity, Mistral Le Chat.",
    accent: "#d4895a",
  },
  {
    id: "code",
    title: "Coding assistants",
    tagline: "Cursor, Claude Code, Codex CLI, Antigravity, Windsurf, GitHub Copilot.",
    accent: "#7a9eaf",
  },
  {
    id: "design",
    title: "Visual UI generators",
    tagline: "v0.dev, Lovable, Bolt, Claude Design, Galileo.",
    accent: "#c97b8a",
  },
  {
    id: "going-deeper",
    title: "Going deeper",
    tagline: "MCP, cost, multimodal, RAG, evals — theory you'll want once you've used the tools.",
    accent: "#a08855",
  },
  {
    id: "cloud",
    title: "Cloud agents (parallel)",
    tagline: "Devin, Claude Cowork, Copilot Workspace, Codex Cloud.",
    accent: "#9e8aac",
  },
  {
    id: "agents",
    title: "Open-source autonomous agents",
    tagline: "Hermes, OpenClaw, nanoclaw, aider, OpenHands — agents you self-host.",
    accent: "#5b9aa0",
  },
  {
    id: "ship",
    title: "Ship Something",
    tagline: "Pick one. Build it. Keep it.",
    accent: "#5a8f7a",
  },
];

export const LESSONS: Lesson[] = [
  {
    id: "welcome",
    slug: "welcome",
    title: "What AI assistants are, in 3 minutes",
    blurb: "The shortest possible intro. No jargon.",
    minutes: 3,
    track: "start",
  },
  {
    id: "capabilities",
    slug: "capabilities",
    title: "What can you actually build?",
    blurb: "A capability map — from a doc to a deployed app.",
    minutes: 4,
    track: "start",
  },
  {
    id: "concept-prompt",
    slug: "concept-prompt",
    title: "Writing prompts that work",
    blurb: "The shape of a good prompt. Iterate; don't restart. The one skill that compounds.",
    minutes: 5,
    track: "concepts",
  },
  {
    id: "concept-cli",
    slug: "concept-cli",
    title: "The CLI / terminal",
    blurb: "A text window where you tell your computer what to do. Where most AI tools live.",
    minutes: 4,
    track: "concepts",
  },
  {
    id: "concept-git",
    slug: "concept-git",
    title: "Git — your AI safety net",
    blurb: "Version control as 'undo for your whole project'. Essential when AI edits files.",
    minutes: 4,
    track: "concepts",
  },
  {
    id: "concept-safety",
    slug: "concept-safety",
    title: "Hallucinations, leaks, and what AI can't do",
    blurb: "The five failure modes every AI user should know — and how to defend against them.",
    minutes: 5,
    track: "concepts",
  },
  {
    id: "chat-first",
    slug: "chat-first",
    title: "Drive a chat assistant",
    blurb: "ChatGPT, Claude.ai, Gemini all share this shape. Try the imitation.",
    minutes: 3,
    track: "chat",
  },
  {
    id: "chat-projects",
    slug: "chat-projects",
    title: "Projects, GPTs, Gems — custom assistants",
    blurb: "Drop in files + instructions to make a focused helper for one job.",
    minutes: 3,
    track: "chat",
  },
  {
    id: "chat-artifacts",
    slug: "chat-artifacts",
    title: "Artifacts and canvases",
    blurb: "When the assistant produces a thing it pops into a side panel.",
    minutes: 3,
    track: "chat",
  },
  {
    id: "code-what",
    slug: "code-what",
    title: "What coding assistants do",
    blurb: "An AI pair programmer that reads, edits, and runs your code.",
    minutes: 4,
    track: "code",
  },
  {
    id: "code-install",
    slug: "code-install",
    title: "Install and first run",
    blurb: "Most CLIs follow the same install pattern.",
    minutes: 4,
    track: "code",
  },
  {
    id: "code-slash",
    slug: "code-slash",
    title: "Slash commands, agents, skills",
    blurb: "Drive a pretend coding-CLI session.",
    minutes: 4,
    track: "code",
  },
  {
    id: "code-skills",
    slug: "code-skills",
    title: "Skills — recipes your assistant loads on demand",
    blurb:
      "A folder of markdown that teaches your CLI a procedure. Auto-triggered by description, model-loaded as needed.",
    minutes: 5,
    track: "code",
  },
  {
    id: "design-first",
    slug: "design-first",
    title: "Sentence in, screen out",
    blurb: "Describe a UI in plain English, see it rendered.",
    minutes: 3,
    track: "design",
  },
  {
    id: "design-iterate",
    slug: "design-iterate",
    title: "Iterating: variants and refinement",
    blurb: "Swap styles, ask for a tweak, copy the code.",
    minutes: 3,
    track: "design",
  },
  {
    id: "concept-mcp",
    slug: "concept-mcp",
    title: "MCP — how AI plugs into your tools",
    blurb: "The standard that lets agents talk to your filesystem, Slack, GitHub, Postgres, etc.",
    minutes: 4,
    track: "going-deeper",
  },
  {
    id: "concept-cost",
    slug: "concept-cost",
    title: "Tokens, models, and what it actually costs",
    blurb: "How AI is priced, where your money goes, and how to cap your spend before it surprises you.",
    minutes: 5,
    track: "going-deeper",
  },
  {
    id: "concept-multimodal",
    slug: "concept-multimodal",
    title: "Multimodal — images, voice, screen",
    blurb:
      "Modern assistants take more than text. What to feed them, what to ask for, and which tool for which medium.",
    minutes: 5,
    track: "going-deeper",
  },
  {
    id: "concept-rag",
    slug: "concept-rag",
    title: "RAG — giving AI access to your data",
    blurb:
      "How retrieval-augmented generation works, when to use it, and the simpler alternatives most people overlook.",
    minutes: 6,
    track: "going-deeper",
  },
  {
    id: "concept-evals",
    slug: "concept-evals",
    title: "Evals — knowing your AI actually works",
    blurb:
      "How to test AI output beyond 'looks fine to me'. The boring practice that separates hobby from production.",
    minutes: 5,
    track: "going-deeper",
  },
  {
    id: "cowork-what",
    slug: "cowork-what",
    title: "Why run things in parallel?",
    blurb: "Hand off small, well-scoped jobs to cloud agents.",
    minutes: 3,
    track: "cloud",
  },
  {
    id: "cowork-flow",
    slug: "cowork-flow",
    title: "Sending a task, reviewing the diff",
    blurb: "From prompt to pull request without a terminal.",
    minutes: 4,
    track: "cloud",
  },
  {
    id: "agents-landscape",
    slug: "agents-landscape",
    title: "The open-source agent ecosystem",
    blurb: "Hermes, OpenClaw, nanoclaw, aider, OpenHands, Goose, Continue, Cline.",
    minutes: 4,
    track: "agents",
  },
  {
    id: "agents-api",
    slug: "agents-api",
    title: "LLM APIs in 4 minutes",
    blurb: "OpenAI, Anthropic, Google — same shape, three vendors.",
    minutes: 4,
    track: "agents",
  },
  {
    id: "agents-setup",
    slug: "agents-setup",
    title: "Set up an autonomous agent (worked example)",
    blurb: "Hermes Agent install — pattern transfers to most others.",
    minutes: 6,
    track: "agents",
  },
  {
    id: "ship-it",
    slug: "ship-it",
    title: "Pick what to build",
    blurb: "Five guided paths. Pick one and follow it end-to-end in the real tool.",
    minutes: 2,
    track: "ship",
  },
  {
    id: "build-writing",
    slug: "build-writing",
    title: "Build · A writing assistant",
    blurb: "A saved Project / GPT / Gem you'll use forever. ~10 min, no install.",
    minutes: 10,
    track: "ship",
  },
  {
    id: "build-webpage",
    slug: "build-webpage",
    title: "Build · A live webpage",
    blurb: "A working one-page site you can share. ~15 min, no install.",
    minutes: 15,
    track: "ship",
  },
  {
    id: "build-script",
    slug: "build-script",
    title: "Build · A personal script",
    blurb: "A Python tool on your machine via a coding CLI. ~20 min.",
    minutes: 20,
    track: "ship",
  },
  {
    id: "build-slackbot",
    slug: "build-slackbot",
    title: "Build · A Slack channel digest bot",
    blurb: "A bot that posts a daily summary to a Slack channel. Real API tokens, real scheduling. ~25 min.",
    minutes: 25,
    track: "ship",
  },
  {
    id: "build-watcher",
    slug: "build-watcher",
    title: "Build · A scheduled watcher",
    blurb:
      "A Claude Cowork agent that scans a feed on a schedule and pings you when something matters. ~30 min.",
    minutes: 30,
    track: "ship",
  },
];

export function lessonIndex(id: string): number {
  return LESSONS.findIndex((l) => l.id === id);
}

export function neighbors(id: string): { prev?: Lesson; next?: Lesson } {
  const i = lessonIndex(id);
  return {
    prev: i > 0 ? LESSONS[i - 1] : undefined,
    next: i >= 0 && i < LESSONS.length - 1 ? LESSONS[i + 1] : undefined,
  };
}

export function trackById(id: TrackId): Track {
  // Throws on unknown ids; lessonIndex returns -1 and neighbors returns undefined.
  const t = TRACKS.find((t) => t.id === id);
  if (!t) throw new Error(`unknown track: ${id}`);
  return t;
}

export function lessonsInTrack(id: TrackId): Lesson[] {
  return LESSONS.filter((l) => l.track === id);
}

/**
 * Critical path — the shortest route from "what is AI?" to "I shipped a small thing".
 * Roughly 30 minutes including the final build. See ADR-0007.
 */
export const CRITICAL_PATH = [
  "welcome",
  "capabilities",
  "concept-prompt",
  "concept-safety",
  "chat-first",
  "ship-it",
  "build-writing",
] as const;

export function criticalPathLessons(): Lesson[] {
  return CRITICAL_PATH.map((id) => {
    const l = LESSONS.find((lesson) => lesson.id === id);
    // Throw at build time on curriculum drift — silently dropping a step
    // would leave the home-page callout shorter than the ADR specifies.
    if (!l) throw new Error(`CRITICAL_PATH references unknown lesson id "${id}"`);
    return l;
  });
}
