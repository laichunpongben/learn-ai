import type { APIRoute } from "astro";
import { lessonsInTrack, TRACKS } from "../data/curriculum";

/**
 * Plain-text site index for LLM crawlers and ingest pipelines.
 * Follows the emerging /llms.txt convention (llmstxt.org) — one curated
 * Markdown document that lists the most useful URLs for a downstream model
 * to read, organised by topic.
 */
export const GET: APIRoute = ({ site }) => {
  const base = (site ?? new URL("http://localhost:4321")).toString().replace(/\/$/, "");
  const lines: string[] = [
    "# Learn AI",
    "",
    "> A hands-on tour of modern AI assistants and agents — chat, coding CLI, cloud agents, UI generators, self-hosted agents. End with a tool you built.",
    "",
    "## Curriculum",
    "",
  ];
  for (const t of TRACKS) {
    lines.push(`### ${t.title}`, `${t.tagline}`, "");
    for (const l of lessonsInTrack(t.id)) {
      lines.push(`- [${l.title}](${base}/lessons/${l.slug}): ${l.blurb} (${l.minutes} min)`);
    }
    lines.push("");
  }
  lines.push("## Reference", "");
  lines.push(`- [Cookbook](${base}/cookbook): Copy-paste starter prompts.`);
  lines.push(`- [Glossary](${base}/glossary): Definitions for the AI terms tutorials drop without warning.`);
  lines.push(`- [What's next](${base}/whats-next): Where to go after you've finished the tutorial.`);
  lines.push("");
  return new Response(lines.join("\n"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
};
