import { useSyncExternalStore } from "react";
import { motionReduced, subscribeMotion } from "../lib/motion";

/** Reactive "reduce motion" state — the site override on <html data-motion>, falling back to the OS. */
export const usePrefersReducedMotion = () => useSyncExternalStore(subscribeMotion, motionReduced, () => false);
