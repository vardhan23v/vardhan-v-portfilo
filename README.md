<div align="center">

# Sree Vardhan V — Portfolio

**Generative AI Developer & Full-Stack Developer**

[![Live Site](https://img.shields.io/badge/Live%20Site-vardhan--v--portfilo.vercel.app-38bdf8?style=for-the-badge&logo=vercel&logoColor=white)](https://vardhan-v-portfilo.vercel.app)
[![GitHub](https://img.shields.io/badge/GitHub-vardhan23v-7c6cff?style=for-the-badge&logo=github&logoColor=white)](https://github.com/vardhan23v)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-vardhan--v23-0a66c2?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/vardhan-v23)

[![Build](https://img.shields.io/badge/build-passing-34d399?style=for-the-badge&logo=githubactions&logoColor=white)](https://github.com/vardhan23v/vardhan-v-portfilo/actions)
[![Vercel](https://img.shields.io/badge/Vercel-Ready-black?style=for-the-badge&logo=vercel&logoColor=white)](https://vardhan-v-portfilo.vercel.app)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-8.2-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![CSS](https://img.shields.io/badge/CSS-663399?style=for-the-badge&logo=css3&logoColor=white)](#-tech-stack)
[![Bundle](https://img.shields.io/badge/bundle-~132kB_JS_+_~37kB_CSS_gzip-7c6cff?style=for-the-badge)](#-tech-stack)
[![Editions](https://img.shields.io/badge/editions-6_(landing_+_5_interfaces)-a78bfa?style=for-the-badge)](#-editions)

[![Aurora 2.0](https://img.shields.io/badge/Aurora-2.0-luminous-22d3ee?style=for-the-badge)](#aurora-20--luminous-interactive)
[![Classic](https://img.shields.io/badge/Classic-cinematic-34d399?style=for-the-badge)](#classic--cinematic)
[![Motion](https://img.shields.io/badge/motion-View_Transitions_+_scroll--driven-38bdf8?style=for-the-badge)](#-tech-stack)

</div>

A production-quality portfolio positioning me as a **Generative AI Developer & Full-Stack Developer** — built around real AI-powered products, not a list of technologies.

> *I build with AI. I ship with code.*

<div align="center">

**[Live: vardhan-v-portfilo.vercel.app](https://vardhan-v-portfilo.vercel.app) · [GitHub: vardhan23v](https://github.com/vardhan23v) · [LinkedIn](https://www.linkedin.com/in/vardhan-v23) · [Email: 23vvardhan@gmail.com](mailto:23vvardhan@gmail.com)**

</div>

---

## 🆕 What’s New — Sep 15 2026 · Vardhan OS 2.0 “glass edition”

The macOS interface was rebuilt from the visual layer up: a **dark-glass OS with editorial typography** (Fraunces display serif, Inter UI, JetBrains Mono details) that is deliberately not a stock-macOS clone. The engine — window manager, preferences, theme, Spotlight, toasts — is unchanged.

- **New surfaces** — boot → login screen (`sessionStorage mac-booted`, `?noboot=1` bypass, replay from Settings → Desktop), draggable **desktop icons** (positions in `localStorage mac-desktop-icons`, snap to a 96px grid), a **Widgets panel** behind the menu-bar clock (IST clock, GitHub stats, status, links), full-screen **Launchpad** (Dock item · View menu · Spotlight), and **project covers** (`Project.cover` / `Project.screenshots`, generated gradient fallback via `src/mac/components/ui/ProjectCover.tsx`).
- **Design system** — 7 stylesheets replace 15: `tokens` (glass/elevation/z/accent matrix that also steers the wallpaper hues) · `shell` · `window` · `components` · `pages` · `apps` · `responsive`, all under `src/mac/styles/`. Flat editorial app tiles via `src/mac/components/ui/AppGlyph.tsx`.
- **Pages** — Overview masthead + lead cover + ledger, Projects gallery with a right-side quick-view drawer and screenshot strip, Experience/Education ledgers, Skills type-specimen cards, numbered certification plates, About essay with drop cap, Contact with a display-size mailto. Finder gained icon/list views and a preview pane.
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
| **Classic** `src/classic/ClassicSite.tsx:1` + `src/classic/styles/animations.css:1` | Cinematic | Top scroll-progress gradient bar, nav slide-down + logo pulse, hero stagger (`classicHeroIn` 0.1→0.52s) + 3D terminal entrance + `useClassicHeroFX` parallax (rAF, `y/700` fade), neural glow pulse, project filter shine + card tech-pop, timeline dot enter, skill wave, `Hero::after` scroll hint `classicScrollHint` |

All respect `prefers-reduced-motion`, use `viewTransition` crossfades, and ship via Vercel auto-deploy on `main`.

---

## ✨ Editions

The site opens on a **landing page with a live edition picker** — a browser-frame preview that cycles through every interface, with keyboard arrows, segment navigation and one-click entry. Switch anytime via the magnetic interface switcher, `1`–`6` keys, or `⌘K` — all with **View Transitions API** crossfade (progressive, reduced-motion safe).

| Route | Edition | Tone | Signature |
|---|---|---|---|
| `/` | **Landing** | Picker | Crossfading mini-skins stage (Terminal/Classic/Paper/Aurora/Forge/macOS), GitHub stats, two-column hero (`/editions` is an alias) |
| `/terminal` | **Terminal** | Retro CRT | Boot seq, shell `help` / `whoami` / `cat skills.tree` / `neofetch` / `cowsay` / `ping`, `↑↓` history + Tab + `` ` `` focus, work at `/terminal/work/:slug` |
| `/classic` | **Classic** — *cinematic* | Original dark | Stagger hero, neural SVG draw-in, IST clock, parallax floaters, CLI `find ./projects` with highlight + `/` focus, **scroll progress**, GitHub stats, sticky project grid |
| `/paper` | **Paper** | Light editorial | Fraunces serifs, overlines, hairline rules, quiet readable |
| `/aurora` | **Aurora 2.0** — *luminous* | Glassmorphism | Frosted glass + drifting blobs + gradient text **plus** searchable/sortable work, quick-view modal, Stack Lab, expandable log, education/certs, mouse aura |
| `/forge` | **Forge** | Editorial dark | Kanit headlines, build pipeline pulse + hover trace, marquee, cached GitHub stats, sticky problem→solution cards |
| `/mac` | **macOS** — *premium OS* | App shell | Spotlight `⌘K` (label-first ranking) + traffic lights + Control Center + Settings (accent/motion/dock/network) + Terminal + Vardhan AI + Developer Mode inspector + Help `?` — see macOS deep dive below |

---

## ⌘K Command Palette & Easter Eggs

- **⌘/Ctrl+K palette** `src/components/CommandPalette.tsx:1` — fuzzy subsequence (`prty` → Party), recents pinned in `localStorage`, copy email / copy link with “Copied ✓”, Surprise me random, quick links
- **Konami** `↑↑↓↓←→←→BA` → `src/components/KonamiFX.tsx:1` canvas confetti burst in accent colors + toast (also via Party mode)
- **Scroll-driven reveals** — pure-CSS `animation-timeline: view()` `scroll-rise` `src/styles/motion.css:465` on cards/stats, zero JS, view-timeline fallbacks

---

## 🌟 Highlights

- **9 featured projects** — Extension AI (flagship), AI Code Reviewer, CareerForge Pro, Vard AI, DisasterMind AI, DriveNest, HPL Auction, Apex Retail ERP, Dayflow HRMS — each with *problem → features → AI engine (Gemini/Claude/Groq/MCP) → stack → GitHub/Live*
- **macOS OS shell** — window manager + Control Center + Settings (accent 6 swatches / theme / motion) + Terminal (`about`/`date`/`repo`) + Spotlight ranking fix + Vardhan AI links + Developer Mode inspector + Help `?` + mobile bounds fix + persisted prefs + a11y (0 buttons without name, `aria-label` on dialogs, `data-mac-motion`) `src/mac/MacPortfolio.tsx:1` — `MacPortfolio-*.js 113kB / 29.9kB gzip` (budget 150kB) + `MacPortfolio-*.css 69kB / 12kB gzip`
- **Aurora 2.0 discovery** — search across name/tagline/tech/slug, sort, view toggle, highlight pills, empty state, modal body with `problem | features•bullet | tech chips` `src/aurora/AuroraSite.tsx:62`
- **Classic cinematic** — `ClassicScrollProgress` `src/classic/ClassicSite.tsx:14`, `classicNavIn`/`classicHeroName`/`classicTerminalIn` `src/classic/styles/animations.css:9`, hero parallax `useClassicHeroFX` `src/classic/components/Hero.tsx:56`, filter `::after` shine, timeline `classicDotEnter`
- **“Other things”** — 13 compact cards + GitHub CTA
- **Experience** — OxCode, FlyRank AI, Zetheta, Zaalima — now expandable in Aurora, slide-in in Classic
- **Tech stack** — honest grouped categories (Languages / Frontend / Backend / Databases / AI-LLM / Cloud & Tools) with glyphs `src/classic/components/Skills.tsx:7`, no % bars; **Stack Lab** makes them interactive in Aurora
- **Live GitHub stats** — followers/repos (session-cached, static fallback) `src/classic/components/GithubSection.tsx:33`, count-up via `requestAnimationFrame`
- **SEO & a11y** — per-route `ROUTE_SEO` `src/App.tsx:20`, OG/Twitter/canonical `index.html:14`, `sitemap.xml`/`robots.txt`, skip-link `src/classic/styles/global.css:341`, focus rings, `prefers-reduced-motion` everywhere
- **QA** — Puppeteer scripts: `layout-audit` (375–1440px overflow), `mob-check`, `shortcut-check`, `switcher-click-check`, `shell-test` (see Scripts)

---

## 🛠 Tech Stack

| Layer | Tools | Notes |
|---|---|---|
| Framework | **Vite 8.2** + **React 19.2** + **TypeScript 6** + `react-router-dom 7` `viewTransition` | `src/App.tsx:90` number-key + `ScrollToTop` + `RouteSeo` |
| Styling | **Hand-written CSS per edition** — tokens (`--bg`, `--accent`, `--surface`) `src/classic/styles/global.css:1`, `src/aurora/styles/aurora.css:5`, `src/classic/styles/animations.css:1` | Zero UI lib; Tailwind via `@tailwindcss/vite` for utilities only |
| Animation | View Transitions, `animation-timeline: view()` + `IntersectionObserver` `useReveal` `src/classic/hooks/useReveal.tsx:1`, `useTilt`/`useMagnetic`, `Aurora 2.0` modal/toolbar/lab + `Classic` parallax/scroll-progress/cinematic `src/styles/motion.css:1` | All `prefers-reduced-motion: reduce` safe |
| Icons | `lucide-react` + custom `Icon` `src/classic/lib/icons.tsx:1` (20+ glyphs) | No huge icon packs |
| Data | GitHub REST (live stats, session cache) | Fallback `30 followers`/`39 repos` |
| QA | `puppeteer-core` + `oxlint` | `npm run lint` — 5 warnings / 0 errors baseline |
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

## 📁 Structure

```
.
├── public/            # favicon.svg, robots.txt, sitemap.xml, resume/resume.pdf
├── scripts/           # layout-audit, mob-check, shortcut-check, switcher-click-check,
│                      # shell-test (terminal), live-check, forge-probe
└── src/
    ├── App.tsx        # BrowserRouter + InterfaceShortcuts(1-6) + RouteSeo + ScrollChrome + CommandPalette + KonamiFX
    ├── landing/       # Landing + EditionStage (stage-frame, mini-skins including macOS)
    ├── terminal/      # CRT shell + work man pages
    ├── classic/       # Classic — data + hooks + lib + styles/animations.css (cinematic)
    │   ├── data/      # site.ts / projects.ts / experience.ts / skills.ts — source of truth
    │   ├── hooks/     # useReveal.tsx
    │   └── styles/    # global.css + animations.css (Sep 13 hero/scroll/timeline/skill)
    ├── paper/         # Paper
    ├── aurora/        # Aurora 2.0 — AuroraSite.tsx + styles/aurora.css (2.4k lines: toolbar/modal/lab/edu/form)
    ├── forge/         # Forge + EmberField
    ├── mac/           # macOS — premium OS shell (scoped under .mac-root, 8 phases)
    │   ├── components/# Desktop, Dock, MenuBar, ControlCenter, DevPanel, HelpOverlay, WindowFrame, CommandPalette, Toast, Finder/Terminal/AI/Settings apps
    │   ├── hooks/     # useWindowManager, usePreferences (accent/devMode persisted), useTheme, useNav, usePalette, useIstTime
    │   ├── pages/     # overview, projects, experience, skills, achievements, contact, about (via AppContent)
    │   ├── data/      # re-exports classic/data (single source of truth)
    │   └── styles/    # design-system (accent matrix + motion gate) + desktop (help/dev/control) + dock + shell + pages
    ├── components/    # CommandPalette, KonamiFX, ScrollChrome, LiquidButton, expandable-tabs, ScrollChrome
    ├── interface-switcher/ # magnetic switcher (every page)
    ├── hooks/         # useTilt, useMagnetic, useReveal
    └── styles/        # motion.css (6 editions + Aurora 2.0 + Classic cinematic + view-transitions + scroll-rise)
```

Content in two places:
- `src/classic/data/` — shared truth (identity, `featuredProjects` 9 + `otherProjects` 13, `experience`/`education`/`certifications`, `skillCategories`/`exploring`) used by Landing/Classic/Paper/Aurora/Forge/macOS.
- `src/terminal/data/` — Terminal’s man-page-rich case studies + `how_i_work.sh` + `site` subset reusing `classic/data/site.ts`.

---

## 🚀 Getting Started

```bash
npm install
npm run dev        # http://localhost:5173  (Vite)
npm run build      # tsc -b + vite build → dist/  — 103 modules
npm run preview    # preview dist/ (use --port 4173 for scripts)
npm run lint       # oxlint — 5 warnings, 0 errors baseline
```

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
| `projects.ts` | `featuredProjects` (problem/features/tech/accent/emoji/highlight/live) + `otherProjects` | `catOf()` `src/aurora/AuroraSite.tsx:22` + `CATEGORY` `src/classic/components/Projects.tsx:11` |
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

- **Live:** https://vardhan-v-portfilo.vercel.app — `/mac` (premium) · `/classic` · `/aurora` (2.0) · `/forge` · `/terminal` · `/paper` · `/` picker
- **Vercel aliases:** `portfilo-rho-steel.vercel.app` + `vardhan-v-portfilo-vardhan23vs-projects.vercel.app` (auto on `main` push)
- **GitHub:** https://github.com/vardhan23v — repo `vardhan-v-portfilo` `main` `a00ec01` (macOS premium polish)
- **LinkedIn:** https://www.linkedin.com/in/vardhan-v23
- **Email:** 23vvardhan@gmail.com

---

© Sree Vardhan V · Designed & built by me — no template involved. `src/styles/motion.css:1` + `src/classic/styles/animations.css:1` power the motion system.
