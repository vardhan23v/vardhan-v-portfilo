import { useEffect, useState } from "react";
import { Bug, RotateCcw, Eraser, Layers } from "lucide-react";
import { useWindowManager } from "../../hooks/useWindowManager";
import { usePreferences } from "../../hooks/usePreferences";
import { useTheme } from "../../hooks/useTheme";

const MAX_LOGS = 40;

/** Phase-7 Developer Mode: a live inspector for the operating system.
 *  Toggled from Settings → General; surfaced as a chip in the menu bar. */
export function DevPanel() {
  const { windows, activeId, bringToFront } = useWindowManager();
  const { prefs } = usePreferences();
  const { theme } = useTheme();
  const [logs, setLogs] = useState<string[]>([]);
  const [uptime, setUptime] = useState(0);

  useEffect(() => {
    const push = (text: string) =>
      setLogs((prev) => [text, ...prev].slice(0, MAX_LOGS));
    const onErr = (e: ErrorEvent) =>
      push(
        `${e.message} @ ${(e.filename?.split("/").pop() ?? "inline")}:${e.lineno}`
      );
    const onRej = (e: PromiseRejectionEvent) =>
      push(`unhandledrejection: ${String(e.reason)}`);
    window.addEventListener("error", onErr);
    window.addEventListener("unhandledrejection", onRej);
    return () => {
      window.removeEventListener("error", onErr);
      window.removeEventListener("unhandledrejection", onRej);
    };
  }, []);

  useEffect(() => {
    const id = window.setInterval(() => setUptime((u) => u + 1), 1000);
    return () => window.clearInterval(id);
  }, []);

  const mm = String(Math.floor(uptime / 60)).padStart(2, "0");
  const ss = String(uptime % 60).padStart(2, "0");

  const resetPrefs = () => {
    try {
      localStorage.removeItem("mac-preferences");
      localStorage.removeItem("mac-theme");
      localStorage.removeItem("mac-desktop-icons");
      sessionStorage.removeItem("mac-booted");
    } catch {
      /* no-op */
    }
    window.location.reload();
  };

  return (
    <div className="dev-panel" role="dialog" aria-label="Developer Mode">
      <div className="dev-panel__head">
        <Bug size={14} /> Developer Mode
        <span className="dev-panel__live">live</span>
      </div>

      <div className="dev-panel__section" aria-label="System">
        <div className="dev-panel__row">
          <span className="dev-panel__k">Viewport</span>
          <span className="dev-panel__v">
            {window.innerWidth}×{window.innerHeight} · dpr {window.devicePixelRatio}
          </span>
        </div>
        <div className="dev-panel__row">
          <span className="dev-panel__k">Theme / motion</span>
          <span className="dev-panel__v">
            {theme} / {prefs.reduceMotion ? "off" : "on"}
          </span>
        </div>
        <div className="dev-panel__row">
          <span className="dev-panel__k">Accent</span>
          <span className="dev-panel__v">{prefs.accent}</span>
        </div>
        <div className="dev-panel__row">
          <span className="dev-panel__k">Session</span>
          <span className="dev-panel__v">{mm}:{ss}</span>
        </div>
      </div>

      <div className="dev-panel__section" aria-label="Windows">
        <div className="dev-panel__subhead">
          <Layers size={12} /> Windows ({windows.length})
        </div>
        {windows.length === 0 && <div className="dev-panel__row"><span className="dev-panel__v">none open</span></div>}
        {windows.map((w) => (
          <button
            key={w.id}
            className={`dev-panel__win${activeId === w.id ? " is-active" : ""}`}
            onClick={() => bringToFront(w.id)}
            title="Focus window"
          >
            <span className="dev-panel__win-id">{w.id}</span>
            <span className="dev-panel__win-meta">
              {w.w}×{w.h} @ {w.x},{w.y} · z{w.z}
              {w.minimized ? " · minimized" : ""}
              {w.maximized ? " · maximized" : ""}
            </span>
          </button>
        ))}
      </div>

      <div className="dev-panel__section" aria-label="Preferences">
        <div className="dev-panel__subhead">Preferences</div>
        <pre className="dev-panel__json">{JSON.stringify(prefs, null, 2)}</pre>
      </div>

      <div className="dev-panel__section" aria-label="Console">
        <div className="dev-panel__subhead">Console</div>
        {logs.length === 0 ? (
          <div className="dev-panel__row"><span className="dev-panel__v dev-panel__v--dim">no errors logged</span></div>
        ) : (
          <div className="dev-panel__console">
            {logs.map((l, i) => (
              <div key={i} className="dev-panel__log">{l}</div>
            ))}
          </div>
        )}
      </div>

      <div className="dev-panel__actions">
        <button className="mac-btn mac-btn--ghost" onClick={() => window.location.reload()}>
          <RotateCcw style={{ width: 13, height: 13 }} /> Reload OS
        </button>
        <button className="mac-btn mac-btn--ghost" onClick={resetPrefs}>
          <Eraser style={{ width: 13, height: 13 }} /> Reset prefs
        </button>
      </div>
    </div>
  );
}