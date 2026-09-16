/**
 * Single source of truth for the six portfolio editions.
 * Landing, routing, SEO titles and the interface switcher all derive from this.
 */
export type Tone = "term" | "classic" | "paper" | "aurora" | "forge" | "mac";

export interface Edition {
  to: `/${string}`;
  label: string;
  tone: Tone;
  num: string;
  /** who it is for */
  role: string;
  /** one-line reason to pick it */
  blurb: string;
  cta: string;
  seo: { title: string; description: string };
}

export const EDITIONS: readonly Edition[] = [
  { to: "/terminal", label: "Terminal", tone: "term", num: "01", role: "for engineers", cta: "Enter the shell",
    blurb: "Type `ls work`, read man pages, and tab-complete your way through the projects.",
    seo: { title: "Terminal — Sree Vardhan V | Generative AI Developer", description: "Interactive terminal edition of Sree Vardhan V's portfolio — a Generative AI and full-stack developer." } },
  { to: "/classic", label: "Classic", tone: "classic", num: "02", role: "for recruiters · start here", cta: "Open the original",
    blurb: "The straightforward one — project grid, live GitHub stats, timeline and contact, top to bottom.",
    seo: { title: "Classic — Sree Vardhan V | Generative AI Developer & Full-Stack Developer", description: "Portfolio of Sree Vardhan V — a Computer Science undergraduate shipping AI-powered web applications." } },
  { to: "/paper", label: "Paper", tone: "paper", num: "03", role: "for reading", cta: "Open the paper",
    blurb: "Light editorial — serif headlines and a magazine layout. The same work, quietly printed.",
    seo: { title: "Paper — Sree Vardhan V | Generative AI Developer", description: "Editorial edition of Sree Vardhan V's portfolio — selected work, experience, skills, and contact." } },
  { to: "/aurora", label: "Aurora", tone: "aurora", num: "04", role: "for exploring", cta: "Step into the light",
    blurb: "Glass panels over drifting auroras, with a searchable project gallery and a stack lab.",
    seo: { title: "Aurora — Sree Vardhan V | Generative AI Developer", description: "Aurora edition — AI-powered products and full-stack systems, shipped end-to-end." } },
  { to: "/forge", label: "Forge", tone: "forge", num: "05", role: "for builders", cta: "Enter the forge",
    blurb: "Dark editorial — problem → solution case cards and a build-pipeline view of each project.",
    seo: { title: "Forge — Sree Vardhan V | Generative AI Developer", description: "Forge edition — Generative AI developer building LLM-powered products and full-stack systems." } },
  { to: "/mac", label: "macOS", tone: "mac", num: "06", role: "for fun", cta: "Boot the desktop",
    blurb: "A working desktop — Finder, Notes, Messages, Terminal, Launchpad and Mission Control, all real.",
    seo: { title: "macOS — Sree Vardhan V | Generative AI Developer", description: "macOS edition of Sree Vardhan V's portfolio — a premium desktop-inspired experience. Overview, projects, experience, skills, and contact." } },
];

export const editionRoutes: string[] = EDITIONS.map((e) => e.to);
export const editionByTone = (tone: Tone) => EDITIONS.find((e) => e.tone === tone)!;
