import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Boot } from "./components/Boot";
import { Navbar } from "./components/Navbar";
import { Footer } from "./components/Footer";
import "./styles/global.css";

function ScrollManager() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash && pathname === "/terminal") {
      const id = hash.slice(1);
      requestAnimationFrame(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    } else {
      window.scrollTo({ top: 0, behavior: "auto" });
    }
  }, [pathname, hash]);

  return null;
}

export function TerminalLayout() {
  const [booting, setBooting] = useState(() => {
    try {
      return !sessionStorage.getItem("folio.booted");
    } catch {
      return true;
    }
  });

  const handleBootDone = () => {
    try {
      sessionStorage.setItem("folio.booted", "1");
    } catch {
      /* ignore */
    }
    setBooting(false);
  };

  return (
    <div className="terminal-root" data-cursor-accent="term">
      {booting && <Boot onDone={handleBootDone} />}
      <ScrollManager />
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <Navbar />
      <main id="main">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}