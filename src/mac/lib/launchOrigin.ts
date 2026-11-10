import type { AppId } from "../hooks/useWindowManager";

/**
 * Where the next open should zoom from: the icon that was actually clicked (Launchpad,
 * desktop icon, Finder item). WindowFrame consumes it on mount; without a fresh origin
 * the window zooms out of its Dock tile as before.
 */
const launchOrigins = new Map<AppId, { rect: DOMRect; t: number; delay: number }>();
export function setLaunchOrigin(id: AppId, el: Element | null | undefined, delay = 0) {
  if (!el) return;
  launchOrigins.set(id, { rect: el.getBoundingClientRect(), t: performance.now(), delay });
}
/** Read once: an origin older than 600ms (a deferred or ignored open) is dropped. */
export function takeLaunchOrigin(id: AppId) {
  const o = launchOrigins.get(id);
  launchOrigins.delete(id);
  return o && performance.now() - o.t < 600 ? o : null;
}
