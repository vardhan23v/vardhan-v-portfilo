import type { AppId } from "../../hooks/useWindowManager";

export type GlyphId = AppId | "launchpad" | "github" | "resume" | "linkedin";

/** Hue offsets (relative to the accent) so tiles feel like one family. */
const TONES: Record<GlyphId, { h: number; s: number; l: number; mono: string }> = {
  finder: { h: 210, s: 70, l: 52, mono: "F" },
  launchpad: { h: 250, s: 55, l: 56, mono: "L" },
  overview: { h: 265, s: 60, l: 54, mono: "V" },
  about: { h: 330, s: 50, l: 56, mono: "A" },
  projects: { h: 28, s: 85, l: 54, mono: "P" },
  experience: { h: 160, s: 55, l: 42, mono: "E" },
  skills: { h: 190, s: 70, l: 44, mono: "S" },
  achievements: { h: 45, s: 85, l: 50, mono: "C" },
  contact: { h: 200, s: 75, l: 50, mono: "M" },
  terminal: { h: 230, s: 12, l: 16, mono: ">" },
  "vardhan-ai": { h: 300, s: 65, l: 56, mono: "AI" },
  settings: { h: 220, s: 8, l: 46, mono: "⚙" },
  "about-mac": { h: 240, s: 20, l: 40, mono: "i" },
  github: { h: 230, s: 10, l: 22, mono: "GH" },
  resume: { h: 20, s: 20, l: 88, mono: "CV" },
  linkedin: { h: 205, s: 80, l: 42, mono: "in" },
};

function Symbol({ id }: { id: GlyphId }) {
  const p = { fill: "none", stroke: "currentColor", strokeWidth: 2.2, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  switch (id) {
    case "finder":
      return (<g {...p}><rect x="5" y="7" width="22" height="18" rx="4" /><path d="M16 7v18M10 13v2M22 13v2M11 20q5 3 10 0" /></g>);
    case "launchpad":
      return (<g {...p}><rect x="6" y="6" width="8" height="8" rx="2" /><rect x="18" y="6" width="8" height="8" rx="2" /><rect x="6" y="18" width="8" height="8" rx="2" /><rect x="18" y="18" width="8" height="8" rx="2" /></g>);
    case "overview":
      return (<g {...p}><path d="M7 25V11l9-5 9 5v14" /><path d="M13 25v-7h6v7" /></g>);
    case "about":
      return (<g {...p}><circle cx="16" cy="12" r="5" /><path d="M6 27c1-6 5-8 10-8s9 2 10 8" /></g>);
    case "projects":
      return (<g {...p}><path d="M5 11h8l2 3h12v11H5z" /><path d="M5 11V8h7" /></g>);
    case "experience":
      return (<g {...p}><rect x="5" y="10" width="22" height="15" rx="3" /><path d="M12 10V7h8v3M5 17h22" /></g>);
    case "skills":
      return (<g {...p}><path d="M11 9l-6 7 6 7M21 9l6 7-6 7M18 7l-4 18" /></g>);
    case "achievements":
      return (<g {...p}><circle cx="16" cy="12" r="6" /><path d="M11 17l-2 9 7-3 7 3-2-9" /></g>);
    case "contact":
      return (<g {...p}><rect x="5" y="8" width="22" height="16" rx="3" /><path d="M5 10l11 8 11-8" /></g>);
    case "terminal":
      return (<g {...p}><path d="M8 10l6 6-6 6M16 22h8" /></g>);
    case "vardhan-ai":
      return (<g {...p}><path d="M16 5l2.6 6.4L25 14l-6.4 2.6L16 23l-2.6-6.4L7 14l6.4-2.6z" /><path d="M24 22l.9 2.1L27 25l-2.1.9L24 28l-.9-2.1L21 25l2.1-.9z" /></g>);
    case "settings":
      return (<g {...p}><circle cx="16" cy="16" r="4" /><path d="M16 4v4M16 24v4M4 16h4M24 16h4M7.5 7.5l2.8 2.8M21.7 21.7l2.8 2.8M7.5 24.5l2.8-2.8M21.7 10.3l2.8-2.8" /></g>);
    case "about-mac":
      return (<g {...p}><circle cx="16" cy="16" r="11" /><path d="M16 14v8M16 10v.5" /></g>);
    case "github":
      return (<g {...p}><path d="M12 27v-4c-4 1-5-2-6-3m14 7v-5a3 3 0 0 0-1-2c3 0 6-1 6-6a5 5 0 0 0-1-4 5 5 0 0 0 0-4s-1 0-4 2a12 12 0 0 0-6 0C11 6 10 6 10 6a5 5 0 0 0 0 4 5 5 0 0 0-1 4c0 5 3 6 6 6a3 3 0 0 0-1 2v5" /></g>);
    case "resume":
      return (<g {...p}><path d="M9 5h9l6 6v16H9z" /><path d="M18 5v6h6M12 16h8M12 20h8M12 12h3" /></g>);
    case "linkedin":
      return (<g {...p}><rect x="6" y="6" width="20" height="20" rx="4" /><path d="M11 13v8M11 10v.5M16 21v-8M16 16c0-2 5-3 5 0v5" /></g>);
    default:
      return null;
  }
}

/**
 * Flat, editorial app tile: accent-adjacent gradient square, one bold
 * monochrome symbol, tiny mono monogram in the corner.
 */
export function AppGlyph({ id, size = 44, className = "" }: { id: GlyphId; size?: number; className?: string }) {
  const t = TONES[id] ?? TONES.overview;
  const style = {
    "--g-h": t.h,
    "--g-s": `${t.s}%`,
    "--g-l": `${t.l}%`,
    width: size,
    height: size,
  } as React.CSSProperties;
  return (
    <span className={`mac-glyph mac-glyph--${id} ${className}`} style={style} aria-hidden="true">
      <svg viewBox="0 0 32 32" width={size * 0.62} height={size * 0.62}>
        <Symbol id={id} />
      </svg>
      <span className="mac-glyph__mono">{t.mono}</span>
    </span>
  );
}
