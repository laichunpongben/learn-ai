// Per ADR-0009 / ADR-0010. Registry of expected screencast slots.
// Entries with status:"missing" render nothing; the site builds and
// ships fine with an empty registry — content lands later.

export type VideoMode = "loop" | "walkthrough";
export type VideoStatus = "missing" | "present";

export interface VideoSlot {
  id: string;
  mode: VideoMode;
  status: VideoStatus;
  posterAlt: string;
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

export const VIDEOS: VideoSlot[] = [];

export function getVideoSlot(id: string): VideoSlot | undefined {
  return VIDEOS.find((v) => v.id === id);
}
