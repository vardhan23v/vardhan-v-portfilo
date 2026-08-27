import { useEffect, useRef, useState } from "react";
import "./konami-fx.css";

const KONAMI = [
  "ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown",
  "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight",
  "b", "a",
];

const COLORS = ["#7c6cff", "#38bdf8", "#36e57c", "#f0abfc", "#fbbf24", "#fb7185"];

type Particle = {
  x: number; y: number; vx: number; vy: number;
  rot: number; vr: number; size: number; color: string; life: number;
};

/**
 * Konami-code easter egg: ↑↑↓↓←→←→BA fires a confetti burst and a toast.
 * Also listens for a `vardhan:party` CustomEvent (used by the command palette).
 */
export function KonamiFX() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [toast, setToast] = useState(false);
  const runningRef = useRef(false);

  useEffect(() => {
    let progress = 0;
    let toastTimer = 0;

    const burst = () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        setToast(true);
        window.clearTimeout(toastTimer);
        toastTimer = window.setTimeout(() => setToast(false), 2600);
        return;
      }
      const canvas = canvasRef.current;
      if (!canvas || runningRef.current) return;
      runningRef.current = true;
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        runningRef.current = false;
        return;
      }
      ctx.scale(dpr, dpr);
      canvas.classList.add("is-active");

      const w = window.innerWidth;
      const h = window.innerHeight;
      const parts: Particle[] = [];
      for (let i = 0; i < 160; i++) {
        const fromLeft = i % 2 === 0;
        parts.push({
          x: fromLeft ? -10 : w + 10,
          y: h * (0.35 + Math.random() * 0.3),
          vx: (fromLeft ? 1 : -1) * (4 + Math.random() * 7),
          vy: -(6 + Math.random() * 7),
          rot: Math.random() * Math.PI * 2,
          vr: (Math.random() - 0.5) * 0.3,
          size: 5 + Math.random() * 6,
          color: COLORS[i % COLORS.length],
          life: 1,
        });
      }

      let raf = 0;
      const step = () => {
        ctx.clearRect(0, 0, w, h);
        let alive = 0;
        for (const p of parts) {
          p.vy += 0.22;
          p.vx *= 0.99;
          p.x += p.vx;
          p.y += p.vy;
          p.rot += p.vr;
          p.life -= 0.006;
          if (p.life <= 0 || p.y > h + 20) continue;
          alive++;
          ctx.save();
          ctx.globalAlpha = Math.max(0, Math.min(1, p.life * 1.4));
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rot);
          ctx.fillStyle = p.color;
          ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
          ctx.restore();
        }
        if (alive > 0) {
          raf = requestAnimationFrame(step);
        } else {
          ctx.clearRect(0, 0, w, h);
          canvas.classList.remove("is-active");
          runningRef.current = false;
        }
      };
      raf = requestAnimationFrame(step);

      setToast(true);
      window.clearTimeout(toastTimer);
      toastTimer = window.setTimeout(() => setToast(false), 2600);

      return () => cancelAnimationFrame(raf);
    };

    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable)) return;
      const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      progress = key === KONAMI[progress] ? progress + 1 : key === KONAMI[0] ? 1 : 0;
      if (progress === KONAMI.length) {
        progress = 0;
        burst();
      }
    };

    const onParty = () => burst();

    window.addEventListener("keydown", onKey);
    window.addEventListener("vardhan:party", onParty);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("vardhan:party", onParty);
      window.clearTimeout(toastTimer);
    };
  }, []);

  return (
    <>
      <canvas ref={canvasRef} className="konami-canvas" aria-hidden="true" />
      <div className={`konami-toast${toast ? " is-visible" : ""}`} role="status" aria-live="polite">
        <span className="konami-toast-badge" aria-hidden="true">★</span>
        achievement unlocked — you found the code
      </div>
    </>
  );
}
