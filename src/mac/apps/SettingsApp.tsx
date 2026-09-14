import { useState } from "react";
import {
  Palette,
  Moon,
  Sun,
  PanelBottom,
  Wifi,
  Volume2,
  Info,
  RotateCcw,
} from "lucide-react";
import { useTheme } from "../hooks/useTheme";
import { useWindowManager } from "../hooks/useWindowManager";
import { usePreferences, type Preferences } from "../hooks/usePreferences";
import type { AppId } from "../hooks/useWindowManager";

/* ── Accent palette ─────────────────────────────────────────── */
export const ACCENTS = [
  { name: "blue" as const, color: "#0a84ff", label: "Blue" },
  { name: "purple" as const, color: "#bf5af2", label: "Purple" },
  { name: "pink" as const, color: "#ff375f", label: "Pink" },
  { name: "orange" as const, color: "#ff9f0a", label: "Orange" },
  { name: "green" as const, color: "#30d158", label: "Green" },
  { name: "graphite" as const, color: "#98989d", label: "Graphite" },
];

/* ── Section nav ────────────────────────────────────────────── */
type SectionId = "appearance" | "focus" | "dock" | "network" | "sound" | "general";

const SECTIONS: {
  id: SectionId;
  label: string;
  Icon: React.ComponentType<{ size?: number }>;
}[] = [
  { id: "appearance", label: "Appearance", Icon: Palette },
  { id: "focus", label: "Focus", Icon: Moon },
  { id: "dock", label: "Dock & Menu Bar", Icon: PanelBottom },
  { id: "network", label: "Network", Icon: Wifi },
  { id: "sound", label: "Sound", Icon: Volume2 },
  { id: "general", label: "General", Icon: Info },
];

/* ── Tiny toggle switch (reuses CC class) ───────────────────── */
function Sw({
  on,
  label,
  onToggle,
}: {
  on: boolean;
  label: string;
  onToggle: () => void;
}) {
  return (
    <button
      className={`cc-switch${on ? " is-on" : ""}`}
      onClick={onToggle}
      aria-pressed={on}
      aria-label={label}
    >
      <span className="cc-switch__knob" />
    </button>
  );
}

/* ── Appearance panel ───────────────────────────────────────── */
function Appearance({
  prefs,
  theme,
  setTheme,
  set,
}: {
  prefs: Preferences;
  theme: string;
  setTheme: (t: "light" | "dark") => void;
  set: <K extends keyof Preferences>(key: K, value: Preferences[K]) => void;
}) {
  return (
    <>
      <div className="settingsapp__head">Appearance</div>
      <div className="settingsapp__group">
        <div className="settingsrow">
          <div className="settingsrow__text">
            <div className="settingsrow__label">Accent colour</div>
          </div>
        </div>
        <div className="accent-row">
          {ACCENTS.map(({ name, color, label }) => (
            <button
              key={name}
              className={`accent-swatch${prefs.accent === name ? " is-selected" : ""}`}
              style={{ background: color }}
              aria-label={label}
              onClick={() => set("accent", name)}
            >
              <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="2.5 7.5 5.5 10.5 11.5 4.5" />
              </svg>
            </button>
          ))}
        </div>
      </div>

      <div className="settingsapp__group">
        <div className="settingsrow">
          <div className="settingsrow__text">
            <div className="settingsrow__label">Appearance</div>
            <div className="settingsrow__sub">
              {theme === "light" ? "Light" : "Dark"}
            </div>
          </div>
          <div className="settingsrow__control cc-seg" role="group" aria-label="Theme">
            <button
              className={theme === "light" ? "is-on" : ""}
              onClick={() => theme !== "light" && setTheme("light")}
            >
              <Sun size={14} /> Light
            </button>
            <button
              className={theme === "dark" ? "is-on" : ""}
              onClick={() => theme !== "dark" && setTheme("dark")}
            >
              <Moon size={14} /> Dark
            </button>
          </div>
        </div>
      </div>

      <div className="settingsapp__group">
        <div className="settingsrow">
          <div className="settingsrow__text">
            <div className="settingsrow__label">Reduce motion</div>
            <div className="settingsrow__sub">
              Animations respect your OS setting automatically
            </div>
          </div>
          <Sw
            on={prefs.reduceMotion}
            label="Reduce motion"
            onToggle={() => {
              set("reduceMotion", !prefs.reduceMotion);
            }}
          />
        </div>
      </div>
    </>
  );
}

/* ── Focus panel ────────────────────────────────────────────── */
function Focus({
  prefs,
  toggle,
}: {
  prefs: Preferences;
  toggle: (k: "dnd") => void;
}) {
  return (
    <>
      <div className="settingsapp__head">Focus</div>
      <div className="settingsapp__group">
        <div className="settingsrow">
          <div className="settingsrow__text">
            <div className="settingsrow__label">Do Not Disturb</div>
            <div className="settingsrow__sub">
              Suppresses notifications while you work
            </div>
          </div>
          <Sw
            on={prefs.dnd}
            label="Do Not Disturb"
            onToggle={() => toggle("dnd")}
          />
        </div>
      </div>
    </>
  );
}

/* ── Dock panel ─────────────────────────────────────────────── */
function Dock({
  prefs,
  toggle,
}: {
  prefs: Preferences;
  toggle: (k: "dockAutoHide") => void;
}) {
  return (
    <>
      <div className="settingsapp__head">Dock & Menu Bar</div>
      <div className="settingsapp__group">
        <div className="settingsrow">
          <div className="settingsrow__text">
            <div className="settingsrow__label">Automatically hide and show the Dock</div>
          </div>
          <Sw
            on={prefs.dockAutoHide}
            label="Auto-hide Dock"
            onToggle={() => toggle("dockAutoHide")}
          />
        </div>
      </div>
    </>
  );
}

/* ── Network panel ──────────────────────────────────────────── */
function Network({
  prefs,
  toggle,
}: {
  prefs: Preferences;
  toggle: (k: "wifi" | "bluetooth" | "airdrop") => void;
}) {
  return (
    <>
      <div className="settingsapp__head">Network</div>
      <div className="settingsapp__group">
        <div className="settingsrow">
          <div className="settingsrow__text">
            <div className="settingsrow__label">Wi-Fi</div>
            <div className="settingsrow__sub">{prefs.wifi ? "GameMesh 5G" : "Off"}</div>
          </div>
          <Sw on={prefs.wifi} label="Wi-Fi" onToggle={() => toggle("wifi")} />
        </div>
        <div className="settingsrow">
          <div className="settingsrow__text">
            <div className="settingsrow__label">Bluetooth</div>
            <div className="settingsrow__sub">{prefs.bluetooth ? "On" : "Off"}</div>
          </div>
          <Sw on={prefs.bluetooth} label="Bluetooth" onToggle={() => toggle("bluetooth")} />
        </div>
        <div className="settingsrow">
          <div className="settingsrow__text">
            <div className="settingsrow__label">AirDrop</div>
            <div className="settingsrow__sub">{prefs.airdrop ? "Contacts Only" : "Off"}</div>
          </div>
          <Sw on={prefs.airdrop} label="AirDrop" onToggle={() => toggle("airdrop")} />
        </div>
      </div>
    </>
  );
}

/* ── Sound panel ────────────────────────────────────────────── */
function Sound({
  prefs,
  set,
}: {
  prefs: Preferences;
  set: <K extends keyof Preferences>(key: K, value: Preferences[K]) => void;
}) {
  return (
    <>
      <div className="settingsapp__head">Sound</div>
      <div className="settingsapp__group">
        <div className="settingsrow">
          <div className="settingsrow__text">
            <div className="settingsrow__label">Output volume</div>
          </div>
          <div className="settingsrow__control">
            <input
              className="cc-range"
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={prefs.volume}
              onInput={(e) =>
                set("volume", parseFloat((e.target as HTMLInputElement).value))
              }
              aria-label="Volume"
            />
            <span className="settingsapp__volume">
              {Math.round(prefs.volume * 100)}%
            </span>
          </div>
        </div>
      </div>
    </>
  );
}

/* ── General panel ──────────────────────────────────────────── */
function General({
  resetWorkspace,
  openWindow,
}: {
  resetWorkspace: () => void;
  openWindow: (id: AppId) => void;
}) {
  return (
    <>
      <div className="settingsapp__head">General</div>
      <div className="settingsapp__group">
        <div className="settingsrow">
          <div className="settingsrow__text">
            <div className="settingsrow__label">About This Mac</div>
            <div className="settingsrow__sub">VardhanOS specs + links</div>
          </div>
          <button
            className="mac-btn mac-btn--ghost"
            onClick={() => openWindow("about-mac")}
          >
            <Info style={{ width: 14, height: 14 }} /> Open
          </button>
        </div>
        <div className="settingsrow">
          <div className="settingsrow__text">
            <div className="settingsrow__label">Reset workspace</div>
            <div className="settingsrow__sub">Close all windows except Overview</div>
          </div>
          <button
            className="mac-btn mac-btn--ghost"
            onClick={resetWorkspace}
          >
            <RotateCcw style={{ width: 14, height: 14 }} /> Reset
          </button>
        </div>
      </div>
      <div className="settingsapp__group">
        <div className="settingsrow">
          <div className="settingsrow__text">
            <div className="settingsrow__label">Version</div>
            <div className="settingsrow__sub">VardhanOS 1.0 (2025)</div>
          </div>
        </div>
      </div>
    </>
  );
}

/* ── Root Settings app ──────────────────────────────────────── */
export function SettingsApp() {
  const [section, setSection] = useState<SectionId>("appearance");
  const { prefs, toggle, set } = usePreferences();
  const { theme, setTheme } = useTheme();
  const { windows, closeWindow, focusWindow, openWindow } =
    useWindowManager();

  const resetWorkspace = () => {
    for (const w of windows)
      if (w.id !== "overview") closeWindow(w.id);
    focusWindow("overview");
  };

  return (
    <div className="settingsapp">
      <nav className="settingsapp__side">
        {SECTIONS.map(({ id, label, Icon }) => (
          <button
            key={id}
            className={`settingsapp__side-item${section === id ? " is-active" : ""}`}
            onClick={() => setSection(id)}
          >
            <Icon size={15} />
            {label}
          </button>
        ))}
      </nav>

      <div className="settingsapp__main">
        {section === "appearance" && (
          <Appearance prefs={prefs} theme={theme} setTheme={setTheme} set={set} />
        )}
        {section === "focus" && <Focus prefs={prefs} toggle={toggle} />}
        {section === "dock" && <Dock prefs={prefs} toggle={toggle} />}
        {section === "network" && <Network prefs={prefs} toggle={toggle} />}
        {section === "sound" && <Sound prefs={prefs} set={set} />}
        {section === "general" && (
          <General resetWorkspace={resetWorkspace} openWindow={openWindow} />
        )}
      </div>
    </div>
  );
}
