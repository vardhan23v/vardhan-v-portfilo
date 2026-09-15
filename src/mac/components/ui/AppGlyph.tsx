import type { AppId } from "../../hooks/useWindowManager";

export type GlyphId = AppId | "launchpad" | "github" | "resume" | "linkedin";

/* macOS-style squircle app icons, drawn as original SVG in the spirit of the
   real ones: Finder, Launchpad, Notes, Messages, Photos, Terminal, Settings… */
const SQ = "M22 0h84c12 0 22 10 22 22v84c0 12-10 22-22 22H22C10 128 0 118 0 106V22C0 10 10 0 22 0z";

function Icon({ id, uid }: { id: GlyphId; uid: string }) {
  const g = (name: string) => `url(#${uid}-${name})`;
  switch (id) {
    case "finder":
      return (
        <>
          <defs>
            <linearGradient id={`${uid}-l`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#5fc2ff" /><stop offset="1" stopColor="#1e7be6" /></linearGradient>
            <linearGradient id={`${uid}-r`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#2e8ff3" /><stop offset="1" stopColor="#0b53c4" /></linearGradient>
          </defs>
          <path d={SQ} fill={g("l")} />
          <path d="M64 0h42c12 0 22 10 22 22v84c0 12-10 22-22 22H64z" fill={g("r")} />
          <path d="M64 0c-8 24-12 44-12 64s4 40 12 64" stroke="#0a3f9a" strokeWidth="4" fill="none" />
          <path d="M28 40c0 8 6 14 14 14M100 40c0 8-6 14-14 14" stroke="#0a3f9a" strokeWidth="5" strokeLinecap="round" fill="none" />
          <ellipse cx="40" cy="52" rx="4" ry="8" fill="#0a3f9a" /><ellipse cx="88" cy="52" rx="4" ry="8" fill="#0a3f9a" />
          <path d="M34 88c14 14 46 14 60 0" stroke="#0a3f9a" strokeWidth="6" strokeLinecap="round" fill="none" />
          <path d="M18 78c6 6 14 8 20 8M110 78c-6 6-14 8-20 8" stroke="#0a3f9a" strokeWidth="5" strokeLinecap="round" fill="none" />
        </>
      );
    case "launchpad":
      return (
        <>
          <defs><linearGradient id={`${uid}-b`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#4a5568" /><stop offset="1" stopColor="#1f2430" /></linearGradient></defs>
          <path d={SQ} fill={g("b")} />
          <g fill="#fff" opacity="0.95">
            <rect x="22" y="22" width="24" height="24" rx="6" /><rect x="52" y="22" width="24" height="24" rx="6" /><rect x="82" y="22" width="24" height="24" rx="6" />
            <rect x="22" y="52" width="24" height="24" rx="6" /><rect x="52" y="52" width="24" height="24" rx="6" /><rect x="82" y="52" width="24" height="24" rx="6" />
            <rect x="22" y="82" width="24" height="24" rx="6" /><rect x="52" y="82" width="24" height="24" rx="6" /><rect x="82" y="82" width="24" height="24" rx="6" />
          </g>
        </>
      );
    case "notes":
      return (
        <>
          <defs><linearGradient id={`${uid}-y`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#ffd84d" /><stop offset="1" stopColor="#ffb000" /></linearGradient></defs>
          <path d={SQ} fill={g("y")} />
          <path d="M0 40h128v66c0 12-10 22-22 22H22C10 128 0 118 0 106z" fill="#fffef5" />
          <g fill="#f0c94a" opacity="0.6"><circle cx="24" cy="20" r="6" /><circle cx="48" cy="20" r="6" /><circle cx="80" cy="20" r="6" /><circle cx="104" cy="20" r="6" /></g>
          <g stroke="#cfd3d8" strokeWidth="3" strokeLinecap="round"><path d="M22 62h84M22 80h84M22 98h60" /></g>
        </>
      );
    case "vardhan-ai":
      return (
        <>
          <defs><linearGradient id={`${uid}-g`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#5df777" /><stop offset="1" stopColor="#12b43a" /></linearGradient></defs>
          <path d={SQ} fill={g("g")} />
          <path d="M64 24c25 0 44 15 44 34s-19 34-44 34c-4 0-8-.4-12-1.3L30 102l6-16C26 80 20 71 20 58c0-19 19-34 44-34z" fill="#fff" />
        </>
      );
    case "photos":
      return (
        <>
          <path d={SQ} fill="#fff" />
          <g transform="translate(64 64)" opacity="0.92">
            {[["#f9c80e", 0], ["#f86624", 45], ["#ea3546", 90], ["#c5299b", 135], ["#3e8ef7", 180], ["#0fbfe0", 225], ["#43aa8b", 270], ["#90be6d", 315]].map(([c, r]) => (
              <ellipse key={String(r)} cx="0" cy="-30" rx="12" ry="26" fill={c as string} transform={`rotate(${r})`} style={{ mixBlendMode: "multiply" }} />
            ))}
          </g>
        </>
      );
    case "preview":
      return (
        <>
          <defs><linearGradient id={`${uid}-p`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#7fd3ff" /><stop offset="1" stopColor="#2f8ff0" /></linearGradient></defs>
          <path d={SQ} fill={g("p")} />
          <rect x="22" y="30" width="84" height="68" rx="8" fill="#fff" />
          <path d="M28 92l22-26 16 18 12-12 22 20z" fill="#3aa0f5" /><circle cx="84" cy="50" r="8" fill="#ffd166" />
          <path d="M22 98c30-20 54-20 84 0" fill="#1e6fd0" opacity="0.15" />
        </>
      );
    case "terminal":
      return (
        <>
          <defs><linearGradient id={`${uid}-t`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#3a3d46" /><stop offset="1" stopColor="#111318" /></linearGradient></defs>
          <path d={SQ} fill={g("t")} />
          <rect x="0" y="0" width="128" height="26" rx="22" fill="#5a5d68" opacity="0.6" /><rect x="0" y="14" width="128" height="12" fill="#3a3d46" opacity="0.6" />
          <text x="22" y="72" fontFamily="JetBrains Mono, monospace" fontSize="30" fontWeight="700" fill="#fff">&gt;_</text>
        </>
      );
    case "settings":
      return (
        <>
          <defs><linearGradient id={`${uid}-s`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#a4a8b3" /><stop offset="1" stopColor="#5f6470" /></linearGradient></defs>
          <path d={SQ} fill={g("s")} />
          <g transform="translate(64 64)" fill="#e9ebef">
            {Array.from({ length: 8 }).map((_, i) => <rect key={i} x="-7" y="-46" width="14" height="20" rx="3" transform={`rotate(${i * 45})`} />)}
            <circle r="34" /><circle r="16" fill="#5f6470" />
          </g>
        </>
      );
    case "contact":
      return (
        <>
          <defs><linearGradient id={`${uid}-m`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#6fc6ff" /><stop offset="1" stopColor="#1c7ef0" /></linearGradient></defs>
          <path d={SQ} fill={g("m")} />
          <rect x="18" y="34" width="92" height="60" rx="10" fill="#fff" />
          <path d="M18 44l46 32 46-32" fill="none" stroke="#1c7ef0" strokeWidth="6" strokeLinejoin="round" />
        </>
      );
    case "overview":
      return (
        <>
          <defs><linearGradient id={`${uid}-o`} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#8f8bff" /><stop offset="1" stopColor="#4a3fd6" /></linearGradient></defs>
          <path d={SQ} fill={g("o")} />
          <text x="64" y="86" textAnchor="middle" fontFamily="Fraunces, Georgia, serif" fontStyle="italic" fontSize="70" fill="#fff">V</text>
        </>
      );
    case "about":
      return (
        <>
          <defs><linearGradient id={`${uid}-a`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#ff9fbf" /><stop offset="1" stopColor="#e0447c" /></linearGradient></defs>
          <path d={SQ} fill={g("a")} />
          <circle cx="64" cy="50" r="20" fill="#fff" /><path d="M24 108c4-24 20-34 40-34s36 10 40 34z" fill="#fff" />
        </>
      );
    case "projects":
      return (
        <>
          <defs><linearGradient id={`${uid}-f`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#7cc8ff" /><stop offset="1" stopColor="#2b8ff0" /></linearGradient></defs>
          <path d={SQ} fill={g("f")} />
          <path d="M18 40c0-5 4-9 9-9h24l10 10h40c5 0 9 4 9 9v46c0 5-4 9-9 9H27c-5 0-9-4-9-9z" fill="#dff1ff" />
          <path d="M18 52h92v43c0 5-4 9-9 9H27c-5 0-9-4-9-9z" fill="#fff" />
        </>
      );
    case "experience":
      return (
        <>
          <defs><linearGradient id={`${uid}-e`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#8b5e3c" /><stop offset="1" stopColor="#4a2f1c" /></linearGradient></defs>
          <path d={SQ} fill={g("e")} />
          <rect x="22" y="42" width="84" height="56" rx="8" fill="#e8c9a0" /><rect x="48" y="30" width="32" height="14" rx="4" fill="#e8c9a0" /><rect x="22" y="62" width="84" height="6" fill="#4a2f1c" opacity="0.5" />
        </>
      );
    case "skills":
      return (
        <>
          <defs><linearGradient id={`${uid}-k`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#35d0e6" /><stop offset="1" stopColor="#0f7fa8" /></linearGradient></defs>
          <path d={SQ} fill={g("k")} />
          <path d="M44 40L24 64l20 24M84 40l20 24-20 24M72 34L56 94" fill="none" stroke="#fff" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" />
        </>
      );
    case "achievements":
      return (
        <>
          <defs><linearGradient id={`${uid}-c`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#ffd766" /><stop offset="1" stopColor="#e39b00" /></linearGradient></defs>
          <path d={SQ} fill={g("c")} />
          <circle cx="64" cy="52" r="26" fill="#fff" /><circle cx="64" cy="52" r="16" fill="#e39b00" opacity="0.35" />
          <path d="M48 74l-8 34 24-12 24 12-8-34" fill="#fff" opacity="0.9" />
        </>
      );
    case "about-mac":
      return (
        <>
          <defs><linearGradient id={`${uid}-i`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#6a7280" /><stop offset="1" stopColor="#2f3542" /></linearGradient></defs>
          <path d={SQ} fill={g("i")} />
          <rect x="22" y="30" width="84" height="56" rx="8" fill="#0b1020" /><rect x="28" y="36" width="72" height="44" rx="4" fill="#3b5bdb" opacity="0.8" /><rect x="46" y="92" width="36" height="8" rx="4" fill="#c9ced8" />
        </>
      );
    case "github":
      return (
        <>
          <path d={SQ} fill="#1b1f27" />
          <path d="M64 22C41 22 24 39 24 62c0 18 11 33 27 38 2 0 3-1 3-2v-8c-11 2-13-5-13-5-2-4-4-6-4-6-4-2 0-2 0-2 4 0 6 4 6 4 3 6 9 4 11 3 0-3 1-4 2-5-9-1-18-4-18-20 0-4 2-8 4-11-1-1-2-5 0-11 0 0 3-1 11 4a38 38 0 0 1 20 0c8-5 11-4 11-4 2 6 1 10 0 11 3 3 4 7 4 11 0 16-9 19-18 20 1 1 3 3 3 7v11c0 1 1 2 3 2 16-5 27-20 27-38 0-23-17-40-40-40z" fill="#fff" />
        </>
      );
    case "resume":
      return (
        <>
          <path d={SQ} fill="#f3f4f6" />
          <path d="M34 22h40l20 20v64H34z" fill="#fff" stroke="#c7cbd3" strokeWidth="3" /><path d="M74 22v20h20" fill="#e5e7eb" stroke="#c7cbd3" strokeWidth="3" />
          <g stroke="#9aa1ad" strokeWidth="4" strokeLinecap="round"><path d="M44 60h40M44 72h40M44 84h28" /></g>
          <rect x="44" y="94" width="22" height="8" rx="3" fill="#e0443e" />
        </>
      );
    case "linkedin":
      return (
        <>
          <path d={SQ} fill="#0a66c2" />
          <rect x="30" y="52" width="16" height="48" fill="#fff" /><circle cx="38" cy="36" r="9" fill="#fff" />
          <path d="M58 52h15v7c3-5 9-8 16-8 14 0 19 8 19 22v27H92V76c0-7-2-12-9-12s-10 5-10 12v24H58z" fill="#fff" />
        </>
      );
    default:
      return <path d={SQ} fill="#5e5ce6" />;
  }
}

let counter = 0;

/** macOS-style app icon (squircle). Size in px. */
export function AppGlyph({ id, size = 44, className = "" }: { id: GlyphId; size?: number; className?: string }) {
  const uid = `g${(counter++ % 10000).toString(36)}`;
  return (
    <span className={`mac-glyph mac-glyph--${id} ${className}`} style={{ width: size, height: size }} aria-hidden="true">
      <svg viewBox="0 0 128 128" width={size} height={size}>
        <Icon id={id} uid={uid} />
        <path d={SQ} fill="none" stroke="rgba(0,0,0,0.25)" strokeWidth="1.5" />
        <path d="M22 1.5h84c11 0 20.5 9.5 20.5 20.5" fill="none" stroke="rgba(255,255,255,0.45)" strokeWidth="2" />
      </svg>
    </span>
  );
}
