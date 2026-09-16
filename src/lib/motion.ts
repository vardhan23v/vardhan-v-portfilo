/**
 * Site-wide motion preference.
 *
 * The OS "Reduce motion" setting is only a default here. Visitors can force
 * animations on or off; the resolved state lives on `<html data-motion>` and
 * every CSS gate (`html[data-motion="reduce"] …`) and JS check reads that,
 * never the media query directly. The inline script in index.html applies the
 * stored preference before first paint so nothing flashes.
 */
export type MotionPreference = "auto" | "on" | "off";

export const MOTION_STORAGE_KEY = "motion";
export const MOTION_EVENT = "motion-change";
const QUERY = "(prefers-reduced-motion: reduce)";

const hasDom = () => typeof window !== "undefined" && typeof document !== "undefined";

export function getMotionPreference(): MotionPreference {
  if (!hasDom()) return "auto";
  try {
    const v = localStorage.getItem(MOTION_STORAGE_KEY);
    return v === "on" || v === "off" ? v : "auto";
  } catch {
    return "auto";
  }
}

/** True when the operating system asks for reduced motion (ignores the site override). */
export const osPrefersReducedMotion = () => hasDom() && window.matchMedia(QUERY).matches;

const resolve = (pref: MotionPreference) =>
  pref === "on" ? "on" : pref === "off" ? "reduce" : osPrefersReducedMotion() ? "reduce" : "on";

/** Write the resolved state to `<html data-motion>`. */
export function applyMotion(pref: MotionPreference = getMotionPreference()) {
  if (!hasDom()) return;
  const next = resolve(pref);
  const root = document.documentElement;
  if (root.getAttribute("data-motion") !== next) root.setAttribute("data-motion", next);
  window.dispatchEvent(new CustomEvent(MOTION_EVENT, { detail: next }));
}

export function setMotionPreference(pref: MotionPreference) {
  try {
    if (pref === "auto") localStorage.removeItem(MOTION_STORAGE_KEY);
    else localStorage.setItem(MOTION_STORAGE_KEY, pref);
  } catch {
    /* private mode */
  }
  applyMotion(pref);
}

/** The single source of truth for "should this animate right now?". */
export function motionReduced(): boolean {
  if (!hasDom()) return false;
  const attr = document.documentElement.getAttribute("data-motion");
  return attr ? attr === "reduce" : osPrefersReducedMotion();
}

/** Subscribe to resolved-state changes (site toggle or OS setting). */
export function subscribeMotion(cb: () => void) {
  if (!hasDom()) return () => {};
  const mq = window.matchMedia(QUERY);
  const onMq = () => applyMotion();
  mq.addEventListener("change", onMq);
  window.addEventListener(MOTION_EVENT, cb);
  return () => {
    mq.removeEventListener("change", onMq);
    window.removeEventListener(MOTION_EVENT, cb);
  };
}

/** Human-readable state for toggles. */
export function motionSummary(): { pref: MotionPreference; reduced: boolean; label: string } {
  const pref = getMotionPreference();
  const reduced = pref === "off" || (pref === "auto" && osPrefersReducedMotion());
  const label =
    pref === "on" ? "Animations on" : pref === "off" ? "Animations off" : reduced ? "Animations off (system)" : "Animations auto";
  return { pref, reduced, label };
}
