import { describe, expect, it } from "vitest";
import { STATIC_PAGES } from "./static-pages";

describe("static pages invariants", () => {
  it("has unique ids", () => {
    const ids = STATIC_PAGES.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("every href is a root-relative path", () => {
    for (const p of STATIC_PAGES) {
      expect(p.href.startsWith("/"), `page ${p.id} href "${p.href}"`).toBe(true);
    }
  });

  it("exposes at least one page per surface flag", () => {
    expect(
      STATIC_PAGES.some((p) => p.search),
      "no search page",
    ).toBe(true);
    expect(
      STATIC_PAGES.some((p) => p.sidebar),
      "no sidebar page",
    ).toBe(true);
    expect(
      STATIC_PAGES.some((p) => p.footer),
      "no footer page",
    ).toBe(true);
  });
});
