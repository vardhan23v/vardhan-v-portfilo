import { useEffect, useRef } from "react";
import type { Tone } from "../editions";
import { motionReduced, subscribeMotion } from "../lib/motion";

/**
 * Landing-page cursor trail: a bundle of springy lines that chase the pointer and settle onto it.
 * Each line is a chain of spring nodes (the classic canvas-cursor technique), drawn as one smooth
 * quadratic curve with additive blending, tinted to the current edition's hue.
 *
 * Only on fine pointers with hover (no touch), off with reduced motion, and the loop sleeps once
 * the lines have settled and the pointer is still.
 */

const TONE_HUE: Record<Tone, number> = { term: 150, classic: 228, paper: 30, aurora: 300, forge: 20, mac: 225, atlas: 150 };
const TRAILS = 20;
const NODES = 40;
const FRICTION = 0.5;
const DAMPENING = 0.25;
const TENSION = 0.98;
const IDLE_MS = 1500;

interface Node { x: number; y: number; vx: number; vy: number }
interface Line { spring: number; friction: number; nodes: Node[] }

export function CanvasCursor({ tone }: { tone: Tone }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const hueRef = useRef(TONE_HUE[tone]);

  useEffect(() => { hueRef.current = TONE_HUE[tone]; }, [tone]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)");

    let lines: Line[] = [];
    let raf = 0, running = false, lastMove = -Infinity, phase = Math.random() * 6;
    const pos = { x: -1, y: -1 };
    let enabled = fine.matches && !motionReduced();

    const size = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(window.innerWidth * dpr);
      canvas.height = Math.round(window.innerHeight * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const seed = (x: number, y: number) => {
      lines = Array.from({ length: TRAILS }, (_, i) => ({
        spring: 0.45 + (i / TRAILS) * 0.025 + 0.1 * Math.random() - 0.02,
        friction: FRICTION + 0.01 * Math.random() - 0.002,
        nodes: Array.from({ length: NODES }, () => ({ x, y, vx: 0, vy: 0 })),
      }));
    };

    const step = (l: Line) => {
      let e = l.spring;
      const head = l.nodes[0];
      head.vx += (pos.x - head.x) * e;
      head.vy += (pos.y - head.y) * e;
      for (let i = 0; i < l.nodes.length; i++) {
        const n = l.nodes[i];
        if (i > 0) {
          const p = l.nodes[i - 1];
          n.vx += (p.x - n.x) * e + p.vx * DAMPENING;
          n.vy += (p.y - n.y) * e + p.vy * DAMPENING;
        }
        n.vx *= l.friction;
        n.vy *= l.friction;
        n.x += n.vx;
        n.y += n.vy;
        e *= TENSION;
      }
    };

    const stroke = (l: Line) => {
      const ns = l.nodes;
      ctx.beginPath();
      ctx.moveTo(ns[0].x, ns[0].y);
      for (let i = 1; i < ns.length - 2; i++) {
        const a = ns[i], b = ns[i + 1];
        ctx.quadraticCurveTo(a.x, a.y, (a.x + b.x) / 2, (a.y + b.y) / 2);
      }
      const a = ns[ns.length - 2], b = ns[ns.length - 1];
      ctx.quadraticCurveTo(a.x, a.y, b.x, b.y);
      ctx.stroke();
    };

    const frame = () => {
      phase += 0.0015;
      ctx.globalCompositeOperation = "source-over";
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.globalCompositeOperation = "lighter";
      const hue = hueRef.current + Math.sin(phase * 40) * 18;
      ctx.strokeStyle = `hsla(${hue.toFixed(1)} 70% 62% / 0.22)`;
      ctx.lineWidth = 1;
      let energy = 0;
      for (const l of lines) {
        step(l);
        stroke(l);
        const tail = l.nodes[l.nodes.length - 1];
        energy += Math.abs(tail.x - pos.x) + Math.abs(tail.y - pos.y);
      }
      const idle = performance.now() - lastMove > IDLE_MS;
      if (idle && energy < TRAILS * 0.5) {
        ctx.globalCompositeOperation = "source-over";
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        running = false;
        return;
      }
      raf = requestAnimationFrame(frame);
    };

    const start = () => {
      if (running || !enabled || document.hidden) return;
      running = true;
      raf = requestAnimationFrame(frame);
    };

    const onMove = (e: PointerEvent) => {
      if (!enabled || e.pointerType !== "mouse") return;
      if (pos.x < 0) seed(e.clientX, e.clientY);
      pos.x = e.clientX;
      pos.y = e.clientY;
      lastMove = performance.now();
      start();
    };
    const stop = () => {
      cancelAnimationFrame(raf);
      running = false;
      ctx.globalCompositeOperation = "source-over";
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    };
    const onVisible = () => { if (document.hidden) stop(); };
    const recheck = () => {
      enabled = fine.matches && !motionReduced();
      if (!enabled) stop();
    };

    size();
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("resize", size);
    document.addEventListener("visibilitychange", onVisible);
    fine.addEventListener("change", recheck);
    const unsubscribe = subscribeMotion(recheck);

    return () => {
      stop();
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("resize", size);
      document.removeEventListener("visibilitychange", onVisible);
      fine.removeEventListener("change", recheck);
      unsubscribe();
    };
  }, []);

  return <canvas ref={canvasRef} className="land-cursor" aria-hidden="true" />;
}
