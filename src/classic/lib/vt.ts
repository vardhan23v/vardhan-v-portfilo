import { flushSync } from "react-dom";
import { startLocalTransition } from "../../lib/motion";

/**
 * Run an in-page state change (filters, Show more, skill chips) as a scoped View Transition: only the
 * items that carry a `--vtn` name morph, the root is not captured, so the page itself never dips or blurs.
 * `data-vt="cl-local"` on <html> turns those names on just for this transition (classic.css), and comes
 * off when the shared helper removes `vt-local`. Instant without the API or under reduced motion.
 */
export function smooth(update: () => void) {
  const root = document.documentElement;
  root.dataset.vt = "cl-local";
  const clear = () => { mo.disconnect(); if (root.dataset.vt === "cl-local") delete root.dataset.vt; };
  const mo = new MutationObserver(() => { if (!root.classList.contains("vt-local")) clear(); });
  startLocalTransition(() => flushSync(update));
  // No transition ran (no API, reduced motion): the update already happened.
  if (!root.classList.contains("vt-local")) { clear(); return; }
  mo.observe(root, { attributes: true, attributeFilter: ["class"] });
}
