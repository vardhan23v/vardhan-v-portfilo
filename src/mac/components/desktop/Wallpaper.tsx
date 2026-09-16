import { useEffect, useRef } from "react";
import { usePreferences } from "../../hooks/usePreferences";
import { featuredProjects } from "../../data/projects";
import { ProjectCover } from "../ui/ProjectCover";
import { motionReduced } from "../../../lib/motion";

const GRAIN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.6 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

/** Gradient-mesh wallpaper with grain and rAF-throttled pointer parallax. */
function daypart(): "dawn" | "day" | "dusk" | "night" {
  const hr = Number(new Date().toLocaleTimeString("en-GB", { hour: "2-digit", hour12: false, timeZone: "Asia/Kolkata" }));
  if (hr >= 5 && hr < 9) return "dawn";
  if (hr >= 9 && hr < 17) return "day";
  if (hr >= 17 && hr < 20) return "dusk";
  return "night";
}

export function Wallpaper() {
  const ref = useRef<HTMLDivElement>(null);
  const { prefs } = usePreferences();
  const part = daypart();
  const wp = prefs.wallpaper || "mesh";
  const isImg = /^(\/|https?:)/.test(wp);
  const coverSlug = wp.startsWith("cover:") ? wp.slice(6) : null;
  const coverProject = coverSlug ? featuredProjects.find((p) => p.slug === coverSlug) : null;
  const grad = wp.startsWith("grad:") ? wp.slice(5) : null;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (prefs.reduceMotion || motionReduced()) {
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
    <div className={`mac-wallpaper is-${part}${grad ? ` mac-wallpaper--${grad}` : ""}${isImg || coverProject ? " has-image" : ""}`} ref={ref} aria-hidden="true">
      {isImg && <img className="mac-wallpaper__img" src={wp} alt="" />}
      {coverProject && <div className="mac-wallpaper__img mac-wallpaper__cover"><ProjectCover project={coverProject} size="lg" ratio="16/9" /></div>}
      <div className="mac-wallpaper__layer mac-wallpaper__layer--a" />
      <div className="mac-wallpaper__layer mac-wallpaper__layer--b" />
      <div className="mac-wallpaper__layer mac-wallpaper__layer--c" />
      <div className="mac-wallpaper__grain" style={{ backgroundImage: GRAIN }} />
      <div className="mac-wallpaper__vignette" />
    </div>
  );
}
