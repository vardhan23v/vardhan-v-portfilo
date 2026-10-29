import { describe, expect, it } from "vitest";
import { featuredProjects, otherProjects, type ProjectCategory } from "../src/classic/data/projects";
import { stats, usedIn } from "../src/classic/data/stats";
import { caseStudies } from "../src/terminal/data/work";
import { EDITIONS } from "../src/editions";

const CATEGORIES: ProjectCategory[] = ["ai", "full-stack", "tool"];
const isHttps = (u: string) => /^https:\/\/\S+$/.test(u);

describe("featuredProjects", () => {
  it("has the required fields on every entry", () => {
    for (const p of featuredProjects) {
      expect(p.slug, "slug").toBeTruthy();
      expect(p.name, `${p.slug} name`).toBeTruthy();
      expect(p.category, `${p.slug} category`).toBeTruthy();
      expect(p.github, `${p.slug} github`).toBeTruthy();
      expect(Array.isArray(p.tech) && p.tech.length > 0, `${p.slug} tech`).toBe(true);
    }
  });

  it("has unique slugs", () => {
    const slugs = featuredProjects.map((p) => p.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("uses a known category", () => {
    for (const p of featuredProjects) expect(CATEGORIES, `${p.slug} category`).toContain(p.category);
  });

  it("links over https only", () => {
    for (const p of [...featuredProjects, ...otherProjects]) {
      expect(isHttps(p.github), `${p.slug ?? p.name} github url`).toBe(true);
      if (p.live) expect(isHttps(p.live), `${p.slug ?? p.name} live url`).toBe(true);
    }
  });
});

describe("terminal caseStudies", () => {
  it("every slug exists in featuredProjects", () => {
    const featured = new Set(featuredProjects.map((p) => p.slug));
    for (const cs of caseStudies) expect(featured.has(cs.slug), `case study ${cs.slug}`).toBe(true);
  });
});

describe("EDITIONS", () => {
  it("has unique routes", () => {
    const routes = EDITIONS.map((e) => e.to);
    expect(new Set(routes).size).toBe(routes.length);
  });

  it("has an SEO title and description each", () => {
    for (const e of EDITIONS) {
      expect(e.seo.title, `${e.to} title`).toBeTruthy();
      expect(e.seo.description, `${e.to} description`).toBeTruthy();
    }
  });
});

describe("stats", () => {
  it("counts live featured projects", () => {
    expect(stats.live).toBe(featuredProjects.filter((p) => Boolean(p.live)).length);
  });

  it("usedIn() finds the headline tools", () => {
    expect(usedIn("Next.js")).toBeGreaterThanOrEqual(2);
    expect(usedIn("React")).toBeGreaterThanOrEqual(5);
  });
});
