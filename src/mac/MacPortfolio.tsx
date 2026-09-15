import type { CSSProperties } from "react";
import { ThemeProvider, useTheme } from "./hooks/useTheme";
import { NavProvider } from "./hooks/useNav";
import { PaletteProvider } from "./hooks/usePalette";
import { ShellProvider, useShell } from "./hooks/useShell";
import { ToastProvider } from "./components/ui/Toast";
import { WindowManagerProvider } from "./hooks/useWindowManager";
import { PreferencesProvider, usePreferences } from "./hooks/usePreferences";
import { Desktop } from "./components/desktop/Desktop";
import { CommandPalette } from "./components/command-palette/CommandPalette";
import { HelpOverlay } from "./components/desktop/HelpOverlay";
import { BootScreen } from "./components/boot/BootScreen";
import "./styles.css";

function MacInner() {
  const { theme } = useTheme();
  const { prefs } = usePreferences();
  const { booted, setBooted } = useShell();
  return (
    <div
      className="mac-root"
      data-theme={theme}
      data-cursor-off
      data-mac-motion={prefs.reduceMotion ? "off" : "on"}
      data-accent={prefs.accent}
      style={{ "--cc-brightness": String(prefs.brightness) } as CSSProperties}
    >
      <PaletteProvider>
        <NavProvider>
          <ToastProvider>
            {booted ? (
              <>
                <Desktop />
                <CommandPalette />
                <HelpOverlay />
              </>
            ) : (
              <BootScreen onDone={() => setBooted(true)} />
            )}
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
          <ShellProvider>
            <MacInner />
          </ShellProvider>
        </PreferencesProvider>
      </WindowManagerProvider>
    </ThemeProvider>
  );
}
