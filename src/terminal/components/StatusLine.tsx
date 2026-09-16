import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useActiveSection } from "../hooks/useActiveSection";
import { usePhosphor } from "../hooks/usePhosphor";
import { nextPhosphor, setPhosphor } from "../lib/phosphor";
import { motionReduced } from "../../lib/motion";

const isTyping = (t: EventTarget | null) => {
  const el = t as HTMLElement | null;
  return !!el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.isContentEditable);
};

/**
 * vim-style status line pinned to the bottom: mode, cwd, scroll position,
 * phosphor toggle. Also owns the vim scroll keys (j / k / gg / G).
 */
export function StatusLine() {
  const { pathname } = useLocation();
  const section = useActiveSection();
  const phosphor = usePhosphor();
  const [pct, setPct] = useState(0);
  const [line, setLine] = useState(1);
  const [insert, setInsert] = useState(false);

  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setPct(max > 0 ? Math.round((window.scrollY / max) * 100) : 100);
      setLine(1 + Math.floor(window.scrollY / 24));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf);
    };
  }, [pathname]);

  useEffect(() => {
    const onFocus = (e: FocusEvent) => setInsert(isTyping(e.target));
    const onBlur = () => setInsert(false);
    document.addEventListener("focusin", onFocus);
    document.addEventListener("focusout", onBlur);
    return () => {
      document.removeEventListener("focusin", onFocus);
      document.removeEventListener("focusout", onBlur);
    };
  }, []);

  // vim motion keys
  useEffect(() => {
    let lastG = 0;
    const onKey = (e: KeyboardEvent) => {
      if (e.altKey || e.ctrlKey || e.metaKey || isTyping(e.target)) return;
      const behavior: ScrollBehavior = motionReduced() ? "auto" : "smooth";
      const step = Math.round(window.innerHeight * 0.12);
      if (e.key === "j") window.scrollBy({ top: step, behavior });
      else if (e.key === "k") window.scrollBy({ top: -step, behavior });
      else if (e.key === "G") window.scrollTo({ top: document.documentElement.scrollHeight, behavior });
      else if (e.key === "g") {
        const now = performance.now();
        if (now - lastG < 450) window.scrollTo({ top: 0, behavior });
        lastG = now;
        return;
      } else return;
      e.preventDefault();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const cwd = pathname.startsWith("/terminal/work/")
    ? `~/work/${pathname.split("/").pop()}`
    : section
      ? `~/${section}`
      : "~";
  const pos = pct <= 0 ? "Top" : pct >= 100 ? "Bot" : `${pct}%`;

  return (
    <div className="statusline" role="status" aria-label={`Reading ${cwd}, ${pos}`}>
      <span className={`sl-mode ${insert ? "is-insert" : ""}`}>{insert ? "-- INSERT --" : "-- NORMAL --"}</span>
      <span className="sl-cwd">{cwd}</span>
      <span className="sl-fill" aria-hidden="true">
        <i style={{ width: `${pct}%` }} />
      </span>
      <span className="sl-keys" aria-hidden="true">
        j/k scroll · gg top · G end · ` shell
      </span>
      <button
        type="button"
        className="sl-phosphor"
        onClick={() => setPhosphor(nextPhosphor(phosphor))}
        title="Cycle CRT phosphor (also: `theme <name>` in the shell)"
        aria-label={`Phosphor: ${phosphor}. Click to change.`}
      >
        <i aria-hidden="true" /> {phosphor}
      </button>
      <span className="sl-pos">
        ln {line} · {pos}
      </span>
    </div>
  );
}
