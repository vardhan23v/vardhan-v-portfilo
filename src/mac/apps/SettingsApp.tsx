import { Moon, Sun, Info, RotateCcw } from "lucide-react";
import { useTheme } from "../hooks/useTheme";
import { useWindowManager } from "../hooks/useWindowManager";

/** Phase-1 Settings: appearance + workspace. Persisted via existing theme storage. */
export function SettingsApp() {
  const { theme, toggle } = useTheme();
  const { windows, closeWindow, focusWindow } = useWindowManager();

  const resetWorkspace = () => {
    for (const w of windows) if (w.id !== "overview") closeWindow(w.id);
    focusWindow("overview");
  };

  return (
    <div className="mac-page settingsapp">
      <div className="page-header">
        <div className="page-header__eyebrow">System</div>
        <h2 className="page-header__title">Settings</h2>
      </div>
      <div className="settingsapp__row">
        <div>
          <div className="settingsapp__label">Appearance</div>
          <div className="settingsapp__sub">Follows your saved preference</div>
        </div>
        <div className="settingsapp__seg" role="group" aria-label="Appearance">
          <button className={theme === "light" ? "is-on" : ""} onClick={() => theme !== "light" && toggle()}><Sun /> Light</button>
          <button className={theme === "dark" ? "is-on" : ""} onClick={() => theme !== "dark" && toggle()}><Moon /> Dark</button>
        </div>
      </div>
      <div className="settingsapp__row">
        <div>
          <div className="settingsapp__label">Motion</div>
          <div className="settingsapp__sub">Animations respect your OS reduced-motion setting automatically</div>
        </div>
      </div>
      <div className="settingsapp__row">
        <div>
          <div className="settingsapp__label">Workspace</div>
          <div className="settingsapp__sub">Close all windows except Overview</div>
        </div>
        <button className="mac-btn mac-btn--ghost" onClick={resetWorkspace}><RotateCcw style={{ width: 14, height: 14 }} /> Reset</button>
      </div>
      <div className="settingsapp__row">
        <div>
          <div className="settingsapp__label">About This Mac</div>
          <div className="settingsapp__sub">VardhanOS specs + links</div>
        </div>
        <AboutButton />
      </div>
    </div>
  );
}

function AboutButton() {
  const { openWindow } = useWindowManager();
  return (
    <button className="mac-btn mac-btn--ghost" onClick={() => openWindow("about-mac")}><Info style={{ width: 14, height: 14 }} /> Open</button>
  );
}
