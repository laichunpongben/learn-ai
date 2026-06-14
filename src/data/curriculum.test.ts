import { describe, expect, it } from "vitest";
import { LESSONS, lessonIndex, lessonsInTrack, neighbors, TRACKS, trackById } from "./curriculum";

describe("curriculum data invariants", () => {
  it("has at least one lesson per track", () => {
    for (const t of TRACKS) {
      const inTrack = lessonsInTrack(t.id);
      expect(inTrack.length, `track ${t.id} has no lessons`).toBeGreaterThan(0);
    }
  });

  it("has unique lesson ids", () => {
    const ids = LESSONS.map((l) => l.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("has unique lesson slugs", () => {
    const slugs = LESSONS.map((l) => l.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("lesson ids match slugs", () => {
    for (const l of LESSONS) {
      expect(l.slug, `lesson ${l.id} slug`).toBe(l.id);
    }
  });

  it("every lesson references a known track", () => {
    const trackIds = new Set(TRACKS.map((t) => t.id));
    for (const l of LESSONS) {
      expect(trackIds.has(l.track), `lesson ${l.id} → unknown track ${l.track}`).toBe(true);
    }
  });

  it("every lesson has a positive minutes value", () => {
    for (const l of LESSONS) {
      expect(l.minutes, `lesson ${l.id} minutes`).toBeGreaterThan(0);
    }
  });

  it("track ids are unique", () => {
    const ids = TRACKS.map((t) => t.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("track accents look like hex colors", () => {
    for (const t of TRACKS) {
      expect(t.accent, `track ${t.id} accent`).toMatch(/^#[0-9a-fA-F]{6}$/);
    }
  });

  it("lessons are grouped contiguously in TRACKS order", () => {
    const seen = new Set<string>();
    const orderedTrackIds: string[] = [];
    let previousTrack: string | undefined;

    for (const l of LESSONS) {
      if (l.track !== previousTrack) {
        expect(seen.has(l.track), `track ${l.track} is split across LESSONS`).toBe(false);
        seen.add(l.track);
        orderedTrackIds.push(l.track);
        previousTrack = l.track;
      }
    }

    const expectedOrder = TRACKS.map((t) => t.id).filter((id) => seen.has(id));
    expect(orderedTrackIds).toEqual(expectedOrder);
  });
});

describe("lookup helpers", () => {
  it("lessonIndex returns -1 for unknown id", () => {
    expect(lessonIndex("definitely-not-a-lesson")).toBe(-1);
  });

  it("lessonIndex returns the right index for known ids", () => {
    expect(lessonIndex("welcome")).toBe(0);
    expect(lessonIndex(LESSONS[LESSONS.length - 1].id)).toBe(LESSONS.length - 1);
  });

  it("trackById throws on unknown track", () => {
    expect(() => trackById("nope" as never)).toThrow();
  });

  it("trackById returns the track for known ids", () => {
    for (const t of TRACKS) {
      expect(trackById(t.id).id).toBe(t.id);
    }
  });
});

describe("neighbors", () => {
  it("first lesson has no prev, has next", () => {
    const first = LESSONS[0];
    const n = neighbors(first.id);
    expect(n.prev).toBeUndefined();
    expect(n.next?.id).toBe(LESSONS[1].id);
  });

  it("last lesson has prev, has no next", () => {
    const last = LESSONS[LESSONS.length - 1];
    const n = neighbors(last.id);
    expect(n.prev?.id).toBe(LESSONS[LESSONS.length - 2].id);
    expect(n.next).toBeUndefined();
  });

  it("middle lessons have both prev and next", () => {
    const mid = LESSONS[Math.floor(LESSONS.length / 2)];
    const n = neighbors(mid.id);
    expect(n.prev).toBeDefined();
    expect(n.next).toBeDefined();
  });

  it("unknown id returns prev and next both undefined", () => {
    const n = neighbors("definitely-not-a-lesson");
    expect(n.prev).toBeUndefined();
    expect(n.next).toBeUndefined();
  });
});

describe("expected curriculum shape (regression guard)", () => {
  it("includes the Foundations track", () => {
    expect(TRACKS.find((t) => t.id === "concepts")).toBeDefined();
  });

  it("includes the nine concept lessons", () => {
    expect(lessonIndex("concept-prompt")).toBeGreaterThanOrEqual(0);
    expect(lessonIndex("concept-cli")).toBeGreaterThanOrEqual(0);
    expect(lessonIndex("concept-git")).toBeGreaterThanOrEqual(0);
    expect(lessonIndex("concept-mcp")).toBeGreaterThanOrEqual(0);
    expect(lessonIndex("concept-safety")).toBeGreaterThanOrEqual(0);
    expect(lessonIndex("concept-cost")).toBeGreaterThanOrEqual(0);
    expect(lessonIndex("concept-multimodal")).toBeGreaterThanOrEqual(0);
    expect(lessonIndex("concept-rag")).toBeGreaterThanOrEqual(0);
    expect(lessonIndex("concept-evals")).toBeGreaterThanOrEqual(0);
  });

  it("includes the four guided builds", () => {
    expect(lessonIndex("build-writing")).toBeGreaterThanOrEqual(0);
    expect(lessonIndex("build-webpage")).toBeGreaterThanOrEqual(0);
    expect(lessonIndex("build-script")).toBeGreaterThanOrEqual(0);
    expect(lessonIndex("build-slackbot")).toBeGreaterThanOrEqual(0);
  });
});
