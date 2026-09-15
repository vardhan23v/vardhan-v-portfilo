import { useRef, useState, useCallback, useEffect, type ReactNode, type PointerEvent } from "react";
import { useWindowManager, type AppId } from "../../hooks/useWindowManager";
import { useShell } from "../../hooks/useShell";
import { AppGlyph } from "../ui/AppGlyph";
import { play } from "../../lib/sounds";

interface Props {
  id: AppId;
  title: string;
  children: ReactNode;
  /** Mission Control placement: target top-left and scale in desktop coords. */
  expose?: { x: number; y: number; s: number };
}

type SnapSide = "left" | "right" | "full" | null;
const snapSideFor = (x: number, y: number): SnapSide => {
  const vw = window.innerWidth;
  if (x <= 10) return "left";
  if (x >= vw - 10) return "right";
  if (y <= 30) return "full";
  return null;
};
const hint = (side: SnapSide) => window.dispatchEvent(new CustomEvent("mac-snap-hint", { detail: side }));

/**
 * Genie effect: the window stretches into a neck aimed at its Dock tile,
 * then pours into it. `reverse` plays the restore. Uses WAAPI so the
 * clip-path polygon can be computed in the window's own pixel space.
 */
function genie(frame: HTMLElement, tile: DOMRect, reverse = false): Animation | null {
  if (typeof frame.animate !== "function") return null;
  const f = frame.getBoundingClientRect();
  const W = f.width;
  const H = f.height;
  const gx = Math.max(0, Math.min(W, tile.left + tile.width / 2 - f.left)); // neck x (window space)
  const gy = tile.top + tile.height / 2 - f.top; // tile centre below the window top
  const stretch = Math.max(1, gy / H);
  const neck = Math.min(28, W * 0.12);
  const rect = `polygon(0 0, ${W}px 0, ${W}px ${H}px, 0 ${H}px)`;
  const funnel = `polygon(0 0, ${W}px 0, ${gx + neck / 2}px ${H}px, ${gx - neck / 2}px ${H}px)`;
  const thread = `polygon(${gx - 3}px 0, ${gx + 3}px 0, ${gx + 3}px ${H}px, ${gx - 3}px ${H}px)`;
  const frames: Keyframe[] = [
    { clipPath: rect, transform: "scaleY(1)", opacity: 1, offset: 0, easing: "cubic-bezier(0.6, 0, 0.4, 1)" },
    { clipPath: funnel, transform: `scaleY(${stretch})`, opacity: 1, offset: 0.45, easing: "cubic-bezier(0.7, 0, 0.6, 1)" },
    { clipPath: thread, transform: `translateY(${gy - 8}px) scaleY(0.02)`, opacity: 0.9, offset: 0.92 },
    { clipPath: thread, transform: `translateY(${gy}px) scaleY(0.01)`, opacity: 0, offset: 1 },
  ];
  frame.style.transformOrigin = "0 0";
  return frame.animate(frames, { duration: reverse ? 480 : 560, fill: "forwards", direction: reverse ? "reverse" : "normal" });
}

const dockTile = (id: string) =>
  document.querySelector<HTMLElement>(`.mac-dock__item[data-app="${id}"]`)?.getBoundingClientRect() ?? null;

const isMobileViewport = () => typeof window !== "undefined" && window.innerWidth <= 640;

export function WindowFrame({ id, title, children, expose }: Props) {
  const { windows, activeId, closeWindow, minimizeWindow, maximizeWindow, focusWindow, updateWindowPos, updateWindowSize, snapWindow } = useWindowManager();
  const { overlay, setOverlay } = useShell();
  const inExpose = overlay === "expose" && !!expose;
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
    play("whoosh");
    if (motionOff()) return done();
    const frame = frameRef.current;
    const tile = dockTile(id);
    if (kind === "minimize" && frame && tile) {
      setLeaving(kind);
      document.querySelector(`.mac-dock__item[data-app="${id}"]`)?.classList.add("is-catching");
      const anim = genie(frame, tile);
      const finish = () => {
        document.querySelector(`.mac-dock__item[data-app="${id}"]`)?.classList.remove("is-catching");
        done();
      };
      if (anim) anim.onfinish = finish;
      else leaveTimer.current = window.setTimeout(finish, 560);
      return;
    }
    setLeaving(kind);
    leaveTimer.current = window.setTimeout(done, 220);
  }, [id, closeWindow, minimizeWindow]);

  useEffect(() => () => window.clearTimeout(leaveTimer.current), []);
  // Restore from the Dock: play the genie in reverse.
  const wasMin = useRef(win?.minimized ?? false);
  useEffect(() => {
    const nowMin = win?.minimized ?? false;
    if (wasMin.current && !nowMin) {
      setLeaving(null);
      const frame = frameRef.current;
      const tile = dockTile(id);
      if (frame && tile && !motionOff()) {
        frame.classList.add("is-restoring");
        const anim = genie(frame, tile, true);
        const clear = () => { frame.classList.remove("is-restoring"); frame.style.clipPath = ""; frame.style.transform = ""; };
        if (anim) anim.onfinish = () => { anim.cancel(); clear(); };
        else clear();
      }
    }
    wasMin.current = nowMin;
  }, [win?.minimized, id]);

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

  const snapRef = useRef<SnapSide>(null);
  const onHeaderPointerMove = useCallback((e: PointerEvent) => {
    if (!dragRef.current || !win || win.maximized) return;
    updateWindowPos(id, e.clientX - dragRef.current.dx, e.clientY - dragRef.current.dy);
    const side = snapSideFor(e.clientX, e.clientY);
    if (side !== snapRef.current) { snapRef.current = side; hint(side); }
  }, [win, id, updateWindowPos]);

  const endDrag = useCallback((e: PointerEvent) => {
    const wasDragging = !!dragRef.current;
    dragRef.current = null;
    setDragging(false);
    try { (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId); } catch { /* noop */ }
    if (wasDragging && snapRef.current) snapWindow(id, snapRef.current);
    snapRef.current = null;
    hint(null);
  }, [id, snapWindow]);

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

  if (!win) return null;
  if (win.minimized && !inExpose) return null;

  const exposeStyle = inExpose
    ? { transform: `translate(${expose.x - win.x}px, ${expose.y - win.y}px) scale(${expose.s})` }
    : undefined;

  return (
    <div
      ref={frameRef}
      className={`mac-desktop-window${isActive ? " is-active" : ""}${dragging ? " is-dragging" : ""}${resizing ? " is-resizing" : ""}${win.maximized ? " is-maximized" : ""}${leaving ? ` is-leaving is-leaving--${leaving}` : ""}${inExpose ? " is-expose" : ""}${win.minimized ? " is-min" : ""}`}
      style={{ left: win.x, top: win.y, width: win.w, height: win.h, zIndex: win.z, ...exposeStyle }}
      onMouseDown={() => { if (!inExpose) focusWindow(id); }}
      onClick={() => { if (inExpose) { setOverlay("none"); focusWindow(id); } }}
      role="dialog"
      aria-label={title}
      data-app={id}
    >
      {inExpose && (
        <div className="mac-desktop-window__expose-label" style={{ transform: `scale(${1 / expose.s})` }}>
          <AppGlyph id={id} size={22} /> <span>{title}</span>
        </div>
      )}
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
