import { useEffect, type RefObject } from "react";
import { motionReduced } from "../lib/motion";

/**
 * A soft glow that follows the pointer across components: one delegated `pointermove` on `root`
 * writes `--gx` / `--gy` (px, relative to the element) on the hovered element matching `selector`,
 * at most once per frame. The CSS draws the glow; mouse only, skipped with reduced motion.
 */
export function usePointerGlow(root: RefObject<HTMLElement | null>, selector: string) {
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    let raf = 0;
    let ev: PointerEvent | null = null;

    const run = () => {
      raf = 0;
      if (!ev) return;
      const target = (ev.target as Element | null)?.closest?.(selector) as HTMLElement | null;
      if (!target || !el.contains(target)) return;
      const r = target.getBoundingClientRect();
      target.style.setProperty("--gx", `${(ev.clientX - r.left).toFixed(0)}px`);
      target.style.setProperty("--gy", `${(ev.clientY - r.top).toFixed(0)}px`);
    };
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse" || motionReduced()) return;
      ev = e;
      if (!raf) raf = requestAnimationFrame(run);
    };

    el.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener("pointermove", onMove);
    };
  }, [root, selector]);
}
