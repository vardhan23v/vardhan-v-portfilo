import { useEffect, useRef, type ElementType, type ReactNode } from "react";

const observerCache = new WeakMap<Element, IntersectionObserver>();

function getObserver(): IntersectionObserver {
  const root = typeof document !== "undefined" ? document.documentElement : null;
  if (!root) throw new Error("no dom");
  let obs = observerCache.get(root);
  if (!obs) {
    obs = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            obs?.unobserve(entry.target);
          }
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.05 }
    );
    observerCache.set(root, obs);
  }
  return obs;
}

export function useReveal<T extends HTMLElement>(delay?: string) {
  const ref = useRef<T | null>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (el.classList.contains("is-visible")) return;
    getObserver().observe(el);
    return () => getObserver().unobserve(el);
  }, []);
  return { ref, className: `reveal${delay ? ` ${delay}` : ""}` };
}

interface RevealProps {
  children: ReactNode;
  as?: ElementType;
  delay?: string;
  className?: string;
  id?: string;
  style?: React.CSSProperties;
}

export function Reveal({ children, as: Tag = "div", delay, className = "", id, style }: RevealProps) {
  const { ref, className: base } = useReveal<HTMLElement>(delay);
  return (
    <Tag ref={ref} className={`${base} ${className}`.trim()} id={id} style={style}>
      {children}
    </Tag>
  );
}