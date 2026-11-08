<div align="center">

# Sree Vardhan V — Portfolio

**Generative AI Developer & Full-Stack Developer**

[![Live Site](https://img.shields.io/badge/Live%20Site-vardhan--v--portfilo.vercel.app-38bdf8?style=for-the-badge&logo=vercel&logoColor=white)](https://vardhan-v-portfilo.vercel.app)
[![GitHub](https://img.shields.io/badge/GitHub-vardhan23v-7c6cff?style=for-the-badge&logo=github&logoColor=white)](https://github.com/vardhan23v)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-vardhan--v23-0a66c2?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/vardhan-v23)

[![CI](https://github.com/vardhan23v/vardhan-v-portfilo/actions/workflows/ci.yml/badge.svg)](https://github.com/vardhan23v/vardhan-v-portfilo/actions/workflows/ci.yml)
[![Vercel](https://img.shields.io/badge/Vercel-Ready-black?style=for-the-badge&logo=vercel&logoColor=white)](https://vardhan-v-portfilo.vercel.app)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-8.2-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![CSS](https://img.shields.io/badge/CSS-663399?style=for-the-badge&logo=css3&logoColor=white)](#-tech-stack)
[![Bundle](https://img.shields.io/badge/bundle-~132kB_JS_+_~37kB_CSS_gzip-7c6cff?style=for-the-badge)](#-tech-stack)
[![Editions](https://img.shields.io/badge/editions-7_interfaces_+_landing-a78bfa?style=for-the-badge)](#-editions)

[![Aurora 2.0](https://img.shields.io/badge/Aurora-2.0-luminous-22d3ee?style=for-the-badge)](#aurora-20--luminous-interactive)
[![Classic](https://img.shields.io/badge/Classic-starry_night-9cc0ff?style=for-the-badge)](#-whats-new--nov-1-2026--classic-starry-night)
[![Atlas](https://img.shields.io/badge/Atlas-survey_atlas-ff5b24?style=for-the-badge)](#-whats-new--nov-2-2026--atlas-case-studies-and-a-site-wide-pass)
[![Motion](https://img.shields.io/badge/motion-View_Transitions_+_scroll--driven-38bdf8?style=for-the-badge)](#-tech-stack)

</div>

A production-quality portfolio positioning me as a **Generative AI Developer & Full-Stack Developer** — built around real AI-powered products, not a list of technologies.

> *I build with AI. I ship with code.*

<div align="center">

**[Live: vardhan-v-portfilo.vercel.app](https://vardhan-v-portfilo.vercel.app) · [GitHub: vardhan23v](https://github.com/vardhan23v) · [LinkedIn](https://www.linkedin.com/in/vardhan-v23) · [Email: 23vvardhan@gmail.com](mailto:23vvardhan@gmail.com)**

</div>

---

## 🤖 What’s New — Nov 7 2026 · Vardhan AI (RAG assistant)

A floating **Vardhan AI** assistant now lives on every edition, and the macOS Messages app uses the same backend. Answers stream from Groq and draw only on the portfolio data, public GitHub repos and the resume, with numbered source citations. Unsupported questions get an honest "no verified information" reply. The stack is Vercel functions in `api/`, Supabase pgvector and a separate embedding provider. Setup, migration and the deployment checklist are in [docs/RAG_ASSISTANT.md](docs/RAG_ASSISTANT.md).

---

## 🗺 What’s New — Nov 2 2026 · Atlas, case studies and a site-wide pass

- **Atlas (`/atlas`, edition 07)** — the work as a survey atlas, laid out after the Forkfolio atlas page and written from scratch on this site's own data (`src/atlas/`):
  - **Title sheet** — a framed A–H × 1–5 map with a seeded contour terrain (`terrain.ts`, marching squares) where every featured project is a summit, a name card and a contents legend.
  - **Sheets** — project plates; a gazetteer of smaller builds plus public repos read live from the GitHub API (offline fallback); a skills index that cites project numbers; a year of contributions as a smoothed elevation profile and day plan (via github-contributions-api, hidden if it fails); the route of roles; the contact form.
  - **Background** — a fixed WebGL contour field (`ContourField.tsx`, one fragment shader, no library) that slides and warps as you scroll, draws only on scroll or resize, and falls back to static SVG contours.
  - **Scroll effects** — one engine (`useScrollProgress.ts`) writes `--p` per element, both ways: the first plate zooms on a sticky stage, survey lines draw, rows rule themselves in, an orange front sweeps the ridge, the compass swings north. Reduced motion pins everything finished.
  - **Layout** — one 12-column grid shared by every block and the ruler ticks; a bar with section, `/` search and a progress line; Host Grotesk + Fragment Mono; a crosshair cursor that reads the grid square.
- **Case studies at `/work/:slug`** — one shareable page per long write-up (Extension AI, AI Code Reviewer, CareerForge Pro, Vard AI, DisasterMind AI), linked from every edition and the ⌘K palette; `[` `]` step between them; the Terminal pages point their canonical URL here.
- **A cursor per interface** — `src/CursorFX.tsx` + `src/cursor-fx.css`: comet (landing), grid-snapped caret (Terminal), star in a swirl (Classic), ink dot (Paper), lagging glow (Aurora), ember spark (Forge), tinted system cursors (macOS), survey crosshair (Atlas). Off on touch and under reduced motion.
- **Site-wide accessibility pass** — axe reports 0 issues on every route at 1440 and 390 px: real list markup in Terminal, stronger secondary text in Terminal and the landing preview, Aurora cards open from a real button inside `<main>`, the Forge pipeline demo is a labelled group, the macOS desktop is the main landmark. Controls are at least 24 × 24 px (the macOS menu bar and window lights stay native-sized by design). Lint warnings 58 → 51.
- **Checks** — typecheck, lint, Vitest (17), build, Puppeteer smoke (12 routes), axe at 1440/390, no horizontal overflow from 1440 to 320 px.

## 🌌 What’s New — Nov 1 2026 · Classic “Starry Night”

`/classic` is rebuilt as a recruiter-first dark edition (`src/classic/`):

- **Look** — after Van Gogh’s *The Starry Night*: the hero is a painted canvas (brushed swirls, a gold crescent moon with halos, ringed stars, a cypress and rolling hills); every colour sampled from the MoMA painting itself (deep sky #1d274e, Prussian #30437a, swirl blues, teal, sage, star yellow #bbaf4a, ochre moon, cypress #1d211f); Fraunces headings with Inter body. Scroll effects run both ways: blocks fold in and out, a swirl rail draws down the page edge, the sky shifts toward dusk, titles brighten at centre, screenshots drift, and the nav steps aside while reading down.
- **Hero** — availability pill, masked-name load sequence, résumé/contact actions, copy-email button, and an "at a glance" card; a count-up **stats strip** follows.
- **Projects** — Extension AI as the wide flagship, then TrustLens AI, HPL Auction and AI Code Reviewer in browser frames with a pointer tilt and on-demand live previews; stack chips; **search** and category filters for the rest; a **details dialog** (problem, features, stack, prev/next) for every project; 18 **smaller builds**.
- **How I work** — the five stages from the Terminal edition.
- **Experience & skills** — role cards on a drawn timeline (current roles glow), education and certificate cards, skill cards with glyphs and per-tool project counts.
- **Motion** — scroll reveals with a failsafe so content is never left hidden, nav section progress, `g` + letter jump keys; everything off under reduced motion.
- **Checks** — typecheck, lint, Vitest, build, Puppeteer smoke (9 routes), axe (0 violations at 1280/375), no horizontal overflow from 1440 to 320 px.

## 🆕 What’s New — Sep 15 2026 · Vardhan OS 2.0 “glass edition”

The macOS interface was rebuilt from the visual layer up: a **dark-glass OS with editorial typography** (Fraunces display serif, Inter UI, JetBrains Mono details) that is deliberately not a stock-macOS clone. The engine — window manager, preferences, theme, Spotlight, toasts — is unchanged.

- **New surfaces** — boot → login screen (`sessionStorage mac-booted`, `?noboot=1` bypass, replay from Settings → Desktop), draggable **desktop icons** (positions in `localStorage mac-desktop-icons`, snap to a 96px grid), a **Widgets panel** behind the menu-bar clock (IST clock, GitHub stats, status, links), full-screen **Launchpad** (Dock item · View menu · Spotlight), and **project covers** (`Project.cover` / `Project.screenshots`, generated gradient fallback via `src/mac/components/ui/ProjectCover.tsx`).
- **Design system** — 7 stylesheets replace 15: `tokens` (glass/elevation/z/accent matrix that also steers the wallpaper hues) · `shell` · `window` · `components` · `pages` · `apps` · `responsive`, all under `src/mac/styles/`. Flat editorial app tiles via `src/mac/components/ui/AppGlyph.tsx`.
- **Pages** — Overview masthead + lead cover + ledger, Projects gallery with a right-side quick-view drawer and screenshot strip, Experience/Education ledgers, Skills type-specimen cards, numbered certification plates, About essay with drop cap, Contact with a display-size mailto. Finder gained icon/list views and a preview pane.
- **Landing, senior pass (Sep 16)** — one source of truth for the six editions (`src/editions.ts` drives Landing, routing, `ROUTE_SEO` and the interface switcher); global tokens split into `src/styles/base.css` so `Landing.css` only loads on `/`; refs + `usePrefersReducedMotion` instead of DOM queries; stage segments follow the APG tabs contract (roving tabindex, ←/→/Home/End, pause button, `aria-live`); name-first `<h1>`; live GitHub repo stat; ledger status chips; canonical/og:url on the real origin, `og:image` (`public/og/cover.jpg`), JSON-LD Person/WebSite, a static pre-JS shell + `<noscript>`, a real 404 route with `noindex`, and a build-time sitemap (`scripts/sitemap.mjs`).
- **Round 3** — ⌥Tab **app switcher**, **Mission Control** (⌃↑ / F3), edge **window snapping** with live preview, ⇧⌘D show desktop, idle **screensaver** (`?saver=1`), time-of-day wallpaper tint, **genie** minimize/restore, circular **light/dark reveal** (View Transitions), Finder **Quick Look** (Space), **notification banners** with app glyphs + actions, Terminal `matrix` + typewriter intro + confetti on `sudo hire vardhan`.
- **Hygiene** — dead `AppShell`/Sidebar/Toolbar/StatusBar/TabBar removed; `useTilt`/`CountUp` honour the in-app Reduce-motion toggle; QA scripts cover `/?noboot=1` and `/editions`.

- **Routing** — the landing page with the edition picker stays at `/` (`/editions` is an alias); the macOS shell lives at `/mac` and links back via the ✦ menu → *Browse Other Editions…*.
- **Wallpaper + Dock refresh** `src/mac/styles/wallpaper.css:1` — layered gradient-mesh wallpaper that follows the accent colour and light/dark theme, frosted window glass, macOS-style coloured Dock tiles with proximity magnification, running-app indicator dots and a tray separator.
- **Window manager hardening** `src/mac/hooks/useWindowManager.tsx:36` — windows re-fit on resize/rotation and never render 0px wide when the viewport reports 0 on first paint; mobile menu bar no longer overflows.

## What’s New — Sep 13 2026

| Edition | Upgrade | Highlights |
|---|---|---|
| **macOS** `src/mac/MacPortfolio.tsx:1` | Premium OS shell — 8-phase build | **Desktop shell** + **window manager** (drag/resize/maximize/minimize, `is-active` accent border) + **menu bar dropdowns** (Apple/App/File/Edit/View/Window/Help) + **Control Center** (Wi-Fi/BT/AirDrop/Focus/DND, appearance, brightness, volume, auto-hide dock, Show Desktop, persisted `mac-preferences`) + **Settings sidebar** (accent 6 swatches, theme, motion, dock, network, sound, dev-mode toggle) + **Terminal** (`about`/`date`/`repo <slug>`/`github`/`linkedin`/`resume` + `open <app>`) + **Spotlight** label-first ranking + 5 app commands + **Vardhan AI** intent engine (project/stack/experience/education/contact with `[app:]` links) + **Developer Mode** chip + live inspector (windows/prefs JSON/console/uptime) + **Help overlay** (`?` + Help menu, 5 sections) + **mobile desktop-area bounds** + `prefers-reduced-motion` + `?` help, all scoped under `.mac-root` |
| **Aurora 2.0** `src/aurora/AuroraSite.tsx:1` | Luminous + interactive | Toolbar with live search / sort (`Featured` / `A-Z` / Most stack) / grid↔list, result count + empty state, glass **project modal** (Esc/backdrop, scroll-lock), **Stack Lab** (28 tech pills filter Work + category breakdown + exploring notes), expandable experience rows, new **Education + Certs** timeline, 2-col contact (direct + validation form + toast), availability + IST + mouse aura, `204kB CSS` |
| **Classic** `src/classic/ClassicSite.tsx:1` + `src/classic/styles/classic.css:1` | Starry Night (Van Gogh) | Painted hero canvas (`HeroPainting` in `src/classic/components/NightSky.tsx`) whose swirls sway, moon breathes and halos pulse on transform/opacity only; scroll parallax; soft blur-clearing reveals with a failsafe (`src/classic/useEffects.ts:1`); View Transition crossfades for filters and toggles (`src/classic/lib/vt.ts`); glass nav; gold hover bloom |

All respect `prefers-reduced-motion`, use `viewTransition` crossfades, and ship via Vercel auto-deploy on `main`.

---

## ✨ Editions

The site opens on a **landing page with a live edition picker** — a browser-frame preview that cycles through every interface, with keyboard arrows, segment navigation and one-click entry. Switch anytime via the magnetic interface switcher, `1`–`7` keys, or `⌘K` — all with **View Transitions API** crossfade (progressive, reduced-motion safe).

| Route | Edition | Tone | Signature |
|---|---|---|---|
| `/` | **Landing** | Picker | Crossfading mini-skins stage (Terminal/Classic/Paper/Aurora/Forge/macOS/Atlas), GitHub stats, two-column hero (`/editions` is an alias) |
| `/work/:slug` | **Case studies** | Shareable | One page per long write-up, linked from every edition and the palette; `[` `]` step between them |
| `/terminal` | **Terminal** | Retro CRT | Boot seq, shell `help` / `whoami` / `cat skills.tree` / `neofetch` / `cowsay` / `ping`, `↑↓` history + Tab + `` ` `` focus, work at `/terminal/work/:slug` |
| `/classic` | **Classic** | Recruiter edition | "Starry Night" after Van Gogh: a painted hero (swirling sky, gold moon, ringed stars, cypress, hills) over a starry page in cobalt and Prussian blue, canvas-cream text and starlight-gold actions; Fraunces headings with Inter body. Hero with availability pill, a stats strip, About, a flagship plus three featured projects in browser frames (live app on request), searchable "More projects", a details dialog for every project, smaller builds, an experience timeline of role cards, skill cards with usage counts, How I work and the contact form. |
| `/paper` | **Paper** | Light editorial | Fraunces serifs, overlines, hairline rules, quiet readable |
| `/aurora` | **Aurora 2.0** — *luminous* | Glassmorphism | Frosted glass + drifting blobs + gradient text **plus** searchable/sortable work, quick-view modal, Stack Lab, expandable log, education/certs, mouse aura |
| `/forge` | **Forge** | Editorial dark | Kanit headlines, build pipeline pulse + hover trace, marquee, cached GitHub stats, sticky problem→solution cards |
| `/mac` | **macOS** — *premium OS* | App shell | Spotlight `⌘K` (label-first ranking) + traffic lights + Control Center + Settings (accent/motion/dock/network) + Terminal + Vardhan AI + Developer Mode inspector + Help `?` — see macOS deep dive below |
| `/atlas` | **Atlas** | Survey atlas | The work drawn as a topographic atlas, laid out after the Forkfolio atlas page: a framed title sheet (A–H × 1–5 grid, seeded contour map, every featured project a summit, a contents legend), a sticky bar with the current section, `/` search and a progress ruler; plates for the 12 projects, a gazetteer of smaller builds plus public GitHub repos read live, a skills index citing project numbers, a year of contributions as an elevation profile and day plan (via github-contributions-api), the route of roles and the contact form. Host Grotesk + Fragment Mono; a crosshair cursor that reads the grid square. |

---

## ⌘K Command Palette & Easter Eggs

- **⌘/Ctrl+K palette** `src/components/CommandPalette.tsx:1` — fuzzy subsequence (`prty` → Party), recents pinned in `localStorage`, copy email / copy link with “Copied ✓”, Surprise me random, quick links
- **Konami** `↑↑↓↓←→←→BA` → `src/components/KonamiFX.tsx:1` canvas confetti burst in accent colors + toast (also via Party mode)
- **Scroll-driven reveals** — pure-CSS `animation-timeline: view()` `scroll-rise` `src/styles/motion.css:465` on cards/stats, zero JS, view-timeline fallbacks

---

## 🌟 Highlights

- **12 featured projects** — Extension AI (flagship), TrustLens AI, LaunchRadar, ChitChain, AI Code Reviewer, CareerForge Pro, Vard AI, DisasterMind AI, DriveNest, HPL Auction, Apex Retail ERP, Dayflow HRMS — each with *problem → features → AI engine (Gemini/Claude/Groq/MCP) → stack → GitHub/Live*
- **macOS OS shell** — window manager + Control Center + Settings (accent 6 swatches / theme / motion) + Terminal (`about`/`date`/`repo`) + Spotlight ranking fix + Vardhan AI links + Developer Mode inspector + Help `?` + mobile bounds fix + persisted prefs + a11y (0 buttons without name, `aria-label` on dialogs, `data-mac-motion`) `src/mac/MacPortfolio.tsx:1` — `MacPortfolio-*.js 113kB / 29.9kB gzip` (budget 150kB) + `MacPortfolio-*.css 69kB / 12kB gzip`
- **Aurora 2.0 discovery** — search across name/tagline/tech/slug, sort, view toggle, highlight pills, empty state, modal body with `problem | features•bullet | tech chips` `src/aurora/AuroraSite.tsx:62`
- **Classic Starry Night** — painted hero and star field `src/classic/components/NightSky.tsx:1`, effects hook `src/classic/useEffects.ts:1`, all motion gated on `prefers-reduced-motion` and the site motion toggle
- **Classic 3D** — the hero is a CSS 3D diorama (moon, swirls, stars, hills and cypress at real depths, leaning toward the pointer) over a lazy-loaded WebGL star sky (`src/classic/components/StarSky3D.tsx`, plain `three`, ~119 kB gzip, desktop with a fine pointer only, paused off-screen, still under reduced motion, painted poster as the fallback); cards tilt with lifted titles and sections fold into place
- **“Other things”** — 13 compact cards + GitHub CTA
- **Experience** — OxCode, FlyRank AI, Zetheta, Zaalima — expandable in Aurora, role cards on a timeline in Classic
- **Tech stack** — honest grouped categories (Languages / Frontend / Backend / Databases / AI-LLM / Cloud & Tools) with glyphs `src/classic/components/Skills.tsx:1` and per-tool project counts (`usedIn` in `src/classic/data/stats.ts`), no % bars; **Stack Lab** makes them interactive in Aurora
- **GitHub stats** — followers/repos with a static fallback `src/classic/data/stats.ts:9`, count-up via `requestAnimationFrame`
- **SEO & a11y** — per-route `ROUTE_SEO` `src/App.tsx:20`, OG/Twitter/canonical `index.html:14`, `sitemap.xml`/`robots.txt`, skip-link `src/classic/styles/classic.css:70`, focus rings, `prefers-reduced-motion` honoured by default (the motion toggle can force animations on/off; unset = follow the OS)
- **QA** — GitHub Actions CI (`.github/workflows/ci.yml`: lint → typecheck → build → `npm test` → `npm run smoke`), Vitest data/shell tests, a Puppeteer smoke run over every route, plus the audit scripts: `layout-audit` (375–1440px overflow), `mob-check`, `shortcut-check`, `switcher-click-check`, `shell-test` (see Scripts)

---

## 🛠 Tech Stack

| Layer | Tools | Notes |
|---|---|---|
| Framework | **Vite 8.2** + **React 19.2** + **TypeScript 6** + `react-router-dom 7` `viewTransition` | `src/App.tsx:90` number-key + `ScrollToTop` + `RouteSeo` |
| Styling | **Hand-written CSS per edition** — tokens (`--bg`, `--accent`, `--surface`) `src/classic/styles/classic.css:1`, `src/aurora/styles/aurora.css:5` | Zero UI lib; hand-written CSS, no utility framework |
| Animation | View Transitions, `animation-timeline: view()` + `IntersectionObserver` `useReveal` `src/hooks/useReveal.tsx:1` (one hook shared by Classic/Terminal/macOS), `useTilt`/`useMagnetic`, `Aurora 2.0` modal/toolbar/lab + Classic sky parallax/reveals (`src/classic/useEffects.ts`) `src/styles/motion.css:1` | All `prefers-reduced-motion: reduce` safe — the OS setting is the default; no animation library |
| Icons | `lucide-react` + custom `Icon` `src/classic/lib/icons.tsx:1` (20+ glyphs) | No huge icon packs |
| Data | GitHub REST (live stats, session cache) | Fallback `33 followers`/`60 repos` (`src/classic/data/stats.ts`) |
| QA | `vitest` + `puppeteer` + `oxlint` + GitHub Actions | `npm run lint` — 0 errors baseline; `npm test`; `npm run smoke` |
| Deploy | **Vercel** `vercel.json:1` `{rewrites:[{source:"/(.*)",destination:"/index.html"}]}` auto-deploy on `main` | `project.json: team_InTZCfnybRSk3JlAYIXFN3UA` |

**Bundle (Sep 14 build):** `dist/assets/index-*.js 246kB / 79kB gzip` + `MacPortfolio-*.js 113kB / 29.9kB gzip` + `index-*.css 41kB / 9kB gzip` + `MacPortfolio-*.css 69kB / 12kB gzip` → total ~121kB gzip for macOS chunk (budget 150kB), `tsc -b` clean, 0 a11y buttons without name, `prefers-reduced-motion` + `data-mac-motion` respected.

---

## 🖥 macOS — Vardhan OS 2.0 (glass edition)

**Composition** `src/mac/MacPortfolio.tsx` — `ThemeProvider → WindowManagerProvider → PreferencesProvider → ShellProvider → (PaletteProvider → NavProvider → ToastProvider)`. `useShell` (`src/mac/hooks/useShell.tsx`) owns overlays (`launchpad` / `widgets`), the boot gate and desktop-icon visibility; overlays are not windows, so `AppId` is unchanged.

| Surface | File | Notes |
|---|---|---|
| Wallpaper | `components/desktop/Wallpaper.tsx` | 3 hue-driven radial layers (`--wp-h1/2/3` from the accent matrix), SVG grain, rAF pointer parallax (off under reduced motion) |
| Boot / login | `components/boot/BootScreen.tsx` | boot bar → login card; any key/click continues; instant when motion is reduced |
| Desktop icons | `components/desktop/DesktopIcons.tsx` + `hooks/usePointerDrag.ts` | Projects · Finder · Terminal · Resume · GitHub; drag, snap, persist, double-click/tap/Enter to open |
| Widgets | `components/desktop/WidgetsPanel.tsx` | clock button in the menu bar; Esc / outside click closes |
| Launchpad | `components/desktop/Launchpad.tsx` | search, arrow keys, Enter, Esc |
| Covers | `components/ui/ProjectCover.tsx` | `cover` image over a generated gradient; used by Overview, Projects, Finder |
| Glyphs | `components/ui/AppGlyph.tsx` | flat SVG tiles for Dock, Launchpad, desktop icons |

**Legacy phases (1–8)** — window manager, menus, Control Center, Settings, Terminal, Spotlight, Vardhan AI, Developer Mode and Help all remain; see the git history for the original phase table.

### Previous deep dive (8 Phases)

Built at `src/mac/MacPortfolio.tsx:12` — providers `ThemeProvider → WindowManagerProvider → PreferencesProvider → PaletteProvider → NavProvider → ToastProvider`.

| Phase | What shipped | Key files |
|---|---|---|
| 1 Desktop shell | Window manager (drag/resize/double-click maximize, `is-active` accent border, `pointer-events` bg fix, `z` renorm >500), mobile `MENU_H/DOCK_H` bounds | `src/mac/hooks/useWindowManager.tsx:67`, `src/mac/components/window/WindowFrame.tsx:12` |
| 2 Menu bar | Dropdowns Apple/App/File/Edit/View/Window/Help, hover-switch fix, `Window (N)` live count | `src/mac/components/desktop/MenuBar.tsx:28` |
| 3 Control Center | Tiles Wi-Fi/BT/AirDrop/Focus(DND), appearance seg, brightness (`--cc-brightness` filter), volume, auto-hide dock (hotzone sibling), Show Desktop, `mac-preferences` store | `src/mac/hooks/usePreferences.tsx:4`, `src/mac/components/desktop/ControlCenter.tsx:18` |
| 4 Settings | Sidebar 6 sections + accent 6 swatches (`data-accent` matrix light/dark), `accent-border` token, persisted | `src/mac/apps/SettingsApp.tsx:6`, `src/mac/styles/design-system.css:141` |
| 5 Terminal + Spotlight | `about`/`date`/`repo <slug>`/`github`/`linkedin`/`resume` + `open` expansion, Spotlight label-first `fieldScore*10+keyword` + 5 app commands | `src/mac/apps/TerminalApp.tsx:29`, `src/mac/components/command-palette/CommandPalette.tsx:21` |
| 6 Vardhan AI | Intent engine (project/stack/experience/education/contact/VardhanOS) + `[label](app:)` / `mailto:` / external link renderer + `open <app>` navigation | `src/mac/apps/VardhanAIApp.tsx:15` |
| 7 Developer Mode | `devMode` pref → bug chip in menu bar → live inspector (viewport/dpr, windows z/bounds/minimized, prefs JSON, console `error`/`unhandledrejection`, uptime, Reload/Reset) | `src/mac/components/desktop/DevPanel.tsx:1` |
| 8 QA + Help | Help overlay `?` + Help menu (5 sections, respects inputs), mobile bounds fix, full desktop/mobile/resize/palette/contact sweep (0 pageerrors) | `src/mac/components/desktop/HelpOverlay.tsx:1`, `src/mac/hooks/useWindowManager.tsx:35` |

**Shortcuts:** `⌘K` Spotlight · `?` Help · `1`–`7` pages · `⌘M` minimize · drag header / corner resize · double-click maximize · traffic lights · Control Center · `Esc` closes overlays.

**Bundle:** `MacPortfolio-*.js 113kB / 29.9kB gzip` (budget 150kB), `MacPortfolio-*.css 69kB / 12kB gzip` — `tsc -b` clean.

**a11y:** 84 `aria-*`/`role` labels, 0 buttons without name, 0 imgs without alt (audit via Playwright), all dialogs `aria-label`, `aria-live` on AI/terminal, `data-mac-motion="off"` + `prefers-reduced-motion` gate `src/mac/styles/design-system.css:234`, focus rings, keyboard-navigable palette (`↑↓↵`).

**Persistence:** `localStorage` keys `mac-preferences` (accent/dnd/reduceMotion/dockAutoHide/brightness/volume/wifi/bt/airdrop/devMode) + `mac-theme` — verified across reload.

---

## 🎨 Design docs

Each interface has a `DESIGN.md` next to its code: concept, colour tokens (with computed contrast), type scale, layout grid, components with `file:line` references, motion and reduced-motion rules, cursor and shared chrome, accessibility, and rules for future changes.

| Interface | Doc |
|---|---|
| Landing (`/`) | [src/landing/DESIGN.md](src/landing/DESIGN.md) |
| Terminal | [src/terminal/DESIGN.md](src/terminal/DESIGN.md) |
| Classic | [src/classic/DESIGN.md](src/classic/DESIGN.md) |
| Paper | [src/paper/DESIGN.md](src/paper/DESIGN.md) |
| Aurora | [src/aurora/DESIGN.md](src/aurora/DESIGN.md) |
| Forge | [src/forge/DESIGN.md](src/forge/DESIGN.md) |
| macOS | [src/mac/DESIGN.md](src/mac/DESIGN.md) |
| Atlas | [src/atlas/DESIGN.md](src/atlas/DESIGN.md) |

---

## 📁 Structure

```
.
├── public/            # favicon.svg, robots.txt, sitemap.xml, resume/resume.pdf
├── .github/           # workflows/ci.yml (lint → tsc → build → test → smoke), dependabot.yml
├── scripts/           # smoke (every route, headless), layout-audit, mob-check, shortcut-check,
│                      # switcher-click-check, shell-test (terminal), live-check, forge-probe, lib/browser.mjs
├── tests/             # Vitest: data.test.ts (projects/editions/stats), shell.test.ts (terminal engine)
└── src/
    ├── App.tsx        # createBrowserRouter + InterfaceShortcuts(1-7) + RouteSeo + ErrorBoundary + ScrollChrome + CommandPalette + KonamiFX + CursorFX
    ├── landing/       # Landing + EditionStage (stage-frame, mini-skins including macOS)
    ├── terminal/      # CRT shell + work man pages
    ├── classic/       # Classic — data + hooks + lib + styles/classic.css (Starry Night)
    │   ├── data/      # site.ts / projects.ts / experience.ts / skills.ts — source of truth
    │   ├── components/ # Hero, Stats, Work, ProjectDialog, Builds, Process, Experience, Skills, NightSky…
    │   ├── lib/       # frames.ts (screenshots, live embeds), icons, monogram
    │   ├── content.ts # Classic-only wording (featured order, what I built, credits)
    │   ├── useEffects.ts # reveals, tilt and glow, scroll state
    │   └── styles/    # classic.css (tokens, layout, effects)
    ├── paper/         # Paper
    ├── aurora/        # Aurora 2.0 — AuroraSite.tsx + styles/aurora.css (~2.9k lines: toolbar/modal/lab/edu/form)
    ├── forge/         # Forge + EmberField
    ├── atlas/         # Atlas — AtlasSite, terrain (contours), ContourField (WebGL backdrop), useScrollProgress, useLive (GitHub repos + contributions)
    ├── work/          # CaseStudy (/work/:slug) + links helper used by every edition
    ├── mac/           # macOS — premium OS shell (scoped under .mac-root, 8 phases)
    │   ├── components/# Desktop, Dock, MenuBar, ControlCenter, DevPanel, HelpOverlay, WindowFrame, CommandPalette, Toast, Finder/Terminal/AI/Settings apps
    │   ├── hooks/     # useWindowManager, usePreferences (accent/devMode persisted), useTheme, useNav, usePalette, useIstTime
    │   ├── pages/     # overview, projects, experience, skills, achievements, contact, about (via AppContent)
    │   ├── data/      # re-exports classic/data (single source of truth)
    │   └── styles/    # design-system (accent matrix + motion gate) + desktop (help/dev/control) + dock + shell + pages
    ├── components/    # CommandPalette, KonamiFX, ScrollChrome, ErrorBoundary, MotionToggle, LiquidButton, expandable-tabs, ui/CountUp
    ├── interface-switcher/ # magnetic switcher (every page)
    ├── hooks/         # useTilt, useMagnetic, useReveal, useIstTime, useGithub, usePrefersReducedMotion (shared by every edition)
    ├── CursorFX.tsx   # one cursor overlay, a look per edition (cursor-fx.css)
    └── styles/        # motion.css (editions + Aurora 2.0 + view-transitions + scroll-rise)
```

Content in two places:
- `src/classic/data/` — shared truth (identity, `featuredProjects` 12 + `otherProjects` 18, `experience`/`education`/`certifications`, `skillCategories`/`exploring`) used by Landing/Classic/Paper/Aurora/Forge/macOS.
- `src/terminal/data/` — Terminal’s man-page-rich case studies + `how_i_work.sh` + `site` subset reusing `classic/data/site.ts`.

---

## 🚀 Getting Started

```bash
npm install
npm run dev        # http://localhost:5173  (Vite)
npm run build      # tsc -b + vite build + sitemap → dist/
npm run preview    # preview dist/ (use --port 4173 for scripts)
npm run lint       # oxlint — 0 errors baseline
npm test           # vitest — data integrity + terminal shell engine (add --run for one pass)
npm run smoke      # headless Puppeteer over every route (starts its own preview on :4173; needs a build)
```

CI (`.github/workflows/ci.yml`) runs the same five steps — lint, `tsc --noEmit`, build, `npm test -- --run`, `npm run smoke` — on every push and pull request. Puppeteer uses its bundled Chrome; set `PUPPETEER_EXECUTABLE_PATH` to point the scripts at Brave/Chrome instead.

QA (with `npm run preview -- --port 4173` running):

```bash
node scripts/layout-audit.mjs          # 375–1440px overflow
node scripts/mob-check.mjs             # mobile
node scripts/shortcut-check.mjs        # 1-5 + ⌘K
node scripts/switcher-click-check.mjs  # switcher nav
node scripts/shell-test.mjs            # terminal: help/neofetch/cat/cowsay/Tab/history/`
node scripts/live-check.mjs            # hits https://vardhan-v-portfilo.vercel.app
```

---

## ✏️ Customizing Content

Data-driven — edit `src/classic/data/`:

| File | Controls | Example |
|---|---|---|
| `site.ts` | Name, title, `tagline`, `location`, `email`, `github`, `resume` | Used by `Hero`, `AuroraSite`, `CommandPalette` |
| `projects.ts` | `featuredProjects` (problem/features/tech/accent/emoji/highlight/live) + `otherProjects` | `catOf()` `src/aurora/AuroraSite.tsx:22` + `CATEGORY_LABEL` `src/classic/data/projects.ts` |
| `experience.ts` | `experience` (role/company/period/points/accent) + `education` + `certifications` | `Timeline` + `Au-edu` + `Stack Lab` |
| `skills.ts` | `skillCategories` (Languages/Frontend/Backend/DB/AI/Tools) + `exploring` | `labTechs` 28 pills `src/aurora/AuroraSite.tsx:240` |

No component edits for content. Rebuild → push `main` → Vercel deploys.

---

## 📝 Before Launch

1. Drop resume at `public/resume/resume.pdf` (`site.resume: "/resume/resume.pdf"`)
2. Update `og:url`/`canonical` `index.html:14` + `public/sitemap.xml` if domain changes
3. GitHub stats fetch per-session; on 403 they fall back to static — no secret needed

---

## 🔗 Links

- **Live:** https://vardhan-v-portfilo.vercel.app — `/mac` (premium) · `/classic` · `/aurora` (2.0) · `/forge` · `/terminal` · `/paper` · `/atlas` · `/work/extension-ai` (case studies) · `/` picker
- **Vercel aliases:** `portfilo-rho-steel.vercel.app` + `vardhan-v-portfilo-vardhan23vs-projects.vercel.app` (auto on `main` push)
- **GitHub:** https://github.com/vardhan23v — repo `vardhan-v-portfilo` (`main`)
- **LinkedIn:** https://www.linkedin.com/in/vardhan-v23
- **Email:** 23vvardhan@gmail.com

---

© Sree Vardhan V · Designed & built by me; the Atlas edition's layout follows the Forkfolio atlas page, and all code is my own. `src/styles/motion.css:1` power the motion system.
