import rss from "@astrojs/rss";
import type { APIRoute } from "astro";
import { LESSONS, trackById } from "../data/curriculum";

// Initial launch date — used as a stable pubDate so feed readers don't
// re-surface every lesson on each fetch. Bump when a lesson is added or
// substantively rewritten to nudge readers.
const FEED_PUB_DATE = new Date("2026-05-21T00:00:00Z");

export const GET: APIRoute = (context) =>
  rss({
    title: "Learn AI · Lessons",
    description: "A hands-on tour of modern AI assistants and agents.",
    site: context.site ?? "http://localhost:4321",
    items: LESSONS.map((l) => ({
      title: l.title,
      description: l.blurb,
      link: `/lessons/${l.slug}`,
      categories: [trackById(l.track).title],
      pubDate: FEED_PUB_DATE,
    })),
    customData: `<language>en-us</language><lastBuildDate>${new Date().toUTCString()}</lastBuildDate>`,
  });
