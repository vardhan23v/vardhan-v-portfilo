# Sree Vardhan V — Portfolio

Production portfolio for **Sree Vardhan V**, positioned as a **Generative AI Developer & Full-Stack Developer**.

Built with **Vite + React + TypeScript**, zero UI libraries, and hand-written CSS with a dark
blue/purple design system. Deploys as static assets — works perfectly on Vercel/Netlify/GitHub
Pages.

## Stack

- Vite 8 + React 19 + TypeScript
- Vanilla CSS with design tokens (no Tailwind, no UI kit)
- IntersectionObserver-based scroll reveals (no animation library)
- GitHub REST API for the "Building in Public" section (graceful static fallback if it fails)

## Run locally

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # production build → dist/
npm run preview    # preview the production build
```

## Structure

```
src/
  data/        # all content (projects, experience, skills, education, certifications)
  components/  # one component per section + Navbar, Footer, Terminal
  hooks/       # useReveal (scroll reveal)
  lib/         # inline SVG icon set (zero deps)
  styles/      # global design system
public/
  favicon.svg, robots.txt, sitemap.xml
```

To edit content (projects, jobs, skills), edit the files in `src/data/` — everything on the
site is data-driven.

## Before deploying

1. **Resume** — drop your resume at `public/resume/resume.pdf` (all "Download Resume" /
   "Resume" buttons point there).
2. **Custom domain** — update `og:url` and `sitemap.xml` (currently `https://vardhan23v.dev/`)
   if you use a different domain.
3. **GitHub section** — fetches live data from the GitHub API (no token needed). If the API
   is rate-limited it falls back to a static snapshot of the top repos.

## Deploy

```bash
npm run build
vercel --prod     # or: netlify deploy --prod
```