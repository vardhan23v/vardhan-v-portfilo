import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Sun, Moon, Check, SlidersHorizontal, Bug } from "lucide-react";
import { useWindowManager } from "../../hooks/useWindowManager";
import { usePalette } from "../../hooks/usePalette";
import { useTheme } from "../../hooks/useTheme";
import { useIstTime } from "../../hooks/useIstTime";
import { usePreferences } from "../../hooks/usePreferences";
import { useShell } from "../../hooks/useShell";
import { ControlCenter } from "./ControlCenter";
import { DevPanel } from "./DevPanel";

type MenuId = "apple" | "app" | "file" | "edit" | "view" | "window" | "help";

interface MenuItemDef {
  label: string;
  shortcut?: string;
  checked?: boolean;
  disabled?: boolean;
  action?: () => void;
}
type MenuEntry = MenuItemDef | { kind: "sep" } | { kind: "label"; label: string };

const exec = (command: string) => () => {
  try {
    (document as unknown as { execCommand: (c: string) => boolean }).execCommand(command);
  } catch {
    /* no-op */
  }
};

export function MenuBar() {
  const {
    windows,
    activeId,
    openWindow,
    closeWindow,
    minimizeWindow,
    maximizeWindow,
    focusWindow,
    bringToFront,
  } = useWindowManager();
  const { setOpen } = usePalette();
  const { theme, toggle } = useTheme();
  const { prefs } = usePreferences();
  const ist = useIstTime(false);
  const routerNavigate = useNavigate();
  const { setOverlay, toggleOverlay } = useShell();
  const [menuState, setMenuState] = useState<{ id: MenuId; src: "click" | "hover" } | null>(null);
  const openMenu = menuState?.id ?? null;
  const [ccOpen, setCcOpen] = useState(false);
  const [devOpen, setDevOpen] = useState(false);
  const rootRef = useRef<HTMLElement | null>(null);
  const close = () => setMenuState(null);

  /** Light/dark switch with a circular reveal from the clicked control (View Transitions API). */
  const toggleThemeFrom = (e?: { clientX: number; clientY: number }) => {
    const doc = document as Document & { startViewTransition?: (cb: () => void) => { ready: Promise<void> } };
    const root = rootRef.current?.closest(".mac-root") as HTMLElement | null;
    const motionOff = root?.getAttribute("data-mac-motion") === "off" || window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!doc.startViewTransition || motionOff) return toggle();
    const x = e?.clientX ?? window.innerWidth - 20;
    const y = e?.clientY ?? 14;
    const r = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));
    document.documentElement.classList.add("mac-theme-vt");
    const vt = doc.startViewTransition(() => toggle());
    vt.ready.then(() => {
      document.documentElement.animate(
        { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${r}px at ${x}px ${y}px)`] },
        { duration: 620, easing: "cubic-bezier(0.2, 0.7, 0.2, 1)", pseudoElement: "::view-transition-new(root)" }
      ).finished.finally(() => document.documentElement.classList.remove("mac-theme-vt"));
    }).catch(() => document.documentElement.classList.remove("mac-theme-vt"));
  };

  // Opening one panel closes the others.
  useEffect(() => {
    if (menuState) { setCcOpen(false); setDevOpen(false); }
  }, [menuState]);
  useEffect(() => {
    if (ccOpen) { setMenuState(null); setDevOpen(false); }
  }, [ccOpen]);
  useEffect(() => {
    if (devOpen) { setMenuState(null); setCcOpen(false); }
  }, [devOpen]);

  const active = windows.find((w) => w.id === activeId);
  const activeName = active ? active.title : "Vardhan OS";
  const anyVisible = windows.some((w) => !w.minimized);

  const resetWorkspace = () => {
    for (const w of windows) if (w.id !== "overview") closeWindow(w.id);
    focusWindow("overview");
  };

  const lockScreen = () => {
    if (anyVisible) {
      for (const w of windows) if (!w.minimized) minimizeWindow(w.id);
    } else {
      focusWindow("overview");
    }
  };

  // Close on outside pointerdown / Escape.
  useEffect(() => {
    if (!openMenu && !ccOpen && !devOpen) return;
    const onDown = (e: PointerEvent) => {
      if (rootRef.current && e.target instanceof Node && rootRef.current.contains(e.target)) return;
      setMenuState(null);
      setCcOpen(false);
      setDevOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMenuState(null);
        setCcOpen(false);
        setDevOpen(false);
      }
    };
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [openMenu, ccOpen, devOpen]);

  const menus: { id: MenuId; className?: string; label: string; items: MenuEntry[] }[] = [
    {
      id: "apple",
      className: "mac-menubar__trigger--apple",
      label: "✦",
      items: [
        { label: "About This Mac", action: () => openWindow("about-mac") },
        { label: "System Settings…", shortcut: "⌘,", action: () => openWindow("settings") },
        { kind: "sep" },
        { label: "Browse Other Editions…", action: () => routerNavigate("/editions", { viewTransition: true }) },
        { kind: "sep" },
        { label: anyVisible ? "Lock Screen" : "Wake Up", action: lockScreen },
      ],
    },
    {
      id: "app",
      className: "mac-menubar__trigger--app",
      label: activeName,
      items: [
        { label: "About Vardhan OS", action: () => openWindow("about-mac") },
        ...(activeId
          ? [
              { label: `Hide ${activeName}`, shortcut: "⌘H", action: () => minimizeWindow(activeId) },
              { label: `Quit ${activeName}`, shortcut: "⌘Q", action: () => closeWindow(activeId) },
            ]
          : []),
        { kind: "sep" },
        { label: "Settings…", shortcut: "⌘,", action: () => openWindow("settings") },
      ],
    },
    {
      id: "file",
      label: "File",
      items: [
        { label: "Close Window", shortcut: "⌘W", disabled: !activeId, action: () => activeId && closeWindow(activeId) },
        { label: "Minimize Window", shortcut: "⌘M", disabled: !activeId, action: () => activeId && minimizeWindow(activeId) },
        { kind: "sep" },
        { label: "New Finder Window", action: () => openWindow("finder") },
        { label: "New Projects Window", action: () => openWindow("projects") },
      ],
    },
    {
      id: "edit",
      label: "Edit",
      items: [
        { label: "Undo", shortcut: "⌘Z", action: exec("undo") },
        { label: "Redo", shortcut: "⇧⌘Z", action: exec("redo") },
        { kind: "sep" },
        { label: "Cut", shortcut: "⌘X", action: exec("cut") },
        { label: "Copy", shortcut: "⌘C", action: exec("copy") },
        { label: "Paste", shortcut: "⌘V", action: exec("paste") },
        { kind: "sep" },
        { label: "Select All", shortcut: "⌘A", action: exec("selectAll") },
      ],
    },
    {
      id: "view",
      label: "View",
      items: [
        {
          label: theme === "dark" ? "Use Light Appearance" : "Use Dark Appearance",
          shortcut: "⇧⌘T",
          action: () => toggleThemeFrom(),
        },
        { kind: "sep" },
        { label: "Mission Control", shortcut: "⌃↑", action: () => setOverlay("expose") },
        { label: "Launchpad", action: () => setOverlay("launchpad") },
        { label: "Widgets", action: () => toggleOverlay("widgets") },
        { label: "Show Desktop", shortcut: "⇧⌘D", disabled: !anyVisible, action: () => { for (const w of windows) if (!w.minimized) minimizeWindow(w.id); } },
        { kind: "sep" },
        { label: "Reset Workspace", action: resetWorkspace },
      ],
    },
    {
      id: "window",
      label: "Window",
      items: [
        { label: "Minimize", shortcut: "⌘M", disabled: !activeId, action: () => activeId && minimizeWindow(activeId) },
        { label: "Zoom", disabled: !activeId, action: () => activeId && maximizeWindow(activeId) },
        { kind: "sep" },
        {
          label: "Bring All to Front",
          disabled: !anyVisible,
          action: () => {
            const top = [...windows].filter((w) => !w.minimized).sort((a, b) => b.z - a.z)[0];
            if (top) bringToFront(top.id);
          },
        },
        { kind: "sep" },
        { kind: "label", label: "Windows" },
        ...windows.map((w) => ({
          label: w.title,
          shortcut: w.minimized ? "minimized" : undefined,
          checked: activeId === w.id,
          action: () => focusWindow(w.id),
        })),
      ],
    },
    {
      id: "help",
      label: "Help",
      items: [
        { label: "Spotlight Search", shortcut: "⌘K", action: () => setOpen(true) },
        { label: "Keyboard Shortcuts", shortcut: "?", action: () => window.dispatchEvent(new CustomEvent("open-help-overlay")) },
        { kind: "sep" },
        { label: "Vardhan OS Help", action: () => openWindow("vardhan-ai") },
        { label: "Open Terminal", action: () => openWindow("terminal") },
      ],
    },
  ];

  return (
    <header className="mac-menubar" aria-label="Menu bar" ref={rootRef}>
      <div className="mac-menubar__left">
        <nav className="mac-menubar__menus" aria-label="Application menus">
          {menus.map((menu) => (
            <div className="mac-menubar__menu" key={menu.id}>
              <button
                type="button"
                className={`mac-menubar__trigger${menu.className ? ` ${menu.className}` : ""}${openMenu === menu.id ? " is-open" : ""}`}
                aria-haspopup="menu"
                aria-expanded={openMenu === menu.id}
                onClick={() =>
                  setMenuState((s) => (s && s.id === menu.id && s.src === "click" ? null : { id: menu.id, src: "click" }))
                }
                onMouseEnter={() => {
                  setMenuState((s) => (s && s.id !== menu.id ? { id: menu.id, src: "hover" } : s));
                }}
              >
                {menu.id === "window" && windows.length > 0 ? `${menu.label} (${windows.length})` : menu.label}
              </button>
              {openMenu === menu.id && (
                <div className="mac-menubar__drop" role="menu" aria-label={menu.label}>
                  {menu.items.map((entry, i) => {
                    if ("kind" in entry && entry.kind === "sep") return <div className="mac-menubar__drop-sep" key={i} role="separator" />;
                    if ("kind" in entry && entry.kind === "label") return <div className="mac-menubar__drop-label" key={i}>{entry.label}</div>;
                    return (
                      <button
                        type="button"
                        role="menuitem"
                        key={i}
                        className="mac-menubar__drop-item"
                        disabled={entry.disabled}
                        onClick={() => {
                          close();
                          entry.action?.();
                        }}
                      >
                        <span className="mac-menubar__drop-check">{entry.checked ? <Check /> : null}</span>
                        <span className="mac-menubar__drop-labeltext">{entry.label}</span>
                        {entry.shortcut && <span className="mac-menubar__drop-shortcut">{entry.shortcut}</span>}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </nav>
      </div>
      <div className="mac-menubar__right">
        <button className="mac-menubar__clock" onClick={() => toggleOverlay("widgets")} title="Widgets · India Standard Time" aria-label="Open widgets">{ist}</button>
        {prefs.devMode && (
          <div className="mac-menubar__dev">
            <button
              className={`mac-menubar__btn dev-chip${devOpen ? " is-open" : ""}`}
              onClick={() => setDevOpen((o) => !o)}
              aria-label="Open Developer Mode"
              aria-expanded={devOpen}
              title="Developer Mode"
            >
              <Bug />
            </button>
            {devOpen && <DevPanel />}
          </div>
        )}
        <div className="mac-menubar__cc">
          <button
            className={`mac-menubar__btn${ccOpen ? " is-open" : ""}`}
            onClick={() => setCcOpen((o) => !o)}
            aria-label="Open Control Center"
            aria-expanded={ccOpen}
            title="Control Center"
          >
            <SlidersHorizontal />
          </button>
          {ccOpen && <ControlCenter />}
        </div>
        <button className="mac-menubar__btn" onClick={() => setOpen(true)} aria-label="Open Spotlight search" title="Spotlight (⌘K)">
          <Search />
        </button>
        <button
          className="mac-menubar__btn"
          onClick={(e) => toggleThemeFrom(e)}
          aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
          title="Toggle theme"
        >
          {theme === "dark" ? <Sun /> : <Moon />}
        </button>
      </div>
    </header>
  );
}