import type { Project } from "../data/projects";

export type ProjectCategory = "ai" | "full-stack" | "tools";

export const CATEGORY_LABELS: Record<ProjectCategory, string> = {
  ai: "AI Products",
  "full-stack": "Full-Stack",
  tools: "Dev Tools",
};

/** Same categorisation as Aurora so filters feel consistent. */
export function catOf(p: Project): ProjectCategory {
  if (p.slug === "extension-ai") return "tools";
  if (p.slug === "ai-code-reviewer" || p.slug.endsWith("-ai")) return "ai";
  return "full-stack";
}

export function categoryCounts(projects: Project[]): Record<ProjectCategory, number> {
  const m: Record<ProjectCategory, number> = { ai: 0, "full-stack": 0, tools: 0 };
  for (const p of projects) m[catOf(p)]++;
  return m;
}

/** Unique tech names across projects, for the Stack Lab. */
export function labTechs(projects: Project[], limit = 28): string[] {
  const s = new Set<string>();
  projects.forEach((p) => p.tech.forEach((t) => s.add(t)));
  return [...s].sort().slice(0, limit);
}

/** Which featured projects use a given skill name. */
export function projectsUsing(projects: Project[], skill: string): Project[] {
  const q = skill.toLowerCase();
  return projects.filter((p) => p.tech.some((t) => t.toLowerCase().includes(q)));
}
