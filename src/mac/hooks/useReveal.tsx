import { useReveal as useRevealBase } from "../../hooks/useReveal";

/**
 * macOS flavour of the shared reveal hook: adds `.is-in` (once) with the
 * one-frame fail-safe so content already on screen never stays hidden.
 */
export function useReveal<T extends HTMLElement>(threshold = 0.15) {
  return useRevealBase<T>({ threshold, rootMargin: "0px 0px -4% 0px", visibleClass: "is-in", failSafe: true });
}
