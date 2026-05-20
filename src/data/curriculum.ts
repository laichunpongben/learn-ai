export type TrackId = "start" | "chat" | "code" | "cowork" | "design";

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
  emoji: string;
}

export const TRACKS: Track[] = [
  {
    id: "start",
    title: "Start Here",
    tagline: "What Claude is and what it can do for you.",
    accent: "#f0a05a",
    emoji: "•",
  },
  {
    id: "chat",
    title: "Claude.ai — Chat",
    tagline: "Have a conversation. Ask anything.",
    accent: "#d4895a",
    emoji: "•",
  },
  {
    id: "code",
    title: "Claude Code — Coding",
    tagline: "An AI pair-programmer in your terminal.",
    accent: "#7a9eaf",
    emoji: "•",
  },
  {
    id: "cowork",
    title: "Claude Cowork — Parallel Work",
    tagline: "Run many tasks at once and review the results.",
    accent: "#9e8aac",
    emoji: "•",
  },
  {
    id: "design",
    title: "Claude Design — Visual UI",
    tagline: "Describe an interface, see it built.",
    accent: "#c97b8a",
    emoji: "•",
  },
];

export const LESSONS: Lesson[] = [
  {
    id: "welcome",
    slug: "welcome",
    title: "What is Claude, really?",
    blurb: "A friendly intro to AI assistants — no jargon.",
    minutes: 3,
    track: "start",
  },
  {
    id: "chat-first",
    slug: "chat-first",
    title: "Your first chat",
    blurb: "Open claude.ai, type something, watch it reply.",
    minutes: 3,
    track: "chat",
  },
  {
    id: "chat-projects",
    slug: "chat-projects",
    title: "Projects: a folder for related chats",
    blurb: "Group conversations and attach reference files.",
    minutes: 3,
    track: "chat",
  },
  {
    id: "chat-artifacts",
    slug: "chat-artifacts",
    title: "Artifacts: when Claude makes a thing",
    blurb: "Documents, code, and diagrams in a side panel.",
    minutes: 3,
    track: "chat",
  },
  {
    id: "code-what",
    slug: "code-what",
    title: "What Claude Code is",
    blurb: "A coding assistant that lives in your terminal.",
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
    title: "Slash commands and agents",
    blurb: "Type / to summon helpers. Skills, agents, plan mode.",
    minutes: 4,
    track: "code",
  },
  {
    id: "cowork-what",
    slug: "cowork-what",
    title: "Why run things in parallel?",
    blurb: "Many isolated tasks at once, each in its own sandbox.",
    minutes: 3,
    track: "cowork",
  },
  {
    id: "cowork-flow",
    slug: "cowork-flow",
    title: "Sending a task, reviewing the diff",
    blurb: "From prompt to pull request without a terminal.",
    minutes: 4,
    track: "cowork",
  },
  {
    id: "design-first",
    slug: "design-first",
    title: "From a sentence to a screen",
    blurb: "Describe a UI in plain English, see it rendered.",
    minutes: 3,
    track: "design",
  },
  {
    id: "design-iterate",
    slug: "design-iterate",
    title: "Iterating visually",
    blurb: "Tweak, swap, refine — until it looks right.",
    minutes: 3,
    track: "design",
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
