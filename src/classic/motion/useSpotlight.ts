import { useEffect, type RefObject } from "react";
import { motionReduced } from "../../lib/motion";

/**
 * One delegated pointer listener on a container: the hovered `selector` element gets `--mx/--my`
 * (pointer position in its own box), which a CSS radial glow follows. Fine pointers only.
 */
export function useSpotlight(ref: RefObject<HTMLElement | null>, selector: string) {
  useEffect(() => {
    const root = ref.current;
    if (!root || motionReduced() || !window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    let raf = 0;
    let last: PointerEvent | null = null;
    const paint = () => {
      raf = 0;
      if (!last) return;
      const el = (last.target as HTMLElement | null)?.closest?.<HTMLElement>(selector);
      if (!el || !root.contains(el)) return;
      const r = el.getBoundingClientRect();
      el.style.setProperty("--mx", `${(((last.clientX - r.left) / r.width) * 100).toFixed(1)}%`);
      el.style.setProperty("--my", `${(((last.clientY - r.top) / r.height) * 100).toFixed(1)}%`);
    };
    const onMove = (e: PointerEvent) => { last = e; if (!raf) raf = requestAnimationFrame(paint); };
    root.addEventListener("pointermove", onMove, { passive: true });
    return () => { root.removeEventListener("pointermove", onMove); if (raf) cancelAnimationFrame(raf); };
  }, [ref, selector]);
}
