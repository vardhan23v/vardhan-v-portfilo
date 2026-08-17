import type { SVGProps } from "react";

const base = {
  width: 20,
  height: 20,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round",
  strokeLinejoin: "round",
} as const;

const solid = { width: 20, height: 20, viewBox: "0 0 24 24", fill: "currentColor" } as const;

export const Icon = {
  github: (p: SVGProps<SVGSVGElement>) => (
    <svg {...solid} {...p} aria-hidden="true">
      <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.55v-2.15c-3.2.7-3.87-1.36-3.87-1.36-.52-1.33-1.28-1.68-1.28-1.68-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.03 1.76 2.69 1.25 3.35.96.1-.75.4-1.25.72-1.54-2.55-.29-5.24-1.28-5.24-5.68 0-1.26.45-2.28 1.18-3.09-.12-.29-.51-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.78 0c2.2-1.49 3.16-1.18 3.16-1.18.63 1.59.24 2.76.12 3.05.74.81 1.18 1.83 1.18 3.09 0 4.41-2.7 5.38-5.26 5.67.41.35.78 1.05.78 2.12v3.15c0 .3.2.67.8.55A11.52 11.52 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5Z" />
    </svg>
  ),
  linkedin: (p: SVGProps<SVGSVGElement>) => (
    <svg {...solid} {...p} aria-hidden="true">
      <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12ZM7.12 20.45H3.55V9h3.57v11.45Z" />
    </svg>
  ),
  mail: (p: SVGProps<SVGSVGElement>) => (
    <svg {...base} {...p} aria-hidden="true">
      <rect x="2.5" y="4.5" width="19" height="15" rx="3" />
      <path d="m3.5 7 8.5 6 8.5-6" />
    </svg>
  ),
  external: (p: SVGProps<SVGSVGElement>) => (
    <svg {...base} {...p} aria-hidden="true">
      <path d="M14 4h6v6" />
      <path d="M20 4 10.5 13.5" />
      <path d="M19 13v5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h5" />
    </svg>
  ),
  arrowRight: (p: SVGProps<SVGSVGElement>) => (
    <svg {...base} {...p} aria-hidden="true">
      <path d="M4 12h16" />
      <path d="m14 6 6 6-6 6" />
    </svg>
  ),
  download: (p: SVGProps<SVGSVGElement>) => (
    <svg {...base} {...p} aria-hidden="true">
      <path d="M12 3v12" />
      <path d="m7 10 5 5 5-5" />
      <path d="M4 20h16" />
    </svg>
  ),
  sparkles: (p: SVGProps<SVGSVGElement>) => (
    <svg {...base} {...p} aria-hidden="true">
      <path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9L12 3Z" />
      <path d="M19 15.5l.9 2.6 2.6.9-2.6.9-.9 2.6-.9-2.6-2.6-.9 2.6-.9.9-2.6Z" />
    </svg>
  ),
  code: (p: SVGProps<SVGSVGElement>) => (
    <svg {...base} {...p} aria-hidden="true">
      <path d="m8 8-5 4 5 4" />
      <path d="m16 8 5 4-5 4" />
      <path d="m14 4-4 16" />
    </svg>
  ),
  layout: (p: SVGProps<SVGSVGElement>) => (
    <svg {...base} {...p} aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="3" />
      <path d="M3 9h18M9 9v12" />
    </svg>
  ),
  server: (p: SVGProps<SVGSVGElement>) => (
    <svg {...base} {...p} aria-hidden="true">
      <rect x="3" y="4" width="18" height="7" rx="2" />
      <rect x="3" y="13" width="18" height="7" rx="2" />
      <path d="M7 7.5h.01M7 16.5h.01" />
    </svg>
  ),
  database: (p: SVGProps<SVGSVGElement>) => (
    <svg {...base} {...p} aria-hidden="true">
      <ellipse cx="12" cy="5" rx="8" ry="3" />
      <path d="M4 5v14c0 1.66 3.58 3 8 3s8-1.34 8-3V5" />
      <path d="M4 12c0 1.66 3.58 3 8 3s8-1.34 8-3" />
    </svg>
  ),
  tools: (p: SVGProps<SVGSVGElement>) => (
    <svg {...base} {...p} aria-hidden="true">
      <path d="M14.7 6.3a4.5 4.5 0 0 0-6 6L3 18l3 3 5.7-5.7a4.5 4.5 0 0 0 6-6L14 13l-3-3 3.7-3.7Z" />
      <path d="m14 4 6 6" />
    </svg>
  ),
  star: (p: SVGProps<SVGSVGElement>) => (
    <svg {...solid} {...p} aria-hidden="true">
      <path d="M12 2l2.9 6.26 6.6.86-4.85 4.62 1.24 6.6L12 17.2l-5.89 3.14 1.24-6.6L2.5 9.12l6.6-.86L12 2Z" />
    </svg>
  ),
  folder: (p: SVGProps<SVGSVGElement>) => (
    <svg {...base} {...p} aria-hidden="true">
      <path d="M3 7a2 2 0 0 1 2-2h4l2 2.5h8a2 2 0 0 1 2 2V17a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z" />
    </svg>
  ),
  terminal: (p: SVGProps<SVGSVGElement>) => (
    <svg {...base} {...p} aria-hidden="true">
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <path d="m7 9 3 3-3 3" />
      <path d="M13 15h4" />
    </svg>
  ),
  mapPin: (p: SVGProps<SVGSVGElement>) => (
    <svg {...base} {...p} aria-hidden="true">
      <path d="M12 21s-7-5.5-7-11a7 7 0 0 1 14 0c0 5.5-7 11-7 11Z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  ),
  send: (p: SVGProps<SVGSVGElement>) => (
    <svg {...base} {...p} aria-hidden="true">
      <path d="m21 3-9.5 9.5" />
      <path d="M21 3 13.5 21l-2-8.5L3 10.5 21 3Z" />
    </svg>
  ),
  menu: (p: SVGProps<SVGSVGElement>) => (
    <svg {...base} {...p} aria-hidden="true">
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  ),
  close: (p: SVGProps<SVGSVGElement>) => (
    <svg {...base} {...p} aria-hidden="true">
      <path d="M6 6l12 12M18 6 6 18" />
    </svg>
  ),
  check: (p: SVGProps<SVGSVGElement>) => (
    <svg {...base} {...p} aria-hidden="true">
      <path d="m5 12.5 4.5 4.5L19 7.5" />
    </svg>
  ),
  cert: (p: SVGProps<SVGSVGElement>) => (
    <svg {...base} {...p} aria-hidden="true">
      <circle cx="12" cy="9" r="5.5" />
      <path d="m9.3 13.6-1.8 7.4 4.5-2.6 4.5 2.6-1.8-7.4" />
    </svg>
  ),
  graduation: (p: SVGProps<SVGSVGElement>) => (
    <svg {...base} {...p} aria-hidden="true">
      <path d="m2 9 10-5 10 5-10 5L2 9Z" />
      <path d="M6 11.5V16c0 1.5 2.7 3 6 3s6-1.5 6-3v-4.5" />
      <path d="M22 9v5" />
    </svg>
  ),
  rocket: (p: SVGProps<SVGSVGElement>) => (
    <svg {...base} {...p} aria-hidden="true">
      <path d="M12 15c-2.5-2-1-6 0-9 3 0 7 1.5 9 3-2 2-5 4-9 6Z" />
      <path d="M9 15c-2 .5-3.5 1.5-4 4 2.5.5 3.5-1 4-4Z" />
      <circle cx="14.5" cy="9.5" r="1.2" />
    </svg>
  ),
  book: (p: SVGProps<SVGSVGElement>) => (
    <svg {...base} {...p} aria-hidden="true">
      <path d="M4 5a2 2 0 0 1 2-2h14v16H6a2 2 0 0 0-2 2V5Z" />
      <path d="M4 19a2 2 0 0 1 2-2h14" />
    </svg>
  ),
  clock: (p: SVGProps<SVGSVGElement>) => (
    <svg {...base} {...p} aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3.5 2" />
    </svg>
  ),
  briefcase: (p: SVGProps<SVGSVGElement>) => (
    <svg {...base} {...p} aria-hidden="true">
      <rect x="3" y="7" width="18" height="13" rx="2.5" />
      <path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" />
      <path d="M3 12h18" />
    </svg>
  ),
  user: (p: SVGProps<SVGSVGElement>) => (
    <svg {...base} {...p} aria-hidden="true">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c0-4 3.6-6 8-6s8 2 8 6" />
    </svg>
  ),
  home: (p: SVGProps<SVGSVGElement>) => (
    <svg {...base} {...p} aria-hidden="true">
      <path d="m3 11 9-8 9 8" />
      <path d="M5 9.5V21h14V9.5" />
      <path d="M10 21v-6h4v6" />
    </svg>
  ),
  folderKanban: (p: SVGProps<SVGSVGElement>) => (
    <svg {...base} {...p} aria-hidden="true">
      <path d="M3 7a2 2 0 0 1 2-2h4l2 2.5h8a2 2 0 0 1 2 2V17a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z" />
      <path d="M8.5 11.5v4M12 11.5v4M15.5 11.5v4" />
    </svg>
  ),
} as const;

export type IconName = keyof typeof Icon;