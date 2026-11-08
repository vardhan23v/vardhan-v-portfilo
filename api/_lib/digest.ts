import { experience } from "../../src/classic/data/experience.js";
import { featuredProjects, otherProjects } from "../../src/classic/data/projects.js";
import { site } from "../../src/classic/data/site.js";

export const DIGEST_TITLE = "All projects overview";
export const CAREER_TITLE = "Work experience overview";
export const CONTACT_TITLE = "Contact details";

export function careerOverview(): string {
  return experience.map((e) => `- ${e.role} at ${e.company} (${e.period}): ${e.points.slice(0, 2).join("; ")}`).join("\n");
}

export function contactOverview(): string {
  return `Email: ${site.email}\nGitHub: ${site.github}\nLinkedIn: ${site.linkedin}\nLocation: ${site.location}`;
}

/** One compact list of every project, so judgement and listing answers can weigh all of them. */
export function projectDigest(): string {
  const featured = featuredProjects.map((p) => `- ${p.name} (${p.category}): ${p.tagline} Tech: ${p.tech.slice(0, 4).join(", ")}`);
  const other = otherProjects.map((p) => `- ${p.name}: ${p.tech.slice(0, 2).join(", ")}`);
  return `Featured projects:\n${featured.join("\n")}\nOther projects:\n${other.join("\n")}`;
}
