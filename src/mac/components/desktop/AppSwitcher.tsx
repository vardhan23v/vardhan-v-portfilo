import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useWindowManager } from "../../hooks/useWindowManager";
import { usePresence } from "../../hooks/usePresence";
import { AppGlyph } from "../ui/AppGlyph";

/** ⌥Tab app switcher: hold Option, tap Tab to cycle, release to focus. */
export function AppSwitcher() {
  const { windows, activeId, focusWindow } = useWindowManager();
  const [open, setOpen] = useState(false);
  const [idx, setIdx] = useState(0);
  const { mounted, closing } = usePresence(open, 120);
  const rowRef = useRef<HTMLDivElement>(null);
  const selRef = useRef<HTMLSpanElement>(null);
  const wasOpen = useRef(false);

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

  // The selection pill glides to the active app: one offset read per keypress, a transform write.
  // On the first frame after opening it is placed without a transition, so it never slides in from slot 0.
  useLayoutEffect(() => {
    const sel = selRef.current;
    const btn = rowRef.current?.children[idx + 1] as HTMLElement | undefined;
    if (!open) {
      wasOpen.current = false;
      return;
    }
    if (!sel || !btn) return;
    const first = !wasOpen.current;
    wasOpen.current = true;
    if (first) sel.style.transition = "none";
    sel.style.width = `${btn.offsetWidth}px`;
    sel.style.height = `${btn.offsetHeight}px`;
    sel.style.transform = `translate(${btn.offsetLeft}px, ${btn.offsetTop - 3}px)`;
    if (!first) return;
    const raf = requestAnimationFrame(() => {
      sel.style.transition = "";
    });
    return () => {
      cancelAnimationFrame(raf);
      sel.style.transition = "";
    };
  }, [open, mounted, idx, windows.length]);

  if (!mounted) return null;
  const list = [...windows].sort((a, b) => b.z - a.z);
  return (
    <div className={`mac-switcher${closing ? " is-closing" : ""}`} role="dialog" aria-label="App switcher">
      <div className="mac-switcher__row" ref={rowRef}>
        <span className="mac-switcher__sel" aria-hidden="true" ref={selRef} />
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
      <div className="mac-switcher__label" key={list[idx]?.id}>{list[idx]?.title}</div>
    </div>
  );
}
