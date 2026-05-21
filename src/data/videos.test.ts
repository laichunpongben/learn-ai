import { describe, expect, it } from "vitest";
import { LESSONS } from "./curriculum";
import {
  getVideoSlot,
  loopFieldsComplete,
  VIDEOS,
  type VideoSlot,
  walkthroughFieldsComplete,
  YOUTUBE_ID_RE,
} from "./videos";

// ---------------------------------------------------------------
// Fixture: a known-good slot of each mode + corruption variants.
// Tests run against these directly so they never depend on which
// slots happen to be "present" in VIDEOS at this commit.
// ---------------------------------------------------------------

const validLoop: VideoSlot = {
  id: "fixture-loop",
  mode: "loop",
  status: "present",
  lesson: "chat-first",
  posterAlt: "fixture",
  webm: "/videos/loops/fixture.webm",
  mp4: "/videos/loops/fixture.mp4",
  poster: "/videos/posters/fixture.png",
};

const validWalkthrough: VideoSlot = {
  id: "fixture-walkthrough",
  mode: "walkthrough",
  status: "present",
  lesson: "build-webpage",
  posterAlt: "fixture",
  youtubeId: "abcDEF12345",
  transcript: "Hello world.",
  captionsVerified: true,
};

describe("loopFieldsComplete (predicate)", () => {
  it("accepts a fully populated loop", () => {
    expect(loopFieldsComplete(validLoop)).toBe(true);
  });

  it("rejects a loop missing webm", () => {
    expect(loopFieldsComplete({ ...validLoop, webm: undefined })).toBe(false);
  });

  it("rejects a loop missing mp4", () => {
    expect(loopFieldsComplete({ ...validLoop, mp4: undefined })).toBe(false);
  });

  it("rejects a loop missing poster", () => {
    expect(loopFieldsComplete({ ...validLoop, poster: undefined })).toBe(false);
  });
});

describe("walkthroughFieldsComplete (predicate)", () => {
  it("accepts a fully populated walkthrough", () => {
    expect(walkthroughFieldsComplete(validWalkthrough)).toBe(true);
  });

  it("rejects when youtubeId is missing", () => {
    expect(walkthroughFieldsComplete({ ...validWalkthrough, youtubeId: undefined })).toBe(false);
  });

  it("rejects when youtubeId is the wrong length", () => {
    expect(walkthroughFieldsComplete({ ...validWalkthrough, youtubeId: "short" })).toBe(false);
    expect(walkthroughFieldsComplete({ ...validWalkthrough, youtubeId: "this-id-is-way-too-long" })).toBe(
      false,
    );
  });

  it("rejects when transcript is empty (WCAG 1.2.3)", () => {
    expect(walkthroughFieldsComplete({ ...validWalkthrough, transcript: "" })).toBe(false);
    expect(walkthroughFieldsComplete({ ...validWalkthrough, transcript: "   " })).toBe(false);
  });

  it("rejects when captionsVerified is not exactly true (WCAG 1.2.2)", () => {
    expect(walkthroughFieldsComplete({ ...validWalkthrough, captionsVerified: false })).toBe(false);
    expect(walkthroughFieldsComplete({ ...validWalkthrough, captionsVerified: undefined })).toBe(false);
  });
});

describe("video registry invariants (real VIDEOS data)", () => {
  it("has unique slot ids", () => {
    const ids = VIDEOS.map((v) => v.id);
    expect(new Set(ids).size, "duplicate slot ids").toBe(ids.length);
  });

  it("every slot mode is loop or walkthrough", () => {
    for (const v of VIDEOS) {
      expect(v.mode, `slot ${v.id} mode`).toMatch(/^(loop|walkthrough)$/);
    }
  });

  it("every slot status is missing or present", () => {
    for (const v of VIDEOS) {
      expect(v.status, `slot ${v.id} status`).toMatch(/^(missing|present)$/);
    }
  });

  it("every slot has a non-empty posterAlt", () => {
    for (const v of VIDEOS) {
      expect(v.posterAlt.trim().length, `slot ${v.id} posterAlt is empty`).toBeGreaterThan(0);
    }
  });

  it('every slot references a real lesson id or "home"', () => {
    const lessonIds = new Set(LESSONS.map((l) => l.id));
    lessonIds.add("home");
    for (const v of VIDEOS) {
      expect(lessonIds.has(v.lesson), `slot ${v.id} → unknown lesson ${v.lesson}`).toBe(true);
    }
  });

  it("every present slot passes its mode-specific validator", () => {
    // Tautology-safe: when nothing is present, this assertion is
    // trivially satisfied. The predicate behaviour itself is
    // exercised by the fixture tests above.
    for (const v of VIDEOS.filter((s) => s.status === "present")) {
      const ok = v.mode === "loop" ? loopFieldsComplete(v) : walkthroughFieldsComplete(v);
      expect(ok, `slot ${v.id} (${v.mode}) fails its present-mode contract`).toBe(true);
    }
  });

  it("recordedAt, when set, parses as a valid date", () => {
    for (const v of VIDEOS) {
      if (v.recordedAt) {
        expect(
          Number.isFinite(Date.parse(v.recordedAt)),
          `slot ${v.id} recordedAt is not a valid ISO date`,
        ).toBe(true);
      }
    }
  });
});

describe("YOUTUBE_ID_RE", () => {
  // Sourced from videos.ts so the runtime facade in Screencast.astro
  // and these tests share the same constant — drift impossible.
  it("matches an 11-char [A-Za-z0-9_-] string", () => {
    expect(YOUTUBE_ID_RE.test("dQw4w9WgXcQ")).toBe(true);
    expect(YOUTUBE_ID_RE.test("abc_def-123")).toBe(true);
  });
  it("rejects wrong length", () => {
    expect(YOUTUBE_ID_RE.test("short")).toBe(false);
    expect(YOUTUBE_ID_RE.test("way-too-long-id-here")).toBe(false);
  });
  it("rejects disallowed characters", () => {
    expect(YOUTUBE_ID_RE.test("abc.def-123")).toBe(false);
    expect(YOUTUBE_ID_RE.test("abc/def-123")).toBe(false);
    expect(YOUTUBE_ID_RE.test("abc def-123")).toBe(false);
  });
});

describe("getVideoSlot", () => {
  it("returns the slot for a known id", () => {
    const v = getVideoSlot("chat-loop");
    expect(v).toBeDefined();
    expect(v?.id).toBe("chat-loop");
  });

  it("returns undefined for an unknown id", () => {
    expect(getVideoSlot("definitely-not-a-slot")).toBeUndefined();
  });

  it("returns undefined for the empty string", () => {
    // The lookup makes no special case for empty input — empty string
    // is just an id that no slot has, so .find returns undefined.
    expect(getVideoSlot("")).toBeUndefined();
  });
});

describe("expected slot coverage (regression guard)", () => {
  it("has one loop slot per capability lesson", () => {
    const expected: Array<[string, string]> = [
      ["chat-loop", "chat-first"],
      ["code-loop", "code-slash"],
      ["design-loop", "design-first"],
      ["cowork-loop", "cowork-flow"],
      ["agents-loop", "agents-landscape"],
    ];
    for (const [id, lesson] of expected) {
      const v = getVideoSlot(id);
      expect(v, `slot ${id} should exist`).toBeDefined();
      expect(v?.mode).toBe("loop");
      expect(v?.lesson).toBe(lesson);
    }
  });

  it("has one walkthrough slot per build-* lesson", () => {
    const expected = [
      "build-webpage-walkthrough",
      "build-slackbot-walkthrough",
      "build-script-walkthrough",
      "build-writing-walkthrough",
      "build-watcher-walkthrough",
    ];
    for (const id of expected) {
      const v = getVideoSlot(id);
      expect(v, `slot ${id} should exist`).toBeDefined();
      expect(v?.mode).toBe("walkthrough");
    }
  });

  it("has five hero-* loops scoped to the home page", () => {
    const heroes = VIDEOS.filter((v: VideoSlot) => v.id.startsWith("hero-"));
    expect(heroes.length).toBe(5);
    for (const h of heroes) {
      expect(h.mode).toBe("loop");
      expect(h.lesson).toBe("home");
    }
  });
});
