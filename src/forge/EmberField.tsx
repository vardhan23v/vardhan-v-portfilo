import { useEffect, useRef } from "react";

type Ember = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  hue: number;
  flicker: number;
  life: number;
  maxLife: number;
};

/**
 * Rising ember particles behind the Forge hero — cyan/violet sparks drifting
 * up from the bottom with a little mouse "wind". Canvas is capped, pauses when
 * the tab is hidden, and skips entirely for reduced-motion / coarse pointers.
 */
export function EmberField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const COUNT = window.matchMedia("(pointer: coarse)").matches ? 26 : 46;
    const HUES = [195, 210, 255, 265]; // forge cyans + violets
    let w = 0;
    let h = 0;
    let wind = 0;
    let windTarget = 0;
    let raf = 0;
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

    const spawn = (e: Ember, initial = false) => {
      e.x = Math.random() * w;
      e.y = initial ? Math.random() * h : h + 6;
      e.vx = (Math.random() - 0.5) * 0.18;
      e.vy = -(0.22 + Math.random() * 0.5);
      e.r = 0.7 + Math.random() * 1.7;
      e.hue = HUES[Math.floor(Math.random() * HUES.length)];
      e.flicker = Math.random() * Math.PI * 2;
      e.maxLife = 460 + Math.random() * 340;
      e.life = initial ? Math.random() * e.maxLife : e.maxLife;
    };

    const embers: Ember[] = Array.from({ length: COUNT }, () => {
      const e = {} as Ember;
      spawn(e, true);
      return e;
    });

    const onMove = (ev: MouseEvent) => {
      windTarget = ((ev.clientX / window.innerWidth) - 0.5) * 0.5;
    };

    const step = () => {
      raf = requestAnimationFrame(step);
      wind += (windTarget - wind) * 0.02;
      ctx.clearRect(0, 0, w, h);
      for (const e of embers) {
        e.flicker += 0.05;
        e.x += e.vx + wind + Math.sin(e.flicker * 0.6) * 0.08;
        e.y += e.vy;
        e.life -= 1;
        if (e.life <= 0 || e.y < -8 || e.x < -12 || e.x > w + 12) spawn(e);
        const fade = Math.min(1, e.life / 120, (e.maxLife - e.life) / 60);
        const a = fade * (0.35 + 0.3 * Math.sin(e.flicker));
        if (a <= 0.01) continue;
        ctx.beginPath();
        ctx.arc(e.x, e.y, e.r, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${e.hue}, 90%, 72%, ${a.toFixed(3)})`;
        ctx.shadowBlur = 6;
        ctx.shadowColor = `hsla(${e.hue}, 90%, 65%, ${(a * 0.8).toFixed(3)})`;
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    };

    const onVis = () => {
      cancelAnimationFrame(raf);
      if (!document.hidden) raf = requestAnimationFrame(step);
    };

    raf = requestAnimationFrame(step);
    window.addEventListener("resize", resize, { passive: true });
    window.addEventListener("mousemove", onMove, { passive: true });
    document.addEventListener("visibilitychange", onVis);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  return <canvas ref={canvasRef} className="fg-embers" aria-hidden="true" />;
}
