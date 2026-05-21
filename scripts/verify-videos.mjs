#!/usr/bin/env node
/**
 * Verifies video assets against the registry contract in ADR-0010.
 *
 * For each VideoSlot with status:"present":
 *   loop        → webm + mp4 exist, each ≤ 800KB; poster ≤ 80KB
 *   walkthrough → captionsVerified === true; transcript non-empty;
 *                 youtubeId non-empty
 *
 * recordedAt older than 12 months → warning (does not fail).
 *
 * Exits 0 on clean, 1 on any budget or contract violation.
 */

import { stat } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join, resolve } from "node:path";

import { VIDEOS } from "../src/data/videos.ts";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const PUBLIC = join(ROOT, "public");

const LOOP_BUDGET_BYTES = 800 * 1024;
const POSTER_BUDGET_BYTES = 80 * 1024;
const STALE_AFTER_MS = 365 * 24 * 60 * 60 * 1000;

const errors = [];
const warnings = [];

function err(slotId, msg) {
  errors.push(`✗ ${slotId}: ${msg}`);
}
function warn(slotId, msg) {
  warnings.push(`! ${slotId}: ${msg}`);
}

async function fileSize(slotId, field, rel) {
  // Resolve against PUBLIC and reject paths that escape it. The registry
  // is source-controlled, but stat'ing /etc/anything from CI on a typo
  // is worth blocking by construction.
  const abs = resolve(PUBLIC, rel.replace(/^\//, ""));
  if (abs !== PUBLIC && !abs.startsWith(PUBLIC + "/")) {
    err(slotId, `${field} path escapes public/: ${rel}`);
    return null;
  }
  try {
    const s = await stat(abs);
    return s.size;
  } catch {
    return null;
  }
}

async function checkLoop(slot) {
  for (const field of ["webm", "mp4", "poster"]) {
    if (!slot[field]) {
      err(slot.id, `present loop missing field "${field}"`);
      continue;
    }
    const size = await fileSize(slot.id, field, slot[field]);
    if (size === null) {
      err(slot.id, `${field} file not found: ${slot[field]}`);
      continue;
    }
    const budget = field === "poster" ? POSTER_BUDGET_BYTES : LOOP_BUDGET_BYTES;
    if (size > budget) {
      const kb = (size / 1024).toFixed(0);
      const max = (budget / 1024).toFixed(0);
      err(slot.id, `${field} exceeds budget: ${kb}KB > ${max}KB (${slot[field]})`);
    }
  }
}

function checkWalkthrough(slot) {
  if (!slot.youtubeId) {
    err(slot.id, "present walkthrough missing youtubeId");
  }
  if (!slot.transcript || slot.transcript.trim() === "") {
    err(slot.id, "present walkthrough missing transcript (WCAG 1.2.3)");
  }
  if (slot.captionsVerified !== true) {
    err(slot.id, "present walkthrough requires captionsVerified:true (WCAG 1.2.2)");
  }
}

function checkStaleness(slot) {
  if (!slot.recordedAt) return;
  const recorded = Date.parse(slot.recordedAt);
  if (Number.isNaN(recorded)) {
    err(slot.id, `recordedAt is not a valid ISO date: ${slot.recordedAt}`);
    return;
  }
  if (Date.now() - recorded > STALE_AFTER_MS) {
    const months = Math.floor((Date.now() - recorded) / (30 * 24 * 60 * 60 * 1000));
    warn(slot.id, `recordedAt is ${months} months old — consider re-recording`);
  }
}

async function main() {
  const present = VIDEOS.filter((v) => v.status === "present");
  const missing = VIDEOS.filter((v) => v.status === "missing");

  for (const slot of present) {
    if (slot.mode === "loop") await checkLoop(slot);
    else if (slot.mode === "walkthrough") checkWalkthrough(slot);
    else err(slot.id, `unknown mode: ${slot.mode}`);
    checkStaleness(slot);
  }

  // recordedAt can be set on a missing slot (e.g. preparing for a future
  // re-record). Validate the format even when the slot isn't live yet —
  // catches typos before they're hidden behind a flip-to-present.
  for (const slot of missing) {
    if (slot.recordedAt && Number.isNaN(Date.parse(slot.recordedAt))) {
      err(slot.id, `recordedAt is not a valid ISO date: ${slot.recordedAt}`);
    }
  }

  console.log(
    `Checked ${VIDEOS.length} slots — ${present.length} present, ${missing.length} missing.`,
  );

  if (warnings.length) {
    console.log("\nWarnings:");
    for (const w of warnings) console.log("  " + w);
  }
  if (errors.length) {
    console.log("\nErrors:");
    for (const e of errors) console.log("  " + e);
    process.exit(1);
  }
  console.log("\nAll present slots within budget and contract.");
}

main().catch((e) => {
  console.error("verify-videos crashed:", e);
  process.exit(2);
});
