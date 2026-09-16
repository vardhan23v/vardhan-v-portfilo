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
  Monitor,
  Play,
} from "lucide-react";
import { useShell } from "../hooks/useShell";
import { getMotionPreference, setMotionPreference, osPrefersReducedMotion, type MotionPreference } from "../../lib/motion";
import { usePrefersReducedMotion } from "../../hooks/usePrefersReducedMotion";
import { featuredProjects } from "../data/projects";
import { ProjectCover } from "../components/ui/ProjectCover";
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
type SectionId = "appearance" | "desktop" | "focus" | "dock" | "network" | "sound" | "general";

const SECTIONS: {
  id: SectionId;
  label: string;
  Icon: React.ComponentType<{ size?: number }>;
}[] = [
  { id: "appearance", label: "Appearance", Icon: Palette },
  { id: "desktop", label: "Desktop", Icon: Monitor },
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
              Turns off window, dock and wallpaper motion inside this edition
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
        <SiteMotionRow />
      </div>
    </>
  );
}

/* ── Site-wide animations (all editions) ────────────────────── */
function SiteMotionRow() {
  usePrefersReducedMotion();
  const pref = getMotionPreference();
  const os = osPrefersReducedMotion();
  const opts: { id: MotionPreference; label: string }[] = [
    { id: "on", label: "On" },
    { id: "off", label: "Off" },
    { id: "auto", label: "System" },
  ];
  return (
    <div className="settingsrow">
      <div className="settingsrow__text">
        <div className="settingsrow__label">Animations (all interfaces)</div>
        <div className="settingsrow__sub">
          {pref === "auto"
            ? os
              ? "Your system asks for reduced motion, so animations are paused. Choose On to override."
              : "Following your system setting (motion is on)"
            : pref === "on"
              ? "Always animate (default), even when the system asks for reduced motion"
              : "Never animate"}
        </div>
      </div>
      <div className="settingsrow__control cc-seg" role="group" aria-label="Animations">
        {opts.map((o) => (
          <button key={o.id} className={pref === o.id ? "is-on" : ""} onClick={() => pref !== o.id && setMotionPreference(o.id)}>
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ── Desktop panel ──────────────────────────────────────────── */
const GRADS = [
  { id: "mesh", label: "Mesh (accent)" },
  { id: "grad:sequoia", label: "Sequoia" },
  { id: "grad:sonoma", label: "Sonoma" },
  { id: "grad:ink", label: "Ink" },
  { id: "grad:ember", label: "Ember" },
];

function DesktopPanel() {
  const { iconsHidden, setIconsHidden, setBooted } = useShell();
  const { prefs, set } = usePreferences();
  const shots = featuredProjects.flatMap((p) => (p.screenshots ?? []).map((s) => ({ src: s, p })));
  return (
    <>
      <div className="settingsapp__head">Desktop &amp; Wallpaper</div>
      <div className="settingsapp__group">
        <div className="settingsrow" style={{ flexDirection: "column", alignItems: "stretch", gap: 10 }}>
          <div className="settingsrow__text"><div className="settingsrow__label">Wallpaper</div><div className="settingsrow__sub">Gradient presets, project screenshots, or any Photos item via “Set as wallpaper”</div></div>
          <div className="wp-grid">
            {GRADS.map((g) => (
              <button key={g.id} className={`wp-tile wp-tile--${g.id.replace("grad:", "")}${prefs.wallpaper === g.id ? " is-selected" : ""}`} onClick={() => set("wallpaper", g.id)} aria-label={g.label} title={g.label}><span>{g.label}</span></button>
            ))}
            {shots.map(({ src, p }) => (
              <button key={src} className={`wp-tile wp-tile--img${prefs.wallpaper === src ? " is-selected" : ""}`} onClick={() => set("wallpaper", src)} aria-label={`${p.name} screenshot`} title={p.name}><img src={src} alt="" loading="lazy" /></button>
            ))}
            {featuredProjects.slice(0, 4).map((p) => (
              <button key={p.slug} className={`wp-tile wp-tile--img${prefs.wallpaper === `cover:${p.slug}` ? " is-selected" : ""}`} onClick={() => set("wallpaper", `cover:${p.slug}`)} aria-label={`${p.name} cover`} title={p.name}><ProjectCover project={p} size="sm" ratio="16/9" /></button>
            ))}
          </div>
        </div>
      </div>
      <div className="settingsapp__group">
        <div className="settingsrow">
          <div className="settingsrow__text">
            <div className="settingsrow__label">Show desktop icons</div>
            <div className="settingsrow__sub">Projects, Finder, Terminal, Resume, GitHub shortcuts</div>
          </div>
          <Sw on={!iconsHidden} label="Show desktop icons" onToggle={() => setIconsHidden(!iconsHidden)} />
        </div>
        <div className="settingsrow">
          <div className="settingsrow__text">
            <div className="settingsrow__label">Reset icon positions</div>
            <div className="settingsrow__sub">Snap shortcuts back to the left column</div>
          </div>
          <button className="mac-btn mac-btn--ghost" onClick={() => window.dispatchEvent(new Event("mac-reset-desktop-icons"))}>
            <RotateCcw style={{ width: 14, height: 14 }} /> Reset
          </button>
        </div>
        <div className="settingsrow">
          <div className="settingsrow__text">
            <div className="settingsrow__label">Replay boot screen</div>
            <div className="settingsrow__sub">Shows the login card again this session</div>
          </div>
          <button className="mac-btn mac-btn--ghost" onClick={() => setBooted(false)}>
            <Play style={{ width: 14, height: 14 }} /> Replay
          </button>
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
  prefs,
  toggle,
  resetWorkspace,
  openWindow,
}: {
  prefs: Preferences;
  toggle: (k: "devMode") => void;
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
        <div className="settingsrow">
          <div className="settingsrow__text">
            <div className="settingsrow__label">Developer Mode</div>
            <div className="settingsrow__sub">Inspect the operating system live</div>
          </div>
          <Sw
            on={prefs.devMode}
            label="Developer Mode"
            onToggle={() => toggle("devMode")}
          />
        </div>
      </div>
      <div className="settingsapp__group">
        <div className="settingsrow">
          <div className="settingsrow__text">
            <div className="settingsrow__label">Version</div>
            <div className="settingsrow__sub">Vardhan OS 2.0 · glass edition (2026)</div>
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
        {section === "desktop" && <DesktopPanel />}
        {section === "focus" && <Focus prefs={prefs} toggle={toggle} />}
        {section === "dock" && <Dock prefs={prefs} toggle={toggle} />}
        {section === "network" && <Network prefs={prefs} toggle={toggle} />}
        {section === "sound" && <Sound prefs={prefs} set={set} />}
        {section === "general" && (
          <General
            prefs={prefs}
            toggle={toggle}
            resetWorkspace={resetWorkspace}
            openWindow={openWindow}
          />
        )}
      </div>
    </div>
  );
}
