import sitemap from "@astrojs/sitemap";
import { defineConfig } from "astro/config";

const site = process.env.SITE_URL;

if (process.env.CI && !site) {
  throw new Error("SITE_URL must be set for CI builds");
}

export default defineConfig({
  site: site ?? "http://localhost:4321",
  trailingSlash: "ignore",
  // Inline every per-page stylesheet into the HTML. The site is text-heavy
  // and pages aren't large; eliminating the CSS round-trip is a clear LCP win.
  build: { inlineStylesheets: "always" },
  integrations: [sitemap({ filter: (page) => !page.endsWith("/404") })],
});
