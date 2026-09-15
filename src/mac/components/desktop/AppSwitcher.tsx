import { useEffect, useState } from "react";
import { useWindowManager } from "../../hooks/useWindowManager";
import { AppGlyph } from "../ui/AppGlyph";
import { play } from "../../lib/sounds";

/** ⌥Tab app switcher: hold Option, tap Tab to cycle, release to focus. */
export function AppSwitcher() {
  const { windows, activeId, focusWindow } = useWindowManager();
  const [open, setOpen] = useState(false);
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const ordered = () => [...windows].sort((a, b) => b.z - a.z);
    const onDown = (e: KeyboardEvent) => {
      if (e.altKey && e.key === "Tab" && windows.length > 0) {
        e.preventDefault();
        const list = ordered();
        if (!open) {
          setOpen(true);
          setIdx(list.length > 1 ? 1 : 0);
        } else {
          setIdx((i) => (e.shiftKey ? (i - 1 + list.length) % list.length : (i + 1) % list.length));
          play("tick");
        }
      } else if (open && e.key === "Escape") {
        setOpen(false);
      }
    };
    const onUp = (e: KeyboardEvent) => {
      if (open && (e.key === "Alt" || e.key === "Meta" || !e.altKey)) {
        const list = ordered();
        const target = list[idx];
        setOpen(false);
        if (target) focusWindow(target.id);
      }
    };
    const onBlur = () => setOpen(false);
    window.addEventListener("keydown", onDown);
    window.addEventListener("keyup", onUp);
    window.addEventListener("blur", onBlur);
    return () => {
      window.removeEventListener("keydown", onDown);
      window.removeEventListener("keyup", onUp);
      window.removeEventListener("blur", onBlur);
    };
  }, [open, idx, windows, focusWindow]);

  if (!open) return null;
  const list = [...windows].sort((a, b) => b.z - a.z);
  return (
    <div className="mac-switcher" role="dialog" aria-label="App switcher">
      <div className="mac-switcher__row">
        {list.map((w, i) => (
          <button
            key={w.id}
            className={`mac-switcher__app${i === idx ? " is-active" : ""}${w.id === activeId ? " is-current" : ""}`}
            onMouseEnter={() => setIdx(i)}
            onClick={() => { setOpen(false); focusWindow(w.id); }}
          >
            <AppGlyph id={w.id} size={64} />
            {w.minimized && <span className="mac-switcher__min" aria-hidden="true">·</span>}
          </button>
        ))}
      </div>
      <div className="mac-switcher__label">{list[idx]?.title}</div>
    </div>
  );
}
