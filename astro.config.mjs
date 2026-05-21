import sitemap from "@astrojs/sitemap";
import { defineConfig } from "astro/config";

export default defineConfig({
  site: process.env.SITE_URL ?? "http://localhost:4321",
  trailingSlash: "ignore",
  integrations: [sitemap()],
});
