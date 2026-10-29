import { featuredProjects, otherProjects } from "./projects";
import { experience } from "./experience";
import { skillCategories } from "./skills";

/**
 * Static GitHub fallback, used until the live API answers (or when it is rate-limited).
 * Checked 2026-10-29 — update alongside the README.
 */
export const GITHUB_FALLBACK = { repos: 60, followers: 33 } as const;
export const github = GITHUB_FALLBACK;

/** Featured projects with a public deployment. */
export const liveProjects = featuredProjects.filter((p) => Boolean(p.live));
/** Roles whose period is still open. */
export const ongoingRoles = experience.filter((e) => /present/i.test(e.period)).length;
/** The AI / LLM tools listed in the skills data — the single source for "ships with AI" copy. */
export const aiStack: string[] = skillCategories.find((c) => c.label === "AI / LLM")?.items.map((i) => i.name) ?? [];

export const stats = {
  projects: featuredProjects.length + otherProjects.length,
  featured: featuredProjects.length,
  live: liveProjects.length,
  repos: github.repos,
  roles: experience.length,
  tools: skillCategories.reduce((n, c) => n + c.items.length, 0),
} as const;

/** "Next.js 16" → "next", "Groq API" → "groq", "React 19" → "react". */
const norm = (s: string) =>
  s
    .toLowerCase()
    .replace(/\s+v?\d+(\.\d+)*$/, "")
    .replace(/\s*(api|\.js|js)$/i, "")
    .trim();
const haystacks = [...featuredProjects, ...otherProjects].map((p) => p.tech.map(norm));

/** How many projects list this tool in their stack (fuzzy on "X API" / "X.js" / "X 16"). */
export function usedIn(tool: string): number {
  const t = norm(tool);
  if (t.length < 2) return 0;
  return haystacks.filter((h) => h.some((x) => x === t || x.startsWith(t + " ") || t.startsWith(x + " "))).length;
}
