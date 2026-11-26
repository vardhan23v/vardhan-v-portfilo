import { useEffect, useRef } from "react";
import { motionReduced, subscribeMotion } from "../lib/motion";

const RADIUS = 120; // px around the pointer that lifts letters
const WAVE_MS = 700; // a click/tap sends one wave across the name
const WAVE_W = 70; // px half-width of the wave crest
const smooth = (t: number) => (t <= 0 ? 0 : t >= 1 ? 1 : t * t * (3 - 2 * t));

/**
 * Letters that react to the pointer: writes `--lift` (0–1) on each `.lt-ch` inside the target.
 * - Hover (fine pointers): letters near the pointer lift, from their distance to it.
 * - Click or tap (any pointer): one wave of lift sweeps the name left to right, then settles.
 * The CSS turns `--lift` into a small rise, scale and colour shift; transitions ease letters back.
 * Writes happen at most once per frame; the loop only runs while a wave is travelling. Letter
 * centres are cached in page coordinates and re-measured on resize, after scrolling stops and once
 * the entrance has settled. Off with reduced motion.
 */
export function useLetterLift<T extends HTMLElement>() {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)");
    const chars = Array.from(el.querySelectorAll<HTMLElement>(".lt-ch"));
    const last = new Float32Array(chars.length);
    let centres: { x: number; y: number }[] = [];
    let box = { l: 0, t: 0, r: 0, b: 0, x0: 0, x1: 0 };
    let raf = 0, px = -1e5, py = -1e5, waveAt = -1;
    let hover = fine.matches && !motionReduced();
    let reduced = motionReduced();

    const measure = () => {
      const sx = window.scrollX, sy = window.scrollY;
      centres = chars.map((c) => {
        const r = c.getBoundingClientRect();
        return { x: r.left + r.width / 2 + sx, y: r.top + r.height / 2 + sy };
      });
      const r = el.getBoundingClientRect();
      box = {
        l: r.left + sx - RADIUS, t: r.top + sy - RADIUS, r: r.right + sx + RADIUS, b: r.bottom + sy + RADIUS,
        x0: centres.length ? centres[0].x : 0, x1: centres.length ? centres[centres.length - 1].x : 0,
      };
    };

    const write = (i: number, v: number) => {
      if (v < 0.01) v = 0;
      if (Math.abs(v - last[i]) < 0.01 && !(v === 0 && last[i] !== 0)) return;
      last[i] = v;
      if (v === 0) chars[i].style.removeProperty("--lift");
      else chars[i].style.setProperty("--lift", v.toFixed(3));
    };

    const apply = (now: number) => {
      raf = 0;
      const inside = px >= box.l && px <= box.r && py >= box.t && py <= box.b;
      const t = waveAt < 0 ? 1 : (now - waveAt) / WAVE_MS;
      const waving = t < 1;
      const crest = box.x0 - WAVE_W + (box.x1 - box.x0 + WAVE_W * 2) * t;
      for (let i = 0; i < chars.length; i++) {
        const c = centres[i];
        const hoverLift = inside ? smooth(1 - Math.hypot(px - c.x, py - c.y) / RADIUS) : 0;
        const waveLift = waving ? smooth(1 - Math.abs(c.x - crest) / WAVE_W) * (1 - t * 0.35) : 0;
        write(i, Math.max(hoverLift, waveLift));
      }
      if (waving) raf = requestAnimationFrame(apply);
      else waveAt = -1;
    };
    const schedule = () => { if (!raf) raf = requestAnimationFrame(apply); };

    const onMove = (e: PointerEvent) => {
      if (!hover || e.pointerType !== "mouse") return;
      px = e.clientX + window.scrollX;
      py = e.clientY + window.scrollY;
      schedule();
    };
    const onDown = () => {
      if (reduced) return;
      waveAt = performance.now();
      schedule();
    };
    const onLeave = () => { px = py = -1e5; schedule(); };
    let resizeTimer = 0, scrollTimer = 0;
    const onResize = () => { clearTimeout(resizeTimer); resizeTimer = window.setTimeout(measure, 150); };
    const onScroll = () => { clearTimeout(scrollTimer); scrollTimer = window.setTimeout(measure, 120); };
    const recheck = () => {
      reduced = motionReduced();
      hover = fine.matches && !reduced;
      if (reduced) waveAt = -1;
      if (!hover) { px = py = -1e5; schedule(); }
    };

    measure();
    const settle = window.setTimeout(measure, 1600); // after the letter entrance
    window.addEventListener("pointermove", onMove, { passive: true });
    el.addEventListener("pointerdown", onDown);
    document.documentElement.addEventListener("pointerleave", onLeave);
    window.addEventListener("resize", onResize);
    window.addEventListener("scroll", onScroll, { passive: true });
    fine.addEventListener("change", recheck);
    const unsubscribe = subscribeMotion(recheck);
    if (document.fonts?.ready) void document.fonts.ready.then(measure);

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(settle);
      clearTimeout(resizeTimer);
      clearTimeout(scrollTimer);
      window.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerdown", onDown);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", onScroll);
      fine.removeEventListener("change", recheck);
      unsubscribe();
    };
  }, []);

  return ref;
}
