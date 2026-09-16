import { useEffect, useState } from "react";
import { motionReduced } from "../../lib/motion";

/**
 * Keeps an element mounted for `ms` after `show` turns false so it can play
 * an exit animation. Returns `closing` while that grace period runs.
 */
export function usePresence(show: boolean, ms = 160) {
  const [mounted, setMounted] = useState(show);
  const [closing, setClosing] = useState(false);
  useEffect(() => {
    if (show) {
      setMounted(true);
      setClosing(false);
      return;
    }
    if (!mounted) return;
    setClosing(true);
    const t = window.setTimeout(
      () => {
        setMounted(false);
        setClosing(false);
      },
      motionReduced() ? 0 : ms
    );
    return () => window.clearTimeout(t);
  }, [show, mounted, ms]);
  return { mounted, closing };
}
