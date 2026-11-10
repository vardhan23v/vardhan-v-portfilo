import { useEffect, useRef } from "react";
import { motionReduced } from "../lib/motion";

/** Pointer tilt: writes --rx/--ry (degrees) and --mx/--my (percent) on the target; the CSS applies them. */
export function useTilt<T extends HTMLElement>(maxDeg = 6, target?: string) {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (motionReduced()) return;
    // Touch screens have no hover, so a tilt would only jump on tap.
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    // macOS edition's in-app Reduce-motion toggle; a no-op outside `.mac-root`.
    if (el.closest(".mac-root")?.getAttribute("data-mac-motion") === "off") return;
    const targetEl = (target ? el.querySelector(target) : el) as HTMLElement | null;
    if (!targetEl) return;

    let frame = 0;
    let x = 0;
    let y = 0;
    const write = () => {
      frame = 0;
      const r = targetEl.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) return;
      const px = (x - r.left) / r.width - 0.5;
      const py = (y - r.top) / r.height - 0.5;
      targetEl.style.setProperty("--rx", (-py * maxDeg).toFixed(2) + "deg");
      targetEl.style.setProperty("--ry", (px * maxDeg).toFixed(2) + "deg");
      targetEl.style.setProperty("--mx", ((px + 0.5) * 100).toFixed(1) + "%");
      targetEl.style.setProperty("--my", ((py + 0.5) * 100).toFixed(1) + "%");
    };

    const onMove = (e: MouseEvent) => {
      x = e.clientX;
      y = e.clientY;
      if (!frame) frame = requestAnimationFrame(write);
    };

    const onLeave = () => {
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
      targetEl.style.removeProperty("--rx");
      targetEl.style.removeProperty("--ry");
      targetEl.style.removeProperty("--mx");
      targetEl.style.removeProperty("--my");
    };

    el.addEventListener("mousemove", onMove);
    el.addEventListener("mouseleave", onLeave);
    return () => {
      if (frame) cancelAnimationFrame(frame);
      el.removeEventListener("mousemove", onMove);
      el.removeEventListener("mouseleave", onLeave);
    };
  }, [maxDeg, target]);

  return ref;
}
