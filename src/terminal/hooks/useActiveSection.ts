import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

/**
 * Id of the `main section[id]` currently occupying the middle band of the
 * viewport, or "" (hero / top). Re-queries when the route changes so the
 * case-study page gets its own sections.
 */
export function useActiveSection(): string {
  const { pathname } = useLocation();
  const [active, setActive] = useState("");

  useEffect(() => {
    let io: IntersectionObserver | null = null;
    const raf = requestAnimationFrame(() => {
      const sections = Array.from(document.querySelectorAll<HTMLElement>("main section[id]"));
      if (!sections.length) return setActive("");
      const visible = new Map<string, number>();
      io = new IntersectionObserver(
        (entries) => {
          for (const e of entries) {
            if (e.isIntersecting) visible.set(e.target.id, e.boundingClientRect.top);
            else visible.delete(e.target.id);
          }
          // topmost intersecting section wins; nothing intersecting → hero
          const top = [...visible.entries()].sort((a, b) => a[1] - b[1])[0];
          setActive(top ? top[0] : window.scrollY < 200 ? "" : active);
        },
        { rootMargin: "-35% 0px -50% 0px", threshold: 0 }
      );
      sections.forEach((s) => io!.observe(s));
    });
    return () => {
      cancelAnimationFrame(raf);
      io?.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  return active;
}
