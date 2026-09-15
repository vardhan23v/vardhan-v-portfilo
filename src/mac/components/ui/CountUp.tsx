import { useEffect, useRef, useState } from "react";

/** Animated count-up number. Falls back to instant on reduced motion. */
export function CountUp({ value, suffix = "" }: { value: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [display, setDisplay] = useState(0);
  const [done, setDone] = useState(false);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const run = () => {
      if (started.current) return;
      started.current = true;
      const motionOff =
        window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
        el.closest(".mac-root")?.getAttribute("data-mac-motion") === "off";
      if (motionOff) {
        setDisplay(value);
        setDone(true);
        return;
      }
      const t0 = performance.now();
      const dur = 1100;
      let raf = 0;
      const tick = (t: number) => {
        const p = Math.min(1, (t - t0) / dur);
        setDisplay(Math.round((1 - Math.pow(1 - p, 3)) * value));
        if (p < 1) raf = requestAnimationFrame(tick);
        else setDone(true);
      };
      raf = requestAnimationFrame(tick);
      return () => cancelAnimationFrame(raf);
    };
    if (typeof IntersectionObserver === "undefined") {
      run();
      return;
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
    return () => io.disconnect();
  }, [value]);

  return (
    <span ref={ref} className={done ? "countup--done" : undefined}>
      {display}
      {suffix}
    </span>
  );
}
