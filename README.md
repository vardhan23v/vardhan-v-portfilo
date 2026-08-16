<div align="center">

# Vardhan V — Portfolio

**Generative AI Developer & Full-Stack Developer**

<img src="docs/screenshot-hero.png" alt="Portfolio hero — CRT terminal with interactive shell" width="720" />

[![Live Site](https://img.shields.io/badge/Live%20Site-vardhan--v--portfilo.vercel.app-a8a8b3?style=flat-square&logo=vercel&logoColor=white)](https://vardhan-v-portfilo.vercel.app)
[![GitHub](https://img.shields.io/badge/GitHub-vardhan23v-a8a8b3?style=flat-square&logo=github&logoColor=white)](https://github.com/vardhan23v)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-vardhan--v23-a8a8b3?style=flat-square&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/vardhan-v23)

</div>

A portfolio that behaves like a terminal because it was built by someone who lives in one.
CRT boot screen, phosphor-green on near-black, scanlines, a real interactive command shell,
and case studies rendered as man pages. **No template. No glassmorphism. Just a shell.**

## Highlights

- **CRT boot sequence** — power-on log lines, skippable, plays once per session
- **Interactive terminal** — type `help`, `whoami`, `ls`, `work`, `cat about.txt`,
  `uptime`, `clear`… it runs, scrolls to sections, and never takes itself too seriously
- **Selected Work** — `ls -l ./work/` listing of five case studies (Extension AI,
  AI Code Reviewer, CareerForge Pro, Vard AI, DisasterMind AI) with LIVE/SOURCE badges
- **Case-study pages** — `/work/:slug` rendered as `vim README.md`-style man pages:
  the_problem, the_approach, architecture tree, engineering_decisions as commits,
  outcome, what_i_learned
- **Experience** — `tail -f ~/experience.log` — factual 2026 timeline (OxCode,
  FlyRank AI, Zetheta, Zaalima) plus education and certs
- **How I work** — a five-stage shell pipeline: understand | design | build | test | ship
- **Technologies** — `tree ~/skills` filesystem tree, no percentage bars
- **Open source** — `git remote -v` listing from the live GitHub API with static fallback
- **Contact** — a `sendmail`-style mail session that opens your mail client
- **Footer** — live uptime counter, UTC clock, `exit status: 0`

## Stack

| Layer | Choice |
| --- | --- |
| Framework | Vite, React 19, TypeScript |
| Routing | react-router-dom (`/work/:slug` case studies) |
| Styling | Hand-written CSS — CRT scanlines, phosphor palette, no UI library |
| Animation | Boot sequence, scroll reveals, animated cursor; reduced-motion support |
| Data | GitHub REST API with graceful static fallback |
| Deployment | Vercel (auto-deploy on push, SPA rewrite in `vercel.json`) |

## Local development

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # typecheck + production build → dist/
npm run preview    # serve the production build
```

## Project structure

```
public/          # favicon, robots.txt, sitemap.xml, resume/ (add resume.pdf), work/ screenshots
src/
  data/          # ALL content — case studies, experience, tech, repos
  components/    # one component per section + WorkDetail, Hero (interactive shell), Boot
  hooks/         # useReveal (scroll reveal)
  styles/        # terminal design system (CRT, windows, prompts)
vercel.json      # SPA rewrite for case-study routes
```

## Editing content

Everything is data-driven — edit `src/data/` and rebuild:

- `src/data/work.ts` — case studies + "also built"
- `src/data/experience.ts` — experience, education, certifications, process
- `src/data/tech.ts` — technology groups + GitHub fallback repos
- `src/data/site.ts` — name, links, resume path

## Before launch

1. Add your resume at `public/resume/resume.pdf`
2. Point `og:url` at your domain if you change it

## Links

- **Live:** https://vardhan-v-portfilo.vercel.app
- **GitHub:** https://github.com/vardhan23v
- **LinkedIn:** https://www.linkedin.com/in/vardhan-v23
- **Email:** 23vvardhan@gmail.com

---

© Vardhan V · Built with React + TypeScript