/**
 * The Atlas title-sheet terrain: a seeded height field with one peak per featured project,
 * traced into contour lines with marching squares. Pure and deterministic, computed once.
 */

export const GRID_COLS = "ABCDEFGHIJKL";
export const GRID_ROWS = 8;
/** Height-field resolution; the SVG viewBox uses the same units. */
export const W = 120;
export const H = 72;

/** Where each summit stands, as fractions of the map (x, y). One per featured project, in order. */
const SPOTS: [number, number][] = [
  [0.22, 0.34], [0.47, 0.22], [0.74, 0.3], [0.88, 0.62], [0.6, 0.55], [0.34, 0.66],
  [0.1, 0.72], [0.15, 0.14], [0.8, 0.12], [0.53, 0.84], [0.7, 0.82], [0.92, 0.38],
];

export interface Summit { x: number; y: number; ref: string }

export const gridRef = (fx: number, fy: number) =>
  `${GRID_COLS[Math.min(GRID_COLS.length - 1, Math.floor(fx * GRID_COLS.length))]}${Math.min(GRID_ROWS, Math.floor(fy * GRID_ROWS) + 1)}`;

export const summitsFor = (n: number): Summit[] =>
  SPOTS.slice(0, n).map(([fx, fy]) => ({ x: fx * W, y: fy * H, ref: gridRef(fx, fy) }));

/* Small seeded value noise: deterministic, so the map never changes between visits. */
function rng(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function valueNoise(seed: number, cells: number) {
  const r = rng(seed);
  const g = Array.from({ length: (cells + 1) * (cells + 1) }, r);
  const at = (i: number, j: number) => g[j * (cells + 1) + i];
  const s = (t: number) => t * t * (3 - 2 * t);
  return (x: number, y: number) => {
    const fx = x * cells, fy = y * cells;
    const i = Math.min(cells - 1, Math.floor(fx)), j = Math.min(cells - 1, Math.floor(fy));
    const u = s(fx - i), v = s(fy - j);
    const a = at(i, j) + (at(i + 1, j) - at(i, j)) * u;
    const b = at(i, j + 1) + (at(i + 1, j + 1) - at(i, j + 1)) * u;
    return a + (b - a) * v;
  };
}

/** Heights in 0..1 on a (W+1)×(H+1) lattice. */
export function heightField(peaks: number): Float32Array {
  const n1 = valueNoise(7, 4), n2 = valueNoise(19, 9), n3 = valueNoise(43, 18);
  const sum = summitsFor(peaks);
  const f = new Float32Array((W + 1) * (H + 1));
  let max = 0;
  for (let y = 0; y <= H; y++) {
    for (let x = 0; x <= W; x++) {
      const nx = x / W, ny = y / H;
      let h = 0.5 * n1(nx, ny) + 0.3 * n2(nx, ny) + 0.12 * n3(nx, ny);
      for (const s of sum) {
        const d2 = ((x - s.x) / 9) ** 2 + ((y - s.y) / 8) ** 2;
        h += 0.62 * Math.exp(-d2);
      }
      f[y * (W + 1) + x] = h;
      if (h > max) max = h;
    }
  }
  for (let i = 0; i < f.length; i++) f[i] /= max;
  return f;
}

/** One contour level as an SVG path `d`, segments chained into polylines. */
function contour(f: Float32Array, level: number): string {
  const at = (x: number, y: number) => f[y * (W + 1) + x];
  const segs: [number, number, number, number][] = [];
  const lerp = (a: number, b: number) => (level - a) / (b - a);
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const a = at(x, y), b = at(x + 1, y), c = at(x + 1, y + 1), d = at(x, y + 1);
      const idx = (a > level ? 8 : 0) | (b > level ? 4 : 0) | (c > level ? 2 : 0) | (d > level ? 1 : 0);
      if (idx === 0 || idx === 15) continue;
      const T: [number, number] = [x + lerp(a, b), y];
      const R: [number, number] = [x + 1, y + lerp(b, c)];
      const B: [number, number] = [x + lerp(d, c), y + 1];
      const L: [number, number] = [x, y + lerp(a, d)];
      const add = (p: [number, number], q: [number, number]) => segs.push([p[0], p[1], q[0], q[1]]);
      switch (idx) {
        case 1: case 14: add(L, B); break;
        case 2: case 13: add(B, R); break;
        case 3: case 12: add(L, R); break;
        case 4: case 11: add(T, R); break;
        case 6: case 9: add(T, B); break;
        case 7: case 8: add(L, T); break;
        case 5: add(L, T); add(B, R); break;
        case 10: add(T, R); add(L, B); break;
      }
    }
  }
  // Chain segments that share endpoints so each line is one subpath, not hundreds.
  const key = (x: number, y: number) => `${Math.round(x * 100)},${Math.round(y * 100)}`;
  const ends = new Map<string, number[]>();
  segs.forEach((s, i) => {
    for (const k of [key(s[0], s[1]), key(s[2], s[3])]) (ends.get(k) ?? ends.set(k, []).get(k)!).push(i);
  });
  const used = new Uint8Array(segs.length);
  const r1 = (v: number) => Math.round(v * 10) / 10;
  let d = "";
  for (let i = 0; i < segs.length; i++) {
    if (used[i]) continue;
    used[i] = 1;
    const pts: [number, number][] = [[segs[i][0], segs[i][1]], [segs[i][2], segs[i][3]]];
    for (const dir of [1, 0]) {
      for (;;) {
        const tip = dir ? pts[pts.length - 1] : pts[0];
        const next = (ends.get(key(tip[0], tip[1])) ?? []).find((j) => !used[j]);
        if (next === undefined) break;
        used[next] = 1;
        const s = segs[next];
        const p: [number, number] = key(s[0], s[1]) === key(tip[0], tip[1]) ? [s[2], s[3]] : [s[0], s[1]];
        if (dir) pts.push(p);
        else pts.unshift(p);
      }
    }
    if (pts.length < 4) continue; // drop specks
    d += `M${pts.map(([x, y]) => `${r1(x)} ${r1(y)}`).join("L")}`;
  }
  return d;
}

export interface Terrain {
  field: Float32Array;
  /** Contour paths, lowest first; `index` lines are drawn heavier, as on survey maps. */
  lines: { d: string; level: number; index: boolean }[];
  summits: Summit[];
}

let cache: Terrain | null = null;
export function terrain(peaks: number): Terrain {
  if (cache) return cache;
  const field = heightField(peaks);
  const lines = [];
  for (let i = 1; i <= 16; i++) {
    const level = i / 17;
    const d = contour(field, level);
    if (d) lines.push({ d, level, index: i % 4 === 0 });
  }
  cache = { field, lines, summits: summitsFor(peaks) };
  return cache;
}

/** Hypsometric tint for a height in 0..1 (moss lowlands → ochre → snow). */
export function tint(h: number): [number, number, number] {
  const stops: [number, [number, number, number]][] = [
    [0, [20, 34, 29]], [0.35, [36, 58, 44]], [0.55, [72, 86, 52]], [0.72, [128, 112, 64]], [0.86, [150, 128, 96]], [1, [196, 196, 182]],
  ];
  for (let i = 1; i < stops.length; i++) {
    const [b, cb] = stops[i];
    const [a, ca] = stops[i - 1];
    if (h <= b) {
      const t = (h - a) / (b - a);
      return [0, 1, 2].map((k) => Math.round(ca[k] + (cb[k] - ca[k]) * t)) as [number, number, number];
    }
  }
  return stops[stops.length - 1][1];
}
