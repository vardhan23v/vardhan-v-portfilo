import { useEffect, useRef } from "react";
import "./cursor-fx.css";
import { motionReduced } from "./lib/motion";

/**
 * One decorative cursor overlay for the whole site. The native cursor always stays
 * visible; this draws an edition-specific companion on top of it.
 *
 * The edition is resolved from the nearest [data-cursor] (a Landing card previewing an
 * edition) or [data-cursor-accent] (an edition root) ancestor and written to
 * `data-cur`; every look lives in CSS under `.cur-fx[data-cur="…"]`. JS only moves
 * things: one rAF loop, transform/opacity writes, a pool of 12 particle nodes, and the
 * loop stops whenever nothing is moving.
 *
 * macOS has no overlay: it swaps the native cursor for accent-tinted CSS cursor images
 * (src/cursors/mac-cursors.css), as an OS would.
 */

type Cur = "default" | "landing" | "term" | "classic" | "paper" | "aurora" | "forge" | "mac" | "atlas";
const CURS: readonly Cur[] = ["default", "landing", "term", "classic", "paper", "aurora", "forge", "mac", "atlas"];
const asCur = (v: string | null | undefined): Cur => (CURS as readonly string[]).includes(v ?? "") ? (v as Cur) : "default";

/** [dot follow, ring follow] per frame at 60fps (1 = locked to the pointer). */
const LERP: Record<Cur, [number, number]> = {
  default: [1, 0.16],
  landing: [1, 0.2],
  term: [1, 0.32],
  classic: [1, 0.09],
  paper: [1, 0.25],
  aurora: [0.55, 0.075],
  forge: [0.45, 0.2],
  mac: [1, 1],
  atlas: [1, 0.22],
};

/** Ring target offset from the pointer tip (terminal brackets frame the arrow). */
const RING_OFFSET: Partial<Record<Cur, [number, number]>> = { term: [6, 10] };

/** How long the click class stays on, per edition. */
const PULSE_MS: Partial<Record<Cur, number>> = { classic: 900, aurora: 600, atlas: 700 };

/** Atlas: the map the crosshair reads grid references from, and its grid size. */
const ATLAS_MAP = ".at-map-inner";
const ATLAS_COLS = "ABCDEFGHIJKL";
const ATLAS_ROWS = 8;

/** Where an edition's live accent comes from (themes can change it at runtime). */
const LIVE_VARS: Partial<Record<Cur, [string, string]>> = {
  term: ["--green", "--cur-accent"], // follows data-phosphor
  forge: ["--fg-cyan", "--cur-accent"], // cyan, orange when data-stoked
  aurora: ["--au-hue", "--cur-hue"], // the visitor's hue preset
};

const POOL = 12;
const INTERACTIVE = "a[href], button, summary, select, label[for], [role='button'], [role='link'], [role='tab'], .iswitcher-item";

type Particle = {
  el: HTMLElement;
  on: boolean;
  x: number;
  y: number;
  vx: number;
  vy: number;
  age: number;
  life: number;
  s0: number;
  s1: number;
  o0: number;
  fr: number;
  g: number;
};

function spiral(turns: number, r0: number, r1: number, phase: number) {
  let d = "";
  const n = 40;
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const a = phase + t * turns * Math.PI * 2;
    const r = r0 + (r1 - r0) * t;
    d += `${i ? "L" : "M"}${(Math.cos(a) * r).toFixed(2)} ${(Math.sin(a) * r).toFixed(2)}`;
  }
  return d;
}
const SWIRL_A = spiral(1.1, 9, 21, 0);
const SWIRL_B = spiral(0.9, 11, 19, Math.PI);

export function CursorFX() {
  const fxRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const tailRef = useRef<HTMLDivElement>(null);
  const partsRef = useRef<HTMLDivElement>(null);
  const refRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const fx = fxRef.current;
    const dot = dotRef.current;
    const ring = ringRef.current;
    const tail = tailRef.current;
    const partsEl = partsRef.current;
    if (!fx || !dot || !ring || !tail || !partsEl) return;
    if (window.matchMedia("(pointer: coarse)").matches) return;

    const parts: Particle[] = Array.from(partsEl.children as HTMLCollectionOf<HTMLElement>).map((el) => ({
      el, on: false, x: 0, y: 0, vx: 0, vy: 0, age: 0, life: 1, s0: 1, s1: 1, o0: 1, fr: 1, g: 0,
    }));
    let slot = 0;
    let active = 0;

    let cur: Cur = "default";
    let x = -100, y = -100; // pointer
    let px = x, py = y; // pointer last frame
    let dx = x, dy = y; // dot
    let rx = x, ry = y; // ring
    let speed = 0, svx = 0, svy = 0; // smoothed velocity (px per 60fps frame)
    let lastEmitX = x, lastEmitY = y;
    let cellX = 0, cellY = 0; // terminal caret grid cell
    let moving = false;
    let raf = 0;
    let last = 0;
    let off = false;
    let reduced = motionReduced();
    let root: Element | null = null;

    const emit = (p: Omit<Particle, "el" | "on" | "age">) => {
      const q = parts[slot];
      slot = (slot + 1) % POOL;
      if (!q.on) active++;
      Object.assign(q, p, { on: true, age: 0 });
    };
    const clearParts = () => {
      for (const q of parts) {
        q.on = false;
        q.el.style.opacity = "0";
      }
      active = 0;
    };

    const stop = () => {
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
    };
    const start = () => {
      if (!raf && !off && !reduced && !document.hidden) {
        last = performance.now();
        raf = requestAnimationFrame(tick);
      }
    };

    const tick = (now: number) => {
      const dt = Math.min(3, Math.max(0.25, (now - last) / 16.667));
      last = now;
      const [dl, rl] = LERP[cur];
      const kd = 1 - Math.pow(1 - dl, dt);
      const kr = 1 - Math.pow(1 - rl, dt);

      // targets
      let tx = x, ty = y;
      if (cur === "term") {
        // the caret sits beside the arrow and snaps to a character grid
        const cx = Math.round((x + 14) / 9), cy = Math.round((y + 9) / 18);
        if ((cx !== cellX || cy !== cellY) && cellX) {
          emit({ x: cellX * 9, y: cellY * 18, vx: 0, vy: 0, life: 420, s0: 1, s1: 1, o0: 0.45, fr: 1, g: 0 });
        }
        cellX = cx; cellY = cy;
        tx = cx * 9; ty = cy * 18;
      }
      const [ox, oy] = RING_OFFSET[cur] ?? [0, 0];

      dx += (tx - dx) * kd; dy += (ty - dy) * kd;
      rx += (x + ox - rx) * kr; ry += (y + oy - ry) * kr;

      // velocity
      const mvx = (x - px) / dt, mvy = (y - py) / dt;
      px = x; py = y;
      const ks = 1 - Math.pow(0.75, dt);
      svx += (mvx - svx) * ks; svy += (mvy - svy) * ks;
      speed = Math.hypot(svx, svy);

      const nowMoving = speed > 0.4;
      if (nowMoving !== moving) {
        moving = nowMoving;
        fx.classList.toggle("cur-moving", moving);
      }

      // emitters
      if (cur === "paper") {
        if (Math.hypot(dx - lastEmitX, dy - lastEmitY) > 5) {
          emit({ x: dx, y: dy, vx: 0, vy: 0, life: 260, s0: 0.9, s1: 0.25, o0: 0.5, fr: 1, g: 0 });
          lastEmitX = dx; lastEmitY = dy;
        }
      } else if (cur === "forge") {
        if (speed > 6 && Math.random() < 0.45 * dt) {
          emit({
            x: dx + (Math.random() - 0.5) * 6, y: dy + (Math.random() - 0.5) * 6,
            vx: -svx * 0.06 + (Math.random() - 0.5) * 0.8, vy: -0.6 - Math.random() * 0.9,
            life: 650 + Math.random() * 400, s0: 0.6 + Math.random() * 0.6, s1: 0.1, o0: 0.95, fr: 0.97, g: -0.015,
          });
        }
      }

      // particles
      if (active) {
        const ms = dt * 16.667;
        for (const q of parts) {
          if (!q.on) continue;
          q.age += ms;
          if (q.age >= q.life) {
            q.on = false;
            active--;
            q.el.style.opacity = "0";
            continue;
          }
          const p = q.age / q.life;
          const f = Math.pow(q.fr, dt);
          q.vx *= f; q.vy = q.vy * f + q.g * dt;
          q.x += q.vx * dt; q.y += q.vy * dt;
          const s = q.s0 + (q.s1 - q.s0) * p;
          q.el.style.transform = `translate3d(${q.x.toFixed(1)}px, ${q.y.toFixed(1)}px, 0) scale(${s.toFixed(3)})`;
          q.el.style.opacity = (q.o0 * (1 - p) * (1 - p * 0.3)).toFixed(3);
        }
      }

      // write
      dot.style.transform = `translate3d(${dx.toFixed(2)}px, ${dy.toFixed(2)}px, 0)`;
      if (cur === "aurora") {
        // the glow stretches along the direction of travel
        const st = Math.min(speed / 40, 0.6);
        const a = Math.atan2(svy, svx);
        ring.style.transform = `translate3d(${rx.toFixed(2)}px, ${ry.toFixed(2)}px, 0) rotate(${a.toFixed(3)}rad) scale(${(1 + st).toFixed(3)}, ${(1 - st * 0.45).toFixed(3)})`;
      } else {
        ring.style.transform = `translate3d(${rx.toFixed(2)}px, ${ry.toFixed(2)}px, 0)`;
      }
      if (cur === "landing") {
        // comet tail points back along the path, longer the faster it flies
        const len = Math.min(speed / 12, 1.8);
        const a = Math.atan2(-svy, -svx);
        tail.style.transform = `translate3d(${dx.toFixed(2)}px, ${dy.toFixed(2)}px, 0) rotate(${a.toFixed(3)}rad) scaleX(${len.toFixed(3)})`;
        tail.style.opacity = Math.min(1, speed / 3).toFixed(3);
      }

      const settled =
        Math.abs(tx - dx) < 0.1 && Math.abs(ty - dy) < 0.1 &&
        Math.abs(x + ox - rx) < 0.1 && Math.abs(y + oy - ry) < 0.1 &&
        speed < 0.02 && active === 0;
      if (settled) {
        raf = 0;
        if (moving) {
          moving = false;
          fx.classList.remove("cur-moving");
        }
        tail.style.opacity = "0";
        return;
      }
      raf = requestAnimationFrame(tick);
    };

    // live accents: copy the edition root's own variable onto the overlay
    const readLive = () => {
      fx.style.removeProperty("--cur-accent");
      fx.style.removeProperty("--cur-hue");
      const live = LIVE_VARS[cur];
      if (!live || !root || root.getAttribute("data-cursor-accent") !== cur) return;
      const v = getComputedStyle(root).getPropertyValue(live[0]).trim();
      if (v) fx.style.setProperty(live[1], v);
    };
    const rootMo = new MutationObserver(readLive);

    const setRoot = (next: Element | null) => {
      if (next === root) return false;
      root = next;
      rootMo.disconnect();
      if (root) rootMo.observe(root, { attributes: true, attributeFilter: ["data-phosphor", "data-stoked", "data-hue", "style"] });
      return true;
    };

    // Atlas: read the grid reference under the crosshair while it is over the map.
    let gridRef = "";
    const readGrid = () => {
      const label = refRef.current;
      const map = cur === "atlas" ? root?.querySelector(ATLAS_MAP) : null;
      let next = "";
      if (map) {
        const r = map.getBoundingClientRect();
        const u = (x - r.left) / r.width, v = (y - r.top) / r.height;
        if (u >= 0 && u < 1 && v >= 0 && v < 1) next = `${ATLAS_COLS[Math.floor(u * ATLAS_COLS.length)]}${Math.floor(v * ATLAS_ROWS) + 1}`;
      }
      if (label && next !== gridRef) {
        gridRef = next;
        label.textContent = next;
        fx.classList.toggle("cur-on-map", !!next);
      }
    };

    const onMove = (e: MouseEvent) => {
      x = e.clientX;
      y = e.clientY;
      if (cur === "atlas" || gridRef) readGrid();
      start();
    };

    const onOver = (e: MouseEvent) => {
      const t = e.target as Element | null;
      if (!t || !t.closest) return;
      const offEl = t.closest("[data-cursor-off]");
      const card = t.closest("[data-cursor]");
      // fixed chrome that lives outside an edition root (switcher, palette) follows the page's edition
      const accent = t.closest("[data-cursor-accent]") ?? document.querySelector("[data-cursor-accent]");
      const inter = t.closest(INTERACTIVE);
      const next = asCur(card ? card.getAttribute("data-cursor") : accent?.getAttribute("data-cursor-accent"));

      const rootChanged = setRoot(accent);
      if (next !== cur) {
        cur = next;
        fx.setAttribute("data-cur", cur);
        clearParts();
        tail.style.opacity = "0";
        // jump the trailing pieces to the pointer so nothing sweeps in from the old spot
        dx = rx = x; dy = ry = y;
        cellX = 0;
        lastEmitX = x; lastEmitY = y;
        readLive();
      } else if (rootChanged) {
        readLive();
      }

      off = !!offEl || cur === "mac";
      fx.classList.toggle("cur-hidden", off);
      // over a Landing card the overlay previews that edition at rest
      fx.classList.toggle("cur-interactive", !!inter && inter !== card && !off);
      if (off) stop();
      else start();
    };

    let pulseTimer = 0;
    const onDown = () => {
      if (reduced || off) return;
      fx.classList.remove("cur-pulse");
      void fx.offsetWidth;
      fx.classList.add("cur-pulse");
      window.clearTimeout(pulseTimer);
      pulseTimer = window.setTimeout(() => fx.classList.remove("cur-pulse"), PULSE_MS[cur] ?? 450);

      if (cur === "forge") {
        for (let i = 0; i < 8; i++) {
          const a = (i / 8) * Math.PI * 2 + Math.random() * 0.5;
          const v = 3 + Math.random() * 3;
          emit({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 1, life: 420 + Math.random() * 200, s0: 1.1, s1: 0.2, o0: 1, fr: 0.88, g: 0.12 });
        }
      } else if (cur === "paper") {
        for (let i = 0; i < 6; i++) {
          const a = Math.random() * Math.PI * 2;
          const v = 1.2 + Math.random() * 2.2;
          emit({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: 380 + Math.random() * 160, s0: 0.5 + Math.random() * 0.6, s1: 0.35, o0: 0.85, fr: 0.8, g: 0 });
        }
      }
      start();
    };

    // The motion toggle / OS setting write <html data-motion>; start or stop the loop live.
    const onMotion = () => {
      reduced = motionReduced();
      if (reduced) {
        stop();
        clearParts();
      } else start();
    };
    const mo = new MutationObserver(onMotion);
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-motion"] });

    const onVisibility = () => (document.hidden ? stop() : start());

    window.addEventListener("mousemove", onMove, { passive: true });
    document.addEventListener("mouseover", onOver, { passive: true });
    document.addEventListener("mousedown", onDown, { passive: true });
    document.addEventListener("visibilitychange", onVisibility);

    start();
    return () => {
      mo.disconnect();
      rootMo.disconnect();
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseover", onOver);
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("visibilitychange", onVisibility);
      window.clearTimeout(pulseTimer);
      stop();
    };
  }, []);

  return (
    <div ref={fxRef} className="cur-fx" data-cur="default" aria-hidden="true">
      <div ref={partsRef} className="cur-parts">
        {Array.from({ length: POOL }, (_, i) => (
          <i key={i} className="cur-p" />
        ))}
      </div>
      <div ref={tailRef} className="cur-tail" />
      <div ref={ringRef} className="cur-ring">
        <span className="cur-ring-inner" />
        <span className="cur-glow" />
        <svg className="cur-swirl" viewBox="-24 -24 48 48" width="48" height="48">
          <path d={SWIRL_A} className="cur-swirl-a" />
          <path d={SWIRL_B} className="cur-swirl-b" />
        </svg>
        <span className="cur-halo cur-halo-1" />
        <span className="cur-halo cur-halo-2" />
        <span className="cur-halo cur-halo-3" />
        <span className="cur-brk cur-brk-l">[</span>
        <span className="cur-brk cur-brk-r">]</span>
      </div>
      <div ref={dotRef} className="cur-dot">
        <span className="cur-core" />
        <svg className="cur-star" viewBox="-12 -12 24 24" width="24" height="24">
          <defs>
            <radialGradient id="cur-star-glow">
              <stop offset="0" stopColor="#bbaf4a" stopOpacity="0.55" />
              <stop offset="1" stopColor="#bbaf4a" stopOpacity="0" />
            </radialGradient>
          </defs>
          <circle r="12" fill="url(#cur-star-glow)" />
          <path d="M0 -9.5C.9 -3 3 -.9 9.5 0C3 .9 .9 3 0 9.5C-.9 3 -3 .9 -9.5 0C-3 -.9 -.9 -3 0 -9.5Z" fill="#bbaf4a" />
          <circle r="1.7" fill="#f4efc4" />
        </svg>
        <span className="cur-caret" />
        <span ref={refRef} className="cur-ref" />
      </div>
    </div>
  );
}
