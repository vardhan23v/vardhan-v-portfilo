import { useEffect } from "react";

/**
 * Magnetic hover: elements matching `selector` ease toward the cursor while
 * hovered and spring back on leave. Pointer-fine + motion-safe only.
 */
export function useMagnetic(selector: string, strength = 0.28, maxShift = 10) {
  useEffect(() => {
    if (window.matchMedia("(pointer: coarse)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const els = Array.from(document.querySelectorAll<HTMLElement>(selector));
    if (!els.length) return;

    const cleanups = els.map((el) => {
      let raf = 0;
      let tx = 0;
      let ty = 0;
      let cx = 0;
      let cy = 0;
      let settling = false;

      const tick = () => {
        cx += (tx - cx) * 0.18;
        cy += (ty - cy) * 0.18;
        el.style.transform = `translate(${cx.toFixed(2)}px, ${cy.toFixed(2)}px)`;
        if (settling && Math.abs(cx) < 0.15 && Math.abs(cy) < 0.15) {
          el.style.transform = "";
          raf = 0;
          return;
        }
        raf = requestAnimationFrame(tick);
      };

      const onMove = (e: MouseEvent) => {
        const r = el.getBoundingClientRect();
        const dx = e.clientX - (r.left + r.width / 2);
        const dy = e.clientY - (r.top + r.height / 2);
        tx = Math.max(-maxShift, Math.min(maxShift, dx * strength));
        ty = Math.max(-maxShift, Math.min(maxShift, dy * strength));
        settling = false;
        if (!raf) raf = requestAnimationFrame(tick);
      };

      const onLeave = () => {
        tx = 0;
        ty = 0;
        settling = true;
        if (!raf) raf = requestAnimationFrame(tick);
      };

      el.addEventListener("mousemove", onMove);
      el.addEventListener("mouseleave", onLeave);
      return () => {
        el.removeEventListener("mousemove", onMove);
        el.removeEventListener("mouseleave", onLeave);
        if (raf) cancelAnimationFrame(raf);
        el.style.transform = "";
      };
    });

    return () => cleanups.forEach((fn) => fn());
  }, [selector, strength, maxShift]);
}
