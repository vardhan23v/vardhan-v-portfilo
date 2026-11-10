import { useEffect, useRef } from "react";
import { motionReduced } from "../lib/motion";

type Ember = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  /** index into the sprite list */
  hue: number;
  flicker: number;
  life: number;
  maxLife: number;
  /** one-off burst ember: not respawned, fades in fast */
  burst?: boolean;
  /** fading out because the target count dropped; 1 → 0 */
  kill?: number;
};

// forge cyans + violets, or embers when the forge is stoked
const CALM_HUES = [195, 210, 255, 265];
const HOT_HUES = [18, 28, 38, 12];
const ALL_HUES = [...CALM_HUES, ...HOT_HUES];
const SPRITE = 32;

/** One soft radial dot per hue, drawn once; frames then only drawImage (no shadowBlur). */
function makeSprites(): HTMLCanvasElement[] {
  return ALL_HUES.map((h) => {
    const c = document.createElement("canvas");
    c.width = c.height = SPRITE;
    const g = c.getContext("2d");
    if (!g) return c;
    const m = SPRITE / 2;
    const grad = g.createRadialGradient(m, m, 0, m, m, m);
    grad.addColorStop(0, `hsla(${h}, 90%, 82%, 1)`);
    grad.addColorStop(0.26, `hsla(${h}, 90%, 72%, 0.95)`);
    grad.addColorStop(0.38, `hsla(${h}, 90%, 65%, 0.4)`);
    grad.addColorStop(1, `hsla(${h}, 90%, 65%, 0)`);
    g.fillStyle = grad;
    g.fillRect(0, 0, SPRITE, SPRITE);
    return c;
  });
}

/**
 * Rising ember particles behind the Forge hero — cyan/violet sparks drifting
 * up from the bottom with a little mouse "wind". One loop for the component's life: stoking
 * changes the palette, speed and size of new embers, grows or shrinks the count over ~40 frames
 * and throws a burst from the toggle, without resetting the field. Frame-rate independent,
 * pre-rendered sprites, DPR ≤ 2, pauses off screen and on hidden tabs, skipped under reduced
 * motion, 26 embers instead of 46 on coarse pointers.
 */
export function EmberField({ stoked = false }: { stoked?: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stokedRef = useRef(stoked);
  const onStokeRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (stokedRef.current === stoked) return;
    stokedRef.current = stoked;
    onStokeRef.current?.();
  }, [stoked]);

  useEffect(() => {
    if (motionReduced()) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const sprites = makeSprites();
    const BASE = window.matchMedia("(pointer: coarse)").matches ? 26 : 46;
    const params = () => {
      const s = stokedRef.current;
      return {
        count: s ? Math.round(BASE * 1.9) : BASE,
        speed: s ? 1.5 : 1,
        size: s ? 1.25 : 1,
        hueBase: s ? CALM_HUES.length : 0,
      };
    };
    let P = params();
    let rate = 1;
    let w = 0;
    let h = 0;
    let wind = 0;
    let windTarget = 0;
    let raf = 0;
    let last = 0;
    const dpr = Math.min(2, window.devicePixelRatio || 1);

    const resize = () => {
      const r = canvas.getBoundingClientRect();
      w = r.width;
      h = r.height;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    const pickHue = () => P.hueBase + Math.floor(Math.random() * CALM_HUES.length);
    const spawn = (e: Ember, initial = false) => {
      e.x = Math.random() * w;
      e.y = initial ? Math.random() * h : h + 6;
      e.vx = (Math.random() - 0.5) * 0.18;
      e.vy = -(0.22 + Math.random() * 0.5) * P.speed;
      e.r = (0.7 + Math.random() * 1.7) * P.size;
      e.hue = pickHue();
      e.flicker = Math.random() * Math.PI * 2;
      e.maxLife = 460 + Math.random() * 340;
      e.life = initial ? Math.random() * e.maxLife : e.maxLife;
      e.burst = false;
      e.kill = undefined;
    };

    const embers: Ember[] = Array.from({ length: P.count }, () => {
      const e = {} as Ember;
      spawn(e, true);
      return e;
    });
    const living = () => embers.reduce((n, e) => n + (e.burst || e.kill !== undefined ? 0 : 1), 0);

    // Draw only while the hero is on screen and the tab is visible.
    let onScreen = true;

    onStokeRef.current = () => {
      P = params();
      rate = Math.max(1, Math.ceil(Math.abs(P.count - living()) / 40));
      if (!onScreen || document.hidden) return;
      // a burst of 12 from the toggle, in canvas coordinates
      const btn = canvas.parentElement?.querySelector<HTMLElement>(".fg-stoke");
      if (!btn) return;
      const c = canvas.getBoundingClientRect();
      const b = btn.getBoundingClientRect();
      const bx = b.left + b.width / 2 - c.left;
      const by = b.top + b.height / 2 - c.top;
      for (let i = 0; i < 12; i++) {
        const life = 90 + Math.random() * 50;
        embers.push({
          x: bx + (Math.random() - 0.5) * b.width * 0.6,
          y: by,
          vx: (Math.random() - 0.5) * 1.4,
          vy: -(1.6 + Math.random() * 0.8),
          r: (1 + Math.random() * 1.6) * P.size,
          hue: pickHue(),
          flicker: Math.random() * Math.PI * 2,
          life,
          maxLife: life,
          burst: true,
        });
      }
    };

    const onMove = (ev: MouseEvent) => {
      windTarget = (ev.clientX / window.innerWidth - 0.5) * 0.5;
    };

    const step = (t: number) => {
      raf = requestAnimationFrame(step);
      const k = last ? Math.min(3, (t - last) / 16.67) : 1;
      last = t;

      // grow or shrink toward the target count
      const n = living();
      if (n < P.count) {
        for (let i = 0; i < Math.min(rate, P.count - n); i++) {
          const e = {} as Ember;
          spawn(e);
          embers.push(e);
        }
      } else if (n > P.count) {
        let drop = Math.min(rate, n - P.count);
        for (const e of embers) {
          if (!drop) break;
          if (e.burst || e.kill !== undefined) continue;
          e.kill = 1;
          drop -= 1;
        }
      }

      wind += (windTarget - wind) * 0.02 * k;
      ctx.clearRect(0, 0, w, h);
      for (let i = embers.length - 1; i >= 0; i--) {
        const e = embers[i];
        e.flicker += 0.05 * k;
        e.x += (e.vx + wind + Math.sin(e.flicker * 0.6) * 0.08) * k;
        e.y += e.vy * k;
        e.life -= k;
        if (e.kill !== undefined) e.kill -= k / 40;
        const gone = e.life <= 0 || e.y < -8 || e.x < -12 || e.x > w + 12;
        if ((gone && e.burst) || (e.kill !== undefined && e.kill <= 0)) {
          embers.splice(i, 1);
          continue;
        }
        if (gone) spawn(e);
        const fadeIn = (e.maxLife - e.life) / (e.burst ? 6 : 60);
        let a = Math.min(1, e.life / (e.burst ? 50 : 120), fadeIn) * (0.35 + 0.3 * Math.sin(e.flicker));
        if (e.burst) a = Math.min(1, a * 1.6);
        if (e.kill !== undefined) a *= Math.max(0, e.kill);
        if (a <= 0.01) continue;
        const d = e.r * 6;
        ctx.globalAlpha = a;
        ctx.drawImage(sprites[e.hue], e.x - d / 2, e.y - d / 2, d, d);
      }
      ctx.globalAlpha = 1;
    };

    const onVis = () => {
      cancelAnimationFrame(raf);
      raf = 0;
      last = 0;
      if (!document.hidden && onScreen) raf = requestAnimationFrame(step);
    };
    const io = new IntersectionObserver((entries) => {
      onScreen = entries[0]?.isIntersecting ?? true;
      onVis();
    });
    io.observe(canvas);

    raf = requestAnimationFrame(step);
    window.addEventListener("resize", resize, { passive: true });
    window.addEventListener("mousemove", onMove, { passive: true });
    document.addEventListener("visibilitychange", onVis);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      onStokeRef.current = null;
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  return <canvas ref={canvasRef} className="fg-embers" aria-hidden="true" />;
}
