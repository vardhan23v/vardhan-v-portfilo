import { useEffect, useRef, type ElementType, type ReactNode } from "react";

let cachedObs: IntersectionObserver | null = null;

function getObserver(): IntersectionObserver {
  if (!cachedObs) {
    cachedObs = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            cachedObs?.unobserve(entry.target);
          }
        }
      },
      { rootMargin: "0px 0px -6% 0px", threshold: 0.04 }
    );
  }
  return cachedObs;
}

export function useReveal<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (el.classList.contains("is-visible")) return;
    getObserver().observe(el);
    return () => getObserver().unobserve(el);
  }, []);
  return ref;
}

export function Reveal({ children, as: Tag = "div", className = "" }: { children: ReactNode; as?: ElementType; className?: string }) {
  const ref = useReveal<HTMLElement>();
  return (
    <Tag ref={ref} className={`reveal ${className}`.trim()}>
      {children}
    </Tag>
  );
}