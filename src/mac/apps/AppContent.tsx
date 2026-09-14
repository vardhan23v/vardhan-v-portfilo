import type { AppId } from "../hooks/useWindowManager";
import type { PageId } from "../hooks/useNav";
import { WindowPage } from "../components/desktop/WindowPage";
import { FinderApp } from "./FinderApp";
import { TerminalApp } from "./TerminalApp";
import { VardhanAIApp } from "./VardhanAIApp";
import { SettingsApp } from "./SettingsApp";
import { AboutMacApp } from "./AboutMacApp";

const PAGE_IDS: PageId[] = ["overview", "about", "projects", "experience", "skills", "achievements", "contact"];

/** Routes a window to its content. Page windows reuse the existing
 *  page components untouched; OS apps render from the same data. */
export function AppContent({ appId }: { appId: AppId }) {
  if ((PAGE_IDS as string[]).includes(appId)) {
    return <WindowPage page={appId as PageId} />;
  }
  switch (appId) {
    case "finder": return <FinderApp />;
    case "terminal": return <TerminalApp />;
    case "vardhan-ai": return <VardhanAIApp />;
    case "settings": return <SettingsApp />;
    case "about-mac": return <AboutMacApp />;
    default: return null;
  }
}
