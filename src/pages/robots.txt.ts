import type { APIRoute } from "astro";

export const GET: APIRoute = ({ site }) => {
  const sitemapUrl = new URL("/sitemap-index.xml", site ?? "http://localhost:4321").toString();
  const body = [
    "User-agent: *",
    "Allow: /",
    "",
    "# Polite crawl rate — this is a small tutorial site.",
    "Crawl-delay: 2",
    "",
    `Sitemap: ${sitemapUrl}`,
    "",
  ].join("\n");
  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
};
