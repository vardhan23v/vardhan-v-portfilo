import {
  Wifi,
  Bluetooth,
  Nfc,
  Moon,
  Sun,
  Monitor,
  Volume2,
  Minimize2,
  Sparkles,
} from "lucide-react";
import { useWindowManager } from "../../hooks/useWindowManager";
import { usePreferences } from "../../hooks/usePreferences";
import { useTheme } from "../../hooks/useTheme";
import { usePresence } from "../../hooks/usePresence";

/** Phase-3 Control Center: connectivity/focus tiles + real display/sound
 *  controls, all backed by the persisted preferences store. */
export function ControlCenter({ open = true }: { open?: boolean }) {
  const { mounted, closing } = usePresence(open, 160);
  const { prefs, toggle, set } = usePreferences();
  const { theme, setTheme } = useTheme();
  const { windows, minimizeWindow } = useWindowManager();

  const showDesktop = () => {
    for (const w of windows) if (!w.minimized) minimizeWindow(w.id);
  };

  if (!mounted) return null;
  return (
    <div className={`cc-drop${closing ? " is-closing" : ""}`} role="dialog" aria-label="Control Center">
      <div className="cc-grid">
        <button
          type="button"
          className={`cc-tile${prefs.wifi ? " is-on" : ""}`}
          onClick={() => toggle("wifi")}
          aria-pressed={prefs.wifi}
        >
          <span className="cc-tile__icon"><Wifi /></span>
          <span className="cc-tile__label">Wi-Fi</span>
          <span className="cc-tile__state">{prefs.wifi ? "On" : "Off"}</span>
        </button>
        <button
          type="button"
          className={`cc-tile${prefs.bluetooth ? " is-on" : ""}`}
          onClick={() => toggle("bluetooth")}
          aria-pressed={prefs.bluetooth}
        >
          <span className="cc-tile__icon"><Bluetooth /></span>
          <span className="cc-tile__label">Bluetooth</span>
          <span className="cc-tile__state">{prefs.bluetooth ? "On" : "Off"}</span>
        </button>
        <button
          type="button"
          className={`cc-tile${prefs.airdrop ? " is-on" : ""}`}
          onClick={() => toggle("airdrop")}
          aria-pressed={prefs.airdrop}
        >
          <span className="cc-tile__icon"><Nfc /></span>
          <span className="cc-tile__label">AirDrop</span>
          <span className="cc-tile__state">{prefs.airdrop ? "Contacts" : "Off"}</span>
        </button>
        <button
          type="button"
          className={`cc-tile${prefs.dnd ? " is-on is-focus" : ""}`}
          onClick={() => toggle("dnd")}
          aria-pressed={prefs.dnd}
        >
          <span className="cc-tile__icon"><Moon /></span>
          <span className="cc-tile__label">Focus</span>
          <span className="cc-tile__state">{prefs.dnd ? "DND" : "On"}</span>
        </button>
      </div>

      <div className="cc-panel">
        <div className="cc-panel__head">Appearance</div>
        <div className="cc-seg" role="group" aria-label="Appearance">
          <button className={theme === "light" ? "is-on" : ""} onClick={() => setTheme("light")} aria-pressed={theme === "light"}>
            <Sun /> Light
          </button>
          <button className={theme === "dark" ? "is-on" : ""} onClick={() => setTheme("dark")} aria-pressed={theme === "dark"}>
            <Moon /> Dark
          </button>
        </div>
      </div>

      <div className="cc-panel">
        <div className="cc-panel__head">Display</div>
        <div className="cc-row">
          <Monitor className="cc-row__icon" />
          <input
            className="cc-range"
            type="range"
            min={0.3}
            max={1}
            step={0.01}
            value={prefs.brightness}
            onChange={(e) => set("brightness", Number(e.target.value))}
            aria-label="Brightness"
          />
        </div>
        <div className="cc-row">
          <span className="cc-row__label">Reduce motion</span>
          <button
            className={`cc-switch${prefs.reduceMotion ? " is-on" : ""}`}
            onClick={() => toggle("reduceMotion")}
            aria-pressed={prefs.reduceMotion}
            aria-label="Reduce motion"
          >
            <span className="cc-switch__knob" />
          </button>
        </div>
      </div>

      <div className="cc-panel">
        <div className="cc-panel__head">Sound</div>
        <div className="cc-row">
          <Volume2 className="cc-row__icon" />
          <input
            className="cc-range"
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={prefs.volume}
            onChange={(e) => set("volume", Number(e.target.value))}
            aria-label="Volume"
          />
        </div>
      </div>

      <div className="cc-panel">
        <div className="cc-row">
          <span className="cc-row__label">Auto-hide Dock</span>
          <button
            className={`cc-switch${prefs.dockAutoHide ? " is-on" : ""}`}
            onClick={() => toggle("dockAutoHide")}
            aria-pressed={prefs.dockAutoHide}
            aria-label="Auto-hide Dock"
          >
            <span className="cc-switch__knob" />
          </button>
        </div>
      </div>

      <button type="button" className="cc-action" onClick={showDesktop}>
        <Minimize2 /> Show Desktop
      </button>
      <div className="cc-footer">
        <Sparkles /> VardhanOS 1.0
      </div>
    </div>
  );
}