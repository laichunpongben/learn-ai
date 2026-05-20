export type TrackId = "start" | "chat" | "code" | "cloud" | "design" | "agents" | "ship";

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

export const TRACKS: Track[] = [
  {
    id: "start",
    title: "Start Here",
    tagline: "What modern AI assistants are, and what you can build with them.",
    accent: "#f0a05a",
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
    tagline: "Cursor, Claude Code, Codex CLI, Windsurf, GitHub Copilot.",
    accent: "#7a9eaf",
  },
  {
    id: "cloud",
    title: "Cloud agents (parallel)",
    tagline: "Devin, Claude Cowork, Copilot Workspace, Codex Cloud.",
    accent: "#9e8aac",
  },
  {
    id: "design",
    title: "Visual UI generators",
    tagline: "v0.dev, Lovable, Bolt, Claude Design, Galileo.",
    accent: "#c97b8a",
  },
  {
    id: "agents",
    title: "Open-source autonomous agents",
    tagline: "Hermes, OpenClaw, aider, OpenHands — agents you self-host.",
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
    id: "agents-landscape",
    slug: "agents-landscape",
    title: "The open-source agent ecosystem",
    blurb: "Hermes, OpenClaw, aider, OpenHands, Goose, Continue, Cline.",
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
    title: "Ship your first tool in 20 minutes",
    blurb: "Pick one: a writing tool, a tiny webpage, or a personal script.",
    minutes: 8,
    track: "ship",
  },
];

export function lessonByIndex(i: number): Lesson | undefined {
  return LESSONS[i];
}

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
  const t = TRACKS.find((t) => t.id === id);
  if (!t) throw new Error(`unknown track: ${id}`);
  return t;
}

export function lessonsInTrack(id: TrackId): Lesson[] {
  return LESSONS.filter((l) => l.track === id);
}
