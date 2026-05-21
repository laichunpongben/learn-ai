#!/usr/bin/env node
/**
 * Real-browser smoke test for the UI interactions that bit us in production.
 *
 * Requirements:
 *   - Local preview server running (npm run preview &)
 *   - A Chrome already running with --remote-debugging-port=9333
 *
 * Exits 0 if all assertions pass; 1 otherwise.
 *
 * Why this test exists: the bugs we shipped (theme toggle dead, search modal
 * stuck open) were not caught by happy-dom/jsdom because both libraries don't
 * faithfully apply the UA stylesheet for `[hidden]` and don't implement
 * native `<dialog>` semantics. A real browser is the only honest oracle.
 */

import { BASE, connect, exitWith } from "./lib/cdp.mjs";

const browser = await connect();
const page = await browser.newPage();
const fails = [];

function assert(name, cond, got) {
  if (cond) console.log(`  ✓ ${name}`);
  else {
    console.log(`  ✗ ${name} (got ${JSON.stringify(got)})`);
    fails.push(name);
  }
}

try {
  await page.goto(`${BASE}/lessons/welcome/`, { waitUntil: "domcontentloaded" });
  await new Promise((r) => setTimeout(r, 400));
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: "domcontentloaded" });
  await new Promise((r) => setTimeout(r, 400));

  // 1. Click on the toggle button must reach something INSIDE the toggle —
  //    any descendant is fine (svg, path, circle, …); the test exists to catch
  //    an external overlay absorbing the click.
  const occluded = await page.evaluate(() => {
    const t = document.querySelector("[data-ui-action='toggle-theme']");
    const r = t.getBoundingClientRect();
    const el = document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2);
    return !t.contains(el);
  });
  assert("toggle is not occluded by an overlay", occluded === false, occluded);

  // 2. Theme actually toggles between light and dark.
  await page.click("[data-ui-action='toggle-theme']");
  await new Promise((r) => setTimeout(r, 200));
  const t1 = await page.evaluate(() => document.documentElement.getAttribute("data-theme"));
  await page.click("[data-ui-action='toggle-theme']");
  await new Promise((r) => setTimeout(r, 200));
  const t2 = await page.evaluate(() => document.documentElement.getAttribute("data-theme"));
  assert("first toggle sets a theme", t1 === "dark" || t1 === "light", t1);
  assert("second toggle flips the theme", t1 !== t2, { t1, t2 });

  // 3. Dialog open + close.
  await page.click("[data-ui-action='open-search']");
  await new Promise((r) => setTimeout(r, 200));
  const o = await page.evaluate(() => document.querySelector("[data-search-dialog]")?.hasAttribute("open"));
  assert("open-search button opens the dialog", o === true, o);

  await page.click("[data-ui-action='close-search']");
  await new Promise((r) => setTimeout(r, 200));
  const c = await page.evaluate(() => document.querySelector("[data-search-dialog]")?.hasAttribute("open"));
  assert("close-search button closes the dialog", c === false, c);

  // 4. Esc closes the dialog (native dialog behavior).
  await page.click("[data-ui-action='open-search']");
  await new Promise((r) => setTimeout(r, 200));
  await page.keyboard.press("Escape");
  await new Promise((r) => setTimeout(r, 200));
  const esc = await page.evaluate(() => document.querySelector("[data-search-dialog]")?.hasAttribute("open"));
  assert("Esc closes the dialog", esc === false, esc);

  // 5. Cmd+K opens the dialog from anywhere.
  await page.keyboard.down("Meta");
  await page.keyboard.press("k");
  await page.keyboard.up("Meta");
  await new Promise((r) => setTimeout(r, 200));
  const k = await page.evaluate(() => document.querySelector("[data-search-dialog]")?.hasAttribute("open"));
  assert("Cmd+K opens the dialog", k === true, k);

  // 5b. Empty-query palette shows track group headers, not a flat list.
  const groups = await page.evaluate(() =>
    document.querySelectorAll("[data-search-results] li.group-header").length,
  );
  assert("empty-query palette renders ≥3 track group headers", groups >= 3, groups);

  // 5c. `/` opens the dialog (close first).
  await page.keyboard.press("Escape");
  await new Promise((r) => setTimeout(r, 200));
  await page.keyboard.press("/");
  await new Promise((r) => setTimeout(r, 200));
  const slash = await page.evaluate(() => document.querySelector("[data-search-dialog]")?.hasAttribute("open"));
  assert("'/' opens the dialog", slash === true, slash);

  // 6. `n` navigates to the next lesson (close dialog first).
  await page.keyboard.press("Escape");
  await new Promise((r) => setTimeout(r, 200));
  const before = page.url();
  await page.keyboard.press("n");
  await new Promise((r) => setTimeout(r, 500));
  const after = page.url();
  assert("'n' navigates forward in the curriculum", before !== after, { before, after });

  // 7. From the homepage, `n` should hop to the continue/start button target.
  await page.goto(`${BASE}/`, { waitUntil: "domcontentloaded" });
  await new Promise((r) => setTimeout(r, 300));
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: "domcontentloaded" });
  await new Promise((r) => setTimeout(r, 400));
  const homeBefore = page.url();
  await page.keyboard.press("n");
  await new Promise((r) => setTimeout(r, 500));
  const homeAfter = page.url();
  assert("'n' from homepage hops to a lesson", homeBefore !== homeAfter && homeAfter.includes("/lessons/"), { homeBefore, homeAfter });

  // 8. 404 page renders with curriculum suggestions.
  await page.goto(`${BASE}/404.html`, { waitUntil: "domcontentloaded" });
  await new Promise((r) => setTimeout(r, 200));
  const has404 = await page.evaluate(() => {
    const h1 = document.querySelector("h1");
    const suggestions = document.querySelectorAll(".suggestions-grid a").length;
    return { h1: h1?.textContent ?? "", suggestions };
  });
  assert("404 page heading is 'Page not found'", has404.h1.includes("not found"), has404);
  assert("404 page lists ≥3 suggested links", has404.suggestions >= 3, has404);
} finally {
  await browser.disconnect();
}

exitWith(fails, "All UI smoke checks passed.");
