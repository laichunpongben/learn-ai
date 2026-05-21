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
const SKIP_PREFIXES = ["/favicon"];

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

const HREF_RE = /\b(?:href|src)\s*=\s*["'](\/[^"'#?]*)(?:[#?][^"']*)?["']/g;

let htmlFiles;
try {
  htmlFiles = await walk(DIST);
} catch (err) {
  if (err?.code === "ENOENT") {
    console.error(`${DIST}/ not found. Run 'npm run build' first.`);
    process.exit(1);
  }
  throw err;
}
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

const REQUIRED = ["sitemap-index.xml", "sitemap-0.xml", "robots.txt", "rss.xml", "llms.txt", "manifest.webmanifest"];
const missing = [];
for (const name of REQUIRED) {
  if (!(await exists(join(DIST, name)))) missing.push(name);
}

// JSON-LD: every lesson page emits a LearningResource block; homepage emits a Course block.
const JSONLD_RE = /<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g;
const jsonldErrors = [];
async function expectType(file, type) {
  const html = await readFile(file, "utf8").catch(() => null);
  if (html === null) {
    jsonldErrors.push(`${file.replace(`${DIST}/`, "")}: file missing`);
    return;
  }
  let foundType = false;
  for (const m of html.matchAll(JSONLD_RE)) {
    try {
      const block = JSON.parse(m[1]);
      if (block["@type"] === type) foundType = true;
    } catch (e) {
      jsonldErrors.push(`${file.replace(`${DIST}/`, "")}: invalid JSON in ld+json block — ${e.message}`);
    }
  }
  if (!foundType) jsonldErrors.push(`${file.replace(`${DIST}/`, "")}: no JSON-LD block with @type=${type}`);
}
await expectType(`${DIST}/index.html`, "Course");
const lessonFiles = htmlFiles.filter((f) => f.includes("/lessons/") && f.endsWith("/index.html"));
for (const f of lessonFiles) {
  await expectType(f, "LearningResource");
  await expectType(f, "BreadcrumbList");
}

const unique = Array.from(new Set(broken.map((b) => `${b.source} → ${b.url}`)));
if (unique.length || missing.length || jsonldErrors.length) {
  if (unique.length) {
    console.log(`Broken internal links (${unique.length}):`);
    for (const line of unique.slice(0, 50)) console.log(`  ✗ ${line}`);
    if (unique.length > 50) console.log(`  … and ${unique.length - 50} more`);
  }
  if (missing.length) {
    console.log(`Missing required artifacts (${missing.length}):`);
    for (const name of missing) console.log(`  ✗ dist/${name}`);
  }
  if (jsonldErrors.length) {
    console.log(`JSON-LD errors (${jsonldErrors.length}):`);
    for (const e of jsonldErrors.slice(0, 20)) console.log(`  ✗ ${e}`);
    if (jsonldErrors.length > 20) console.log(`  … and ${jsonldErrors.length - 20} more`);
  }
  process.exit(1);
}
console.log(`All ${checked} internal links resolved across ${htmlFiles.length} pages.`);
console.log(`Required artifacts present: ${REQUIRED.join(", ")}.`);
console.log(`JSON-LD: Course on homepage + LearningResource + BreadcrumbList on ${lessonFiles.length} lesson pages.`);
