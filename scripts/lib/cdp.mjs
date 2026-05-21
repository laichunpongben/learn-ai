/**
 * Shared CDP/preview wiring for the real-browser scripts in this repo
 * (smoke + a11y). Centralises env-var defaults and the connect/disconnect
 * pattern so the two scripts diverge only in what they actually assert.
 */
import puppeteer from "puppeteer-core";

export const BASE = process.env.SMOKE_URL ?? "http://localhost:4321";
export const CDP = process.env.CDP_URL ?? "http://localhost:9333";

export async function connect() {
  return puppeteer.connect({ browserURL: CDP });
}

export function exitWith(fails, okMessage) {
  if (fails.length) {
    console.log(`\n${fails.length} check(s) failed.`);
    process.exit(1);
  }
  console.log(`\n${okMessage}`);
}
