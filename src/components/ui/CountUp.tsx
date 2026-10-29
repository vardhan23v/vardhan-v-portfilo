import { useEffect, useRef, useState } from "react";
import { motionReduced } from "../../lib/motion";

export interface CountUpProps {
  /** Target number (Classic spelling). */
  to?: number;
  /** Target number (macOS spelling) — alias of `to`. */
  value?: number;
  /** Animation length in ms. */
  duration?: number;
  suffix?: string;
}

/**
 * Counts from 0 to the target once the element scrolls into view.
 * Instant under the site motion toggle, the OS reduce-motion setting, or the
 * macOS in-app Reduce-motion preference (`.mac-root[data-mac-motion="off"]`).
 */
export function CountUp({ to, value, duration = 1100, suffix = "" }: CountUpProps) {
  const target = value ?? to ?? 0;
  const ref = useRef<HTMLSpanElement | null>(null);
  const [n, setN] = useState(() => (motionReduced() ? target : 0));
  const [done, setDone] = useState(false);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let raf = 0;
    const run = () => {
      if (started.current) return;
      started.current = true;
      const motionOff = motionReduced() || el.closest(".mac-root")?.getAttribute("data-mac-motion") === "off";
      if (motionOff) {
        setN(target);
        setDone(true);
        return;
      }
      const t0 = performance.now();
      const tick = (t: number) => {
        const p = Math.min(1, (t - t0) / duration);
        setN(Math.round((1 - Math.pow(1 - p, 3)) * target));
        if (p < 1) raf = requestAnimationFrame(tick);
        else setDone(true);
      };
      raf = requestAnimationFrame(tick);
    };
    if (typeof IntersectionObserver === "undefined") {
      run();
      return () => cancelAnimationFrame(raf);
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          run();
          io.disconnect();
        }
      },
      { threshold: 0.4 }
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [target, duration]);

  return (
    <span ref={ref} className={done ? "countup--done" : undefined}>
      {n}
      {suffix}
    </span>
  );
}
