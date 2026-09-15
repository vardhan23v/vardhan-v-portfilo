import { useEffect, useState } from "react";
import { useShell } from "../../hooks/useShell";
import { useIstTime } from "../../hooks/useIstTime";
import { site } from "../../data/site";

const IDLE_MS = 120_000;

/** Idle screensaver: a drifting display clock. Any input dismisses it. */
export function Screensaver() {
  const { overlay, setOverlay } = useShell();
  const ist = useIstTime(false);
  const [seed, setSeed] = useState(0);
  const on = overlay === "saver";

  // idle detection
  useEffect(() => {
    if (typeof window === "undefined") return;
    const forced = new URLSearchParams(window.location.search).get("saver") === "1";
    let t = 0;
    const arm = () => {
      window.clearTimeout(t);
      t = window.setTimeout(() => setOverlay("saver"), IDLE_MS);
    };
    const events = ["pointermove", "pointerdown", "keydown", "wheel", "touchstart"];
    events.forEach((e) => window.addEventListener(e, arm, { passive: true }));
    if (forced) setOverlay("saver");
    else arm();
    return () => {
      window.clearTimeout(t);
      events.forEach((e) => window.removeEventListener(e, arm));
    };
  }, [setOverlay]);

  // reposition the clock every 20s while active
  useEffect(() => {
    if (!on) return;
    const i = window.setInterval(() => setSeed((s) => s + 1), 20_000);
    return () => window.clearInterval(i);
  }, [on]);

  if (!on) return null;
  const px = 35 + ((seed * 37) % 31);
  const py = 30 + ((seed * 53) % 41);
  const [h, m] = ist.replace(/\s.*$/, "").split(":");

  return (
    <div
      className="mac-saver"
      role="button"
      tabIndex={0}
      aria-label="Screensaver — press any key or click to wake"
      onPointerDown={() => setOverlay("none")}
      onKeyDown={() => setOverlay("none")}
    >
      <div className="mac-saver__clock" style={{ left: `${px}%`, top: `${py}%` }}>
        <span className="mac-saver__time">{h}<i>:</i>{m}</span>
        <span className="mac-saver__name">{site.name}</span>
        <span className="mac-saver__hint mac-caps">tap anywhere to wake</span>
      </div>
      <div className="mac-saver__orb mac-saver__orb--a" aria-hidden="true" />
      <div className="mac-saver__orb mac-saver__orb--b" aria-hidden="true" />
    </div>
  );
}
