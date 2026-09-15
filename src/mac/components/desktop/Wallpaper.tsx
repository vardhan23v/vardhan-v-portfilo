import { useEffect, useRef } from "react";
import { usePreferences } from "../../hooks/usePreferences";

const GRAIN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.6 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

/** Gradient-mesh wallpaper with grain and rAF-throttled pointer parallax. */
export function Wallpaper() {
  const ref = useRef<HTMLDivElement>(null);
  const { prefs } = usePreferences();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (prefs.reduceMotion || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.style.setProperty("--px", "0");
      el.style.setProperty("--py", "0");
      return;
    }
    let raf = 0;
    let nx = 0;
    let ny = 0;
    const onMove = (e: PointerEvent) => {
      nx = e.clientX / window.innerWidth - 0.5;
      ny = e.clientY / window.innerHeight - 0.5;
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        el.style.setProperty("--px", nx.toFixed(3));
        el.style.setProperty("--py", ny.toFixed(3));
      });
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(raf);
    };
  }, [prefs.reduceMotion]);

  return (
    <div className="mac-wallpaper" ref={ref} aria-hidden="true">
      <div className="mac-wallpaper__layer mac-wallpaper__layer--a" />
      <div className="mac-wallpaper__layer mac-wallpaper__layer--b" />
      <div className="mac-wallpaper__layer mac-wallpaper__layer--c" />
      <div className="mac-wallpaper__grain" style={{ backgroundImage: GRAIN }} />
      <div className="mac-wallpaper__vignette" />
    </div>
  );
}
