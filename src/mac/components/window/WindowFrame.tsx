import {
  useRef,
  useState,
  useCallback,
  useEffect,
  useLayoutEffect,
  type ReactNode,
  type PointerEvent,
  type MouseEvent,
  type KeyboardEvent,
  type FocusEvent,
} from "react";
import { useWindowManager, snapBounds, MENU_H, DOCK_H, type AppId } from "../../hooks/useWindowManager";
import { useShell } from "../../hooks/useShell";
import { useContextMenu } from "../../hooks/useContextMenu";
import { AppGlyph } from "../ui/AppGlyph";
import { motionReduced } from "../../../lib/motion";

interface Props {
  id: AppId;
  title: string;
  children: ReactNode;
  /** Mission Control placement: target top-left and scale in desktop coords. */
  expose?: { x: number; y: number; s: number };
}

/** The system curve: quick start, long settle. Same as --ease-cinema. */
const EASE = "cubic-bezier(0.2, 0.7, 0.2, 1)";

type SnapSide = "left" | "right" | "full" | null;
const snapSideFor = (x: number, y: number): SnapSide => {
  const vw = window.innerWidth;
  if (x <= 10) return "left";
  if (x >= vw - 10) return "right";
  if (y <= 30) return "full";
  return null;
};
const hint = (side: SnapSide) => window.dispatchEvent(new CustomEvent("mac-snap-hint", { detail: side }));

/** Same clamp the window manager applies, so a drag never shows a position it would reject. */
function clampPos(x: number, y: number, w: number) {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  return { x: Math.max(-w + 80, Math.min(vw - 80, x)), y: Math.max(MENU_H, Math.min(vh - DOCK_H - 40, y)) };
}

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
const canHover = () => typeof window !== "undefined" && window.matchMedia("(hover: hover)").matches;

/** Where a window slides when the desktop is shown: off the nearest screen edge. */
function parkTransform(x: number, y: number, w: number, h: number) {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const d = [
    { k: "left", v: x + w },
    { k: "right", v: vw - x },
    { k: "top", v: y + h },
    { k: "bottom", v: vh - y },
  ].sort((a, b) => a.v - b.v)[0];
  const pad = 48;
  if (d.k === "left") return `translate3d(${-(x + w + pad)}px, 0, 0)`;
  if (d.k === "right") return `translate3d(${vw - x + pad}px, 0, 0)`;
  if (d.k === "top") return `translate3d(0, ${-(y + h + pad)}px, 0)`;
  return `translate3d(0, ${vh - y + pad}px, 0)`;
}

export function WindowFrame({ id, title, children, expose }: Props) {
  const { windows, activeId, closeWindow, minimizeWindow, maximizeWindow, focusWindow, updateWindowPos, updateWindowSize, snapWindow } =
    useWindowManager();
  const { overlay, setOverlay, settling } = useShell();
  const ctxMenu = useContextMenu();
  const inExpose = overlay === "expose" && !!expose;
  const parked = overlay === "desktop";
  const win = windows.find((w) => w.id === id);
  const isActive = activeId === id;
  const frameRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);
  const [resizing, setResizing] = useState(false);
  const [leaving, setLeaving] = useState<"close" | "minimize" | null>(null);
  const [tileMenu, setTileMenu] = useState(false);
  const leaveTimer = useRef(0);
  const tileTimer = useRef(0);
  const tileMenuRef = useRef<HTMLDivElement>(null);
  const maxBtnRef = useRef<HTMLButtonElement>(null);
  /** Set when the tiling menu was opened from the keyboard, so focus moves into it. */
  const tileMenuKb = useRef(false);

  // Gestures live in refs: the frame is moved directly each animation frame and the
  // window manager only hears the final bounds, so nothing re-renders mid-drag.
  const drag = useRef<{ ox: number; oy: number; x0: number; y0: number; w: number; h: number; lx: number; ly: number; raf: number } | null>(null);
  const resize = useRef<{ sx: number; sy: number; sw: number; sh: number; lx: number; ly: number; raf: number } | null>(null);
  const snapRef = useRef<SnapSide>(null);
  /** Last visual rect, so programmatic bound changes can play as a FLIP zoom. */
  const lastRect = useRef<DOMRect | null>(null);
  const lastFrameEl = useRef<HTMLDivElement | null>(null);
  const flip = useRef<Animation | null>(null);
  /** The open zoom, while it runs: the FLIP effect must not measure through it. */
  const openAnim = useRef<Animation | null>(null);

  const motionOff = () =>
    motionReduced() || frameRef.current?.closest(".mac-root")?.getAttribute("data-mac-motion") === "off";

  // ── Open: zoom out of the app's Dock tile (or gently from the centre) ──
  useLayoutEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;
    lastRect.current = frame.getBoundingClientRect();
    lastFrameEl.current = frame;
    if (motionOff() || typeof frame.animate !== "function") return;
    const r = lastRect.current;
    const tile = dockTile(id);
    const from = tile
      ? { x: tile.left + tile.width / 2 - (r.left + r.width / 2), y: tile.top + tile.height / 2 - (r.top + r.height / 2), s: Math.max(0.05, tile.width / r.width) }
      : { x: 0, y: 0, s: 0.92 };
    frame.style.transformOrigin = "50% 50%";
    const a = frame.animate(
      [
        { transform: `translate(${from.x}px, ${from.y}px) scale(${from.s})`, opacity: tile ? 0.2 : 0 },
        { transform: "none", opacity: 1 },
      ],
      { duration: tile ? 320 : 240, easing: EASE, fill: "backwards" }
    );
    openAnim.current = a;
    a.onfinish = () => {
      openAnim.current = null;
      frame.style.transformOrigin = "";
      // The settled, un-animated rect seeds the first zoom/tile FLIP.
      if (!frame.dataset.gesture) lastRect.current = frame.getBoundingClientRect();
    };
    return () => {
      a.cancel();
      openAnim.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── FLIP: zoom, tiling, snapping and refits animate as a transform, never as layout ──
  useLayoutEffect(() => {
    const frame = frameRef.current;
    if (!frame || !win) return;
    if (frame.dataset.gesture) {
      // A gesture just committed: the manager owns the bounds again.
      frame.style.transform = "";
      delete frame.dataset.gesture;
    }
    if (inExpose || parked || settling) {
      // Overlay in place, or its glide-back still in flight: a rect taken now would
      // carry the thumbnail/parked transform, so wait until the window has settled.
      lastRect.current = null;
      return;
    }
    // The open zoom owns the transform this commit; its onfinish seeds lastRect.
    if (openAnim.current) return;
    const same = lastFrameEl.current === frame;
    lastFrameEl.current = frame;
    let before = lastRect.current;
    if (flip.current) {
      // Interrupted mid-flight: where the window visually is = the previous target
      // with the running transform applied (origin 0 0), so the new zoom reverses smoothly.
      const t = getComputedStyle(frame).transform;
      const m = t && t !== "none" ? new DOMMatrixReadOnly(t) : null;
      flip.current.cancel();
      flip.current = null;
      if (before && m) before = new DOMRect(before.left + m.m41, before.top + m.m42, before.width * m.a, before.height * m.d);
    }
    const after = frame.getBoundingClientRect();
    lastRect.current = after;
    if (!same || !before || leaving || motionOff() || typeof frame.animate !== "function") return;
    const dx = before.left - after.left;
    const dy = before.top - after.top;
    const sw = before.width / after.width;
    const sh = before.height / after.height;
    if (Math.abs(dx) < 0.5 && Math.abs(dy) < 0.5 && Math.abs(sw - 1) < 0.002 && Math.abs(sh - 1) < 0.002) return;
    frame.style.transformOrigin = "0 0";
    const a = frame.animate(
      [{ transform: `translate(${dx}px, ${dy}px) scale(${sw}, ${sh})` }, { transform: "none" }],
      { duration: 340, easing: EASE }
    );
    flip.current = a;
    a.onfinish = () => {
      if (flip.current === a) {
        flip.current = null;
        frame.style.transformOrigin = "";
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [win?.x, win?.y, win?.w, win?.h, inExpose, parked, settling]);

  /** Play the exit animation, then hand off to the window manager. */
  const leave = useCallback(
    (kind: "close" | "minimize") => {
      const done = () => (kind === "close" ? closeWindow(id) : minimizeWindow(id));
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
      leaveTimer.current = window.setTimeout(done, 190);
    },
    [id, closeWindow, minimizeWindow]
  );

  useEffect(
    () => () => {
      window.clearTimeout(leaveTimer.current);
      window.clearTimeout(tileTimer.current);
    },
    []
  );

  // Restore from the Dock: play the genie in reverse.
  const wasMin = useRef(win?.minimized ?? false);
  useLayoutEffect(() => {
    const nowMin = win?.minimized ?? false;
    if (wasMin.current && !nowMin) {
      setLeaving(null);
      const frame = frameRef.current;
      if (frame) {
        // The frame remounted while minimized: seed the FLIP refs against the new node.
        lastFrameEl.current = frame;
        lastRect.current = frame.getBoundingClientRect();
      }
      const tile = dockTile(id);
      if (frame && tile && !motionOff()) {
        frame.classList.add("is-restoring");
        const anim = genie(frame, tile, true);
        const clear = () => {
          frame.classList.remove("is-restoring");
          frame.style.clipPath = "";
          frame.style.transform = "";
          frame.style.transformOrigin = "";
        };
        if (anim) anim.onfinish = () => { anim.cancel(); clear(); };
        else clear();
      }
    }
    wasMin.current = nowMin;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [win?.minimized, id]);

  // ── Drag ──
  const onHeaderPointerDown = useCallback(
    (e: PointerEvent) => {
      if (!win || win.maximized || isMobileViewport() || e.button !== 0) return;
      const target = e.target as HTMLElement;
      if (target.closest("button")) return;
      focusWindow(id);
      const frame = frameRef.current;
      if (!frame) return;
      flip.current?.cancel();
      flip.current = null;
      delete frame.dataset.gesture;
      frame.style.transform = "";
      const rect = frame.getBoundingClientRect();
      drag.current = { ox: e.clientX - rect.left, oy: e.clientY - rect.top, x0: win.x, y0: win.y, w: win.w, h: win.h, lx: e.clientX, ly: e.clientY, raf: 0 };
      setDragging(true);
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    },
    [win, id, focusWindow]
  );

  const onHeaderPointerMove = useCallback((e: PointerEvent) => {
    const d = drag.current;
    if (!d) return;
    d.lx = e.clientX;
    d.ly = e.clientY;
    if (!d.raf) {
      d.raf = requestAnimationFrame(() => {
        d.raf = 0;
        const frame = frameRef.current;
        if (!frame || drag.current !== d) return;
        const p = clampPos(d.lx - d.ox, d.ly - d.oy, d.w);
        frame.style.transform = `translate3d(${p.x - d.x0}px, ${p.y - d.y0}px, 0)`;
      });
    }
    const side = snapSideFor(e.clientX, e.clientY);
    if (side !== snapRef.current) {
      snapRef.current = side;
      hint(side);
    }
  }, []);

  const endDrag = useCallback(
    (e: PointerEvent) => {
      const d = drag.current;
      drag.current = null;
      setDragging(false);
      try {
        (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {
        /* noop */
      }
      if (!d) return;
      if (d.raf) cancelAnimationFrame(d.raf);
      const frame = frameRef.current;
      const p = clampPos(d.lx - d.ox, d.ly - d.oy, d.w);
      const side = snapRef.current;
      snapRef.current = null;
      hint(null);
      const target = side ? snapBounds(side) : { x: p.x, y: p.y, w: d.w, h: d.h };
      const unchanged = !!win && target.x === win.x && target.y === win.y && target.w === win.w && target.h === win.h;
      if (frame) {
        const dx = p.x - d.x0;
        const dy = p.y - d.y0;
        if (unchanged) {
          // Same bounds → the manager will not re-render, so nothing would clear the
          // gesture transform. Glide home from the drop position ourselves.
          frame.style.transform = "";
          delete frame.dataset.gesture;
          lastRect.current = frame.getBoundingClientRect();
          if ((dx || dy) && !motionOff() && typeof frame.animate === "function") {
            frame.style.transformOrigin = "0 0";
            const a = frame.animate([{ transform: `translate3d(${dx}px, ${dy}px, 0)` }, { transform: "none" }], { duration: 340, easing: EASE });
            flip.current = a;
            a.onfinish = () => {
              if (flip.current === a) {
                flip.current = null;
                frame.style.transformOrigin = "";
              }
            };
          }
        } else {
          frame.style.transform = `translate3d(${dx}px, ${dy}px, 0)`;
          lastRect.current = frame.getBoundingClientRect();
          frame.dataset.gesture = "1";
        }
      }
      if (side) snapWindow(id, side);
      else updateWindowPos(id, p.x, p.y);
    },
    [id, win, snapWindow, updateWindowPos]
  );

  // ── Resize ──
  const onResizePointerDown = useCallback(
    (e: PointerEvent) => {
      if (!win || win.maximized || isMobileViewport() || e.button !== 0) return;
      e.stopPropagation();
      focusWindow(id);
      flip.current?.cancel();
      flip.current = null;
      resize.current = { sx: e.clientX, sy: e.clientY, sw: win.w, sh: win.h, lx: e.clientX, ly: e.clientY, raf: 0 };
      setResizing(true);
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    },
    [win, id, focusWindow]
  );

  const sizeAt = (r: NonNullable<typeof resize.current>) => ({
    w: Math.max(360, Math.min(window.innerWidth - 8, r.sw + (r.lx - r.sx))),
    h: Math.max(260, Math.min(window.innerHeight - MENU_H - DOCK_H, r.sh + (r.ly - r.sy))),
  });

  const onResizePointerMove = useCallback((e: PointerEvent) => {
    const r = resize.current;
    if (!r) return;
    r.lx = e.clientX;
    r.ly = e.clientY;
    if (!r.raf) {
      r.raf = requestAnimationFrame(() => {
        r.raf = 0;
        const frame = frameRef.current;
        if (!frame || resize.current !== r) return;
        const s = sizeAt(r);
        frame.style.width = `${s.w}px`;
        frame.style.height = `${s.h}px`;
      });
    }
  }, []);

  const endResize = useCallback(
    (e: PointerEvent) => {
      const r = resize.current;
      resize.current = null;
      setResizing(false);
      try {
        (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {
        /* noop */
      }
      if (!r) return;
      if (r.raf) cancelAnimationFrame(r.raf);
      const s = sizeAt(r);
      const frame = frameRef.current;
      if (frame) {
        frame.style.width = `${s.w}px`;
        frame.style.height = `${s.h}px`;
        lastRect.current = frame.getBoundingClientRect();
      }
      updateWindowSize(id, s.w, s.h);
    },
    [id, updateWindowSize]
  );

  const onHeaderDoubleClick = useCallback(() => {
    if (isMobileViewport()) return;
    maximizeWindow(id);
  }, [id, maximizeWindow]);

  // ── Tiling menu on the green light (hover or ↓ from the keyboard), and the title-bar context menu ──
  const armTile = () => {
    if (isMobileViewport() || !canHover()) return;
    window.clearTimeout(tileTimer.current);
    tileTimer.current = window.setTimeout(() => setTileMenu(true), 420);
  };
  const openTileMenuKb = () => {
    if (isMobileViewport()) return;
    window.clearTimeout(tileTimer.current);
    tileMenuKb.current = true;
    setTileMenu(true);
  };
  useEffect(() => {
    if (!tileMenu || !tileMenuKb.current) return;
    tileMenuKb.current = false;
    tileMenuRef.current?.querySelector<HTMLButtonElement>("button")?.focus();
  }, [tileMenu]);
  const onTileMenuKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const items = Array.from(tileMenuRef.current?.querySelectorAll<HTMLButtonElement>("button") ?? []);
    const i = items.indexOf(document.activeElement as HTMLButtonElement);
    const go = (n: number) => {
      e.preventDefault();
      items[(n + items.length) % items.length]?.focus();
    };
    if (e.key === "Escape") {
      e.preventDefault();
      e.stopPropagation();
      setTileMenu(false);
      maxBtnRef.current?.focus();
    } else if (e.key === "ArrowRight" || e.key === "ArrowDown") go(i + 1);
    else if (e.key === "ArrowLeft" || e.key === "ArrowUp") go(i - 1);
    else if (e.key === "Tab") setTileMenu(false);
  };
  const onTileMenuBlur = (e: FocusEvent<HTMLDivElement>) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setTileMenu(false);
  };
  const disarmTile = () => {
    window.clearTimeout(tileTimer.current);
    tileTimer.current = window.setTimeout(() => setTileMenu(false), 220);
  };
  const holdTile = () => window.clearTimeout(tileTimer.current);
  const tile = (side: "left" | "right" | "full") => {
    setTileMenu(false);
    snapWindow(id, side);
  };

  const onHeaderContextMenu = (e: MouseEvent) => {
    if (!win) return;
    ctxMenu.open(
      e,
      [
        { label: "Minimize", shortcut: "⌘M", action: () => leave("minimize") },
        { label: win.maximized ? "Restore" : "Zoom", action: () => maximizeWindow(id) },
        { sep: true },
        { label: "Tile Left", action: () => snapWindow(id, "left"), disabled: isMobileViewport() },
        { label: "Tile Right", action: () => snapWindow(id, "right"), disabled: isMobileViewport() },
        { label: "Fill Desktop", action: () => snapWindow(id, "full"), disabled: isMobileViewport() },
        { sep: true },
        { label: "Close", shortcut: "⌘W", action: () => leave("close") },
      ],
      title
    );
  };

  if (!win) return null;
  if (win.minimized && !inExpose) return null;

  const exposeStyle = inExpose ? { transform: `translate(${expose.x - win.x}px, ${expose.y - win.y}px) scale(${expose.s})` } : undefined;
  const parkStyle = parked && !inExpose ? { transform: parkTransform(win.x, win.y, win.w, win.h) } : undefined;

  return (
    <div
      ref={frameRef}
      className={`mac-desktop-window${isActive ? " is-active" : ""}${dragging ? " is-dragging" : ""}${resizing ? " is-resizing" : ""}${win.maximized ? " is-maximized" : ""}${leaving ? ` is-leaving is-leaving--${leaving}` : ""}${inExpose ? " is-expose" : ""}${win.minimized ? " is-min" : ""}${parked ? " is-parked" : ""}`}
      style={{ left: win.x, top: win.y, width: win.w, height: win.h, zIndex: win.z, ...exposeStyle, ...parkStyle }}
      inert={parked && !inExpose}
      aria-hidden={parked && !inExpose ? true : undefined}
      onMouseDown={() => {
        if (!inExpose) focusWindow(id);
      }}
      onClick={() => {
        if (inExpose) {
          setOverlay("none");
          focusWindow(id);
        }
      }}
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
        onContextMenu={onHeaderContextMenu}
      >
        <div className="traffic-lights" role="group" aria-label="Window controls">
          <button type="button" className="traffic-light traffic-light--close" onClick={() => leave("close")} aria-label="Close window" title="Close" />
          <button type="button" className="traffic-light traffic-light--minimize" onClick={() => leave("minimize")} aria-label="Minimize window" title="Minimize" />
          <button
            ref={maxBtnRef}
            type="button"
            className="traffic-light traffic-light--maximize"
            onClick={() => {
              window.clearTimeout(tileTimer.current);
              setTileMenu(false);
              maximizeWindow(id);
            }}
            onMouseEnter={armTile}
            onMouseLeave={disarmTile}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown" || (e.altKey && e.key === "Enter")) {
                e.preventDefault();
                openTileMenuKb();
              }
            }}
            aria-label={win.maximized ? "Restore window" : "Maximize window"}
            aria-haspopup="menu"
            aria-expanded={tileMenu}
            title={win.maximized ? "Restore" : "Maximize"}
          />
          {tileMenu && (
            <div
              ref={tileMenuRef}
              className="mac-tile-menu"
              role="menu"
              aria-label="Tile window"
              onMouseEnter={holdTile}
              onMouseLeave={disarmTile}
              onKeyDown={onTileMenuKey}
              onBlur={onTileMenuBlur}
            >
              <button type="button" role="menuitem" onClick={() => tile("full")}>
                <i className="mac-tile-menu__glyph mac-tile-menu__glyph--full" aria-hidden="true" /> Fill
              </button>
              <button type="button" role="menuitem" onClick={() => tile("left")}>
                <i className="mac-tile-menu__glyph mac-tile-menu__glyph--left" aria-hidden="true" /> Left
              </button>
              <button type="button" role="menuitem" onClick={() => tile("right")}>
                <i className="mac-tile-menu__glyph mac-tile-menu__glyph--right" aria-hidden="true" /> Right
              </button>
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setTileMenu(false);
                  maximizeWindow(id);
                }}
              >
                <i className="mac-tile-menu__glyph mac-tile-menu__glyph--zoom" aria-hidden="true" /> {win.maximized ? "Restore" : "Zoom"}
              </button>
            </div>
          )}
        </div>
        <div className="mac-desktop-window__title mac-caps">{title}</div>
        <div className="mac-desktop-window__spacer" aria-hidden="true" />
      </div>
      <div className="mac-desktop-window__body">{children}</div>
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
