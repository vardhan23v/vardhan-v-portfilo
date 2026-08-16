<div align="center">

# Vardhan V — Portfolio

**Generative AI Developer & Full-Stack Developer**

<img src="docs/screenshot-hero.png" alt="Portfolio hero — editorial dark layout with build console" width="720" />

[![Live Site](https://img.shields.io/badge/Live%20Site-vardhan--v--portfilo.vercel.app-a8a8b3?style=flat-square&logo=vercel&logoColor=white)](https://vardhan-v-portfilo.vercel.app)
[![GitHub](https://img.shields.io/badge/GitHub-vardhan23v-a8a8b3?style=flat-square&logo=github&logoColor=white)](https://github.com/vardhan23v)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-vardhan--v23-a8a8b3?style=flat-square&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/vardhan-v23)

</div>

A production portfolio designed to feel like it was engineered by someone who cares about
software quality — editorial layout, restrained motion, one accent color, and real
engineering storytelling. **The work speaks louder than the effects.**

## Highlights

- **Hero** — editorial headline with a `build-product` console and a frontend → API → data →
  LLM → product stack strip
- **Selected Work** — five case-study showcases (Extension AI, AI Code Reviewer,
  CareerForge Pro, Vard AI, DisasterMind AI) with asymmetric layouts, system diagrams, and
  Problem / Approach / Technology / Outcome detail rows
- **Case-study pages** — `/work/:slug` with The Problem, The Approach, Architecture,
  Engineering Decisions, Outcome, and What I Learned — grounded in the actual repositories
- **Experience** — factual 2026 timeline (OxCode, FlyRank AI, Zetheta, Zaalima)
- **How I work** — a five-step Understand → Design → Build → Test → Ship process
- **Technologies I work with** — spec-style grouped lists, no percentage bars
- **Open source & experiments** — live GitHub API rows with a static fallback, no stats
  dashboard
- **Contact** — channels plus a mailto-fallback form, no fake backend

## Stack

| Layer | Choice |
| --- | --- |
| Framework | Vite, React 19, TypeScript |
| Routing | react-router-dom (`/work/:slug` case studies) |
| Styling | Hand-written CSS, design tokens, no UI library |
| Animation | IntersectionObserver reveals, 150–300 ms transitions, reduced-motion support |
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
  components/    # one component per section + WorkDetail, Console, WorkDiagram
  hooks/         # useReveal (scroll reveal)
  styles/        # global design system
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