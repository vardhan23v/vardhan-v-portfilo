<div align="center">

# Sree Vardhan V — Portfolio

**Generative AI Developer & Full-Stack Developer**

[![Live Site](https://img.shields.io/badge/Live%20Site-vardhan--v--portfilo.vercel.app-38bdf8?style=flat-square&logo=vercel&logoColor=white)](https://vardhan-v-portfilo.vercel.app)
[![GitHub](https://img.shields.io/badge/GitHub-vardhan23v-7c6cff?style=flat-square&logo=github&logoColor=white)](https://github.com/vardhan23v)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-vardhan--v23-0a66c2?style=flat-square&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/vardhan-v23)

</div>

A production-quality portfolio positioning me as a **Generative AI Developer &
Full-Stack Developer** — built around real AI-powered products, not a list of
technologies.

> *I build with AI. I ship with code.*

## ✨ Editions

The site opens on a **landing page with a live edition picker** — a browser-frame
preview that cycles through every interface, with keyboard arrows, segment
navigation and one-click entry:

- **`/` — Landing** — edition picker stage (crossfading mini-skins), live GitHub
  stats, and a two-column hero
- **`/terminal` — Terminal edition** — retro CRT/hacker theme: boot sequence,
  interactive command shell with ↑/↓ history, Tab completion and a `` ` ``
  global focus shortcut (`help`, `whoami`, `ls`, `cat about.txt`,
  `cat skills.tree`, `neofetch`, `cowsay`, `ping`…), work as `ls -l ./work/`,
  experience as a log, case studies as man pages at `/terminal/work/:slug`
- **`/classic` — Classic edition** — the original design: hero typewriter,
  neural-network SVG draw-in, an IST nav clock, a CLI `find ./projects` search
  over the project grid with match highlighting and a `/` shortcut, GitHub stats,
  skills, education timeline and contact
- **`/paper` — Paper edition** — light editorial: Fraunces serif headlines,
  magazine overlines, hairline rules, quiet and readable
- **`/aurora` — Aurora edition** — glassmorphism: frosted panels, drifting
  pastel aurora blobs, gradient text, live GitHub follower count-up, premium and
  luminous
- **`/forge` — Forge edition** — editorial dark: Kanit headlines, a live build
  pipeline visual with a flowing light pulse and hover-trace, drifting marquee,
  live GitHub stats strip (session-cached), stacked sticky project cards, and
  project cards that communicate problem → solution → tech → impact

Switch between editions from any page via the interface switcher.

## ✨ Highlights

- **6 featured projects** — Extension AI, AI Code Reviewer, CareerForge Pro,
  Vard AI, DisasterMind AI, DriveNest — each presented with the problem it solves,
  key features, AI engine (Gemini / Claude / Groq / MCP where actually used),
  tech stack, GitHub + live demo links
- **"Other things I've built"** — 10 more projects in a compact grid
- **Experience timeline** — OxCode, FlyRank AI, Zetheta Algorithms, Zaalima Development
- **Tech stack** — grouped categories with honest context, no fake percentage bars
- **Live GitHub stats** — followers/repos via the GitHub REST API with a graceful
  static fallback and per-session caching
- **SEO & a11y** — Open Graph/Twitter meta, canonical, per-route titles, sitemap,
  robots.txt, semantic HTML, visible focus states, `prefers-reduced-motion` support
- **QA tooling** — headless browser checks for layout overflow, mobile, keyboard
  shortcuts, switcher navigation and the terminal shell

## 🛠 Tech Stack

| Layer | Tools |
| --- | --- |
| Framework | Vite, React 19, TypeScript |
| Styling | Hand-written CSS with per-edition design tokens (zero UI libraries) |
| Animation | IntersectionObserver scroll reveals, pure CSS keyframes |
| Data | GitHub REST API (live stats, session-cached) |
| QA | Puppeteer-core headless check scripts |
| Deployment | Vercel (auto-deploy on push) |

~123 kB JS / ~30 kB CSS gzipped — no icon libraries, no animation frameworks, no
bloated deps.

## 📁 Structure

```
.
├── public/            # favicon, robots.txt, sitemap.xml, resume/ (drop resume.pdf here)
├── scripts/           # QA checks: layout-audit, mob-check, shell-test, shortcut-check,
│                      # switcher-click-check, live-check, forge-probe …
└── src/
    ├── App.tsx        # router + keyboard edition switching (⌘/Ctrl+K palette)
    ├── landing/       # Landing + EditionStage picker
    ├── terminal/      # Terminal edition (shell, work detail man pages)
    ├── classic/       # Classic edition (+ shared data, hooks, lib)
    ├── paper/         # Paper edition
    ├── aurora/        # Aurora edition
    ├── forge/         # Forge edition
    ├── components/    # shared UI (LiquidButton/MetalButton, expandable tabs)
    ├── interface-switcher/  # edition switcher shown on every page
    └── hooks/         # shared hooks
```

Content lives in two places:
- `src/classic/data/` — the shared source of truth for identity, projects, experience, skills, and certifications, used by Landing, Classic, Paper, Aurora, and Forge.
- `src/terminal/data/` — the Terminal edition keeps its own case-study-rich data (man-page-style project entries, `how_i_work.sh` process stages) plus a small site profile that reuses the shared identity fields from `src/classic/data/site.ts`.

## 🚀 Getting Started

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # type-check + production build → dist/
npm run preview    # preview the production build
npm run lint       # oxlint (5 warnings, 0 errors baseline)
```

QA checks (start `npm run preview -- --port 4173` first, then):

```bash
node scripts/layout-audit.mjs       # horizontal overflow at 375–1440px
node scripts/mob-check.mjs          # mobile layout
node scripts/shortcut-check.mjs     # keyboard shortcuts
node scripts/switcher-click-check.mjs  # interface switcher navigation
node scripts/shell-test.mjs         # terminal shell commands
node scripts/live-check.mjs         # checks the deployed production site
```

## ✏️ Customizing Content

Everything on the site is **data-driven** — edit the files in `src/classic/data/`:

| File | What it controls |
| --- | --- |
| `site.ts` | Name, title, links, resume path |
| `projects.ts` | Featured + other projects (problem, features, tech, AI models) |
| `experience.ts` | Experience, education, certifications |
| `skills.ts` | Tech stack categories + "Currently Exploring" |

No component changes needed for content. Rebuild and push — Vercel deploys
automatically.

## 📝 Before Launch

1. Drop your resume at `public/resume/resume.pdf`
2. Update `og:url` / `canonical` and `sitemap.xml` if you change domains
3. Live GitHub stats fetch the API per session; if rate-limited they fall back to
   a static snapshot

## 🔗 Links

- **Live:** https://vardhan-v-portfilo.vercel.app
- **GitHub:** https://github.com/vardhan23v
- **LinkedIn:** https://www.linkedin.com/in/vardhan-v23
- **Email:** 23vvardhan@gmail.com

---

© Sree Vardhan V · Designed & built by me — no template involved.