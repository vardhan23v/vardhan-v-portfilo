import { useSyncExternalStore } from "react";

const QUERY = "(prefers-reduced-motion: reduce)";
const subscribe = (cb: () => void) => {
  if (typeof window === "undefined") return () => {};
  const mq = window.matchMedia(QUERY);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
};
const getSnapshot = () => (typeof window === "undefined" ? false : window.matchMedia(QUERY).matches);

/** Reactive prefers-reduced-motion — one subscription, no re-querying at call sites. */
export const usePrefersReducedMotion = () => useSyncExternalStore(subscribe, getSnapshot, () => false);
