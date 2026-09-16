import { featuredProjects, otherProjects } from "./projects";
import { experience } from "./experience";
import { skillCategories } from "./skills";

/** GitHub numbers are static (the live API is rate-limited); update alongside the README. */
export const github = { repos: 39, followers: 30 } as const;

export const stats = {
  projects: featuredProjects.length + otherProjects.length,
  shipped: featuredProjects.length,
  repos: github.repos,
  roles: experience.length,
  tools: skillCategories.reduce((n, c) => n + c.items.length, 0),
} as const;

const norm = (s: string) => s.toLowerCase().replace(/\s*(api|\.js|js)$/i, "").trim();
const haystacks = [...featuredProjects, ...otherProjects].map((p) => p.tech.map(norm));

/** How many projects list this tool in their stack (fuzzy on "X API" / "X.js"). */
export function usedIn(tool: string): number {
  const t = norm(tool);
  if (t.length < 2) return 0;
  return haystacks.filter((h) => h.some((x) => x === t || x.startsWith(t + " ") || t.startsWith(x + " "))).length;
}
