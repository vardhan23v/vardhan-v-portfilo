import { useRef, useState, useCallback, useEffect, type ReactNode, type PointerEvent } from "react";
import { useWindowManager, type AppId } from "../../hooks/useWindowManager";

interface Props {
  id: AppId;
  title: string;
  children: ReactNode;
}

const isMobileViewport = () => typeof window !== "undefined" && window.innerWidth <= 640;

export function WindowFrame({ id, title, children }: Props) {
  const { windows, activeId, closeWindow, minimizeWindow, maximizeWindow, focusWindow, updateWindowPos, updateWindowSize } = useWindowManager();
  const win = windows.find((w) => w.id === id);
  const isActive = activeId === id;
  const frameRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ dx: number; dy: number } | null>(null);
  const resizeRef = useRef<{ sx: number; sy: number; sw: number; sh: number } | null>(null);
  const [dragging, setDragging] = useState(false);
  const [resizing, setResizing] = useState(false);
  const [leaving, setLeaving] = useState<"close" | "minimize" | null>(null);
  const leaveTimer = useRef(0);

  const motionOff = () =>
    (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) ||
    frameRef.current?.closest(".mac-root")?.getAttribute("data-mac-motion") === "off";

  /** Play the exit animation, then hand off to the window manager. */
  const leave = useCallback((kind: "close" | "minimize") => {
    const done = () => (kind === "close" ? closeWindow(id) : minimizeWindow(id));
    if (motionOff()) return done();
    // aim the minimize animation at this app's Dock tile
    const tile = document.querySelector<HTMLElement>(`.mac-dock__item[data-app="${id}"]`);
    const frame = frameRef.current;
    if (kind === "minimize" && tile && frame) {
      const t = tile.getBoundingClientRect();
      const f = frame.getBoundingClientRect();
      frame.style.setProperty("--tx", `${t.left + t.width / 2 - (f.left + f.width / 2)}px`);
      frame.style.setProperty("--ty", `${t.top + t.height / 2 - (f.top + f.height / 2)}px`);
    }
    setLeaving(kind);
    leaveTimer.current = window.setTimeout(done, kind === "close" ? 220 : 380);
  }, [id, closeWindow, minimizeWindow]);

  useEffect(() => () => window.clearTimeout(leaveTimer.current), []);
  // reset exit state if the window comes back (un-minimize)
  useEffect(() => { if (win && !win.minimized) setLeaving(null); }, [win]);

  const onHeaderPointerDown = useCallback((e: PointerEvent) => {
    if (!win || win.maximized || isMobileViewport()) return;
    const target = e.target as HTMLElement;
    if (target.closest("button")) return;
    focusWindow(id);
    const rect = frameRef.current?.getBoundingClientRect();
    if (!rect) return;
    dragRef.current = { dx: e.clientX - rect.left, dy: e.clientY - rect.top };
    setDragging(true);
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  }, [win, id, focusWindow]);

  const onHeaderPointerMove = useCallback((e: PointerEvent) => {
    if (!dragRef.current || !win || win.maximized) return;
    updateWindowPos(id, e.clientX - dragRef.current.dx, e.clientY - dragRef.current.dy);
  }, [win, id, updateWindowPos]);

  const endDrag = useCallback((e: PointerEvent) => {
    dragRef.current = null;
    setDragging(false);
    try { (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId); } catch { /* noop */ }
  }, []);

  const onResizePointerDown = useCallback((e: PointerEvent) => {
    if (!win || win.maximized || isMobileViewport()) return;
    e.stopPropagation();
    focusWindow(id);
    resizeRef.current = { sx: e.clientX, sy: e.clientY, sw: win.w, sh: win.h };
    setResizing(true);
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  }, [win, id, focusWindow]);

  const onResizePointerMove = useCallback((e: PointerEvent) => {
    if (!resizeRef.current) return;
    updateWindowSize(id, resizeRef.current.sw + (e.clientX - resizeRef.current.sx), resizeRef.current.sh + (e.clientY - resizeRef.current.sy));
  }, [id, updateWindowSize]);

  const endResize = useCallback((e: PointerEvent) => {
    resizeRef.current = null;
    setResizing(false);
    try { (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId); } catch { /* noop */ }
  }, []);

  const onHeaderDoubleClick = useCallback(() => {
    if (isMobileViewport()) return;
    maximizeWindow(id);
  }, [id, maximizeWindow]);

  if (!win || win.minimized) return null;

  return (
    <div
      ref={frameRef}
      className={`mac-desktop-window${isActive ? " is-active" : ""}${dragging ? " is-dragging" : ""}${resizing ? " is-resizing" : ""}${win.maximized ? " is-maximized" : ""}${leaving ? ` is-leaving is-leaving--${leaving}` : ""}`}
      style={{ left: win.x, top: win.y, width: win.w, height: win.h, zIndex: win.z }}
      onMouseDown={() => focusWindow(id)}
      role="dialog"
      aria-label={title}
      data-app={id}
    >
      <div
        className="mac-desktop-window__header"
        onPointerDown={onHeaderPointerDown}
        onPointerMove={onHeaderPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onDoubleClick={onHeaderDoubleClick}
      >
        <div className="traffic-lights" role="group" aria-label="Window controls">
          <button type="button" className="traffic-light traffic-light--close" onClick={() => leave("close")} aria-label="Close window" title="Close" />
          <button type="button" className="traffic-light traffic-light--minimize" onClick={() => leave("minimize")} aria-label="Minimize window" title="Minimize" />
          <button type="button" className="traffic-light traffic-light--maximize" onClick={() => maximizeWindow(id)} aria-label={win.maximized ? "Restore window" : "Maximize window"} title={win.maximized ? "Restore" : "Maximize"} />
        </div>
        <div className="mac-desktop-window__title mac-caps">{title}</div>
        <div className="mac-desktop-window__spacer" aria-hidden="true" />
      </div>
      <div className="mac-desktop-window__body">
        {children}
      </div>
      {!win.maximized && (
        <div
          className="mac-desktop-window__resize"
          onPointerDown={onResizePointerDown}
          onPointerMove={onResizePointerMove}
          onPointerUp={endResize}
          onPointerCancel={endResize}
          aria-hidden="true"
        />
      )}
    </div>
  );
}
