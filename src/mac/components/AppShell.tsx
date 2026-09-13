import { useRef, useState, type ReactNode } from "react";
import { Sidebar } from "./sidebar/Sidebar";
import { Toolbar } from "./toolbar/Toolbar";
import { StatusBar } from "./status-bar/StatusBar";
import { TabBar } from "./tabbar/TabBar";

export type WindowState = "normal" | "maximized" | "minimized" | "closed";

export function AppShell({ children }: { children: ReactNode }) {
  const [win, setWin] = useState<WindowState>("normal");
  const winRef = useRef<HTMLDivElement>(null);

  return (
    <>
      <div className="mac-bg" aria-hidden="true">
        <div className="mac-blob mac-blob--a" />
        <div className="mac-blob mac-blob--b" />
      </div>
      <div className="mac-app">
        <div
          ref={winRef}
          className={`mac-window${win === "maximized" ? " mac-window--maximized" : ""}${win === "minimized" ? " mac-window--minimized" : ""}`}
          onPointerMove={(e) => {
            const el = winRef.current;
            if (!el) return;
            const r = el.getBoundingClientRect();
            if (r.width === 0 || r.height === 0) return;
            el.style.setProperty("--mx", `${e.clientX - r.left}px`);
            el.style.setProperty("--my", `${e.clientY - r.top}px`);
            el.classList.add("mac-window--spotting");
          }}
          onPointerLeave={() => winRef.current?.classList.remove("mac-window--spotting")}
        >
          <Toolbar win={win} setWin={setWin} />
          {win === "closed" ? (
            <div className="mac-body">
              <div className="mac-content">
                <div className="mac-page">
                  <div className="mac-closed">
                    <span className="mac-closed__emoji" aria-hidden="true">🖥️</span>
                    <div className="mac-closed__title">Vardhan has been closed</div>
                    <div className="mac-closed__sub">The portfolio application is not running.</div>
                    <button className="mac-btn mac-btn--primary" onClick={() => setWin("normal")}>
                      Reopen Vardhan
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : win === "minimized" ? (
            <div className="mac-body">
              <div className="mac-content">
                <div className="mac-page">
                  <div className="mac-closed">
                    <div className="mac-closed__title">Minimized to the Dock</div>
                    <div className="mac-closed__sub">Click the green light or restore below.</div>
                    <button className="mac-btn mac-btn--primary" onClick={() => setWin("normal")}>
                      Restore window
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="mac-body">
                <Sidebar />
                {children}
              </div>
              <TabBar />
              <StatusBar />
            </>
          )}
        </div>
      </div>
    </>
  );
}
