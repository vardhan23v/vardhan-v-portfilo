import { useEffect, lazy, Suspense } from "react";
import { Outlet, Route, RouterProvider, createBrowserRouter, createRoutesFromElements, useLocation, useNavigate } from "react-router-dom";
import { CursorFX } from "./CursorFX";
import { ScrollChrome } from "./components/ScrollChrome";
import { CommandPalette } from "./components/CommandPalette";
import { KonamiFX } from "./components/KonamiFX";
import "./styles/motion.css";
import { editionRoutes } from "./editions";
import { NOT_FOUND_SEO, SEO_BY_PATH, canonicalUrl, themeColorFor } from "./seo";
import { NotFound } from "./components/NotFound";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { ErrorBoundary, RouteError } from "./components/ErrorBoundary";

const Landing = lazy(() => import("./landing/Landing").then((m) => ({ default: m.Landing })));
const ClassicSite = lazy(() => import("./classic/ClassicSite").then((m) => ({ default: m.ClassicSite })));
const PaperSite = lazy(() => import("./paper/PaperSite").then((m) => ({ default: m.PaperSite })));
const AuroraSite = lazy(() => import("./aurora/AuroraSite").then((m) => ({ default: m.AuroraSite })));
const ForgeSite = lazy(() => import("./forge/ForgeSite").then((m) => ({ default: m.ForgeSite })));
const MacPortfolio = lazy(() => import("./mac/MacPortfolio").then((m) => ({ default: m.MacPortfolio })));
const TerminalLayout = lazy(() => import("./terminal/TerminalLayout").then((m) => ({ default: m.TerminalLayout })));
const TerminalHome = lazy(() => import("./terminal/TerminalHome").then((m) => ({ default: m.TerminalHome })));
const WorkDetail = lazy(() => import("./terminal/components/WorkDetail").then((m) => ({ default: m.WorkDetail })));

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
    const known = pathname === "/" || pathname === "/editions" || interfaceRoutes.includes(base);
    const seo = known ? (SEO_BY_PATH[pathname] ?? SEO_BY_PATH[base]) : NOT_FOUND_SEO;
    const url = canonicalUrl({ canonicalPath: SEO_BY_PATH[pathname]?.canonicalPath ?? pathname });
    document.title = seo.title;
    setMeta('meta[name="description"]', seo.description);
    setMeta('meta[name="theme-color"]', themeColorFor(pathname));
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

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
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
      if (n >= 1 && n <= 6 && interfaceRoutes[n - 1]) {
        navigate(interfaceRoutes[n - 1], { viewTransition: true });
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [navigate, pathname]);

  return null;
}

function LoadingFallback() {
  return (
    <div style={{
      height: "100dvh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "var(--text-3)", // global token from src/styles/base.css (the mac-only tokens aren't loaded here)
      fontSize: "0.85rem",
    }}>
      Loading...
    </div>
  );
}

/** Root layout: global chrome + a Suspense boundary around the lazy edition routes. */
function Root() {
  return (
    <>
      <CursorFX />
      <InterfaceShortcuts />
      <ScrollChrome />
      <CommandPalette />
      <KonamiFX />
      <Analytics />
      <SpeedInsights />
      <RouteSeo />
      <ScrollToTop />
      <Suspense fallback={<LoadingFallback />}>
        <ErrorBoundary>
          <Outlet />
        </ErrorBoundary>
      </Suspense>
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
    <Route element={<Root />} errorElement={<RouteError />}>
      <Route path="/" element={<Landing />} />
      <Route path="/editions" element={<Landing />} />
      <Route path="/classic" element={<ClassicSite />} />
      <Route path="/paper" element={<PaperSite />} />
      <Route path="/aurora" element={<AuroraSite />} />
      <Route path="/forge" element={<ForgeSite />} />
      <Route path="/mac" element={<MacPortfolio />} />
      <Route path="/terminal" element={<TerminalLayout />}>
        <Route index element={<TerminalHome />} />
        <Route path="work/:slug" element={<WorkDetail />} />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Route>
  )
);

export default function App() {
  return <RouterProvider router={router} />;
}
