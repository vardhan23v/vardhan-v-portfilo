/**
 * The Starry Night backdrop: one fixed SVG behind everything. Stars come from a fixed seed, so the
 * sky is identical on every visit (no runtime randomness, nothing to hydrate differently). Density
 * is highest near the top and along the edges; CSS masks it thinner behind the reading column.
 * A handful of stars twinkle through CSS opacity only, and only when motion is allowed.
 */

interface Star { x: number; y: number; r: number; o: number; twinkle?: number }

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
    out.push(star);
  }
  return out;
})();

export function NightSky() {
  return (
    <svg className="sky" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="shoot-tail" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#e9eef8" stopOpacity="0" />
          <stop offset="1" stopColor="#e9eef8" stopOpacity="0.9" />
        </linearGradient>
      </defs>
      {/* Two depth layers: small, dim stars are far and drift less as the page scrolls. */}
      {(["far", "near"] as const).map((layer) => (
        <g key={layer} className={`sky-layer sky-layer--${layer}`}>
          {STARS.map((s, i) => ((s.r >= 1.05) === (layer === "near") ? (
            <circle
              key={i}
              cx={s.x}
              cy={s.y}
              r={s.r}
              className={s.twinkle !== undefined ? "star star--twinkle" : "star"}
              style={{ opacity: s.o, ...(s.twinkle !== undefined ? { animationDelay: `${s.twinkle * -1.3}s`, animationDuration: `${7 + (s.twinkle % 4)}s` } : null) } as React.CSSProperties}
            />
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

/** A small, fixed constellation for the hero's right margin (desktop only). Decorative. */
const POINTS: [number, number, number][] = [
  [20, 132, 1.7], [74, 96, 1.3], [128, 112, 2.1], [176, 58, 1.4], [232, 76, 1.8], [262, 22, 1.2], [214, 138, 1.3],
];
const LINKS: [number, number][] = [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [2, 6], [6, 4]];

export function Constellation() {
  return (
    <svg className="constellation" viewBox="0 0 284 160" aria-hidden="true" focusable="false">
      {LINKS.map(([a, b]) => (
        <line key={`${a}-${b}`} x1={POINTS[a][0]} y1={POINTS[a][1]} x2={POINTS[b][0]} y2={POINTS[b][1]} className="constellation-line" pathLength={1} style={{ "--c": LINKS.findIndex((l) => l[0] === a && l[1] === b) } as React.CSSProperties} />
      ))}
      {POINTS.map(([x, y, r], i) => <circle key={i} cx={x} cy={y} r={r} className="constellation-star" style={{ "--c": i } as React.CSSProperties} />)}
    </svg>
  );
}
