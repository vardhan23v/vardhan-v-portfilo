import { useEffect, type RefObject } from "react";
import { motionReduced, subscribeMotion } from "../lib/motion";

/**
 * Magnetic hover: elements matching `selector` ease toward the cursor while hovered and spring
 * back on leave. Hover-capable fine pointers and motion-safe only; it detaches and re-attaches
 * live when the visitor toggles motion.
 *
 * The pull is written to the individual `translate` property, so it composes with the element's
 * own CSS `transform` (hover lifts, :active scale) instead of replacing it or restarting a
 * transform transition every frame. The element's rect is read once per hover, not per move.
 * Pass `rootRef` to scope the query to one component instance.
 */
export function useMagnetic(selector: string, strength = 0.28, maxShift = 10, rootRef?: RefObject<Element | null>) {
  useEffect(() => {
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

    let detach: (() => void) | null = null;

    const attach = () => {
      const scope: ParentNode = rootRef?.current ?? document;
      const els = Array.from(scope.querySelectorAll<HTMLElement>(selector));
      const cleanups = els.map((el) => {
        let raf = 0;
        let tx = 0;
        let ty = 0;
        let cx = 0;
        let cy = 0;
        let settling = false;
        let ox = 0; // resting centre (rect minus the current pull)
        let oy = 0;

        const tick = () => {
          cx += (tx - cx) * 0.18;
          cy += (ty - cy) * 0.18;
          el.style.translate = `${cx.toFixed(2)}px ${cy.toFixed(2)}px`;
          if (settling && Math.abs(cx) < 0.15 && Math.abs(cy) < 0.15) {
            cx = cy = 0;
            el.style.translate = "";
            raf = 0;
            return;
          }
          raf = requestAnimationFrame(tick);
        };

        const onEnter = () => {
          const r = el.getBoundingClientRect();
          ox = r.left + r.width / 2 - cx;
          oy = r.top + r.height / 2 - cy;
        };

        const onMove = (e: MouseEvent) => {
          tx = Math.max(-maxShift, Math.min(maxShift, (e.clientX - ox) * strength));
          ty = Math.max(-maxShift, Math.min(maxShift, (e.clientY - oy) * strength));
          settling = false;
          if (!raf) raf = requestAnimationFrame(tick);
        };

        const onLeave = () => {
          tx = 0;
          ty = 0;
          settling = true;
          if (!raf) raf = requestAnimationFrame(tick);
        };

        el.addEventListener("mouseenter", onEnter, { passive: true });
        el.addEventListener("mousemove", onMove, { passive: true });
        el.addEventListener("mouseleave", onLeave, { passive: true });
        if (el.matches(":hover")) onEnter();
        return () => {
          el.removeEventListener("mouseenter", onEnter);
          el.removeEventListener("mousemove", onMove);
          el.removeEventListener("mouseleave", onLeave);
          if (raf) cancelAnimationFrame(raf);
          el.style.translate = "";
        };
      });
      detach = () => {
        cleanups.forEach((fn) => fn());
        detach = null;
      };
    };

    const sync = () => {
      if (motionReduced()) detach?.();
      else if (!detach) attach();
    };
    sync();
    const unsub = subscribeMotion(sync);
    return () => {
      unsub();
      detach?.();
    };
  }, [selector, strength, maxShift, rootRef]);
}
