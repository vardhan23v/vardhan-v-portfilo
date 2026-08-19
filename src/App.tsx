import { useEffect } from "react";
import { BrowserRouter, Route, Routes, useNavigate } from "react-router-dom";
import { Landing } from "./landing/Landing";
import { ClassicSite } from "./classic/ClassicSite";
import { TerminalLayout } from "./terminal/TerminalLayout";
import { TerminalHome } from "./terminal/TerminalHome";
import { WorkDetail } from "./terminal/components/WorkDetail";
import { PaperSite } from "./paper/PaperSite";
import { AuroraSite } from "./aurora/AuroraSite";
import { ForgeSite } from "./forge/ForgeSite";
import { CursorFX } from "./CursorFX";
import "./landing/Landing.css";

const interfaceRoutes = ["/terminal", "/classic", "/paper", "/aurora", "/forge"];

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