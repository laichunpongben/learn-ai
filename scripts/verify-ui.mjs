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

import puppeteer from "puppeteer-core";

const BASE = process.env.SMOKE_URL ?? "http://localhost:4321";
const CDP = process.env.CDP_URL ?? "http://localhost:9333";

const browser = await puppeteer.connect({ browserURL: CDP });
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

  // 1. Click on the toggle button must reach an SVG (not absorbed by a hidden overlay).
  const at = await page.evaluate(() => {
    const t = document.querySelector("[data-ui-action='toggle-theme']");
    const r = t.getBoundingClientRect();
    return document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2).tagName.toLowerCase();
  });
  assert("toggle is not occluded by an overlay", at === "svg" || at === "button", at);

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
} finally {
  await browser.disconnect();
}

if (fails.length) {
  console.log(`\n${fails.length} check(s) failed.`);
  process.exit(1);
}
console.log("\nAll UI smoke checks passed.");
