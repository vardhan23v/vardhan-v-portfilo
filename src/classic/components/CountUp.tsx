import { useEffect, useRef, useState } from "react";
import { motionReduced } from "../../lib/motion";

/** Counts from 0 to `to` once the element scrolls into view (instant under reduced motion). */
export function CountUp({ to, duration = 1100, suffix = "" }: { to: number; duration?: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement | null>(null);
  const [n, setN] = useState(motionReduced() ? to : 0);

  useEffect(() => {
    const el = ref.current;
    if (!el || motionReduced()) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting) return;
        io.disconnect();
        const t0 = performance.now();
        let raf = 0;
        const tick = (t: number) => {
          const p = Math.min(1, (t - t0) / duration);
          setN(Math.round((1 - Math.pow(1 - p, 3)) * to));
          if (p < 1) raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(raf);
      },
      { threshold: 0.4 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [to, duration]);

  return (
    <span ref={ref}>
      {n}
      {suffix}
    </span>
  );
}
