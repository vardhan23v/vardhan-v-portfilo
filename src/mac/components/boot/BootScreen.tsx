import { useEffect, useState } from "react";
import { site } from "../../data/site";
import { usePreferences } from "../../hooks/usePreferences";
import { motionReduced } from "../../../lib/motion";

const initials = site.name
  .split(" ")
  .filter(Boolean)
  .slice(0, 2)
  .map((w) => w[0])
  .join("")
  .toUpperCase();

/**
 * Boot → login → done. Any key or click completes; reduced motion jumps
 * straight to the login card with no progress animation.
 */
export function BootScreen({ onDone }: { onDone: () => void }) {
  const { prefs } = usePreferences();
  const instant =
    prefs.reduceMotion ||
    (motionReduced());
  const [phase, setPhase] = useState<"boot" | "login" | "leaving">(instant ? "login" : "boot");

  useEffect(() => {
    if (phase !== "boot") return;
    const t = window.setTimeout(() => setPhase("login"), 1100);
    return () => window.clearTimeout(t);
  }, [phase]);

  useEffect(() => {
    const finish = () => {
      if (phase === "leaving") return;
      setPhase("leaving");
      window.setTimeout(onDone, instant ? 0 : 360);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Enter" || e.key === "Escape" || e.key === " ") {
        e.preventDefault();
        finish();
      }
    };
    window.addEventListener("keydown", onKey);
    (window as unknown as { __macBootFinish?: () => void }).__macBootFinish = finish;
    return () => {
      window.removeEventListener("keydown", onKey);
      delete (window as unknown as { __macBootFinish?: () => void }).__macBootFinish;
    };
  }, [phase, onDone, instant]);

  const finish = () => (window as unknown as { __macBootFinish?: () => void }).__macBootFinish?.();

  return (
    <div
      className={`mac-boot mac-boot--${phase}${instant ? " is-instant" : ""}`}
      role="dialog"
      aria-label="Sign in to Vardhan OS"
      onClick={phase === "login" ? finish : undefined}
    >
      {phase === "boot" && (
        <div className="mac-boot__stage">
          <div className="mac-boot__wordmark">Vardhan<span>OS</span></div>
          <div className="mac-boot__bar" aria-hidden="true"><span /></div>
          <div className="mac-boot__hint mac-caps">loading the desk</div>
        </div>
      )}
      {phase !== "boot" && (
        <div className="mac-boot__stage" onClick={(e) => e.stopPropagation()}>
          <div className="mac-boot__avatar" aria-hidden="true">{initials}</div>
          <div className="mac-boot__name">{site.name}</div>
          <div className="mac-boot__role mac-caps">{site.shortTitle}</div>
          <button type="button" className="mac-boot__enter" onClick={finish} autoFocus>
            Enter <kbd>↵</kbd>
          </button>
          <button type="button" className="mac-boot__skip mac-caps" onClick={finish}>
            skip
          </button>
        </div>
      )}
    </div>
  );
}
