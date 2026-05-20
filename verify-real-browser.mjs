import puppeteer from "puppeteer-core";
const browser = await puppeteer.connect({ browserURL: "http://localhost:9333" });
const page = await browser.newPage();
await page.goto("https://learn-ai-4ey.pages.dev/lessons/welcome/?cb=" + Date.now(), { waitUntil: "domcontentloaded" });
await new Promise((r) => setTimeout(r, 800));

const diag = await page.evaluate(() => {
  const ov = document.querySelector("[data-search-overlay]");
  const cs = getComputedStyle(ov);
  return {
    hasHiddenAttr: ov.hasAttribute("hidden"),
    display: cs.display,
    visibility: cs.visibility,
    position: cs.position,
    inset: cs.inset,
    zIndex: cs.zIndex,
    width: ov.offsetWidth,
    height: ov.offsetHeight,
  };
});
console.log("=== search-overlay computed style ===");
console.log(JSON.stringify(diag, null, 2));

// What's at the toggle's coordinates?
const at = await page.evaluate(() => {
  const t = document.querySelector("[data-theme-toggle]");
  const r = t.getBoundingClientRect();
  const cx = r.x + r.width / 2;
  const cy = r.y + r.height / 2;
  const el = document.elementFromPoint(cx, cy);
  return { x: cx, y: cy, hit: el ? el.tagName + "." + el.className : "null" };
});
console.log("");
console.log("=== What's at toggle's center coords? ===");
console.log(JSON.stringify(at));

await browser.disconnect();
