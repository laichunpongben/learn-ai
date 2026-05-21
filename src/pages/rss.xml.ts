import rss from "@astrojs/rss";
import type { APIRoute } from "astro";
import { LESSONS, trackById } from "../data/curriculum";

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
    })),
    customData: "<language>en-us</language>",
  });
