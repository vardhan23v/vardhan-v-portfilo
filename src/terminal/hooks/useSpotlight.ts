import { useEffect } from "react";

export function useSpotlight() {
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const el = (e.target as HTMLElement | null)?.closest?.("[data-spot]") as HTMLElement | null;
      if (!el) return;
      const r = el.getBoundingClientRect();
      el.style.setProperty("--mx", `${e.clientX - r.left}px`);
      el.style.setProperty("--my", `${e.clientY - r.top}px`);
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, []);
}