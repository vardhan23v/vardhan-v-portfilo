import { useEffect, useRef } from "react";

export function useTilt<T extends HTMLElement>(maxDeg = 6, target?: string) {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const targetEl = (target ? el.querySelector(target) : el) as HTMLElement | null;
    if (!targetEl) return;

    const onMove = (e: MouseEvent) => {
      const r = targetEl.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) return;
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      targetEl.style.setProperty("--rx", (-py * maxDeg).toFixed(2) + "deg");
      targetEl.style.setProperty("--ry", (px * maxDeg).toFixed(2) + "deg");
    };

    const onLeave = () => {
      targetEl.style.removeProperty("--rx");
      targetEl.style.removeProperty("--ry");
    };

    el.addEventListener("mousemove", onMove);
    el.addEventListener("mouseleave", onLeave);
    return () => {
      el.removeEventListener("mousemove", onMove);
      el.removeEventListener("mouseleave", onLeave);
    };
  }, [maxDeg, target]);

  return ref;
}