import { useEffect, useState } from "react";
import { Power } from "lucide-react";
import { useShell } from "../../hooks/useShell";
import { useIstTime } from "../../hooks/useIstTime";
import { site } from "../../data/site";

const initials = site.name.split(" ").filter(Boolean).slice(0, 2).map((w) => w[0]).join("").toUpperCase();

/** Lock / sleep / restart / shut-down overlays driven by useShell().sysState. */
export function SystemStates() {
  const { sysState, setSysState, setBooted } = useShell();
  const ist = useIstTime(false);
  const [fading, setFading] = useState(false);

  // restart: fade to black, then reboot through the boot screen
  useEffect(() => {
    if (sysState !== "restart") return;
    setFading(true);
    const t = window.setTimeout(() => {
      setFading(false);
      setSysState("none");
      setBooted(false);
    }, 900);
    return () => window.clearTimeout(t);
  }, [sysState, setSysState, setBooted]);

  // sleep: any input wakes to the lock screen
  useEffect(() => {
    if (sysState !== "sleep") return;
    const wake = () => setSysState("lock");
    const t = window.setTimeout(() => {
      window.addEventListener("pointerdown", wake, { once: true });
      window.addEventListener("keydown", wake, { once: true });
    }, 400);
    return () => { window.clearTimeout(t); window.removeEventListener("pointerdown", wake); window.removeEventListener("keydown", wake); };
  }, [sysState, setSysState]);

  useEffect(() => {
    if (sysState !== "lock") return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Enter" || e.key === "Escape") setSysState("none"); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [sysState, setSysState]);

  if (sysState === "none" && !fading) return null;

  if (sysState === "restart") return <div className="mac-sys mac-sys--black" aria-hidden="true" />;

  if (sysState === "sleep")
    return (
      <div className="mac-sys mac-sys--sleep" role="button" tabIndex={0} aria-label="Sleeping — press any key or click to wake">
        <i className="mac-sys__breath" />
      </div>
    );

  if (sysState === "shutdown")
    return (
      <div className="mac-sys mac-sys--off" role="dialog" aria-label="Shut down">
        <button className="mac-sys__power" onClick={() => { setSysState("none"); setBooted(false); }} aria-label="Power on">
          <Power />
        </button>
        <span className="mac-caps">press power to start</span>
      </div>
    );

  return (
    <div className="mac-sys mac-sys--lock" role="dialog" aria-label="Locked" onClick={() => setSysState("none")}>
      <div className="mac-sys__time">{ist}</div>
      <div className="mac-sys__card" onClick={(e) => e.stopPropagation()}>
        <div className="mac-boot__avatar">{initials}</div>
        <div className="mac-boot__name">{site.name}</div>
        <button className="mac-boot__enter" onClick={() => setSysState("none")} autoFocus>Unlock <kbd>↵</kbd></button>
      </div>
      <span className="mac-sys__hint mac-caps">click anywhere or press enter</span>
    </div>
  );
}
