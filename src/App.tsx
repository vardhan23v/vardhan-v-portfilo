import { useEffect } from "react";
import { BrowserRouter, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { Landing } from "./landing/Landing";
import { ClassicSite } from "./classic/ClassicSite";
import { TerminalLayout } from "./terminal/TerminalLayout";
import { TerminalHome } from "./terminal/TerminalHome";
import { WorkDetail } from "./terminal/components/WorkDetail";
import { PaperSite } from "./paper/PaperSite";
import { AuroraSite } from "./aurora/AuroraSite";
import { ForgeSite } from "./forge/ForgeSite";
import { CursorFX } from "./CursorFX";
import { ScrollChrome } from "./components/ScrollChrome";
import { CommandPalette } from "./components/CommandPalette";
import "./landing/Landing.css";
import "./styles/motion.css";

const interfaceRoutes = ["/terminal", "/classic", "/paper", "/aurora", "/forge"];

const ROUTE_SEO: Record<string, { title: string; description: string }> = {
  "/": {
    title: "Sree Vardhan V | Generative AI Developer & Full-Stack Developer",
    description:
      "Five portfolio interfaces by Sree Vardhan V — a Generative AI developer and full-stack engineer building AI-powered products, developer tools, and full-stack systems.",
  },
  "/terminal": {
    title: "Terminal — Sree Vardhan V | Generative AI Developer",
    description:
      "Interactive terminal edition of Sree Vardhan V's portfolio — a Generative AI and full-stack developer. Explore projects, experience, skills, and contact via the shell.",
  },
  "/classic": {
    title: "Sree Vardhan V | Generative AI Developer & Full-Stack Developer",
    description:
      "Portfolio of Sree Vardhan V — a Computer Science undergraduate shipping AI-powered web applications, developer tools, and full-stack products.",
  },
  "/paper": {
    title: "Paper — Sree Vardhan V | Generative AI Developer",
    description:
      "Editorial edition of Sree Vardhan V's portfolio — a Generative AI developer and full-stack engineer. Selected work, experience, skills, and contact in print style.",
  },
  "/aurora": {
    title: "Aurora — Sree Vardhan V | Generative AI Developer",
    description:
      "Aurora edition of Sree Vardhan V's portfolio — AI-powered products and full-stack systems, shipped end-to-end. Projects, experience, skills, and contact.",
  },
  "/forge": {
    title: "Forge — Sree Vardhan V | Generative AI Developer",
    description:
      "Forge edition of Sree Vardhan V — Generative AI developer building LLM-powered products, developer tools, and full-stack systems.",
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

function InterfaceShortcuts() {
  const navigate = useNavigate();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable)) return;
      const n = Number(e.key);
      if (n >= 1 && n <= 6 && interfaceRoutes[n - 1]) {
        navigate(interfaceRoutes[n - 1]);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [navigate]);

  return null;
}

export default function App() {
  return (
    <BrowserRouter>
      <CursorFX />
      <InterfaceShortcuts />
      <ScrollChrome />
      <CommandPalette />
      <RouteSeo />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/classic" element={<ClassicSite />} />
        <Route path="/paper" element={<PaperSite />} />
        <Route path="/aurora" element={<AuroraSite />} />
        <Route path="/forge" element={<ForgeSite />} />
        <Route path="/terminal" element={<TerminalLayout />}>
          <Route index element={<TerminalHome />} />
          <Route path="work/:slug" element={<WorkDetail />} />
        </Route>
        <Route path="*" element={<Landing />} />
      </Routes>
    </BrowserRouter>
  );
}