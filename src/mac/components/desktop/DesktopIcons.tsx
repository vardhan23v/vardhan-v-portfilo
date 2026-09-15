import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { useWindowManager, type AppId } from "../../hooks/useWindowManager";
import { usePointerDrag } from "../../hooks/usePointerDrag";
import { useShell, SHELL_KEYS } from "../../hooks/useShell";
import { site } from "../../data/site";
import { AppGlyph, type GlyphId } from "../ui/AppGlyph";

interface IconDef {
  id: string;
  label: string;
  glyph: GlyphId;
  kind: "app" | "link";
  app?: AppId;
  href?: string;
  col: number;
  row: number;
}

const ICONS: IconDef[] = [
  { id: "projects", label: "Projects", glyph: "projects", kind: "app", app: "projects", col: 0, row: 0 },
  { id: "finder", label: "Finder", glyph: "finder", kind: "app", app: "finder", col: 0, row: 1 },
  { id: "terminal", label: "Terminal", glyph: "terminal", kind: "app", app: "terminal", col: 0, row: 2 },
  { id: "resume", label: "Resume.pdf", glyph: "resume", kind: "link", href: site.resume, col: 0, row: 3 },
  { id: "github", label: "GitHub", glyph: "github", kind: "link", href: site.github, col: 0, row: 4 },
];

const GRID = 96;
const PAD_X = 18;
const PAD_Y = 40;
type Pos = Record<string, { x: number; y: number }>;

function loadPositions(): Pos {
  try {
    const raw = localStorage.getItem(SHELL_KEYS.ICONS_KEY);
    if (!raw) return {};
    const obj = JSON.parse(raw);
    return obj.positions ?? {};
  } catch {
    return {};
  }
}
function savePositions(p: Pos) {
  try {
    const raw = localStorage.getItem(SHELL_KEYS.ICONS_KEY);
    const obj = raw ? JSON.parse(raw) : {};
    localStorage.setItem(SHELL_KEYS.ICONS_KEY, JSON.stringify({ ...obj, positions: p }));
  } catch {
    /* ignore */
  }
}

function DesktopIcon({
  def,
  pos,
  onMove,
  onOpen,
}: {
  def: IconDef;
  pos: { x: number; y: number };
  onMove: (id: string, x: number, y: number) => void;
  onOpen: (def: IconDef) => void;
}) {
  const start = useRef(pos);
  const { dragging, handlers } = usePointerDrag<HTMLButtonElement>({
    onStart: () => {
      start.current = pos;
    },
    onMove: (dx, dy) => onMove(def.id, start.current.x + dx, start.current.y + dy),
    onEnd: (_dx, _dy, moved) => {
      if (!moved && window.innerWidth <= 640) onOpen(def);
    },
  });
  return (
    <button
      type="button"
      className={`mac-dicon${dragging ? " is-dragging" : ""}`}
      style={{ "--x": `${pos.x}px`, "--y": `${pos.y}px` } as CSSProperties}
      onDoubleClick={() => onOpen(def)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpen(def);
        }
      }}
      aria-label={`${def.label} (double-click to open)`}
      title={def.label}
      {...handlers}
    >
      <AppGlyph id={def.glyph} size={52} />
      <span className="mac-dicon__label">{def.label}</span>
    </button>
  );
}

/** Draggable desktop shortcuts; positions persist in localStorage. */
export function DesktopIcons() {
  const { openWindow, windows } = useWindowManager();
  const { iconsHidden } = useShell();
  const [pos, setPos] = useState<Pos>(loadPositions);
  const areaRef = useRef<HTMLDivElement>(null);

  const defaults = useMemo(() => {
    const p: Pos = {};
    for (const i of ICONS) p[i.id] = { x: PAD_X + i.col * GRID, y: PAD_Y + i.row * GRID };
    return p;
  }, []);

  const clamp = useCallback((x: number, y: number) => {
    const area = areaRef.current?.parentElement;
    const w = area?.clientWidth ?? window.innerWidth;
    const h = area?.clientHeight ?? window.innerHeight;
    const cx = Math.max(4, Math.min(w - GRID + 8, x));
    const cy = Math.max(32, Math.min(h - GRID - 84, y));
    return { x: cx, y: cy };
  }, []);

  const onMove = useCallback(
    (id: string, x: number, y: number) => setPos((p) => ({ ...p, [id]: clamp(x, y) })),
    [clamp]
  );

  // Snap + persist once a drag ends (pointerup fires onMove last, so debounce).
  useEffect(() => {
    const t = window.setTimeout(() => {
      setPos((p) => {
        const snapped: Pos = {};
        let changed = false;
        for (const [k, v] of Object.entries(p)) {
          const s = clamp(Math.round((v.x - PAD_X) / GRID) * GRID + PAD_X, Math.round((v.y - PAD_Y) / GRID) * GRID + PAD_Y);
          snapped[k] = s;
          if (s.x !== v.x || s.y !== v.y) changed = true;
        }
        savePositions(snapped);
        return changed ? snapped : p;
      });
    }, 220);
    return () => window.clearTimeout(t);
  }, [pos, clamp]);

  useEffect(() => {
    const reset = () => {
      setPos({});
      savePositions({});
    };
    window.addEventListener("mac-reset-desktop-icons", reset);
    return () => window.removeEventListener("mac-reset-desktop-icons", reset);
  }, []);

  const onOpen = useCallback(
    (def: IconDef) => {
      if (def.kind === "app" && def.app) openWindow(def.app);
      else if (def.href) window.open(def.href, "_blank", "noopener");
    },
    [openWindow]
  );

  const anyMaximized = windows.some((w) => w.maximized && !w.minimized);
  if (iconsHidden || anyMaximized) return null;

  return (
    <div className="mac-dicons" ref={areaRef} aria-label="Desktop shortcuts">
      {ICONS.map((def, i) => (
        <div key={def.id} className="mac-dicon-slot" style={{ "--i": i } as React.CSSProperties}>
          <DesktopIcon def={def} pos={pos[def.id] ?? defaults[def.id]} onMove={onMove} onOpen={onOpen} />
        </div>
      ))}
    </div>
  );
}
