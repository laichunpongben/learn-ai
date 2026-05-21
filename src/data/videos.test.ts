import { describe, expect, it } from "vitest";
import { LESSONS } from "./curriculum";
import { getVideoSlot, VIDEOS, type VideoSlot } from "./videos";

describe("video registry invariants", () => {
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

  it("present loop slots have webm + mp4 + poster paths", () => {
    for (const v of VIDEOS.filter((s) => s.status === "present" && s.mode === "loop")) {
      expect(v.webm, `slot ${v.id} missing webm`).toBeTruthy();
      expect(v.mp4, `slot ${v.id} missing mp4`).toBeTruthy();
      expect(v.poster, `slot ${v.id} missing poster`).toBeTruthy();
    }
  });

  it("present walkthrough slots have youtubeId + transcript + captionsVerified", () => {
    for (const v of VIDEOS.filter((s) => s.status === "present" && s.mode === "walkthrough")) {
      expect(v.youtubeId, `slot ${v.id} missing youtubeId`).toBeTruthy();
      expect(v.transcript?.trim(), `slot ${v.id} missing transcript`).toBeTruthy();
      expect(v.captionsVerified, `slot ${v.id} must verify captions (WCAG 1.2.2)`).toBe(true);
    }
  });

  it("youtubeId, when set, is an 11-char YouTube id", () => {
    // Same regex the runtime facade uses. Keeping them in sync matters —
    // a present walkthrough that fails this check would never render.
    const YT = /^[\w-]{11}$/;
    for (const v of VIDEOS) {
      if (v.youtubeId) {
        expect(v.youtubeId, `slot ${v.id} youtubeId`).toMatch(YT);
      }
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

  it("every lesson referenced by a slot exists at most once per mode", () => {
    // Prevents wiring two competing loops into the same lesson — a
    // mistake in the registry would render both stacked.
    const seen = new Map<string, Set<string>>();
    for (const v of VIDEOS) {
      const key = v.lesson;
      if (!seen.has(key)) seen.set(key, new Set());
      const modes = seen.get(key)!;
      const tag = `${v.mode}:${v.id}`;
      // Multiple slots for the same lesson are fine (e.g. lesson "home"
      // hosts five hero-* loops). What we prevent is duplicate ids.
      expect(modes.has(tag), `slot ${tag} duplicated in lesson ${key}`).toBe(false);
      modes.add(tag);
    }
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
