#!/usr/bin/env node
/**
 * Generate PWA icon PNGs from public/favicon.svg.
 *
 * Outputs:
 *   public/icons/icon-192.png            — any-purpose, 192x192
 *   public/icons/icon-512.png            — any-purpose, 512x512
 *   public/icons/icon-512-maskable.png   — maskable, 512x512 with 80% safe zone
 *   public/icons/apple-touch-icon.png    — iOS Safari, 180x180
 *
 * Re-run whenever favicon.svg changes. Output files are committed.
 *
 * Uses `sharp`, which is pulled in transitively by the existing test
 * tooling. If a future bump removes the transitive presence we'll add
 * it explicitly to devDependencies; until then this script's presence
 * is the contract.
 */

import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const SVG_PATH = join(ROOT, "public/favicon.svg");
const OUT_DIR = join(ROOT, "public/icons");

const PNG_OPTS = { compressionLevel: 9, palette: true };

async function rasterize(svg, size) {
  return sharp(Buffer.from(svg)).resize(size, size).png(PNG_OPTS).toBuffer();
}

// Maskable: same SVG, drawn at 80% size, centred on a same-color
// background. The outer 20% (10% per side) is the safe-zone padding
// that Android's launcher will mask.
async function rasterizeMaskable(svg, size) {
  // Pull the background color out of the SVG (first <rect fill=…>). If
  // we can't find one, fall back to the canonical background color.
  const fillMatch = svg.match(/<rect[^>]*fill="(#[0-9a-fA-F]{3,8})"/);
  const bg = fillMatch ? fillMatch[1] : "#c1633a";
  const inner = Math.round(size * 0.8);
  const offset = Math.round((size - inner) / 2);
  const innerPng = await sharp(Buffer.from(svg))
    .resize(inner, inner)
    .png(PNG_OPTS)
    .toBuffer();
  return sharp({
    create: { width: size, height: size, channels: 4, background: bg },
  })
    .composite([{ input: innerPng, top: offset, left: offset }])
    .png(PNG_OPTS)
    .toBuffer();
}

async function writePng(name, buf) {
  const path = join(OUT_DIR, name);
  await writeFile(path, buf);
  const kb = (buf.length / 1024).toFixed(1);
  console.log(`  wrote ${name} (${kb}KB)`);
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });
  const svg = await readFile(SVG_PATH, "utf8");
  console.log(`Source: ${SVG_PATH}`);
  console.log(`Output: ${OUT_DIR}`);
  await writePng("icon-192.png", await rasterize(svg, 192));
  await writePng("icon-512.png", await rasterize(svg, 512));
  await writePng("icon-512-maskable.png", await rasterizeMaskable(svg, 512));
  await writePng("apple-touch-icon.png", await rasterize(svg, 180));
  console.log("Done.");
}

main().catch((e) => {
  console.error("generate-icons crashed:", e);
  process.exit(1);
});
