import { useEffect, lazy, Suspense } from "react";
import { BrowserRouter, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { CursorFX } from "./CursorFX";
import { ScrollChrome } from "./components/ScrollChrome";
import { CommandPalette } from "./components/CommandPalette";
import { KonamiFX } from "./components/KonamiFX";
import "./landing/Landing.css";
import "./styles/motion.css";

const Landing = lazy(() => import("./landing/Landing").then((m) => ({ default: m.Landing })));
const ClassicSite = lazy(() => import("./classic/ClassicSite").then((m) => ({ default: m.ClassicSite })));
const PaperSite = lazy(() => import("./paper/PaperSite").then((m) => ({ default: m.PaperSite })));
const AuroraSite = lazy(() => import("./aurora/AuroraSite").then((m) => ({ default: m.AuroraSite })));
const ForgeSite = lazy(() => import("./forge/ForgeSite").then((m) => ({ default: m.ForgeSite })));
const MacPortfolio = lazy(() => import("./mac/MacPortfolio").then((m) => ({ default: m.MacPortfolio })));
const TerminalLayout = lazy(() => import("./terminal/TerminalLayout").then((m) => ({ default: m.TerminalLayout })));
const TerminalHome = lazy(() => import("./terminal/TerminalHome").then((m) => ({ default: m.TerminalHome })));
const WorkDetail = lazy(() => import("./terminal/components/WorkDetail").then((m) => ({ default: m.WorkDetail })));

const interfaceRoutes = ["/terminal", "/classic", "/paper", "/aurora", "/forge", "/mac"];

const ROUTE_SEO: Record<string, { title: string; description: string }> = {
  "/": {
    title: "Sree Vardhan V | Generative AI Developer & Full-Stack Developer",
    description:
      "Portfolio of Sree Vardhan V — a Generative AI developer and full-stack engineer — presented as a macOS-style desktop. Overview, projects, experience, skills, and contact.",
  },
  "/editions": {
    title: "Editions — Sree Vardhan V | Generative AI Developer",
    description:
      "Six portfolio interfaces by Sree Vardhan V — Terminal, Classic, Paper, Aurora, Forge, and macOS.",
  },
  "/terminal": {
    title: "Terminal — Sree Vardhan V | Generative AI Developer",
    description:
      "Interactive terminal edition of Sree Vardhan V's portfolio — a Generative AI and full-stack developer.",
  },
  "/classic": {
    title: "Classic — Sree Vardhan V | Generative AI Developer & Full-Stack Developer",
    description:
      "Portfolio of Sree Vardhan V — a Computer Science undergraduate shipping AI-powered web applications.",
  },
  "/paper": {
    title: "Paper — Sree Vardhan V | Generative AI Developer",
    description:
      "Editorial edition of Sree Vardhan V's portfolio — selected work, experience, skills, and contact.",
  },
  "/aurora": {
    title: "Aurora — Sree Vardhan V | Generative AI Developer",
    description:
      "Aurora edition — AI-powered products and full-stack systems, shipped end-to-end.",
  },
  "/forge": {
    title: "Forge — Sree Vardhan V | Generative AI Developer",
    description:
      "Forge edition — Generative AI developer building LLM-powered products and full-stack systems.",
  },
  "/mac": {
    title: "macOS — Sree Vardhan V | Generative AI Developer",
    description:
      "macOS edition of Sree Vardhan V's portfolio — a premium desktop-inspired experience. Overview, projects, experience, skills, and contact.",
  },
};

function RouteSeo() {
  const { pathname } = useLocation();

  useEffect(() => {
    const seo = ROUTE_SEO[pathname] ?? ROUTE_SEO["/"];
    const meta = document.querySelector('meta[name="description"]');
    const prevTitle = document.title;
    const prevDesc = meta?.getAttribute("content") ?? null;
    document.title = seo.title;
    meta?.setAttribute("content", seo.description);
    return () => {
      document.title = prevTitle;
      if (meta && prevDesc !== null) meta.setAttribute("content", prevDesc);
    };
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
    // The macOS shell (/ and /mac) has its own inner 1-7 page shortcuts — don't hijack them
    if (pathname === "/" || pathname.startsWith("/mac")) return;
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
      color: "var(--text-tertiary)",
      fontSize: "var(--text-sm)",
    }}>
      Loading...
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <CursorFX />
      <InterfaceShortcuts />
      <ScrollChrome />
      <CommandPalette />
      <KonamiFX />
      <RouteSeo />
      <ScrollToTop />
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          <Route path="/" element={<MacPortfolio />} />
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
          <Route path="*" element={<MacPortfolio />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
