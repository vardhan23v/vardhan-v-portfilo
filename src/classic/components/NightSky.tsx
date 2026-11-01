import { Component, lazy, Suspense, useCallback, useEffect, useState, type ReactNode } from "react";
/**
 * The Starry Night backdrop: one fixed SVG behind everything. Stars come from a fixed seed, so the
 * sky is identical on every visit (no runtime randomness, nothing to hydrate differently). Density
 * is highest near the top and along the edges; CSS masks it thinner behind the reading column.
 * A handful of stars twinkle through CSS opacity only, and only when motion is allowed.
 */

interface Star { x: number; y: number; r: number; o: number; twinkle?: number; warm?: boolean; halo?: boolean }

function mulberry32(seed: number) {
  return () => {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const W = 1440, H = 900;

const STARS: Star[] = (() => {
  const rnd = mulberry32(20261031);
  const out: Star[] = [];
  let twinkles = 0;
  for (let i = 0; i < 92; i++) {
    // Bias toward the top of the sky and the outer thirds, away from the reading column.
    const y = H * Math.pow(rnd(), 1.5);
    const side = rnd() < 0.78;
    const x = side ? (rnd() < 0.5 ? rnd() * W * 0.3 : W * 0.7 + rnd() * W * 0.3) : rnd() * W;
    const tier = rnd();
    const r = tier > 0.94 ? 1.6 : tier > 0.7 ? 1.05 : 0.65;
    const o = tier > 0.94 ? 0.95 : tier > 0.7 ? 0.7 : 0.45;
    const star: Star = { x: +x.toFixed(1), y: +y.toFixed(1), r, o };
    if (r >= 1.05 && twinkles < 8 && rnd() < 0.35) star.twinkle = twinkles++;
    // Roughly one star in nine burns warm, like the painting's starlight against the blue.
    if (r >= 1.05 && i % 9 === 4) star.warm = true;
    // A few of the brightest burn gold with Van Gogh's concentric halos.
    if (r >= 1.05 && i % 4 === 1) { star.warm = true; star.halo = true; }
    out.push(star);
  }
  return out;
})();

export function NightSky() {
  return (
    <svg className="sky" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="shoot-tail" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#f3ecd8" stopOpacity="0" />
          <stop offset="1" stopColor="#f3ecd8" stopOpacity="0.9" />
        </linearGradient>
      </defs>
      {/* Two depth layers: small, dim stars are far and drift less as the page scrolls. */}
      {(["far", "near"] as const).map((layer) => (
        <g key={layer} className={`sky-layer sky-layer--${layer}`}>
          {STARS.map((s, i) => ((s.r >= 1.05) === (layer === "near") ? (
            <g key={i}>{s.halo && <><circle cx={s.x} cy={s.y} r={s.r * 7} className="halo halo--outer" /><circle cx={s.x} cy={s.y} r={s.r * 4} className="halo" /></>}<circle
              cx={s.x}
              cy={s.y}
              r={s.r}
              className={`star${s.twinkle !== undefined ? " star--twinkle" : ""}${s.warm ? " star--warm" : ""}`}
              style={{ opacity: s.o, ...(s.twinkle !== undefined ? { animationDelay: `${s.twinkle * -1.3}s`, animationDuration: `${7 + (s.twinkle % 4)}s` } : null) } as React.CSSProperties}
            /></g>
          ) : null))}
        </g>
      ))}
      {/* One shooting star in the upper-left margin, now and then. */}
      <g transform="translate(110 70) rotate(24)">
        <g className="shoot">
          <line x1="-90" y1="0" x2="0" y2="0" stroke="url(#shoot-tail)" strokeWidth="1.4" strokeLinecap="round" />
          <circle cx="0" cy="0" r="1.6" className="star" />
        </g>
      </g>
    </svg>
  );
}


/* ---------- The hero's painted canvas, after "The Starry Night" (1889) ----------
   Each moving part is its own SVG layer and moves by CSS transform only, so the browser composites it
   without repainting; the brush texture (a turbulence displacement) is computed once per layer. */
const PW = 1440, PH = 720;

/** An Archimedean spiral as a polyline path, opening outward from (cx, cy). */
function spiral(cx: number, cy: number, r0: number, r1: number, turns: number, phase = 0) {
  const steps = Math.round(turns * 48);
  let d = "";
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const a = phase + t * turns * Math.PI * 2;
    const r = r0 + (r1 - r0) * t;
    d += `${i ? "L" : "M"}${(cx + Math.cos(a) * r).toFixed(1)} ${(cy + Math.sin(a) * r * 0.82).toFixed(1)}`;
  }
  return d;
}

/** The great rolling wave across the sky, as parallel brush strokes. */
const WAVE = [0, 1, 2, 3, 4, 5, 6].map((k) => {
  const o = k * 13;
  return { d: `M 640 ${330 + o} C 760 ${170 + o}, 860 ${400 + o}, 1010 ${300 + o} S 1300 ${150 + o}, 1520 ${270 + o}`, k };
});
const SPIRAL_A = [0, 1, 2, 3].map((k) => spiral(960, 270, 6 + k * 7, 118 + k * 6, 2.4, k * 0.5));
const SPIRAL_B = [0, 1, 2].map((k) => spiral(1230, 470, 4 + k * 6, 74 + k * 5, 2, k * 0.6));
const HERO_STARS: [number, number, number][] = [[620, 110, 0.9], [800, 60, 0.75], [1120, 140, 0.9], [760, 560, 0.6], [1395, 330, 0.75], [1060, 610, 0.6]];

function Brush({ id, seed }: { id: string; seed: number }) {
  return (
    <filter id={id} x="-10%" y="-10%" width="120%" height="120%">
      <feTurbulence type="fractalNoise" baseFrequency="0.018 0.03" numOctaves="2" seed={seed} result="n" />
      <feDisplacementMap in="SourceGraphic" in2="n" scale="9" xChannelSelector="R" yChannelSelector="G" />
    </filter>
  );
}

/** One painted layer, set at its own depth (`--z`, px toward the viewer) inside the hero diorama. */
const layer = (cls: string, z: number, children: React.ReactNode, sky = true) => (
  <div className={`depth${sky ? " depth--sky" : ""}`} style={{ "--z": z } as React.CSSProperties}>
    <svg className={`paint ${cls}`} viewBox={`0 0 ${PW} ${PH}`} preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">{children}</svg>
  </div>
);

/** Errors in the 3D sky (no WebGL, lost context) leave the painted poster as it is. */
class Quiet extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() { return this.state.failed ? null : this.props.children; }
}

const StarSky3D = lazy(() => import("./StarSky3D"));
const hasWebGL = () => { try { const c = document.createElement("canvas"); return Boolean(c.getContext("webgl2") ?? c.getContext("webgl")); } catch { return false; } };

/** Mounts the WebGL sky after first paint, on wide fine-pointer screens with WebGL only. */
function Sky3D() {
  const [on, setOn] = useState(false);
  const [ready, setReady] = useState(false);
  const markReady = useCallback(() => setReady(true), []);
  useEffect(() => {
    if (!window.matchMedia("(min-width: 900px) and (hover: hover) and (pointer: fine)").matches || !hasWebGL()) return;
    const w = window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number; cancelIdleCallback?: (id: number) => void };
    if (w.requestIdleCallback) { const id = w.requestIdleCallback(() => setOn(true), { timeout: 2000 }); return () => w.cancelIdleCallback?.(id); }
    const t = window.setTimeout(() => setOn(true), 800);
    return () => window.clearTimeout(t);
  }, []);
  if (!on) return null;
  return (
    <div className={`depth depth--gl${ready ? " is-ready" : ""}`} style={{ "--z": -140 } as React.CSSProperties}>
      <Quiet><Suspense fallback={null}><StarSky3D onReady={markReady} /></Suspense></Quiet>
    </div>
  );
}

export function HeroPainting() {
  return (
    <div className="painting" aria-hidden="true">
      <div className="painting-stage">
        <Sky3D />
        {layer("paint-wave", -30, <>
          <defs><Brush id="brush-w" seed={3} /></defs>
          <g filter="url(#brush-w)" fill="none" strokeLinecap="round">
            {WAVE.map((w) => <path key={w.k} d={w.d} className={`stroke stroke--${w.k % 3}`} strokeWidth={w.k % 3 === 0 ? 7 : 4} />)}
          </g>
        </>)}
        {layer("paint-spiral-a", -60, <>
          <defs><Brush id="brush-a" seed={8} /></defs>
          <g filter="url(#brush-a)" fill="none" strokeLinecap="round">
            {SPIRAL_A.map((d, k) => <path key={k} d={d} className={`stroke stroke--${k % 3}`} strokeWidth={k === 0 ? 6 : 3.5} />)}
          </g>
        </>)}
        {layer("paint-spiral-b", -45, <>
          <defs><Brush id="brush-b" seed={14} /></defs>
          <g filter="url(#brush-b)" fill="none" strokeLinecap="round">
            {SPIRAL_B.map((d, k) => <path key={k} d={d} className={`stroke stroke--${(k + 1) % 3}`} strokeWidth={k === 0 ? 5 : 3} />)}
          </g>
        </>)}
        {layer("paint-stars", -90, <>
          {HERO_STARS.map(([x, y, s], i) => (
            <g key={i} className="hstar" style={{ "--i": i } as React.CSSProperties}>
              <circle cx={x} cy={y} r={30 * s} className="halo halo--outer" />
              <circle cx={x} cy={y} r={17 * s} className="halo" />
              <circle cx={x} cy={y} r={5 * s} className="hstar-core" />
            </g>
          ))}
        </>)}
      {layer("paint-moon", -120, <>
        <defs>
          <radialGradient id="moon-glow"><stop offset="0" stopColor="#f4c542" stopOpacity="0.55" /><stop offset="0.45" stopColor="#e8a93b" stopOpacity="0.18" /><stop offset="1" stopColor="#e8a93b" stopOpacity="0" /></radialGradient>
          <mask id="moon-cut"><rect width={PW} height={PH} fill="#fff" /><circle cx="1318" cy="96" r="30" fill="#000" /></mask>
        </defs>
        <circle cx="1300" cy="110" r="130" fill="url(#moon-glow)" className="moon-glow" />
        <circle cx="1300" cy="110" r="62" className="moon-ring" />
        <circle cx="1300" cy="110" r="44" className="moon-ring" />
        <circle cx="1300" cy="110" r="32" className="moon" mask="url(#moon-cut)" />
      </>, false)}
      <div className="depth" style={{ "--z": 20 } as React.CSSProperties}><svg className="paint-hills" viewBox="0 0 1440 160" preserveAspectRatio="none" aria-hidden="true" focusable="false">
        <path d="M0 96 C 180 60, 330 112, 520 84 S 860 46, 1040 82 S 1320 64, 1440 78 L1440 160 L0 160 Z" className="hill hill--far" />
        <path d="M0 128 C 220 100, 420 140, 640 118 S 1060 98, 1240 120 S 1400 112, 1440 116 L1440 160 L0 160 Z" className="hill" />
      </svg></div>
      <div className="depth depth--cypress" style={{ "--z": 40 } as React.CSSProperties}><svg className="paint-cypress" viewBox="0 0 120 420" aria-hidden="true" focusable="false">
        <defs><Brush id="brush-c" seed={21} /></defs>
        <path filter="url(#brush-c)" className="cypress" d="M60 6 C 70 60, 92 96, 84 150 C 104 196, 96 240, 108 290 C 118 340, 104 380, 112 420 L 8 420 C 16 380, 2 340, 14 292 C 22 244, 12 200, 34 154 C 26 100, 50 64, 60 6 Z" />
        <path filter="url(#brush-c)" className="cypress-light" d="M60 40 C 66 90, 78 120, 72 170 C 84 220, 80 260, 88 320" />
      </svg></div>
      </div>
    </div>
  );
}
