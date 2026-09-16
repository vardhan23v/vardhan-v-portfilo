import { motionSummary, setMotionPreference, type MotionPreference } from "../lib/motion";
import { usePrefersReducedMotion } from "../hooks/usePrefersReducedMotion";

const NEXT: Record<MotionPreference, MotionPreference> = { auto: "on", on: "off", off: "auto" };

/** Cycles auto → on → off. Renders as an unstyled button so each page can theme it. */
export function MotionToggle({ className }: { className?: string }) {
  usePrefersReducedMotion(); // re-render when the resolved state changes
  const { pref, reduced, label } = motionSummary();
  const next = NEXT[pref];
  return (
    <button
      type="button"
      className={className}
      onClick={() => setMotionPreference(next)}
      aria-pressed={!reduced}
      title={`Click to set animations: ${next === "auto" ? "follow system" : next}`}
    >
      {label}
    </button>
  );
}
