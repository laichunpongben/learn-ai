export type TrackId = "start" | "chat" | "code" | "cowork" | "design" | "agents" | "ship";

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
    tagline: "What Claude is, and what you can build with it.",
    accent: "#f0a05a",
  },
  {
    id: "chat",
    title: "Claude.ai — Chat",
    tagline: "The browser product. Best for non-code work, mobile, and non-developers.",
    accent: "#d4895a",
  },
  {
    id: "code",
    title: "Claude Code — Coding",
    tagline: "The developer's default. If you have a terminal open, start here.",
    accent: "#7a9eaf",
  },
  {
    id: "cowork",
    title: "Claude Cowork — Parallel Work",
    tagline: "A task dashboard imitation — submit, watch, review diffs.",
    accent: "#9e8aac",
  },
  {
    id: "design",
    title: "Claude Design — Visual UI",
    tagline: "A canvas that renders your prompt as a real-looking screen.",
    accent: "#c97b8a",
  },
  {
    id: "agents",
    title: "Beyond Anthropic's apps — Open-source agents",
    tagline: "Hermes Agent, OpenClaw, and the broader ecosystem on top of Claude.",
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
    title: "What Claude is, in 3 minutes",
    blurb: "The shortest possible intro. No jargon.",
    minutes: 3,
    track: "start",
  },
  {
    id: "capabilities",
    slug: "capabilities",
    title: "What can you actually build?",
    blurb: "A capability map with real examples — from a doc to a deployed app.",
    minutes: 4,
    track: "start",
  },
  {
    id: "chat-first",
    slug: "chat-first",
    title: "Drive the chat",
    blurb: "Imitation of claude.ai. Sidebar, streaming, suggestion chips.",
    minutes: 3,
    track: "chat",
  },
  {
    id: "chat-projects",
    slug: "chat-projects",
    title: "Projects: build a custom assistant",
    blurb: "Drop in files + instructions to make a focused helper for one job.",
    minutes: 3,
    track: "chat",
  },
  {
    id: "chat-artifacts",
    slug: "chat-artifacts",
    title: "Artifacts: when Claude makes a thing",
    blurb: "Ask for a doc or a webpage — watch the side panel open.",
    minutes: 3,
    track: "chat",
  },
  {
    id: "code-what",
    slug: "code-what",
    title: "What Claude Code lets you build",
    blurb: "A coding assistant in your terminal — for tools, scripts, real apps.",
    minutes: 4,
    track: "code",
  },
  {
    id: "code-install",
    slug: "code-install",
    title: "Install and first run",
    blurb: "One command, one login, one hello-world prompt.",
    minutes: 4,
    track: "code",
  },
  {
    id: "code-slash",
    slug: "code-slash",
    title: "Drive a pretend Claude Code session",
    blurb: "Slash menu, streaming output, approve/deny tool prompts.",
    minutes: 4,
    track: "code",
  },
  {
    id: "cowork-what",
    slug: "cowork-what",
    title: "Why run things in parallel?",
    blurb: "Hand off small, well-scoped jobs. Review the diffs later.",
    minutes: 3,
    track: "cowork",
  },
  {
    id: "cowork-flow",
    slug: "cowork-flow",
    title: "Drive a pretend Cowork dashboard",
    blurb: "Click Run all, watch tasks complete, approve the diffs.",
    minutes: 4,
    track: "cowork",
  },
  {
    id: "design-first",
    slug: "design-first",
    title: "Sentence in, screen out",
    blurb: "Type a prompt, hit Generate, see a real-looking component.",
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
    title: "What lives on top of Claude?",
    blurb: "OpenClaw, Hermes Agent, aider, OpenHands — the open-source ecosystem.",
    minutes: 4,
    track: "agents",
  },
  {
    id: "agents-api",
    slug: "agents-api",
    title: "The Claude API in 4 minutes",
    blurb: "How any tool gets access to Claude. The key, the SDK, the call.",
    minutes: 4,
    track: "agents",
  },
  {
    id: "agents-setup",
    slug: "agents-setup",
    title: "Set up Hermes Agent (worked example)",
    blurb: "Step-by-step install of one popular open-source agent.",
    minutes: 6,
    track: "agents",
  },
  {
    id: "ship-it",
    slug: "ship-it",
    title: "Ship your first tool in 20 minutes",
    blurb: "Pick one: a writing tool, a tiny webpage, or a personal script. Build it now.",
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
