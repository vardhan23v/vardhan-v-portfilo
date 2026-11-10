import { motionReduced } from "../motion";

/**
 * Should the assistant skip a JS-driven animation right now? True for the site-wide reduced-motion
 * state and for macOS's in-app "Reduce motion" (.mac-root[data-mac-motion="off"]), which the CSS
 * mirrors at the end of assistant.css.
 */
export const assistantMotionOff = (): boolean =>
  motionReduced() || (typeof document !== "undefined" && document.querySelector(".mac-root")?.getAttribute("data-mac-motion") === "off");
