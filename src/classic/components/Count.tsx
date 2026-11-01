import { useEffect, useRef, useState } from "react";
import { motionReduced } from "../../lib/motion";

/**
 * Counts up to `n` (about 0.9 s) each time the number comes into view, from either direction: it resets
 * to 0 only once fully off screen, and replays when a quarter of it is back. Screen readers always get the
 * value; reduced motion, hidden pages and browsers without IntersectionObserver show the final value.
 */
export function Count({ n }: { n: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [v, setV] = useState(n);
  useEffect(() => {
    const el = ref.current;
    if (!el || motionReduced() || typeof IntersectionObserver === "undefined") { setV(n); return; }
    let raf = 0;
    let armed = true;
    const stop = () => { if (raf) cancelAnimationFrame(raf); raf = 0; };
    const run = () => {
      stop();
      if (document.visibilityState !== "visible" || motionReduced()) { setV(n); return; }
      const t0 = performance.now();
      const tick = (t: number) => {
        const p = Math.min(1, (t - t0) / 900);
        setV(Math.round(n * (1 - Math.pow(1 - p, 3))));
        raf = p < 1 ? requestAnimationFrame(tick) : 0;
      };
      setV(0);
      raf = requestAnimationFrame(tick);
    };
    const io = new IntersectionObserver(([e]) => {
      if (!e) return;
      if (!e.isIntersecting) {
        // Fully off screen: rest at 0 so the next entrance counts up again (only while it can tick).
        armed = true;
        stop();
        setV(document.visibilityState === "visible" && !motionReduced() ? 0 : n);
      } else if (armed && e.intersectionRatio >= 0.25) {
        armed = false;
        run();
      }
    }, { threshold: [0, 0.25] });
    io.observe(el);
    // A page that goes hidden mid-count would freeze on a partial number: settle on the value instead.
    const onHide = () => { if (document.visibilityState !== "visible") { stop(); setV(n); } };
    document.addEventListener("visibilitychange", onHide);
    return () => { io.disconnect(); stop(); document.removeEventListener("visibilitychange", onHide); };
  }, [n]);
  return (
    <>
      <span className="sr-only">{n}</span>
      <span aria-hidden="true" className="count" ref={ref}>{v}</span>
    </>
  );
}
