import { flushSync } from "react-dom";
import { motionReduced } from "../../lib/motion";

/** Run a state change inside a View Transition (a soft crossfade) where supported; instant otherwise. */
export function smooth(update: () => void) {
  const doc = document as Document & { startViewTransition?: (cb: () => void) => unknown };
  if (!doc.startViewTransition || motionReduced()) return update();
  doc.startViewTransition(() => flushSync(update));
}
