// Per ADR-0009 / ADR-0010. Registry of expected screencast slots.
// Entries with status:"missing" render nothing; the site builds and
// ships fine with an empty registry — content lands later.
//
// To activate a slot:
//   1. Record the asset (see CONTRIBUTING.md — issue #108)
//   2. Drop files under public/videos/
//   3. Flip this entry from "missing" to "present" and fill in the
//      file refs, recordedAt, etc.
//   4. `npm run videos:check` must pass before commit.

export type VideoMode = "loop" | "walkthrough";
export type VideoStatus = "missing" | "present";

export interface VideoSlot {
  id: string;
  mode: VideoMode;
  status: VideoStatus;
  lesson: string; // lesson slug or "home" for hero-reel slots
  posterAlt: string; // required: aria-label / alt text for the loop
  // loop-only
  webm?: string;
  mp4?: string;
  poster?: string;
  aspect?: string; // e.g. "16 / 9"
  // walkthrough-only
  youtubeId?: string;
  transcript?: string;
  captionsVerified?: boolean;
  // both
  recordedAt?: string; // ISO date
}

export const VIDEOS: VideoSlot[] = [
  // Capability-lesson loops (issue #105)
  {
    id: "chat-loop",
    mode: "loop",
    status: "missing",
    lesson: "chat-first",
    posterAlt: "Real chat assistant streaming a reply",
  },
  {
    id: "code-loop",
    mode: "loop",
    status: "missing",
    lesson: "code-slash",
    posterAlt: "Coding CLI running in a real terminal",
  },
  {
    id: "design-loop",
    mode: "loop",
    status: "missing",
    lesson: "design-first",
    posterAlt: "UI generator rendering a page from a prompt",
  },
  {
    id: "cowork-loop",
    mode: "loop",
    status: "missing",
    lesson: "cowork-flow",
    posterAlt: "Cloud agent queue running tasks in parallel",
  },
  {
    id: "agents-loop",
    mode: "loop",
    status: "missing",
    lesson: "agents-landscape",
    posterAlt: "Open-source autonomous agent driving a workflow",
  },

  // Home hero-reel loops (issue #107) — one per HeroReel moment
  {
    id: "hero-chat",
    mode: "loop",
    status: "missing",
    lesson: "home",
    posterAlt: "Chat assistant in motion",
  },
  {
    id: "hero-terminal",
    mode: "loop",
    status: "missing",
    lesson: "home",
    posterAlt: "Coding CLI in motion",
  },
  {
    id: "hero-design",
    mode: "loop",
    status: "missing",
    lesson: "home",
    posterAlt: "UI generator in motion",
  },
  {
    id: "hero-cloud",
    mode: "loop",
    status: "missing",
    lesson: "home",
    posterAlt: "Cloud agent queue in motion",
  },
  {
    id: "hero-agents",
    mode: "loop",
    status: "missing",
    lesson: "home",
    posterAlt: "Open-source agent in motion",
  },

  // Build-lesson walkthroughs (issue #106)
  {
    id: "build-webpage-walkthrough",
    mode: "walkthrough",
    status: "missing",
    lesson: "build-webpage",
    posterAlt: "From prompt to a shipped webpage — walkthrough",
  },
  {
    id: "build-slackbot-walkthrough",
    mode: "walkthrough",
    status: "missing",
    lesson: "build-slackbot",
    posterAlt: "Building a Slack bot end-to-end — walkthrough",
  },
  {
    id: "build-script-walkthrough",
    mode: "walkthrough",
    status: "missing",
    lesson: "build-script",
    posterAlt: "Writing a useful script end-to-end — walkthrough",
  },
  {
    id: "build-writing-walkthrough",
    mode: "walkthrough",
    status: "missing",
    lesson: "build-writing",
    posterAlt: "Drafting a long-form piece end-to-end — walkthrough",
  },
  {
    id: "build-watcher-walkthrough",
    mode: "walkthrough",
    status: "missing",
    lesson: "build-watcher",
    posterAlt: "Wiring a build-watcher end-to-end — walkthrough",
  },
];

export function getVideoSlot(id: string): VideoSlot | undefined {
  return VIDEOS.find((v) => v.id === id);
}

// YouTube IDs are an exact 11-char [A-Za-z0-9_-] string. The runtime
// facade in Screencast.astro and the test suite both gate on this
// regex; keep them sourced from the same constant.
export const YOUTUBE_ID_RE = /^[\w-]{11}$/;

// Validation predicates. Used by tests to assert that activated slots
// satisfy the contract without depending on which slots happen to be
// "present" at any given commit — the test fixtures exercise both
// branches directly.
export function loopFieldsComplete(v: VideoSlot): boolean {
  return Boolean(v.webm && v.mp4 && v.poster);
}
export function walkthroughFieldsComplete(v: VideoSlot): boolean {
  return Boolean(
    v.youtubeId &&
      YOUTUBE_ID_RE.test(v.youtubeId) &&
      v.transcript &&
      v.transcript.trim() !== "" &&
      v.captionsVerified === true,
  );
}
