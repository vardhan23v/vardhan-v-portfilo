import { useEffect, useRef } from "react";
import {
  AdditiveBlending, BufferAttribute, BufferGeometry, CanvasTexture, Color, PerspectiveCamera, Points,
  PointsMaterial, SRGBColorSpace, Scene, WebGLRenderer,
} from "three";
import { motionReduced } from "../../lib/motion";

/**
 * The hero's WebGL sky: two Van Gogh vortices, the rolling wave band and a deep star field, as soft
 * additive points (three draw calls). The camera leans toward the pointer and drifts forward as the
 * hero scrolls away. Loaded lazily on wide, fine-pointer screens only; the SVG painting is the poster.
 * Plain three.js with named imports keeps the chunk small; it pauses off screen and in hidden tabs.
 */
const CREAM = new Color("#f3ecd8");
const CERULEAN = new Color("#6f9be0");
const ULTRA = new Color("#2a4f9e");
const GOLD = new Color("#f4c542");

function rng(seed: number) {
  return () => {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type Cloud = { positions: Float32Array; colors: Float32Array };

function vortex(n: number, radius: number, seed: number): Cloud {
  const r = rng(seed);
  const positions = new Float32Array(n * 3);
  const colors = new Float32Array(n * 3);
  const c = new Color();
  for (let i = 0; i < n; i++) {
    const arm = i % 3;
    const t = Math.pow(r(), 0.8);
    const a = t * Math.PI * 4.2 + (arm * Math.PI * 2) / 3;
    const d = 0.15 + t * radius + (r() - 0.5) * 0.25;
    positions.set([Math.cos(a) * d, Math.sin(a) * d * 0.82, (r() - 0.5) * 0.6], i * 3);
    c.copy(CREAM).lerp(CERULEAN, t);
    if (r() < 0.06) c.copy(GOLD);
    colors.set([c.r, c.g, c.b], i * 3);
  }
  return { positions, colors };
}

function field(stars: number, wave: number, seed: number): Cloud {
  const r = rng(seed);
  const n = stars + wave;
  const positions = new Float32Array(n * 3);
  const colors = new Float32Array(n * 3);
  const c = new Color();
  for (let i = 0; i < stars; i++) {
    positions.set([(r() - 0.5) * 34, (r() - 0.5) * 18, -5 - r() * 35], i * 3);
    const k = r();
    c.copy(k < 0.12 ? GOLD : k < 0.45 ? CERULEAN : CREAM);
    colors.set([c.r, c.g, c.b], i * 3);
  }
  for (let j = 0; j < wave; j++) {
    const i = stars + j;
    const x = -1.5 + r() * 11;
    const band = (j % 6) * 0.13;
    const y = 0.9 + Math.sin(x * 0.75) * 0.75 - band + (r() - 0.5) * 0.08;
    positions.set([x, y, (r() - 0.5) * 0.8], i * 3);
    c.copy(j % 3 === 0 ? CREAM : j % 3 === 1 ? CERULEAN : ULTRA);
    colors.set([c.r, c.g, c.b], i * 3);
  }
  return { positions, colors };
}

/** A round, soft sprite drawn once on a 64 px canvas. */
function sprite() {
  const cv = document.createElement("canvas");
  cv.width = cv.height = 64;
  const g = cv.getContext("2d")!;
  const grad = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  grad.addColorStop(0, "rgba(255,255,255,1)");
  grad.addColorStop(0.35, "rgba(255,255,255,0.55)");
  grad.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = grad;
  g.fillRect(0, 0, 64, 64);
  const tex = new CanvasTexture(cv);
  tex.colorSpace = SRGBColorSpace;
  return tex;
}

function cloud(c: Cloud, size: number, map: CanvasTexture) {
  const geo = new BufferGeometry();
  geo.setAttribute("position", new BufferAttribute(c.positions, 3));
  geo.setAttribute("color", new BufferAttribute(c.colors, 3));
  const mat = new PointsMaterial({ size, map, vertexColors: true, transparent: true, depthWrite: false, blending: AdditiveBlending, sizeAttenuation: true, opacity: 0.9 });
  return new Points(geo, mat);
}

export default function StarSky3D({ onReady }: { onReady: () => void }) {
  const box = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const still = motionReduced();
    const renderer = new WebGLRenderer({ antialias: false, alpha: true, powerPreference: "low-power" });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.domElement.setAttribute("aria-hidden", "true");
    el.appendChild(renderer.domElement);
    const scene = new Scene();
    const camera = new PerspectiveCamera(55, 1, 0.1, 80);
    camera.position.set(0, 0, 10);
    const map = sprite();
    const fl = cloud(field(1500, 700, 47), 0.07, map);
    const va = cloud(vortex(1400, 2.2, 11), 0.06, map);
    const vb = cloud(vortex(800, 1.4, 29), 0.055, map);
    va.position.set(2.4, 1.1, 0);
    vb.position.set(5.6, -1.6, 0.3);
    scene.add(fl, va, vb);

    const size = () => {
      const w = el.clientWidth, h = el.clientHeight;
      renderer.setSize(w, h, false);
      camera.aspect = w / Math.max(h, 1);
      camera.updateProjectionMatrix();
    };
    size();
    const ro = new ResizeObserver(() => { size(); if (!running) renderer.render(scene, camera); });
    ro.observe(el);

    const pointer = { x: 0, y: 0 };
    const onMove = (e: PointerEvent) => { pointer.x = (e.clientX / innerWidth) * 2 - 1; pointer.y = (e.clientY / innerHeight) * 2 - 1; };
    if (!still) window.addEventListener("pointermove", onMove, { passive: true });

    let raf = 0, last = performance.now(), running = false, visible = true;
    const frame = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      va.rotation.z += dt * 0.06;
      vb.rotation.z -= dt * 0.085;
      fl.rotation.z = Math.sin(now / 20000) * 0.03;
      const fly = Math.min(window.scrollY / 900, 1) * 3;
      camera.position.x += (pointer.x * 0.9 - camera.position.x) * 0.04;
      camera.position.y += (-pointer.y * 0.6 - camera.position.y) * 0.04;
      camera.position.z += (10 - fly - camera.position.z) * 0.06;
      camera.lookAt(1.5, 0.4, 0);
      renderer.render(scene, camera);
      raf = requestAnimationFrame(frame);
    };
    // Run only while the hero is on screen and the tab is visible; reduced motion renders one still frame.
    const sync = () => {
      const want = !still && visible && document.visibilityState === "visible";
      if (want && !running) { running = true; last = performance.now(); raf = requestAnimationFrame(frame); }
      if (!want && running) { running = false; cancelAnimationFrame(raf); }
    };
    camera.lookAt(1.5, 0.4, 0);
    renderer.render(scene, camera);
    onReady();
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; sync(); });
    io.observe(el);
    document.addEventListener("visibilitychange", sync);
    sync();

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      document.removeEventListener("visibilitychange", sync);
      window.removeEventListener("pointermove", onMove);
      for (const p of [fl, va, vb]) { p.geometry.dispose(); (p.material as PointsMaterial).dispose(); }
      map.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [onReady]);
  return <div className="sky3d" ref={box} />;
}
