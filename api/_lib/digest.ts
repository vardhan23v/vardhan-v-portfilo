import { experience } from "../../src/classic/data/experience.js";
import { featuredProjects, otherProjects } from "../../src/classic/data/projects.js";
import { site } from "../../src/classic/data/site.js";
import { skillCategories } from "../../src/classic/data/skills.js";
import { caseStudies } from "../../src/terminal/data/work.js";

export const DIGEST_TITLE = "All projects overview";
export const CAREER_TITLE = "Work experience overview";
export const CONTACT_TITLE = "Contact details";
export const SKILLS_TITLE = "Skills overview";

/** Every skill category from the portfolio, one line each. */
export function skillsOverview(): string {
  return skillCategories.map((c) => `- ${c.label}: ${c.items.map((i) => i.name).join(", ")}`).join("\n");
}

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

const clip = (s: string, words: number) => {
  const w = s.replace(/\s+/g, " ").trim().split(" ");
  return w.length > words ? `${w.slice(0, words).join(" ")}…` : w.join(" ");
};

/** Display name for a project key (featured slug or repo name). */
export function projectName(key: string): string {
  const k = key.toLowerCase();
  const f = featuredProjects.find((p) => p.slug === k);
  if (f) return f.name;
  const o = otherProjects.find((p) => repoOf(p.github).toLowerCase() === k || p.name.toLowerCase().replace(/[^a-z0-9]+/g, "-") === k);
  return o?.name ?? key;
}

function repoOf(url?: string) {
  return url?.match(/github\.com\/[^/]+\/([^/#?]+)/i)?.[1]?.replace(/\.git$/, "") ?? "";
}

/**
 * The evidence a judgement answer weighs: per featured project, who built it, the problem, scope,
 * stack and (where a case study exists) the key decisions. Built from the data files, so no sync.
 */
export function judgementDigest(): string {
  const featured = featuredProjects.map((p) => {
    const cs = caseStudies.find((c) => c.slug === p.slug);
    const parts = [
      `- ${p.name} (${p.category}; ${p.role ?? "sole builder"}${p.year ? `, ${p.year}` : ""}): ${clip(p.problem, 16)}`,
      `  Scope: ${p.features.length} features (${p.features.slice(0, 2).join("; ")}). Tech: ${p.tech.slice(0, 6).join(", ")}.${p.live ? " Live." : ""}`,
    ];
    if (cs?.decisions.length) parts.push(`  Decisions: ${cs.decisions.slice(0, 3).map((d) => d.title).join("; ")}.`);
    return parts.join("\n");
  });
  const other = otherProjects.map((p) => p.name).join(", ");
  return `Featured projects:\n${featured.join("\n")}\nSmaller builds: ${other}.`;
}

/** One compact card with everything the portfolio states about a single project. */
export function factCard(key: string): { title: string; url?: string; content: string } | null {
  const k = key.toLowerCase();
  const p = featuredProjects.find((x) => x.slug === k);
  if (p) {
    const cs = caseStudies.find((c) => c.slug === p.slug);
    const lines = [
      `${p.name}: ${p.tagline}`,
      `Category: ${p.category}. Role: ${p.role ?? "sole builder"}.${p.year ? ` Year: ${p.year}.` : ""}`,
      `Problem: ${clip(p.problem, 60)}`,
      `Features: ${p.features.join("; ")}.`,
      `Tech: ${p.tech.join(", ")}.`,
    ];
    if (cs) {
      lines.push(`Key decisions: ${cs.decisions.map((d) => d.title).join("; ")}.`);
      lines.push(`Architecture: ${cs.architecture.map((a) => a.label).join(" → ")}.`);
    }
    lines.push(`GitHub: ${p.github}`);
    if (p.live) lines.push(`Live site: ${p.live}`);
    else lines.push("Live site: none listed.");
    if (cs) lines.push(`Case study: ${site.url}/work/${p.slug}`);
    return { title: `${p.name} project facts`, url: p.github, content: lines.join("\n") };
  }
  const o = otherProjects.find((x) => repoOf(x.github).toLowerCase() === k || x.name.toLowerCase().replace(/[^a-z0-9]+/g, "-") === k);
  if (!o) return null;
  const lines = [`${o.name}: ${o.description}`, `Tech: ${o.tech.join(", ")}.`, `GitHub: ${o.github}`, o.live ? `Live site: ${o.live}` : "Live site: none listed."];
  return { title: `${o.name} project facts`, url: o.github, content: lines.join("\n") };
}
