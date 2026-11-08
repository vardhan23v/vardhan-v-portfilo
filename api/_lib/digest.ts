import { featuredProjects, otherProjects } from "../../src/classic/data/projects.js";

export const DIGEST_TITLE = "All projects overview";

/** One compact list of every project, so judgement and listing answers can weigh all of them. */
export function projectDigest(): string {
  const featured = featuredProjects.map((p) => `- ${p.name} (${p.category}): ${p.tagline} Tech: ${p.tech.slice(0, 4).join(", ")}`);
  const other = otherProjects.map((p) => `- ${p.name}: ${p.tech.slice(0, 3).join(", ")}`);
  return `Featured projects:\n${featured.join("\n")}\nOther projects:\n${other.join("\n")}`;
}
