import sitemap from "@astrojs/sitemap";
import { defineConfig } from "astro/config";

export default defineConfig({
  site: process.env.SITE_URL ?? "http://localhost:4321",
  trailingSlash: "ignore",
  // Inline every per-page stylesheet into the HTML. The site is text-heavy
  // and pages aren't large; eliminating the CSS round-trip is a clear LCP win.
  build: { inlineStylesheets: "always" },
  integrations: [sitemap({ filter: (page) => !page.endsWith("/404") })],
});
