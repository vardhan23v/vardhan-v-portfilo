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
  description: `Portfolio of ${site.name} — a Generative AI and full-stack developer building AI-powered products, developer tools and full-stack systems. Six interfaces, one body of work.`,
};

export const NOT_FOUND_SEO = { title: `Not found — ${site.name}`, description: "There is nothing at this address." };

export const SEO_ROUTES: readonly RouteSeoEntry[] = [
  { path: "/", ...LANDING_SEO, canonicalPath: "/" },
  { path: "/editions", ...LANDING_SEO, canonicalPath: "/" },
  ...EDITIONS.map((e) => ({ path: e.to, ...e.seo, canonicalPath: e.to })),
  ...caseStudies.map((s) => ({
    path: `/terminal/work/${s.slug}`,
    title: `${s.name} — case study | ${site.name}`,
    description: s.description,
    canonicalPath: `/terminal/work/${s.slug}`,
  })),
];

/** Fast lookup by exact path. */
export const SEO_BY_PATH: Readonly<Record<string, RouteSeoEntry>> = Object.fromEntries(SEO_ROUTES.map((r) => [r.path, r]));

/** Absolute canonical URL for an entry. */
export const canonicalUrl = (entry: Pick<RouteSeoEntry, "canonicalPath">) => `${site.url}${entry.canonicalPath}`;

/** Browser theme-color per route: Paper is the only light edition. */
export const themeColorFor = (pathname: string) => (pathname === "/paper" || pathname.startsWith("/paper/") ? "#f5f1ea" : "#05060f");
