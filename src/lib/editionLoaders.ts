/**
 * One memoised loader per lazy route, shared by the router (route.lazy) and prefetching.
 * `prefetchEdition("/paper")` on hover/focus/touch means the click finds the chunk ready, and
 * the router's `lazy` resolves from the same promise, so the module is fetched exactly once.
 */
import type { ComponentType } from "react";

type Loader = () => Promise<unknown>;

const once = <T,>(f: () => Promise<T>): (() => Promise<T>) => {
  let p: Promise<T> | undefined;
  return () => (p ??= f().catch((e) => { p = undefined; throw e; }));
};

// Module loaders (one fetch each).
const mod = {
  landing: once(() => import("../landing/Landing")),
  classic: once(() => import("../classic/ClassicSite")),
  paper: once(() => import("../paper/PaperSite")),
  aurora: once(() => import("../aurora/AuroraSite")),
  forge: once(() => import("../forge/ForgeSite")),
  atlas: once(() => import("../atlas/AtlasSite")),
  mac: once(() => import("../mac/MacPortfolio")),
  termLayout: once(() => import("../terminal/TerminalLayout")),
  termHome: once(() => import("../terminal/TerminalHome")),
  termWork: once(() => import("../terminal/components/WorkDetail")),
  caseStudy: once(() => import("../work/CaseStudy")),
};

/** Prefetch keys → everything that route needs (a nested route needs its parent too). */
export const editionLoaders: Record<string, Loader> = {
  "/": mod.landing,
  "/classic": mod.classic,
  "/paper": mod.paper,
  "/aurora": mod.aurora,
  "/forge": mod.forge,
  "/atlas": mod.atlas,
  "/mac": mod.mac,
  "/terminal": () => Promise.all([mod.termLayout(), mod.termHome()]),
  "/terminal/work": () => Promise.all([mod.termLayout(), mod.termWork()]),
  "/work": mod.caseStudy,
};

type Lazy = () => Promise<{ Component: ComponentType }>;
const asRoute = <M,>(load: () => Promise<M>, pick: (m: M) => ComponentType): Lazy => () => load().then((m) => ({ Component: pick(m) }));

/** `route.lazy` for each route (react-router maps `Component` onto the route). */
export const routeLazy = {
  landing: asRoute(mod.landing, (m) => m.Landing),
  classic: asRoute(mod.classic, (m) => m.ClassicSite),
  paper: asRoute(mod.paper, (m) => m.PaperSite),
  aurora: asRoute(mod.aurora, (m) => m.AuroraSite),
  forge: asRoute(mod.forge, (m) => m.ForgeSite),
  atlas: asRoute(mod.atlas, (m) => m.AtlasSite),
  mac: asRoute(mod.mac, (m) => m.MacPortfolio),
  termLayout: asRoute(mod.termLayout, (m) => m.TerminalLayout),
  termHome: asRoute(mod.termHome, (m) => m.TerminalHome),
  termWork: asRoute(mod.termWork, (m) => m.WorkDetail),
  caseStudy: asRoute(mod.caseStudy, (m) => m.CaseStudy),
} satisfies Record<string, Lazy>;

/** Loader key for a pathname ("/terminal/work/x" → "/terminal/work", "/work/x" → "/work"). */
export function loaderKey(pathname: string): string | undefined {
  const p = pathname.replace(/\/+$/, "") || "/";
  if (p === "/" || p === "/editions") return "/";
  if (p.startsWith("/terminal/work/")) return "/terminal/work";
  if (p.startsWith("/work/")) return "/work";
  const base = "/" + p.split("/")[1];
  return base in editionLoaders ? base : undefined;
}

type Conn = { saveData?: boolean; effectiveType?: string };
const connection = () => (typeof navigator === "undefined" ? undefined : (navigator as Navigator & { connection?: Conn }).connection);

/** True when idle (speculative) prefetching should be skipped: Data Saver or a 2G-class link. */
export function idlePrefetchBlocked(): boolean {
  const c = connection();
  return !!c?.saveData || /(^|-)2g$/.test(c?.effectiveType ?? "");
}

let inFlight = 0;
/** True while a speculative prefetch is downloading; main.tsx then lets a failed preload fail quietly
 *  (no page reload) — a real navigation that needs the chunk still recovers through the ErrorBoundary. */
export const isPrefetching = (): boolean => inFlight > 0;

/** Start downloading a route's code; safe to call repeatedly. Skipped on Data Saver and 2G-class links. */
export function prefetchEdition(pathname: string): void {
  if (idlePrefetchBlocked()) return;
  const key = loaderKey(pathname);
  if (!key) return;
  inFlight++;
  editionLoaders[key]().catch(() => {}).finally(() => { inFlight--; });
}
