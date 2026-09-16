import { Fragment, useCallback, useEffect, useLayoutEffect, useRef, useState, type MouseEvent, type PointerEvent } from "react";
import { useWindowManager, type AppId } from "../../hooks/useWindowManager";
import { usePreferences } from "../../hooks/usePreferences";
import { useShell } from "../../hooks/useShell";
import { useContextMenu } from "../../hooks/useContextMenu";
import { AppGlyph, type GlyphId } from "../ui/AppGlyph";
import { motionReduced } from "../../../lib/motion";

type DockId = AppId | "launchpad";

const DEFAULT_ORDER: DockId[] = ["finder", "launchpad", "overview", "projects", "terminal", "vardhan-ai", "notes", "photos", "contact", "settings"];
const LABELS: Record<string, string> = {
  finder: "Finder",
  launchpad: "Launchpad",
  overview: "Vardhan",
  projects: "Projects",
  terminal: "Terminal",
  "vardhan-ai": "Messages",
  notes: "Notes",
  photos: "Photos",
  contact: "Contact",
  settings: "Settings",
};
/** Finder stays first and Settings last, like the real Dock's fixed ends. */
const FIXED = new Set<DockId>(["finder", "settings"]);
const ORDER_KEY = "mac-dock-order";

function loadOrder(): DockId[] {
  try {
    const raw = localStorage.getItem(ORDER_KEY);
    if (!raw) return DEFAULT_ORDER;
    const saved = (JSON.parse(raw) as DockId[]).filter((id) => DEFAULT_ORDER.includes(id));
    const merged = [...saved, ...DEFAULT_ORDER.filter((id) => !saved.includes(id))];
    return ["finder", ...merged.filter((id) => !FIXED.has(id)), "settings"];
  } catch {
    return DEFAULT_ORDER;
  }
}

/** Magnification: how much the tile under the pointer grows, and how far the swell reaches. */
const MAG = 0.6;
const RANGE = 120;
const coarse = () => typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches;

/** Dock: open/focus apps, Launchpad overlay, running dots, pointer-tracked magnification, drag to reorder. */
export function Dock() {
  const { windows, activeId, openWindow, closeWindow, minimizeWindow } = useWindowManager();
  const { prefs } = usePreferences();
  const { overlay, setOverlay, toggleOverlay } = useShell();
  const ctxMenu = useContextMenu();
  const [bouncing, setBouncing] = useState<string | null>(null);
  const [order, setOrder] = useState<DockId[]>(loadOrder);
  const [dragId, setDragId] = useState<DockId | null>(null);
  const navRef = useRef<HTMLElement>(null);
  const tiles = useRef(new Map<DockId, HTMLButtonElement>());
  const rects = useRef(new Map<DockId, DOMRect>());
  const magRaf = useRef(0);
  const settleTimer = useRef(0);
  const suppressClick = useRef(false);
  const drag = useRef<{ id: DockId; startX: number; baseLeft: number; restLeft: number; lx: number; moved: boolean; raf: number } | null>(null);

  /** Same gate as WindowFrame: the site-wide toggle or the shell's own Reduce-motion switch. */
  const motionOff = useCallback(
    () => motionReduced() || navRef.current?.closest(".mac-root")?.getAttribute("data-mac-motion") === "off",
    []
  );

  /** Untransformed tile rects in viewport space (offsetLeft ignores magnification and in-flight FLIPs). */
  const measureTiles = useCallback(() => {
    const nav = navRef.current;
    const next = new Map<DockId, DOMRect>();
    if (!nav) return next;
    const base = (nav.offsetParent as HTMLElement | null)?.getBoundingClientRect().left ?? 0;
    for (const [id, el] of tiles.current) next.set(id, new DOMRect(base + el.offsetLeft, 0, el.offsetWidth, el.offsetHeight));
    return next;
  }, []);

  const bounce = (id: string) => {
    setBouncing(id);
    window.setTimeout(() => setBouncing((b) => (b === id ? null : b)), 1800);
  };

  useEffect(() => {
    try {
      localStorage.setItem(ORDER_KEY, JSON.stringify(order));
    } catch {
      /* ignore */
    }
  }, [order]);

  // ── Magnification: every tile scales with its distance to the pointer (cosine falloff) ──
  const applyMag = useCallback((px: number | null) => {
    const nav = navRef.current;
    if (!nav) return;
    const off = px === null || coarse() || motionOff();
    const measured: { el: HTMLButtonElement; cx: number }[] = [];
    for (const el of tiles.current.values()) {
      const r = el.getBoundingClientRect();
      measured.push({ el, cx: r.left + r.width / 2 });
    }
    for (const { el, cx } of measured) {
      let s = 1;
      if (!off) {
        const d = Math.abs((px as number) - cx);
        if (d < RANGE) s = 1 + MAG * Math.cos((d / RANGE) * (Math.PI / 2));
      }
      el.style.setProperty("--s", s.toFixed(3));
    }
  }, [motionOff]);

  const onNavPointerMove = (e: PointerEvent) => {
    if (e.pointerType !== "mouse" || drag.current?.moved) return;
    const nav = navRef.current;
    if (!nav) return;
    nav.classList.remove("is-settling");
    window.clearTimeout(settleTimer.current);
    const x = e.clientX;
    if (magRaf.current) return;
    magRaf.current = requestAnimationFrame(() => {
      magRaf.current = 0;
      applyMag(x);
    });
  };

  const settle = useCallback(() => {
    const nav = navRef.current;
    if (magRaf.current) {
      cancelAnimationFrame(magRaf.current);
      magRaf.current = 0;
    }
    nav?.classList.add("is-settling");
    applyMag(null);
    window.clearTimeout(settleTimer.current);
    settleTimer.current = window.setTimeout(() => nav?.classList.remove("is-settling"), 320);
  }, [applyMag]);

  useEffect(() => () => window.clearTimeout(settleTimer.current), []);

  // ── Reorder: FLIP the neighbours whenever the order changes ──
  useLayoutEffect(() => {
    const prev = rects.current;
    const next = measureTiles();
    const d = drag.current;
    if (d) {
      // The dragged tile keeps following the pointer from its new slot.
      const el = tiles.current.get(d.id);
      if (el) {
        el.style.transform = "";
        d.restLeft = el.getBoundingClientRect().left;
        el.style.transform = `translate3d(${d.baseLeft + (d.lx - d.startX) - d.restLeft}px, -8px, 0) scale(1.08)`;
      }
    }
    if (prev.size && !motionOff()) {
      for (const [id, el] of tiles.current) {
        if (d && id === d.id) continue;
        const a = prev.get(id);
        const b = next.get(id);
        if (!a || !b) continue;
        const dx = a.left - b.left;
        if (Math.abs(dx) > 1 && typeof el.animate === "function") {
          el.animate([{ transform: `translateX(${dx}px) scale(var(--s, 1))` }, { transform: "translateX(0) scale(var(--s, 1))" }], {
            duration: 200,
            easing: "cubic-bezier(0.2, 0.7, 0.2, 1)",
          });
        }
      }
    }
    rects.current = next;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [order]);

  const onTilePointerDown = (e: PointerEvent<HTMLButtonElement>, id: DockId) => {
    if (e.button !== 0 || FIXED.has(id) || !order.includes(id) || window.innerWidth <= 640) return;
    const r = e.currentTarget.getBoundingClientRect();
    rects.current = measureTiles(); // fresh geometry: the viewport or the running-app tiles may have changed
    drag.current = { id, startX: e.clientX, baseLeft: r.left, restLeft: r.left, lx: e.clientX, moved: false, raf: 0 };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const onTilePointerMove = (e: PointerEvent<HTMLButtonElement>, id: DockId) => {
    const d = drag.current;
    if (!d || d.id !== id) return;
    d.lx = e.clientX;
    if (!d.moved) {
      if (Math.abs(e.clientX - d.startX) < 8) return;
      d.moved = true;
      suppressClick.current = true;
      setDragId(id);
      applyMag(null);
    }
    if (d.raf) return;
    d.raf = requestAnimationFrame(() => {
      d.raf = 0;
      const el = tiles.current.get(d.id);
      if (!el) return;
      const visualLeft = d.baseLeft + (d.lx - d.startX);
      el.style.transform = `translate3d(${visualLeft - d.restLeft}px, -8px, 0) scale(1.08)`;
      // Where would this tile land? Count the movable tiles whose centre is left of the pointer.
      const movable = order.filter((o) => !FIXED.has(o));
      const others = movable.filter((o) => o !== d.id);
      const live = measureTiles();
      let slot = 0;
      for (const o of others) {
        const r = live.get(o);
        if (r && r.left + r.width / 2 < d.lx) slot++;
      }
      const cur = movable.indexOf(d.id);
      if (slot !== cur) {
        const nextMovable = [...others];
        nextMovable.splice(slot, 0, d.id);
        setOrder(["finder", ...nextMovable, "settings"]);
      }
    });
  };

  const onTilePointerUp = (e: PointerEvent<HTMLButtonElement>, id: DockId) => {
    const d = drag.current;
    if (!d || d.id !== id) return;
    drag.current = null;
    if (d.raf) cancelAnimationFrame(d.raf);
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      /* noop */
    }
    if (d.moved) {
      const el = tiles.current.get(id);
      if (el) {
        const from = el.style.transform;
        el.style.transform = "";
        if (from && !motionOff() && typeof el.animate === "function") {
          el.animate([{ transform: from }, { transform: "translate3d(0, 0, 0) scale(1)" }], { duration: 260, easing: "cubic-bezier(0.2, 0.7, 0.2, 1)" });
        }
      }
      setDragId(null);
      window.setTimeout(() => {
        suppressClick.current = false;
      }, 0);
    }
  };

  const activate = (id: DockId) => {
    if (suppressClick.current) return;
    if (id === "launchpad") {
      toggleOverlay("launchpad");
      return;
    }
    const win = windows.find((w) => w.id === id);
    setOverlay("none");
    if (!win || win.minimized) bounce(id);
    openWindow(id);
  };

  const onTileContextMenu = (e: MouseEvent, id: DockId) => {
    const label = LABELS[id] ?? id;
    if (id === "launchpad") {
      ctxMenu.open(e, [{ label: "Open Launchpad", action: () => setOverlay("launchpad") }], label);
      return;
    }
    const win = windows.find((w) => w.id === id);
    const open = !!win;
    ctxMenu.open(
      e,
      [
        { label: open ? (win.minimized ? "Show" : "Bring to Front") : "Open", action: () => activate(id) },
        { label: "Hide", shortcut: "⌘M", disabled: !open || win.minimized, action: () => minimizeWindow(id) },
        { label: "Quit", shortcut: "⌘Q", disabled: !open, action: () => closeWindow(id) },
        { sep: true },
        { label: "Show in Launchpad", action: () => setOverlay("launchpad") },
        { label: "Reset Dock Order", action: () => setOrder(DEFAULT_ORDER), disabled: order.join() === DEFAULT_ORDER.join() },
      ],
      label
    );
  };

  // Apps that are open but have no fixed tile show up like macOS's running apps, before the separator.
  const running = windows.map((w) => w.id as DockId).filter((id) => !order.includes(id));
  const tileFor = (id: DockId, draggable: boolean) => {
    const isLaunchpad = id === "launchpad";
    const label = LABELS[id] ?? windows.find((w) => w.id === id)?.title ?? id;
    const win = isLaunchpad ? undefined : windows.find((w) => w.id === id);
    const isActive = isLaunchpad ? overlay === "launchpad" : activeId === id && !!win && !win.minimized;
    return (
      <button
        key={id}
        data-app={id}
        ref={(el) => {
          if (el) tiles.current.set(id, el);
          else tiles.current.delete(id);
        }}
        className={`mac-dock__item${isActive ? " is-active" : ""}${win ? " is-open" : ""}${win?.minimized ? " is-minimized" : ""}${bouncing === id ? " is-bouncing" : ""}${dragId === id ? " is-dragging" : ""}${draggable ? "" : " is-running-extra"}`}
        onClick={() => activate(id)}
        onPointerDown={(e) => onTilePointerDown(e, id)}
        onPointerMove={(e) => onTilePointerMove(e, id)}
        onPointerUp={(e) => onTilePointerUp(e, id)}
        onPointerCancel={(e) => onTilePointerUp(e, id)}
        onContextMenu={(e) => onTileContextMenu(e, id)}
        aria-label={`Open ${label}`}
        title={label}
      >
        <AppGlyph id={id as GlyphId} size={46} />
        <span className="mac-dock__tip" aria-hidden="true">
          {label}
        </span>
        <span className="mac-dock__dot" aria-hidden="true" />
      </button>
    );
  };

  return (
    <>
      {prefs.dockAutoHide && <div className="mac-dock-hotzone" aria-hidden="true" />}
      <div className={`mac-dock-wrap${prefs.dockAutoHide ? " is-autohide" : ""}`}>
        <nav
          className={`mac-dock${dragId ? " is-reordering" : ""}`}
          aria-label="Dock"
          ref={navRef}
          onPointerMove={onNavPointerMove}
          onPointerLeave={settle}
        >
          {order.map((id) => (
            <Fragment key={id}>
              {id === "settings" && running.map((r) => tileFor(r, false))}
              {id === "settings" && <span className="mac-dock__sep" aria-hidden="true" />}
              {tileFor(id, !FIXED.has(id))}
            </Fragment>
          ))}
        </nav>
      </div>
    </>
  );
}
