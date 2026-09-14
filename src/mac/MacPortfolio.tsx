import { ThemeProvider, useTheme } from "./hooks/useTheme";
import { NavProvider } from "./hooks/useNav";
import { PaletteProvider } from "./hooks/usePalette";
import { ToastProvider } from "./components/ui/Toast";
import { WindowManagerProvider } from "./hooks/useWindowManager";
import { Desktop } from "./components/desktop/Desktop";
import { CommandPalette } from "./components/command-palette/CommandPalette";
import "./styles.css";

function MacInner() {
  const { theme } = useTheme();
  return (
    <div className="mac-root" data-theme={theme} data-cursor-off>
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
        <MacInner />
      </WindowManagerProvider>
    </ThemeProvider>
  );
}
