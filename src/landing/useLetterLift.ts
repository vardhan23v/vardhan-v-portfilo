import { useEffect, useRef } from "react";
import { motionReduced, subscribeMotion } from "../lib/motion";

const RADIUS = 120; // px around the pointer that lifts letters
const smooth = (t: number) => (t <= 0 ? 0 : t >= 1 ? 1 : t * t * (3 - 2 * t));

/**
 * Letters that react to the pointer: writes `--lift` (0–1) on each `.lt-ch` inside the target,
 * from its distance to the pointer, at most once per frame. The CSS turns it into a small rise,
 * scale and colour shift; transitions ease letters back when the pointer leaves.
 * Fine pointers only, off with reduced motion. Letter centres are cached (page coordinates) and
 * re-measured on resize and once the entrance animation has settled.
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
    let box = { l: 0, t: 0, r: 0, b: 0 };
    let raf = 0, px = -1e5, py = -1e5;
    let enabled = fine.matches && !motionReduced();

    const measure = () => {
      const sx = window.scrollX, sy = window.scrollY;
      centres = chars.map((c) => {
        const r = c.getBoundingClientRect();
        return { x: r.left + r.width / 2 + sx, y: r.top + r.height / 2 + sy };
      });
      const r = el.getBoundingClientRect();
      box = { l: r.left + sx - RADIUS, t: r.top + sy - RADIUS, r: r.right + sx + RADIUS, b: r.bottom + sy + RADIUS };
    };

    const write = (i: number, v: number) => {
      if (Math.abs(v - last[i]) < 0.01 && !(v === 0 && last[i] !== 0)) return;
      last[i] = v;
      if (v === 0) chars[i].style.removeProperty("--lift");
      else chars[i].style.setProperty("--lift", v.toFixed(3));
    };

    const apply = () => {
      raf = 0;
      const inside = px >= box.l && px <= box.r && py >= box.t && py <= box.b;
      for (let i = 0; i < chars.length; i++) {
        if (!inside) { write(i, 0); continue; }
        const c = centres[i];
        write(i, smooth(1 - Math.hypot(px - c.x, py - c.y) / RADIUS));
      }
    };
    const schedule = () => { if (!raf) raf = requestAnimationFrame(apply); };

    const onMove = (e: PointerEvent) => {
      if (!enabled || e.pointerType !== "mouse") return;
      px = e.clientX + window.scrollX;
      py = e.clientY + window.scrollY;
      schedule();
    };
    const onLeave = () => { px = py = -1e5; schedule(); };
    let resizeTimer = 0;
    const onResize = () => { clearTimeout(resizeTimer); resizeTimer = window.setTimeout(measure, 150); };
    const recheck = () => {
      enabled = fine.matches && !motionReduced();
      if (!enabled) { px = py = -1e5; schedule(); }
    };

    measure();
    const settle = window.setTimeout(measure, 1600); // after the letter entrance
    window.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    window.addEventListener("resize", onResize);
    fine.addEventListener("change", recheck);
    const unsubscribe = subscribeMotion(recheck);
    if (document.fonts?.ready) void document.fonts.ready.then(measure);

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(settle);
      clearTimeout(resizeTimer);
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("resize", onResize);
      fine.removeEventListener("change", recheck);
      unsubscribe();
    };
  }, []);

  return ref;
}
