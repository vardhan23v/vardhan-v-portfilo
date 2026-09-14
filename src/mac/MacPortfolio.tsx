import type { CSSProperties } from "react";
import { ThemeProvider, useTheme } from "./hooks/useTheme";
import { NavProvider } from "./hooks/useNav";
import { PaletteProvider } from "./hooks/usePalette";
import { ToastProvider } from "./components/ui/Toast";
import { WindowManagerProvider } from "./hooks/useWindowManager";
import { PreferencesProvider, usePreferences } from "./hooks/usePreferences";
import { Desktop } from "./components/desktop/Desktop";
import { CommandPalette } from "./components/command-palette/CommandPalette";
import "./styles.css";

function MacInner() {
  const { theme } = useTheme();
  const { prefs } = usePreferences();
  return (
    <div
      className="mac-root"
      data-theme={theme}
      data-cursor-off
      data-mac-motion={prefs.reduceMotion ? "off" : "on"}
      style={{ "--cc-brightness": String(prefs.brightness) } as CSSProperties}
    >
      <PaletteProvider>
        <NavProvider>
          <ToastProvider>
            <Desktop />
            <CommandPalette />
          </ToastProvider>
        </NavProvider>
      </PaletteProvider>
    </div>
  );
}

export function MacPortfolio() {
  return (
    <ThemeProvider>
      <WindowManagerProvider>
        <PreferencesProvider>
          <MacInner />
        </PreferencesProvider>
      </WindowManagerProvider>
    </ThemeProvider>
  );
}