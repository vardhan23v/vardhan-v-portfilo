import { useEffect, useState, type RefObject } from "react";
import { motionReduced } from "../lib/motion";

/** What rises into view as you scroll. Everything else (the hero, the nav) is on screen at load. */
const REVEAL = [".section-head", ".about-grid", ".feature", ".sync", ".more", ".xp-row", ".xp-aside", ".skill-row", ".contact-card", ".foot-grid"].join(", ");

/**
 * Classic's effects, all opt-out-safe:
 * - scroll reveals: blocks fade and rise once as they enter; pre-states only exist with `.js`,
 *   and anything already in view (or never observed) is shown immediately;
 * - card glow: the hovered screenshot gets `--mx/--my` so a soft moonlight edge follows the pointer.
 * Reduced motion (OS or the site toggle) skips both.
 */
export function useClassicEffects(rootRef: RefObject<HTMLElement | null>) {
  const [js, setJs] = useState(false);
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    setJs(true);
    if (motionReduced() || typeof IntersectionObserver === "undefined") return;

    const items = Array.from(root.querySelectorAll<HTMLElement>(REVEAL));
    // Stagger siblings that share a parent (feature cards, timeline rows, skill rows).
    const seen = new Map<Element, number>();
    for (const el of items) {
      const n = seen.get(el.parentElement!) ?? 0;
      seen.set(el.parentElement!, n + 1);
      el.style.setProperty("--rv", String(Math.min(n, 5)));
      el.setAttribute("data-reveal", "");
    }
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); }
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    const vh = window.innerHeight;
    for (const el of items) {
      if (el.getBoundingClientRect().top < vh) el.classList.add("is-in");
      else io.observe(el);
    }

    let raf = 0;
    let last: PointerEvent | null = null;
    const paint = () => {
      raf = 0;
      const t = (last?.target as HTMLElement | null)?.closest?.<HTMLElement>(".feature-shot, .compact");
      if (!t || !last) return;
      const r = t.getBoundingClientRect();
      t.style.setProperty("--mx", `${(((last.clientX - r.left) / r.width) * 100).toFixed(1)}%`);
      t.style.setProperty("--my", `${(((last.clientY - r.top) / r.height) * 100).toFixed(1)}%`);
    };
    const onMove = (e: PointerEvent) => { last = e; if (!raf) raf = requestAnimationFrame(paint); };
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    if (fine) root.addEventListener("pointermove", onMove, { passive: true });

    return () => {
      io.disconnect();
      root.removeEventListener("pointermove", onMove);
      if (raf) cancelAnimationFrame(raf);
      // Reset, so a remount (React's dev double-mount, or route changes) starts clean.
      for (const el of items) { el.removeAttribute("data-reveal"); el.classList.remove("is-in"); el.style.removeProperty("--rv"); }
    };
  }, [rootRef]);
  return js;
}
