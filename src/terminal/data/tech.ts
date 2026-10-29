/**
 * Terminal-edition skill tree. Derived from src/classic/data/skills.ts — one source of truth.
 */
import { skillCategories } from "../../classic/data/skills";
import { caseStudies, otherWork } from "./work";

export const techGroups = skillCategories.map((c) => ({
  label: c.label,
  items: c.items.map((i) => i.name),
}));

export const langFor = (tech: string[]) =>
  tech.some((x) => /typescript|tanstack|next\.js/i.test(x)) ? "TypeScript" : tech.some((x) => /python|fastapi/i.test(x)) ? "Python" : tech.some((x) => /java\b|jakarta/i.test(x)) ? "Java" : "JavaScript";

/** Public repos shown in OPEN_SOURCE — the case studies plus the first few "also built" entries. */
export const fallbackRepos: { name: string; description: string; language: string; url: string }[] = [
  ...caseStudies.map((p) => ({ name: p.github.split("/").pop() ?? p.slug, description: p.description, language: langFor(p.tech), url: p.github })),
  ...otherWork.slice(0, 3).map((o) => ({ name: o.url.split("/").pop() ?? o.name, description: o.note.split(". ")[0] + ".", language: o.lang ?? "JavaScript", url: o.url })),
];
