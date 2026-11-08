import { featuredProjects } from "../../classic/data/projects";
import type { AppId } from "../hooks/useWindowManager";

/** Navigation intents handled locally in VardhanOS — no network, no model. */
export const OPEN_APPS: Record<string, AppId> = {
  overview: "overview", home: "overview", main: "overview",
  about: "about", "about-mac": "about-mac", "about-this-mac": "about-mac",
  projects: "projects", project: "projects", portfolio: "projects", work: "projects",
  experience: "experience", skills: "skills", tech: "skills", stack: "skills",
  achievements: "achievements", education: "achievements",
  contact: "contact", finder: "finder", terminal: "terminal",
  settings: "settings", preferences: "settings", ai: "vardhan-ai",
  "vardhan-ai": "vardhan-ai", assistant: "vardhan-ai", messages: "vardhan-ai", notes: "notes", photos: "photos",
};

export interface LocalAnswer { text: string; open?: AppId }

const normalize = (q: string) =>
  q.toLowerCase().replace(/[?.!]/g, "").replace(/[’']/g, "").replace(/\s+/g, " ").trim();

/**
 * "open settings", "go to experience", "launch terminal", "open hpl auction" → handled here.
 * Returns null for everything else, which goes to the shared RAG backend.
 */
export function localIntent(q: string): LocalAnswer | null {
  const m = normalize(q).match(/^(?:please )?(?:open|launch|start|show me|show|take me to|go to)\s+(?:the\s+)?(.+?)(?:\s+app)?$/);
  if (!m) return null;
  const target = m[1].trim();
  const key = target.replace(/\s+/g, "-");
  if (OPEN_APPS[key]) return { text: `Opening ${target}…`, open: OPEN_APPS[key] };
  const proj = featuredProjects.find((p) => p.name.toLowerCase() === target || p.slug.replace(/-/g, " ") === target || p.slug === key);
  if (proj) {
    const links = [`[GitHub](${proj.github})`, proj.live ? `[Live](${proj.live})` : ""].filter(Boolean).join(" · ");
    return { text: `Opening Projects for **${proj.name}** — ${proj.tagline} ${links}`, open: "projects" };
  }
  return null;
}
