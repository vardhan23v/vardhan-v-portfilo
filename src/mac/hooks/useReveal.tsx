import { useEffect, useRef } from "react";

/**
 * Adds `.is-in` when the element scrolls into view (once).
 * Returns a ref to attach. Respects nothing else — the CSS handles
 * reduced-motion via the global guard.
 */
export function useReveal<T extends HTMLElement>(threshold = 0.15) {
  const ref = useRef<T | null>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      el.classList.add("is-in");
      return;
    }
    let io: IntersectionObserver | null = null;
    // Delay observer by one frame so the initial hidden state is painted first
    const raf = requestAnimationFrame(() => {
      // Fail-safe: anything already inside the viewport reveals immediately,
      // so a throttled/hidden tab or a missed observer callback never leaves
      // content invisible.
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight || document.documentElement.clientHeight;
      if (r.top < vh && r.bottom > 0 && r.width > 0) {
        el.classList.add("is-in");
        return;
      }
      io = new IntersectionObserver(
        (entries) => {
          if (entries[0]?.isIntersecting) {
            el.classList.add("is-in");
            io?.disconnect();
          }
        },
        { threshold, rootMargin: "0px 0px -4% 0px" }
      );
      io.observe(el);
    });
    return () => {
      cancelAnimationFrame(raf);
      io?.disconnect();
    };
  }, [threshold]);
  return ref;
}
