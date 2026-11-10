/**
 * Route → SEO table. Single source of truth for the client-side <RouteSeo /> in App.tsx,
 * the build-time prerender (scripts/prerender.mjs) and the sitemap (scripts/sitemap.mjs).
 *
 * This module is imported by Node at build time, so keep it free of browser APIs and of
 * imports that pull in CSS / JSX.
 */
import { EDITIONS } from "./editions";
import { site } from "./classic/data/site";
import { caseStudies } from "./terminal/data/work";

export interface RouteSeoEntry {
  /** URL path as served (e.g. "/classic", "/terminal/work/extension-ai"). */
  path: string;
  title: string;
  description: string;
  /** Path the canonical/og:url should point at — differs from `path` only for aliases. */
  canonicalPath: string;
}

export const LANDING_SEO = {
  title: `${site.name} | ${site.title}`,
  description: `Portfolio of ${site.name} — a Generative AI and full-stack developer building AI-powered products, developer tools and full-stack systems. Seven interfaces, one body of work.`,
};

export const NOT_FOUND_SEO = { title: `Not found — ${site.name}`, description: "There is nothing at this address." };

export const SEO_ROUTES: readonly RouteSeoEntry[] = [
  { path: "/", ...LANDING_SEO, canonicalPath: "/" },
  { path: "/editions", ...LANDING_SEO, canonicalPath: "/" },
  ...EDITIONS.map((e) => ({ path: e.to, ...e.seo, canonicalPath: e.to })),
  ...caseStudies.map((s) => ({
    path: `/work/${s.slug}`,
    title: `${s.name} — case study | ${site.name}`,
    description: s.description,
    canonicalPath: `/work/${s.slug}`,
  })),
  // The Terminal keeps its own reading of each study; search engines are pointed at /work.
  ...caseStudies.map((s) => ({
    path: `/terminal/work/${s.slug}`,
    title: `${s.name} — case study | ${site.name}`,
    description: s.description,
    canonicalPath: `/work/${s.slug}`,
  })),
];

/** Fast lookup by exact path. */
export const SEO_BY_PATH: Readonly<Record<string, RouteSeoEntry>> = Object.fromEntries(SEO_ROUTES.map((r) => [r.path, r]));

/** Absolute canonical URL for an entry. */
export const canonicalUrl = (entry: Pick<RouteSeoEntry, "canonicalPath">) => `${site.url}${entry.canonicalPath}`;

/** Which surface a pathname shows: the edition, the shared landing, a case study, or the 404. */
export type EditionKey = "landing" | "classic" | "aurora" | "forge" | "paper" | "terminal" | "atlas" | "mac" | "work" | "notfound";

/** [page background, color-scheme, accent] per surface: html background, theme-color, splash and pending bar. */
export const EDITION_SURFACE: Readonly<Record<EditionKey, readonly [bg: string, scheme: "light" | "dark", accent: string]>> = {
  landing: ["#0b0f1a", "dark", "#7c6cff"],
  terminal: ["#050807", "dark", "#36e57c"],
  classic: ["#1d274e", "dark", "#bbaf4a"],
  paper: ["#faf8f4", "light", "#be4b2a"],
  aurora: ["#0a0a18", "dark", "#f0abfc"],
  forge: ["#0c0c0c", "dark", "#7dd3fc"],
  mac: ["#0b0f1a", "dark", "#6ea8ff"],
  atlas: ["#0a0a0a", "dark", "#ff5b24"],
  work: ["#0b0f1a", "dark", "#6ea8ff"],
  notfound: ["#0b0f1a", "dark", "#7c6cff"],
};

const EDITION_PATHS = new Set(EDITIONS.map((e) => e.to));

/** Surface for a pathname ("/terminal/work/x" → terminal, "/work/x" → work, unknown → notfound). */
export function editionKey(pathname: string): EditionKey {
  const p = pathname.replace(/\/+$/, "") || "/";
  if (p === "/" || p === "/editions") return "landing";
  if (/^\/work\/[^/]+$/.test(p)) return "work";
  if (/^\/terminal\/work\/[^/]+$/.test(p)) return "terminal";
  return EDITION_PATHS.has(p as `/${string}`) ? (p.slice(1) as EditionKey) : "notfound";
}

/** Browser theme-color per route: the surface the page actually paints. */
export const themeColorFor = (pathname: string) => EDITION_SURFACE[editionKey(pathname)][0];
