import { useEffect, useRef, type CSSProperties, type ElementType, type ReactNode } from "react";

/**
 * Scroll-triggered reveal: adds `visibleClass` once the element enters the viewport.
 * One implementation for every edition — Classic/Terminal use `.reveal` → `.is-visible`,
 * the macOS shell uses `.rv` → `.is-in` (see `src/mac/hooks/useReveal.tsx`).
 */
export interface RevealOptions {
  /** IntersectionObserver threshold (0–1). */
  threshold?: number;
  /** IntersectionObserver rootMargin; the default trims the bottom edge slightly. */
  rootMargin?: string;
  /** Class added when the element is in view. */
  visibleClass?: string;
  /** Reveal once and stop observing (default), or toggle the class on every crossing. */
  once?: boolean;
  /**
   * Wait one frame, then reveal anything already on screen without an observer —
   * so a throttled tab or a missed callback never leaves above-the-fold content hidden.
   */
  failSafe?: boolean;
}

const DEFAULTS: Required<RevealOptions> = {
  threshold: 0.05,
  rootMargin: "0px 0px -8% 0px",
  visibleClass: "is-visible",
  once: true,
  failSafe: false,
};

/* One shared observer per distinct option set — cheaper than one per element. */
const observers = new Map<string, IntersectionObserver>();

function getObserver(o: Required<RevealOptions>): IntersectionObserver {
  const key = `${o.threshold}|${o.rootMargin}|${o.visibleClass}|${o.once}`;
  let obs = observers.get(key);
  if (!obs) {
    obs = new IntersectionObserver(
      (entries, io) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add(o.visibleClass);
            if (o.once) io.unobserve(entry.target);
          } else if (!o.once) {
            entry.target.classList.remove(o.visibleClass);
          }
        }
      },
      { threshold: o.threshold, rootMargin: o.rootMargin }
    );
    observers.set(key, obs);
  }
  return obs;
}

export function useReveal<T extends HTMLElement>(options: RevealOptions = {}) {
  const ref = useRef<T | null>(null);
  const { threshold, rootMargin, visibleClass, once, failSafe } = { ...DEFAULTS, ...options };

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (el.classList.contains(visibleClass)) return;
    if (typeof IntersectionObserver === "undefined") {
      el.classList.add(visibleClass);
      return;
    }
    const o = { threshold, rootMargin, visibleClass, once, failSafe };
    let obs: IntersectionObserver | null = null;
    let raf = 0;

    const observe = () => {
      obs = getObserver(o);
      obs.observe(el);
    };

    if (failSafe) {
      // Delay by one frame so the initial hidden state is painted first.
      raf = requestAnimationFrame(() => {
        const r = el.getBoundingClientRect();
        const vh = window.innerHeight || document.documentElement.clientHeight;
        if (r.top < vh && r.bottom > 0 && r.width > 0) {
          el.classList.add(visibleClass);
          if (once) return;
        }
        observe();
      });
    } else {
      observe();
    }

    return () => {
      cancelAnimationFrame(raf);
      obs?.unobserve(el);
    };
  }, [threshold, rootMargin, visibleClass, once, failSafe]);

  return ref;
}

export interface RevealProps {
  children: ReactNode;
  as?: ElementType;
  /** Extra stagger class, e.g. `reveal-d1`. */
  delay?: string;
  className?: string;
  id?: string;
  style?: CSSProperties;
  /** Observer options, e.g. a generous bottom rootMargin so the entrance plays before the element is on screen. */
  options?: RevealOptions;
}

/** `<div class="reveal [delay] [className]">` that gains `.is-visible` when scrolled into view. */
export function Reveal({ children, as: Tag = "div", delay, className = "", id, style, options }: RevealProps) {
  const ref = useReveal<HTMLElement>(options);
  return (
    <Tag ref={ref} className={`reveal${delay ? ` ${delay}` : ""} ${className}`.trim()} id={id} style={style}>
      {children}
    </Tag>
  );
}
