import type { ReactNode } from "react";
import { Sidebar } from "./sidebar/Sidebar";
import { Toolbar } from "./toolbar/Toolbar";
import { StatusBar } from "./status-bar/StatusBar";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <>
      <div className="mac-bg" />
      <div className="mac-app">
        <div className="mac-window">
          <Toolbar />
          <div className="mac-body">
            <Sidebar />
            {children}
          </div>
          <StatusBar />
        </div>
      </div>
    </>
  );
}
