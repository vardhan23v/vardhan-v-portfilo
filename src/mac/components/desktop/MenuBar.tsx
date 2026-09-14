import { useEffect, useRef, useState } from "react";
import { Search, Sun, Moon, Check } from "lucide-react";
import { useWindowManager } from "../../hooks/useWindowManager";
import { usePalette } from "../../hooks/usePalette";
import { useTheme } from "../../hooks/useTheme";
import { useIstTime } from "../../hooks/useIstTime";

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
  const ist = useIstTime(false);
  const [openMenu, setOpenMenu] = useState<MenuId | null>(null);
  const rootRef = useRef<HTMLElement | null>(null);
  const close = () => setOpenMenu(null);

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
    if (!openMenu) return;
    const onDown = (e: PointerEvent) => {
      if (rootRef.current && e.target instanceof Node && rootRef.current.contains(e.target)) return;
      setOpenMenu(null);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenMenu(null);
    };
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [openMenu]);

  const menus: { id: MenuId; className?: string; label: string; items: MenuEntry[] }[] = [
    {
      id: "apple",
      label: "V",
      items: [
        { label: "About This Mac", action: () => openWindow("about-mac") },
        { label: "System Settings…", shortcut: "⌘,", action: () => openWindow("settings") },
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
          action: toggle,
        },
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
                onClick={() => setOpenMenu((o) => (o === menu.id ? null : menu.id))}
                onMouseEnter={() => {
                  if (openMenu) setOpenMenu(menu.id);
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
        <span className="mac-menubar__clock" title="India Standard Time">{ist}</span>
        <button className="mac-menubar__btn" onClick={() => setOpen(true)} aria-label="Open Spotlight search" title="Spotlight (⌘K)">
          <Search />
        </button>
        <button
          className="mac-menubar__btn"
          onClick={toggle}
          aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
          title="Toggle theme"
        >
          {theme === "dark" ? <Sun /> : <Moon />}
        </button>
      </div>
    </header>
  );
}