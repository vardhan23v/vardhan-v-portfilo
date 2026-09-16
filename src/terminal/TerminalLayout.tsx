import { useEffect, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { Boot } from "./components/Boot";
import { Footer } from "./components/Footer";
import { StatusLine } from "./components/StatusLine";
import { useSpotlight } from "./hooks/useSpotlight";
import { useCrt, usePhosphor } from "./hooks/usePhosphor";
import { motionReduced } from "../lib/motion";
import { sessionStart } from "./lib/shell";
import "./styles/global.css";

function ScrollManager() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    const behavior: ScrollBehavior = motionReduced() ? "auto" : "smooth";
    if (hash && pathname === "/terminal") {
      const id = hash.slice(1);
      requestAnimationFrame(() => {
        document.getElementById(id)?.scrollIntoView({ behavior, block: "start" });
      });
    } else {
      window.scrollTo({ top: 0, behavior: "auto" });
    }
  }, [pathname, hash]);

  return null;
}

/** The shell's `open <slug>` and the bottom bar hand navigation over through this event. */
function NavigateBridge() {
  const navigate = useNavigate();
  useEffect(() => {
    const onNav = (e: Event) => {
      const to = (e as CustomEvent<string>).detail;
      if (to) navigate(to, { viewTransition: true });
    };
    window.addEventListener("folio:navigate", onNav);
    return () => window.removeEventListener("folio:navigate", onNav);
  }, [navigate]);
  return null;
}

export function TerminalLayout() {
  useSpotlight();
  const phosphor = usePhosphor();
  const crt = useCrt();
  const [booting, setBooting] = useState(() => {
    try {
      return !sessionStorage.getItem("folio.booted");
    } catch {
      return true;
    }
  });

  useEffect(() => {
    sessionStart(); // stamp the session so uptime is consistent everywhere
  }, []);

  const handleBootDone = () => {
    try {
      sessionStorage.setItem("folio.booted", "1");
    } catch {
      /* ignore */
    }
    setBooting(false);
  };

  return (
    <div className="terminal-root" data-cursor-accent="term" data-phosphor={phosphor} data-crt={crt ? "on" : "off"}>
      {booting && <Boot onDone={handleBootDone} />}
      <div className="crt-sweep" aria-hidden="true" />
      <ScrollManager />
      <NavigateBridge />
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <main id="main">
        <Outlet />
      </main>
      <Footer />
      <StatusLine />
    </div>
  );
}
