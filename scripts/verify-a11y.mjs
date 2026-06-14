#!/usr/bin/env node
/**
 * Accessibility scan with axe-core over the live preview.
 *
 * Required env:
 *   SMOKE_URL  — base URL (default http://localhost:4321)
 *   CDP_URL    — Chrome CDP endpoint (default http://localhost:9333)
 *
 * Scans a representative sample of pages (homepage + one rich lesson +
 * one reference page). Fails on any 'critical' or 'serious' violation;
 * 'moderate' and 'minor' are reported but don't break CI yet — the bar
 * can be tightened later.
 */

import { AxePuppeteer } from "@axe-core/puppeteer";
import { BASE, connect, exitWith } from "./lib/cdp.mjs";

const PAGES = ["/", "/lessons/concept-mcp/", "/glossary/"];

const browser = await connect();
const fails = [];
let checked = 0;

try {
  for (const path of PAGES) {
    const page = await browser.newPage();
    page.setDefaultTimeout(15000);
    page.setDefaultNavigationTimeout(15000);
    await page.goto(`${BASE}${path}`, { waitUntil: "networkidle2" });
    checked++;

    const results = await new AxePuppeteer(page).analyze();
    const byImpact = { critical: [], serious: [], moderate: [], minor: [] };
    for (const v of results.violations) {
      const bucket = byImpact[v.impact ?? "minor"];
      if (bucket) bucket.push(v);
      else {
        console.log(`  ✗ unknown impact: ${v.impact} for ${v.id}`);
        fails.push(`${path}: ${v.id} has unknown impact ${v.impact}`);
      }
    }

    console.log(`\n=== ${path} ===`);
    console.log(`  critical: ${byImpact.critical.length} · serious: ${byImpact.serious.length} · moderate: ${byImpact.moderate.length} · minor: ${byImpact.minor.length}`);

    for (const v of [...byImpact.critical, ...byImpact.serious]) {
      console.log(`  ✗ [${v.impact}] ${v.id} — ${v.help}`);
      console.log(`    nodes affected: ${v.nodes.length}`);
      if (v.nodes[0]?.html) console.log(`    e.g. ${v.nodes[0].html.slice(0, 120)}`);
      fails.push(`${path}: ${v.id}`);
    }
    for (const v of [...byImpact.moderate, ...byImpact.minor]) {
      console.log(`  · [${v.impact}] ${v.id} — ${v.help}`);
    }

    await page.close();
  }
} finally {
  await browser.disconnect();
}

exitWith(fails, "No critical/serious a11y violations.", {
  checked,
  minChecks: PAGES.length,
  label: "a11y pages",
});
