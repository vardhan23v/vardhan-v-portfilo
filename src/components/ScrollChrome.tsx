import { useEffect, useState, type CSSProperties } from "react";
import { useLocation } from "react-router-dom";
import "./scroll-chrome.css";

const ACCENTS: Record<string, string> = {
  landing: "#7c6cff",
  term: "#36e57c",
  classic: "#7c6cff",
  paper: "#be4b2a",
  aurora: "#f0abfc",
  forge: "#7dd3fc",
};

export function ScrollChrome() {
  const location = useLocation();
  const [accent, setAccent] = useState("#7c6cff");
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    const root = document.querySelector<HTMLElement>("[data-cursor-accent], [data-cursor-off]");
    const key = root?.dataset.cursorAccent ?? (root?.dataset.cursorOff !== undefined ? "aurora" : "landing");
    setAccent(ACCENTS[key] ?? "#7c6cff");
  }, [location.pathname]);

  useEffect(() => {
    const bar = document.querySelector<HTMLElement>(".sc-progress");
    const btn = document.querySelector<HTMLElement>(".sc-top");
    let raf = 0;
    const update = () => {
      raf = 0;
      const y = window.scrollY;
      const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      if (bar) bar.style.transform = `scaleX(${Math.min(1, y / max)})`;
      const vis = y > 500;
      if (btn) btn.classList.toggle("is-visible", vis);
      setShowTop(vis);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  const toTop = () => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
  };

  return (
    <>
      <div
        className="sc-progress"
        style={{
          background: `linear-gradient(90deg, ${accent}, color-mix(in srgb, ${accent} 55%, #fff))`,
        }}
        aria-hidden="true"
      />
      <button
        type="button"
        className="sc-top"
        style={{ "--sc-accent": accent } as CSSProperties}
        onClick={toTop}
        aria-label="Back to top"
        tabIndex={showTop ? 0 : -1}
        aria-hidden={!showTop}
      >
        ↑
      </button>
    </>
  );
}