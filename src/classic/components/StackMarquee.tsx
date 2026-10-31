import { useEffect, useRef } from "react";
import { skillCategories } from "../data/skills";

const names = skillCategories.flatMap((c) => c.items.map((i) => i.name));

/** The whole stack drifting in one row. Decorative: the Stack section lists the same names. */
export function StackMarquee() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    // Only runs while on screen.
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(([e]) => el.classList.toggle("is-paused", !e.isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div className="marquee" ref={ref} aria-hidden="true">
      <div className="marquee-track">
        {[0, 1].map((copy) => (
          <ul className="marquee-list" key={copy}>
            {names.map((n) => <li key={n}>{n}</li>)}
          </ul>
        ))}
      </div>
    </div>
  );
}
