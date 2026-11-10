import { useEffect, useLayoutEffect, useRef, Suspense, type CSSProperties } from "react";
import { Navigate, Outlet, Route, RouterProvider, createBrowserRouter, createRoutesFromElements, useLocation, useNavigate, useNavigationType } from "react-router-dom";
import { CursorFX } from "./CursorFX";
import { ScrollChrome } from "./components/ScrollChrome";
import { CommandPalette } from "./components/CommandPalette";
import { KonamiFX } from "./components/KonamiFX";
import "./styles/motion.css";
import { editionRoutes } from "./editions";
import { EDITION_SURFACE, NOT_FOUND_SEO, SEO_BY_PATH, canonicalUrl, editionKey } from "./seo";
import { NotFound } from "./components/NotFound";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { ErrorBoundary, RouteError } from "./components/ErrorBoundary";
import { PortfolioAssistant } from "./components/ai/PortfolioAssistant";
import { idlePrefetchBlocked, prefetchEdition, routeLazy } from "./lib/editionLoaders";

const interfaceRoutes = editionRoutes;

const setMeta = (selector: string, content: string) => document.querySelector(selector)?.setAttribute("content", content);

/**
 * Per-route title/description/og/canonical, driven by the shared table in src/seo.ts (the same
 * one the build-time prerender uses). Nested routes without their own entry inherit their
 * edition's entry by prefix.
 */
function RouteSeo() {
  const { pathname } = useLocation();

  useEffect(() => {
    const base = "/" + pathname.split("/")[1];
    const known = pathname === "/" || pathname === "/editions" || interfaceRoutes.includes(base) || Boolean(SEO_BY_PATH[pathname]);
    const seo = known ? (SEO_BY_PATH[pathname] ?? SEO_BY_PATH[base]) : NOT_FOUND_SEO;
    const url = canonicalUrl({ canonicalPath: SEO_BY_PATH[pathname]?.canonicalPath ?? pathname });
    document.title = seo.title;
    setMeta('meta[name="description"]', seo.description);
    setMeta('meta[property="og:title"]', seo.title);
    setMeta('meta[property="og:description"]', seo.description);
    setMeta('meta[property="og:url"]', url);
    setMeta('meta[name="twitter:title"]', seo.title);
    setMeta('meta[name="twitter:description"]', seo.description);
    document.querySelector('link[rel="canonical"]')?.setAttribute("href", url);
    let robots = document.querySelector<HTMLMetaElement>('meta[name="robots"]');
    if (!known) {
      if (!robots) { robots = document.createElement("meta"); robots.name = "robots"; document.head.appendChild(robots); }
      robots.content = "noindex";
    } else robots?.remove();
  }, [pathname]);

  return null;
}

/* ---------- scroll: instant reset on a new page, restore on Back/Forward ---------- */

const SCROLL_KEY = "route-scroll";
const savedScroll: Map<string, number> = (() => {
  try {
    const raw = sessionStorage.getItem(SCROLL_KEY);
    return new Map<string, number>(raw ? JSON.parse(raw) : []);
  } catch {
    return new Map<string, number>();
  }
})();

/**
 * Runs in the commit (layout effect), i.e. inside react-router's View Transition update callback,
 * so the new edition is captured at its final scroll position: no smooth scroll racing up through
 * the page while it fades in. Back/Forward restore where the visitor was (retrying for a few
 * frames while a lazy page grows); in-page hash links keep their smooth scroll.
 */
function RouteScroll() {
  const loc = useLocation();
  const nav = useNavigationType();
  const keyRef = useRef(loc.key);
  const prevPath = useRef<string | null>(null);

  useEffect(() => {
    if ("scrollRestoration" in history) history.scrollRestoration = "manual";
    let raf = 0;
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(() => { raf = 0; savedScroll.set(keyRef.current, window.scrollY); });
    };
    const persist = () => {
      try { sessionStorage.setItem(SCROLL_KEY, JSON.stringify([...savedScroll].slice(-50))); } catch { /* storage unavailable */ }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("pagehide", persist);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("pagehide", persist);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  useLayoutEffect(() => {
    keyRef.current = loc.key;
    const samePage = prevPath.current === loc.pathname;
    const first = prevPath.current === null;
    prevPath.current = loc.pathname;
    if (loc.hash && nav !== "POP") {
      if (samePage) return; // in-page anchor: let it glide
      let id = loc.hash.slice(1);
      try { id = decodeURIComponent(id); } catch { /* keep it raw */ }
      const el = document.getElementById(id);
      if (el) { el.scrollIntoView({ behavior: "instant", block: "start" }); return; }
    }
    if (samePage && nav !== "POP") return; // search-param-only change on the same page
    const target = nav === "POP" ? (savedScroll.get(loc.key) ?? 0) : 0;
    if (first && target === 0) return; // fresh load: the browser already starts at the top
    window.scrollTo({ top: target, left: 0, behavior: "instant" });
    if (target <= 0 || Math.abs(window.scrollY - target) < 2) return;
    // The restored page may still be growing (lazy sections, images): keep trying briefly,
    // and give up the moment the visitor scrolls themselves.
    let raf = 0;
    const until = performance.now() + 900;
    const cancel = () => { cancelAnimationFrame(raf); raf = 0; off(); };
    const off = () => ["wheel", "touchstart", "keydown", "pointerdown"].forEach((t) => window.removeEventListener(t, cancel));
    ["wheel", "touchstart", "keydown", "pointerdown"].forEach((t) => window.addEventListener(t, cancel, { passive: true, once: true }));
    const retry = () => {
      window.scrollTo({ top: target, left: 0, behavior: "instant" });
      if (Math.abs(window.scrollY - target) < 2 || performance.now() > until) { raf = 0; off(); return; }
      raf = requestAnimationFrame(retry);
    };
    raf = requestAnimationFrame(retry);
    return cancel;
  }, [loc.key, loc.pathname, loc.hash, nav]);

  return null;
}

/* ---------- per-edition surface + transition direction ---------- */

/** html[data-edition], background, color-scheme, --edition-bg and theme-color for a pathname. */
function applySurface(pathname: string) {
  const key = editionKey(pathname);
  const [bg, scheme] = EDITION_SURFACE[key];
  const html = document.documentElement;
  html.dataset.edition = key;
  html.style.backgroundColor = bg;
  html.style.colorScheme = scheme;
  html.style.setProperty("--edition-bg", bg);
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", bg);
}

// Before the first paint of the app (the hydrate splash), so the first frame is already tinted.
if (typeof document !== "undefined") applySurface(window.location.pathname);

/** Index in the switcher's 1–7 order, or null for anything that is not an edition's own page. */
const editionIndex = (pathname: string) => {
  const i = interfaceRoutes.indexOf(pathname.replace(/\/+$/, "") || "/");
  return i < 0 ? null : i;
};

/**
 * Writes the surface and the View Transition direction in the commit, before react-router's
 * update callback resolves, so the new snapshot and its pseudo-elements see them. A navigation
 * can name its direction (`state: { vtDir: "fwd" | "back" }`, e.g. case-study prev/next);
 * otherwise only an edition-to-edition switch is directional.
 */
function RouteChrome() {
  const { pathname, state } = useLocation();
  const navType = useNavigationType();
  const prev = useRef<string | null>(null);

  useLayoutEffect(() => {
    applySurface(pathname);
    // A history entry's saved vtDir described how it was first reached; on Back/Forward it would
    // point the wrong way, so POP only uses the edition order.
    const asked = navType === "POP" ? undefined : (state as { vtDir?: unknown } | null)?.vtDir;
    let dir: "fwd" | "back" | "none" = "none";
    if (asked === "fwd" || asked === "back") dir = asked;
    else if (prev.current !== null) {
      const a = editionIndex(prev.current), b = editionIndex(pathname);
      if (a !== null && b !== null && a !== b) dir = b > a ? "fwd" : "back";
    }
    document.documentElement.dataset.vtDir = dir;
    prev.current = pathname;
  }, [pathname, state, navType]);

  // Once the page is idle, fetch the editions either side of this one (1–7 order) so the
  // switcher and number keys find them ready. Skipped on Data Saver and 2G-class links.
  useEffect(() => {
    const i = editionIndex(pathname);
    if (i === null || idlePrefetchBlocked()) return;
    const run = () => [interfaceRoutes[i - 1], interfaceRoutes[i + 1]].forEach((p) => p && prefetchEdition(p));
    const w = window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number; cancelIdleCallback?: (id: number) => void };
    if (w.requestIdleCallback) {
      const id = w.requestIdleCallback(run, { timeout: 4000 });
      return () => w.cancelIdleCallback?.(id);
    }
    const t = window.setTimeout(run, 2500);
    return () => window.clearTimeout(t);
  }, [pathname]);

  return null;
}

function InterfaceShortcuts() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  useEffect(() => {
    // /mac has its own inner 1-7 page shortcuts — don't hijack them
    if (pathname.startsWith("/mac")) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable)) return;
      const n = Number(e.key);
      if (n >= 1 && n <= interfaceRoutes.length && interfaceRoutes[n - 1]) {
        navigate(interfaceRoutes[n - 1], { viewTransition: true });
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [navigate, pathname]);

  return null;
}

/** A silent surface in the edition's colour with the shared 2px pending bar (no "Loading..." text flash). */
function LoadingFallback() {
  const accent = EDITION_SURFACE[editionKey(window.location.pathname)][2];
  return (
    <div className="route-splash" role="status" style={{ "--splash-accent": accent } as CSSProperties}>
      <span className="sr-only">Loading</span>
    </div>
  );
}

/** Editions without a skip link of their own. */
const NEEDS_SKIP_LINK = new Set(["/", "/editions", "/aurora", "/forge", "/mac"]);

function SkipLink() {
  const { pathname } = useLocation();
  const path = pathname.replace(/\/+$/, "") || "/";
  if (!NEEDS_SKIP_LINK.has(path) && !path.startsWith("/work/")) return null;
  const toMain = (e: React.MouseEvent) => {
    e.preventDefault();
    const main = document.querySelector("main");
    if (!main) return;
    main.setAttribute("tabindex", "-1");
    main.focus();
  };
  return <a className="skip-global" href="#main" onClick={toMain}>Skip to content</a>;
}

/** Root layout: global chrome + a Suspense boundary for lazy content nested inside an edition (routes load via route.lazy). */
function Root() {
  return (
    <>
      <SkipLink />
      <CursorFX />
      <InterfaceShortcuts />
      <ScrollChrome />
      <CommandPalette />
      <KonamiFX />
      <Analytics />
      <SpeedInsights />
      <RouteSeo />
      <RouteChrome />
      <RouteScroll />
      <Suspense fallback={<LoadingFallback />}>
        <ErrorBoundary>
          <Outlet />
        </ErrorBoundary>
      </Suspense>
      {/* After the page so an edition's own skip link is the first tab stop; the launcher is fixed-position. */}
      <PortfolioAssistant />
    </>
  );
}

/*
 * Data router on purpose: `viewTransition` on <Link>/navigate() is only honoured
 * by createBrowserRouter — the declarative <BrowserRouter> silently ignores it,
 * which is why the page-to-page crossfade never ran before.
 */
const router = createBrowserRouter(
  createRoutesFromElements(
    <Route element={<Root />} errorElement={<RouteError />} hydrateFallbackElement={<LoadingFallback />}>
      {/* route.lazy: the router fetches the module before it commits, so a View Transition never
          starts on a chunk that is still downloading (src/lib/editionLoaders.ts shares the fetch with prefetching). */}
      <Route path="/" lazy={routeLazy.landing} />
      <Route path="/editions" lazy={routeLazy.landing} />
      <Route path="/classic" lazy={routeLazy.classic} />
      <Route path="/paper" lazy={routeLazy.paper} />
      <Route path="/aurora" lazy={routeLazy.aurora} />
      <Route path="/forge" lazy={routeLazy.forge} />
      <Route path="/mac" lazy={routeLazy.mac} />
      <Route path="/atlas" lazy={routeLazy.atlas} />
      <Route path="/terminal" lazy={routeLazy.termLayout}>
        <Route index lazy={routeLazy.termHome} />
        <Route path="work/:slug" lazy={routeLazy.termWork} />
      </Route>
      <Route path="/work" element={<Navigate to="/" replace />} />
      <Route path="/work/:slug" lazy={routeLazy.caseStudy} />
      <Route path="*" element={<NotFound />} />
    </Route>
  )
);

export default function App() {
  return <RouterProvider router={router} />;
}
