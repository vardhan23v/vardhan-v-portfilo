import { useEffect, useRef, useState, type CSSProperties } from "react";
import { useLocation, useNavigation } from "react-router-dom";
import "./scroll-chrome.css";
import { motionReduced, subscribeMotion } from "../lib/motion";

const ACCENTS: Record<string, string> = {
  landing: "#7c6cff",
  term: "#36e57c",
  classic: "#bbaf4a",
  atlas: "#ff5b24",
  paper: "#be4b2a",
  aurora: "#f0abfc",
  forge: "#7dd3fc",
  work: "#6ea8ff",
};

/** Scroll-driven animations run the bar and ring on the compositor; reduced motion removes all
 *  CSS animations, so position feedback falls back to the JS path there. */
const cssDriven = () =>
  typeof CSS !== "undefined" && CSS.supports("animation-timeline: scroll()") && !motionReduced();

export function ScrollChrome() {
  const location = useLocation();
  const navigation = useNavigation();
  const [accent, setAccent] = useState("#7c6cff");
  const [showTop, setShowTop] = useState(false);
  const barRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    // Editions load lazily, so the root may not exist yet on the first render.
    const resolve = () => {
      const root = document.querySelector<HTMLElement>("[data-cursor-accent], [data-cursor-off]");
      if (!root) return false;
      const key = root.dataset.cursorAccent ?? (root.dataset.cursorOff !== undefined ? "aurora" : "landing");
      setAccent(ACCENTS[key] ?? "#7c6cff");
      return true;
    };
    if (resolve()) return;
    const mo = new MutationObserver(() => {
      if (resolve()) mo.disconnect();
    });
    mo.observe(document.body, { childList: true, subtree: true });
    return () => mo.disconnect();
  }, [location.pathname]);

  useEffect(() => {
    const bar = barRef.current;
    const btn = btnRef.current;
    let raf = 0;
    let last: boolean | null = null;
    let css = cssDriven();
    const update = () => {
      raf = 0;
      const y = window.scrollY;
      if (bar) {
        if (css) bar.style.removeProperty("transform");
        else {
          const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
          bar.style.transform = `scaleX(${Math.min(1, y / max)})`;
        }
      }
      const vis = y > 500;
      if (vis !== last) {
        last = vis;
        btn?.classList.toggle("is-visible", vis);
        setShowTop(vis);
      }
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    const unsub = subscribeMotion(() => {
      css = cssDriven();
      onScroll();
    });
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      unsub();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  const toTop = () => {
    const reduced = motionReduced();
    window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
  };

  const accentStyle = { "--sc-accent": accent } as CSSProperties;

  return (
    <>
      <div ref={barRef} className="sc-progress" style={accentStyle} aria-hidden="true" />
      {/* Navigation pending (a route chunk still downloading): mounted only while loading, shown after 150 ms. */}
      {navigation.state === "loading" && <div className="sc-pending" style={accentStyle} aria-hidden="true" />}
      <button
        ref={btnRef}
        type="button"
        className="sc-top"
        style={accentStyle}
        onClick={toTop}
        aria-label="Back to top"
        tabIndex={showTop ? 0 : -1}
        aria-hidden={!showTop}
      >
        <svg className="sc-ring" viewBox="0 0 42 42" aria-hidden="true" focusable="false">
          <rect x="1" y="1" width="40" height="40" rx="20" ry="20" pathLength="1" />
        </svg>
        <span className="sc-arrow" aria-hidden="true">↑</span>
      </button>
    </>
  );
}
