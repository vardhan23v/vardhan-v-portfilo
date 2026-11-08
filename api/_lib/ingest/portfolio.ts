import { site } from "../../../src/classic/data/site.js";
import { featuredProjects, otherProjects, CATEGORY_LABEL } from "../../../src/classic/data/projects.js";
import { experience, education, certifications } from "../../../src/classic/data/experience.js";
import { skillCategories, exploring } from "../../../src/classic/data/skills.js";
import { caseStudies } from "../../../src/terminal/data/work.js";
import type { KnowledgeDocument } from "../store.js";
import { repoName } from "../retrieval.js";

/**
 * Knowledge documents built straight from the TypeScript data the editions render —
 * the single source of truth, so the assistant can never drift from the site.
 */
export function buildPortfolioDocuments(): KnowledgeDocument[] {
  const docs: KnowledgeDocument[] = [];
  const base = site.url;

  docs.push({
    sourceType: "portfolio",
    sourceId: "portfolio:profile",
    title: `${site.name} — profile and contact`,
    sourceUrl: base,
    metadata: { section: "profile" },
    content: [
      `Name: ${site.name}`,
      `Title: ${site.title}`,
      `Tagline: ${site.tagline}`,
      `Location: ${site.location}`,
      `Availability: ${site.availability}`,
      `Email: ${site.email}`,
      `GitHub: ${site.github}`,
      `LinkedIn: ${site.linkedin}`,
      `Resume: ${base}${site.resume}`,
      `Portfolio website: ${base}`,
      `Typical reply time: ${site.replyTime}`,
    ].join("\n"),
  });

  for (const p of featuredProjects) {
    docs.push({
      sourceType: "portfolio",
      sourceId: `portfolio:project:${p.slug}`,
      title: `${p.name} (featured project)`,
      sourceUrl: `${base}/work/${p.slug}`,
      metadata: { section: "project", project: p.slug, repo: repoName(p.github), github: p.github, live: p.live ?? null, category: p.category },
      content: [
        `Project: ${p.name}`,
        `Category: ${CATEGORY_LABEL[p.category]}${p.kicker ? ` — ${p.kicker}` : ""}`,
        `Role: ${p.role ?? "Sole builder"}`,
        p.year ? `Year: ${p.year}` : "",
        `Tagline: ${p.tagline}`,
        `Problem and approach: ${p.problem}`,
        `Key features:\n${p.features.map((f) => `- ${f}`).join("\n")}`,
        `Tech stack: ${p.tech.join(", ")}`,
        `GitHub repository: ${p.github}`,
        p.live ? `Live site: ${p.live}` : "Live site: none listed",
        `Case study: ${base}/work/${p.slug}`,
      ].filter(Boolean).join("\n"),
    });
  }

  // Long-form case studies: architecture, decisions and lessons — the "why" behind each build.
  for (const cs of caseStudies) {
    docs.push({
      sourceType: "portfolio",
      sourceId: `portfolio:case-study:${cs.slug}`,
      title: `${cs.name} — case study`,
      sourceUrl: `${base}/work/${cs.slug}`,
      metadata: { section: "case-study", project: cs.slug, repo: repoName(cs.github), github: cs.github, live: cs.live ?? null },
      content: [
        `Case study: ${cs.name} — ${cs.tagline}`,
        cs.role ? `Role: ${cs.role}` : "",
        `Summary: ${cs.description}`,
        `Problem: ${cs.problem}`,
        `Approach: ${cs.approach}`,
        `Outcome: ${cs.outcome}`,
        `Architecture:\n${cs.architecture.map((a) => `- ${a.label}${a.note ? `: ${a.note}` : ""}`).join("\n")}`,
        `Key decisions:\n${cs.decisions.map((d) => `- ${d.title}: ${d.text}`).join("\n")}`,
        `Lessons learned:\n${cs.learned.map((l) => `- ${l}`).join("\n")}`,
        `Tech: ${cs.tech.join(", ")}`,
        `GitHub repository: ${cs.github}`,
        cs.live ? `Live site: ${cs.live}` : "",
      ].filter(Boolean).join("\n\n"),
    });
  }

  for (const p of otherProjects) {
    const repo = repoName(p.github);
    docs.push({
      sourceType: "portfolio",
      sourceId: `portfolio:other:${repo || p.name}`,
      title: `${p.name} (other project)`,
      sourceUrl: p.live ?? p.github,
      metadata: { section: "project", project: repo.toLowerCase(), repo, github: p.github, live: p.live ?? null },
      content: [
        `Project: ${p.name}`,
        p.category ? `Category: ${CATEGORY_LABEL[p.category]}` : "",
        `Description: ${p.description}`,
        `Tech stack: ${p.tech.join(", ")}`,
        `GitHub repository: ${p.github}`,
        p.live ? `Live site: ${p.live}` : "",
      ].filter(Boolean).join("\n"),
    });
  }

  for (const e of experience) {
    docs.push({
      sourceType: "portfolio",
      sourceId: `portfolio:experience:${e.company}:${e.role}`.toLowerCase().replace(/\s+/g, "-"),
      title: `${e.role} at ${e.company}`,
      sourceUrl: `${base}/classic`,
      metadata: { section: "experience" },
      content: `Experience: ${e.role} at ${e.company}\nPeriod: ${e.period}\n${e.points.map((x) => `- ${x}`).join("\n")}`,
    });
  }

  docs.push({
    sourceType: "portfolio",
    sourceId: "portfolio:education",
    title: "Education",
    sourceUrl: `${base}/classic`,
    metadata: { section: "education" },
    content: education.map((e) => `${e.degree} — ${e.school} (${e.period})${e.detail ? `. ${e.detail}` : ""}`).join("\n"),
  });

  docs.push({
    sourceType: "portfolio",
    sourceId: "portfolio:certifications",
    title: "Certifications",
    sourceUrl: `${base}/classic`,
    metadata: { section: "certifications" },
    content: `Certifications:\n${certifications.map((c) => `- ${c}`).join("\n")}`,
  });

  docs.push({
    sourceType: "portfolio",
    sourceId: "portfolio:skills",
    title: "Skills and tech stack",
    sourceUrl: `${base}/classic`,
    metadata: { section: "skills" },
    content: [
      ...skillCategories.map((c) => `${c.label}: ${c.items.map((i) => i.name).join(", ")}`),
      `Currently exploring: ${exploring.map((x) => `${x.name} (${x.note})`).join("; ")}`,
    ].join("\n"),
  });

  return docs;
}
