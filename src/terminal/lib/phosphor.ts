/**
 * CRT phosphor colour for the terminal edition. Persisted in localStorage
 * (`folio.phosphor`) and applied as `data-phosphor` on `.terminal-root`;
 * the palette itself lives in styles/global.css.
 */
export const PHOSPHORS = ["green", "amber", "cyan", "white"] as const;
export type Phosphor = (typeof PHOSPHORS)[number];

const KEY = "folio.phosphor";
const EVENT = "folio:phosphor";

export const isPhosphor = (v: unknown): v is Phosphor => PHOSPHORS.includes(v as Phosphor);

export function getPhosphor(): Phosphor {
  try {
    const v = localStorage.getItem(KEY);
    return isPhosphor(v) ? v : "green";
  } catch {
    return "green";
  }
}

export function setPhosphor(p: Phosphor) {
  try {
    if (p === "green") localStorage.removeItem(KEY);
    else localStorage.setItem(KEY, p);
  } catch {
    /* private mode */
  }
  window.dispatchEvent(new CustomEvent(EVENT, { detail: p }));
}

export const nextPhosphor = (p: Phosphor): Phosphor => PHOSPHORS[(PHOSPHORS.indexOf(p) + 1) % PHOSPHORS.length];

export function subscribePhosphor(cb: () => void) {
  window.addEventListener(EVENT, cb);
  return () => window.removeEventListener(EVENT, cb);
}
