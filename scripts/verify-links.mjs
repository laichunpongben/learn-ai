#!/usr/bin/env node
/**
 * Static internal-link checker.
 *
 * Reads every dist/**\/*.html, pulls href/src attributes that look
 * internal (start with "/", no scheme), and verifies each target
 * resolves to a real file inside dist/.
 *
 * Why: catches the "renamed a lesson but forgot a reference" bug
 * — purely static, no browser, no preview server needed.
 *
 * Exits 0 on clean, 1 on any broken link.
 */

import { readFile, readdir, stat } from "node:fs/promises";
import { join, posix } from "node:path";

const DIST = process.env.DIST_DIR ?? "dist";
const SKIP_PREFIXES = ["/favicon", "/sitemap"];

async function walk(dir) {
  const out = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const p = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...(await walk(p)));
    else if (entry.name.endsWith(".html")) out.push(p);
  }
  return out;
}

async function exists(path) {
  try { await stat(path); return true; } catch { return false; }
}

/** Map a URL path ("/lessons/welcome" or "/foo/") to a candidate file in dist. */
function resolveTarget(urlPath) {
  const clean = urlPath.replace(/[#?].*$/, "");
  const noTrail = clean.replace(/\/+$/, "");
  const candidates = [
    join(DIST, noTrail),
    join(DIST, noTrail + ".html"),
    join(DIST, noTrail, "index.html"),
    join(DIST, clean),
  ];
  return candidates;
}

const HREF_RE = /\b(?:href|src)\s*=\s*"(\/[^"#?]*)(?:[#?][^"]*)?"/g;

const htmlFiles = await walk(DIST);
const broken = [];
let checked = 0;

for (const file of htmlFiles) {
  const html = await readFile(file, "utf8");
  for (const match of html.matchAll(HREF_RE)) {
    const url = match[1];
    if (SKIP_PREFIXES.some((p) => url.startsWith(p))) continue;
    if (url.startsWith("//")) continue;
    checked++;
    const candidates = resolveTarget(url);
    const found = (await Promise.all(candidates.map(exists))).some(Boolean);
    if (!found) broken.push({ source: file.replace(/^dist\//, ""), url });
  }
}

const unique = Array.from(new Set(broken.map((b) => `${b.source} → ${b.url}`)));
if (unique.length) {
  console.log(`Broken internal links (${unique.length}):`);
  for (const line of unique.slice(0, 50)) console.log(`  ✗ ${line}`);
  if (unique.length > 50) console.log(`  … and ${unique.length - 50} more`);
  process.exit(1);
}
console.log(`All ${checked} internal links resolved across ${htmlFiles.length} pages.`);
