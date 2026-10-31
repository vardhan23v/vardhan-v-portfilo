import { useEffect, useState } from "react";
import { motionReduced } from "../../lib/motion";

/** Counts up to `n` once on mount (about 0.9 s). Screen readers and reduced motion get the value. */
export function Count({ n }: { n: number }) {
  const [v, setV] = useState(() => (motionReduced() ? n : 0));
  useEffect(() => {
    if (motionReduced()) return;
    let raf = 0;
    const t0 = performance.now();
    const tick = (t: number) => {
      const p = Math.min(1, (t - t0) / 900);
      setV(Math.round(n * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [n]);
  return (
    <>
      <span className="sr-only">{n}</span>
      <span aria-hidden="true" className="count">{v}</span>
    </>
  );
}
