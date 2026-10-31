import { useEffect, useLayoutEffect, useState, type RefObject } from "react";
import { motionReduced } from "../lib/motion";

/** What rises into view as you scroll. Everything else (the hero, the nav) is on screen at load. */
const REVEAL = [".section-head", ".about-grid", ".feature", ".sync", ".more", ".xp-row", ".xp-aside", ".skill-row", ".contact-card", ".foot-grid"].join(", ");

/**
 * Classic's effects, all opt-out-safe. State lives in data attributes (data-reveal, data-in,
 * data-scrolling) because React rewrites className on re-render and would wipe added classes.
 *
 * - scroll reveals: blocks fade and rise once as they enter; pre-states only exist with `.js`,
 *   and anything already in view (or never observed) is shown immediately;
 * - card glow: the hovered screenshot gets `--mx/--my` so a soft moonlight edge follows the pointer.
 * Reduced motion (OS or the site toggle) skips both.
 */
export function useClassicEffects(rootRef: RefObject<HTMLElement | null>) {
  const [js, setJs] = useState(false);
  // Before first paint, so the hero's load pre-states never flash.
  useLayoutEffect(() => { setJs(true); }, []);
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    // A hidden page (a background tab, or an embedded preview that reports itself hidden) never
    // ticks transitions, so faded-out blocks would stay invisible: show everything as-is instead.
    if (motionReduced() || typeof IntersectionObserver === "undefined" || document.visibilityState !== "visible") return;

    const items = Array.from(root.querySelectorAll<HTMLElement>(REVEAL));
    // Stagger siblings that share a parent (feature cards, timeline rows, skill rows).
    const seen = new Map<Element, number>();
    for (const el of items) {
      const n = seen.get(el.parentElement!) ?? 0;
      seen.set(el.parentElement!, n + 1);
      el.style.setProperty("--rv", String(Math.min(n, 5)));
      el.setAttribute("data-reveal", "");
    }
    // Once shown, the block drops its reveal attributes after the fade, so it can never be stranded
    // at opacity 0 where transitions do not tick (hidden or throttled pages, embedded previews).
    const timers: number[] = [];
    const show = (el: Element) => {
      if (el.hasAttribute("data-in")) return;
      el.setAttribute("data-in", "");
      timers.push(window.setTimeout(() => { el.removeAttribute("data-reveal"); el.removeAttribute("data-in"); }, 1400));
    };
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) if (e.isIntersecting) { show(e.target); io.unobserve(e.target); }
    }, { rootMargin: "0px 0px 10% 0px", threshold: 0 });
    const vh = window.innerHeight;
    for (const el of items) {
      if (el.getBoundingClientRect().top < vh) show(el);
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
    // While the page is moving, the near stars brighten a touch; they settle 500 ms after it stops.
    let idle = 0;
    // Failsafe for fast scrolls and jumps: anything at or above the fold is shown, even if the
    // observer has not reported it yet, so no block is ever left blank on screen.
    let sweep = 0;
    const reveal = () => {
      sweep = 0;
      const fold = window.innerHeight;
      for (const el of items) if (!el.hasAttribute("data-in") && el.getBoundingClientRect().top < fold) { show(el); io.unobserve(el); }
    };
    const onScroll = () => { if (!sweep) sweep = requestAnimationFrame(reveal); root.setAttribute("data-scrolling", ""); window.clearTimeout(idle); idle = window.setTimeout(() => root.removeAttribute("data-scrolling"), 500); };
    window.addEventListener("scroll", onScroll, { passive: true });
    // If the page goes hidden mid-way, drop the pre-states so nothing is stranded at opacity 0.
    const onHide = () => { if (document.visibilityState !== "visible") { io.disconnect(); for (const el of items) el.removeAttribute("data-reveal"); } };
    document.addEventListener("visibilitychange", onHide);

    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    if (fine) root.addEventListener("pointermove", onMove, { passive: true });

    return () => {
      io.disconnect();
      timers.forEach((t) => window.clearTimeout(t));
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("visibilitychange", onHide);
      window.clearTimeout(idle);
      if (sweep) cancelAnimationFrame(sweep);
      root.removeAttribute("data-scrolling");
      root.removeEventListener("pointermove", onMove);
      if (raf) cancelAnimationFrame(raf);
      // Reset, so a remount (React's dev double-mount, or route changes) starts clean.
      for (const el of items) { el.removeAttribute("data-reveal"); el.removeAttribute("data-in"); el.style.removeProperty("--rv"); }
    };
  }, [rootRef]);
  return js;
}
