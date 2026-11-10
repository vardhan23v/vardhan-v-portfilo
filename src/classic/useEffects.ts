import { useEffect, useLayoutEffect, useState, type RefObject } from "react";
import { motionReduced } from "../lib/motion";

/** What rises into view as you scroll. Everything else (the hero, the nav) is on screen at load. */
const REVEAL = [".section-head", ".about-grid", ".feature", ".more", ".stat", ".process-step", ".builds", ".xp-row", ".xp-aside", ".skill-row", ".contact-card", ".foot-grid"].join(", ");
/**
 * Blocks that classic.css animates on a view() scroll timeline (fold in on entry, soften on exit) where the
 * browser supports it. There the scroll position drives them both ways, so they are left out of the
 * observer-driven reveal and never get a data-reveal pre-state that could fight the timeline.
 */
const SCROLL_DRIVEN = [".section-head", ".feature", ".xp-row", ".skill-row"].join(", ");
const viewTimelines = () => typeof CSS !== "undefined" && typeof CSS.supports === "function" && CSS.supports("animation-timeline: view()");

/**
 * Classic's effects, all opt-out-safe. State lives in data attributes (data-reveal, data-in,
 * data-scrolling) because React rewrites className on re-render and would wipe added classes.
 *
 * - scroll reveals: blocks fade and rise as they enter, in both scroll directions; pre-states only
 *   exist with `.js`, only off screen, and anything already in view (or never observed) is shown
 *   immediately. Where view() timelines exist, the folding blocks are left to CSS instead;
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

    const scrollDriven = viewTimelines();
    const items = Array.from(root.querySelectorAll<HTMLElement>(REVEAL)).filter((el) => !(scrollDriven && el.matches(SCROLL_DRIVEN)));
    // Stagger siblings that share a parent (feature cards, timeline rows, skill rows).
    const seen = new Map<Element, number>();
    for (const el of items) {
      const n = seen.get(el.parentElement!) ?? 0;
      seen.set(el.parentElement!, n + 1);
      el.style.setProperty("--rv", String(Math.min(n, 5)));
      el.setAttribute("data-reveal", "");
    }
    // Two-way: a block rises in each time it enters and drops back to its pre-state once it is fully off
    // screen, so scrolling up replays it too. Once shown, the reveal attributes are dropped after the
    // fade (1400 ms), so a block on screen can never be stranded at opacity 0 where transitions do not tick
    // (hidden or throttled pages, embedded previews); leaving the viewport re-arms it, off screen.
    const timers = new Map<Element, number>();
    const show = (el: Element) => {
      if (el.hasAttribute("data-in") || !el.hasAttribute("data-reveal")) return;
      el.setAttribute("data-in", "");
      timers.set(el, window.setTimeout(() => { timers.delete(el); el.removeAttribute("data-reveal"); el.removeAttribute("data-in"); }, 1400));
    };
    const offScreen = (el: Element) => { const r = el.getBoundingClientRect(); return r.bottom <= 0 || r.top >= window.innerHeight; };
    const arm = (el: Element) => {
      // Only off screen and only on a visible page, so the pre-state is never painted where it is seen.
      if (document.visibilityState !== "visible" || !offScreen(el)) return;
      const t = timers.get(el);
      if (t) { window.clearTimeout(t); timers.delete(el); }
      el.removeAttribute("data-in");
      el.setAttribute("data-reveal", "");
    };
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.isIntersecting) show(e.target);
        else arm(e.target);
      }
    }, { rootMargin: "0px 0px 10% 0px", threshold: 0 });
    const vh = window.innerHeight;
    for (const el of items) {
      // Anything at or above the fold at load is shown at once (no rise for what is already on screen).
      if (el.getBoundingClientRect().top < vh) show(el);
      io.observe(el);
    }

    let raf = 0;
    let last: PointerEvent | null = null;
    const hero = root.querySelector<HTMLElement>(".hero");
    const paint = () => {
      raf = 0;
      // The hero diorama leans toward the pointer (-1..1 from the viewport centre).
      if (hero && last) {
        hero.style.setProperty("--px", ((last.clientX / window.innerWidth) * 2 - 1).toFixed(3));
        hero.style.setProperty("--py", ((last.clientY / window.innerHeight) * 2 - 1).toFixed(3));
      }
      const t = (last?.target as HTMLElement | null)?.closest?.<HTMLElement>(".shot-frame, .feature-shot, .compact, .xp-main, .skill-row");
      if (!t || !last) return;
      const r = t.getBoundingClientRect();
      t.style.setProperty("--mx", `${(((last.clientX - r.left) / r.width) * 100).toFixed(1)}%`);
      t.style.setProperty("--my", `${(((last.clientY - r.top) / r.height) * 100).toFixed(1)}%`);
      // -1..1 from the centre, for the featured screenshots' gentle tilt (CSS applies it on hover only).
      t.style.setProperty("--tx", (((last.clientX - r.left) / r.width) * 2 - 1).toFixed(3));
      t.style.setProperty("--ty", (((last.clientY - r.top) / r.height) * 2 - 1).toFixed(3));
    };
    const onMove = (e: PointerEvent) => { last = e; if (!raf) raf = requestAnimationFrame(paint); };
    // While the page is moving, the near stars brighten a touch; they settle 500 ms after it stops.
    let idle = 0;
    // Failsafe for fast scrolls and jumps: anything on screen is shown, even if the observer has not
    // reported it yet, so no block is ever left blank in view.
    let sweep = 0;
    const reveal = () => {
      sweep = 0;
      const fold = window.innerHeight;
      for (const el of items) {
        if (el.hasAttribute("data-in") || !el.hasAttribute("data-reveal")) continue;
        const r = el.getBoundingClientRect();
        if (r.top < fold && r.bottom > 0) show(el);
      }
    };
    const onScroll = () => { if (!sweep) sweep = requestAnimationFrame(reveal); root.setAttribute("data-scrolling", ""); window.clearTimeout(idle); idle = window.setTimeout(() => root.removeAttribute("data-scrolling"), 500); };
    window.addEventListener("scroll", onScroll, { passive: true });
    // If the page goes hidden mid-way, drop the pre-states so nothing is stranded at opacity 0.
    const onHide = () => { if (document.visibilityState !== "visible") { io.disconnect(); timers.forEach((t) => window.clearTimeout(t)); timers.clear(); for (const el of items) { el.removeAttribute("data-reveal"); el.removeAttribute("data-in"); } } };
    document.addEventListener("visibilitychange", onHide);

    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    if (fine) root.addEventListener("pointermove", onMove, { passive: true });

    return () => {
      io.disconnect();
      timers.forEach((t) => window.clearTimeout(t));
      timers.clear();
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
