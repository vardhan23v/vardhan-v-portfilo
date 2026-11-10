# Forge — design

> A dark editorial portfolio for builders: problem → solution case cards, an interactive build-pipeline panel and ember particles, with a "stoke the forge" mode that turns the cyan palette orange. Route: `/forge`. Main files: `src/forge/ForgeSite.tsx`, `src/forge/EmberField.tsx`, `src/forge/styles/forge.css`.

## Concept and audience

- Edition 05 in `src/editions.ts:33-35`: role "for builders", blurb "Dark editorial — problem → solution case cards and a build-pipeline view of each project".
- The page reads like a product spec. Each project card leads with its tagline, then a labelled `problem` line, features, an `ai engine` line and the tech list (`src/forge/ForgeSite.tsx:799-825`). The back of each card is a spec sheet (`src/forge/ForgeSite.tsx:741-785`).
- The hero pairs the headline "Where code meets intelligence." with a five-stage build pipeline (Frontend → API → Database → LLM → Product) that the visitor can run (`src/forge/ForgeSite.tsx:425-551`).
- All content comes from the shared Classic data modules (`src/forge/ForgeSite.tsx:17-22`): `featuredProjects`, `experience`, `skillCategories`, `site`, `github`, `aiStack`. Forge only adds presentation copy (ledes, section names, stack captions).
- Section order (`src/forge/ForgeSite.tsx:1049-1061`): nav, hero, stats strip, marquee, 01 Selected Work, 02 Stack, 03 Experience, 04 About, 05 Contact, 06 Other interfaces, footer.

## Colour

All tokens live on `.forge-root` (`src/forge/styles/forge.css:6-20`). Stoked mode overrides the four accent tokens (`src/forge/styles/forge.css:2205-2210`), switched on by `data-stoked="1"` on the root (`src/forge/ForgeSite.tsx:1044`).

| Token or selector | Value | Role |
| --- | --- | --- |
| `--fg-bg` | `#0c0c0c` | Page background; timeline number fill |
| `--fg-card` | `#0e0e10` | Project cards, interface cards, card back face |
| `.fg-proj-card:hover` background | `#101014` | Card hover surface (`forge.css:1184`) |
| `--fg-text` | `#d7e2ea` | Body text, headings' base colour |
| `--fg-muted` | `rgba(215, 226, 234, 0.65)` | Secondary copy, nav links, descriptions |
| `--fg-faint` | `rgba(215, 226, 234, 0.55)` | Indices, labels, footers of panels |
| `--fg-line` | `rgba(215, 226, 234, 0.13)` | Hairline borders |
| `--fg-line-2` | `rgba(215, 226, 234, 0.22)` | Stronger borders (buttons, timeline numbers) |
| `--fg-cyan` | `#7dd3fc` | Primary accent: eyebrows, focus ring, active filter, dots |
| `--fg-blue` | `#93c5fd` | Secondary accent |
| `--fg-violet` | `#a78bfa` | Heat-bar gradient, background glow |
| `--fg-purple` | `#c4b5fd` | Secondary accent |
| `[data-stoked]` `--fg-cyan` / `--fg-blue` / `--fg-violet` / `--fg-purple` | `#fb923c` / `#fbbf24` / `#f97316` / `#fdba74` | Stoked palette |
| `::selection` | `rgba(125, 211, 252, 0.28)`; stoked `rgba(251, 146, 60, 0.3)` | Text selection (`forge.css:32-34`, `2211-2213`) |
| Heading gradient | `#646973 → #9fb0bd → #eaf2f9 → #9fb0bd → #646973` at 110deg | Chrome text on `.hero-heading`, `.fg-hero-heading` and each `.fg-h-word` (`forge.css:129-145`, `1776-1790`) |
| `.fg-filter.is-active` text | `#0b0b0d` on `--fg-cyan` | Selected work filter (`forge.css:1842-1846`) |
| `.fg-pipe-row.is-done .fg-pipe-idx`, `.is-passed` status | `#86efac` | Build "ok" / "passed ✓" green (`forge.css:1941-1946`) |
| Nav heat bar | `--fg-cyan → --fg-violet 70% → #f472b6` | Scroll progress under the nav (`forge.css:1878-1889`) |
| Pipeline stage colours (`--pc`) | `#7DD3FC`, `#93C5FD`, `#A78BFA`, `#C4B5FD`, `#BBCCD7` | Frontend, API, Database, LLM, Product (`ForgeSite.tsx:455-461`) |
| Stack card hues (`--hc`) | `#7dd3fc`, `#93c5fd`, `#a78bfa`, `#67e8f9`, `#c4b5fd`, `#86efac` | One per stack group (`ForgeSite.tsx:73`) |
| `--pa1` | the project's `accent[0]` from data | Card border, glow, badge, category, feature bullets (`ForgeSite.tsx:738`) |

Contrast (WCAG 2 relative luminance, alpha tokens composited over `#0c0c0c`):

| Pair | Ratio |
| --- | --- |
| `--fg-text` on `--fg-bg` | 14.86:1 |
| `--fg-muted` on `--fg-bg` | 6.61:1 (6.60:1 on `--fg-card`) |
| `--fg-faint` on `--fg-bg` | 5.02:1 (4.95:1 on `--fg-card`) |
| `--fg-cyan` on `--fg-bg` | 11.73:1 |
| stoked `#fb923c` on `--fg-bg` | 8.64:1 |
| `#0b0b0d` on `#7dd3fc` (active filter) | 11.79:1; on stoked `#fb923c` 8.69:1 |

`--fg-faint` is used for 10–11px mono labels (indices, `fg-pipe-foot`, `fg-stat-label`, `fg-proj-label`); it was raised from 0.46 alpha (3.79:1) so these labels pass 4.5:1.

## Typography

- Kanit 300, 400, 500, 600 (latin and latin-ext) are imported by the edition itself (`src/forge/ForgeSite.tsx:1-8`). JetBrains Mono 400, 500, 700 is loaded site-wide (`src/main.tsx:5-10`).
- `--fg-sans`: `"Kanit", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`. `--fg-mono`: `"JetBrains Mono", ui-monospace, SFMono-Regular, monospace` (`forge.css:18-19`).
- Root body: Kanit 300, line-height 1.6, antialiased (`forge.css:25-28`). Mono is used for every label, chip, button, nav link and number; Kanit for headings and prose.

| Size | Weight / family | Where |
| --- | --- | --- |
| `clamp(2.75rem, 6.5vw, 6.25rem)` | 600 Kanit, line-height 1.02 | Hero `h1` `.fg-hero-heading` (`forge.css:426-432`) |
| `clamp(2.5rem, 6vw, 5rem)` | 500 Kanit, line-height 1.05 | Section `h2` `.fg-heading` (`forge.css:152-158`) |
| `clamp(1.8rem, 3.6vw, 3.6rem)` | 600 | Featured project title (`forge.css:1138-1141`) |
| `clamp(1.5rem, 3vw, 3rem)` | 500 | Project title (`forge.css:1258-1264`) |
| `clamp(1.4rem, 2.4vw, 2rem)` | inherits | Spec-sheet title (`forge.css:2095-2097`) |
| `clamp(17px, 2vw, 21px)` | 400 | Rotating hero lede (`forge.css:442-447`) |
| 26px | mono, tabular-nums | Stat values (`forge.css:714-721`) |
| 21px | 500 | Timeline role `h3` (`forge.css:1051-1056`) |
| 20px | 300 (first paragraph 400) | About prose (`forge.css:822-831`) |
| 18px | 300 | `.fg-subhead` (`forge.css:165-171`) |
| 17px | 300 / 500 | Hero description (`forge.css:449`); interface card name (`forge.css:1448`) |
| `clamp(16px, 1.6vw, 19px)` | 300 | Project tagline (`forge.css:1266-1272`) |
| 15px | 300–500 | Nav name, stack card `h3` (uppercase), problem line, timeline bullets |
| 14.5px | mono | Pipeline stage name (`forge.css:648-652`) |
| 13–13.5px | 300 | Filter chips, feature bullets, About meta values |
| 12–12.5px | mono, uppercase, 0.1em | Buttons (`.fg-btn`), hero eyebrow, project links, marquee items |
| 10–11.5px | mono, uppercase, 0.12–0.22em | Nav links, section eyebrows, chips, labels, pipe meta, keys hint |

## Layout and spacing

- `.forge-main`: `max-width: 1280px`, centred, side padding `clamp(20px, 4vw, 40px)` (`forge.css:95-103`). The footer repeats the same width and padding (`forge.css:1487-1502`).
- Sections: `padding: 120px 0`, `scroll-margin-top: 96px` (`forge.css:160-163`); 92px at ≤1024px, 76px at ≤520px.
- Nav: sticky at `top: 0`, `z-index: 30`, flex space-between, 14px vertical padding, `rgba(12, 12, 12, 0.72)` with 18px blur (`forge.css:292-306`).
- Hero: grid `1.08fr 0.92fr`, `min-height: calc(100svh - 64px)`, gap `clamp(40px, 6vw, 88px)` (`forge.css:401-408`). The pipeline panel sits in a `perspective: 1100px` wrapper (`forge.css:1736-1743`).
- Selected Work is a sticky card stack: each `.fg-proj-wrap` sticks at `top: calc(84px + var(--i) * 44px)`, overlaps the next by `margin-bottom: -22vh` and scales by `1 - i * 0.014` (`forge.css:1108-1119`). The stack ends with `padding-bottom: 26vh` (`forge.css:1103-1106`).
- Radii: `--fg-radius` 36px for project and interface cards (28px at ≤520px), pipeline 24px, stack cards 22px, stats strip 20px, meta cells 18px, chips and buttons 999px.
- Grids: stats 4 columns; stack 3; About meta 5; interfaces 4 (max 900px); project features 2; spec rows `110px 1fr`.
- Breakpoints that exist in the CSS:
  - `max-width: 1024px` — hero stacks to one column, pipeline max 560px, meta 3 columns, stack 2, stats 2, interfaces 2 (`forge.css:1525-1565`).
  - `max-width: 760px` — inline nav links and the interface switcher hide; the hamburger `.fg-menu` and a drop-down `.fg-nav-panel` take over (`forge.css:1567-1618`).
  - `max-width: 560px` — spec-sheet rows go single column (`forge.css:2130-2135`).
  - `max-width: 520px` — interfaces, stack and features go single column, meta 2, the sticky overlap is removed (`margin-bottom: 0`), card header stacks (`forge.css:1620-1662`).
  - `pointer: coarse` — the cursor glow and the `j / k / f` hint are hidden (`forge.css:1993-1997`, `2163-2167`).

## Components

- `ForgeNav` — name link, section links with scroll-spy, GitHub link, `InterfaceSwitcher`, hamburger and mobile panel; writes `--sp` for the heat bar (`src/forge/ForgeSite.tsx:279-352`). Scroll-spy: `src/forge/ForgeSite.tsx:235-257`.
- `Hero` — eyebrow, name, gradient `h1`, rotating lede (`useLede`, 4200ms, `src/forge/ForgeSite.tsx:138-146`), CTAs (`LiquidButton` + `.fg-btn` with `Sparks`), context chips and the stoke toggle (`src/forge/ForgeSite.tsx:425-506`).
- Build pipeline panel — five rows with hover-trace (rows at or after the hovered one highlight, earlier ones dim), "run build ▶" button that steps each row queued → running → ok every 520ms, a build counter, a "passed ✓" flash for 2400ms, the typing `BuildLog` and an uptime clock (`src/forge/ForgeSite.tsx:428-453`, `507-548`, `367-408`, `354-365`). The panel tilts up to 5deg via `useTilt` (`src/forge/ForgeSite.tsx:454`).
- `EmberField` — canvas of rising particles behind the hero (`src/forge/EmberField.tsx:21-116`).
- `StatsStrip` / `Stat` — four counters that count up over 900ms (ease-out cubic) when 40% visible; GitHub numbers come from `useGithub` with static fallbacks (`src/forge/ForgeSite.tsx:553-606`).
- `Marquee` — two rows of project chips (even / odd projects) moved by scroll in opposite directions (`src/forge/ForgeSite.tsx:608-636`, drift hook `174-200`).
- `Work` — filter chips (`all`, `ai products`, `full-stack`, `dev tools`) with counts and `aria-pressed`, keyboard hint, and the card stack, remounted on filter change (`src/forge/ForgeSite.tsx:844-924`).
- `ProjectCard` — pointer-tracked glow (`--mx` / `--my`), featured variant, front case card and back spec sheet with a flip button, links to GitHub, live demo and case study (`src/forge/ForgeSite.tsx:719-842`).
- `Stack` — one card per skill category with caption and chips that "ignite" in their hue (`src/forge/ForgeSite.tsx:662-687`).
- `Experience` — numbered timeline whose rail grows with scroll (`--tl`) and whose items reveal one by one (`src/forge/ForgeSite.tsx:689-717`, `202-233`, `259-277`).
- `About`, `Contact` (gold `MetalButton` mailto plus GitHub / LinkedIn), `Interfaces` (links to five other editions), `ForgeFooter` (`src/forge/ForgeSite.tsx:638-660`, `926-996`).
- Shared helpers: `SectionEyebrow` (`src/forge/ForgeSite.tsx:121-130`), `StaggerHeading` (`src/forge/ForgeSite.tsx:411-423`), `Sparks` (`src/forge/ForgeSite.tsx:111-119`).
- Root: `ForgeSite` sets up reveals, magnetic buttons (`.fg-btn, .fg-filter`, strength 0.24, max 7px), stoke persistence in `localStorage` key `fg.stoked`, and the background grid glow (`src/forge/ForgeSite.tsx:998-1063`).

## Motion

| What | Duration / easing | Where |
| --- | --- | --- |
| Hero entrance `fgenter` (rise 26px) | 0.7s `cubic-bezier(0.25, 0.1, 0.25, 1)`, staggered by `--d` 0–0.58s | `forge.css:107-116` |
| Scroll reveal `.fg-reveal` → `.fg-in` | 0.7s, same curve; IntersectionObserver, `-8%` bottom margin | `forge.css:118-127`, `ForgeSite.tsx:154-172` |
| Section heading word rise `fg-h-rise` | 0.7s `cubic-bezier(0.22, 1, 0.36, 1)`, 0.09s per word | `forge.css:1799-1813` |
| Heading shimmer `fg-head-shimmer` | 9s ease-in-out infinite | `forge.css:144-150` |
| Hero heading `text-reveal` (clip from the left) | 0.9s `cubic-bezier(0.22,1,0.36,1)`, 0.2s delay | `forge.css:2242-2244`, keyframes `src/styles/motion.css:34` |
| Background blobs `fg-bg-drift` | 26s and 34s alternate | `forge.css:54-82` |
| Grid drift `forge-grid-drift` | 60s linear | `forge.css:2225-2232` |
| Pipeline light pulse `fg-pipe-flow`; status dot `fg-pipe-pulse` | 4.8s; 2.6s | `forge.css:563-602`, `541-553` |
| Run-build row sweep; pass flash | 0.55s linear infinite; 0.9s | `forge.css:1934-1953` |
| Pipeline tilt | `transform 0.18s ease-out` from `--rx` / `--ry` | `forge.css:1739-1743` |
| Button sparks `fg-spark` | 0.9s ease-out, staggered `--d` | `forge.css:1977-1984` |
| Stack chip ignition `fg-ignite` | 0.7s, delays by card and chip index | `forge.css:2000-2011` |
| Timeline item reveal; number ring `fg-num-fill` | 0.5s transform/opacity; 0.6s | `forge.css:2286-2296`, `2031-2037` |
| Card flip `fg-turn` (scaleX to 0.04 and back; faces swap at 0.24s) | 0.5s ease-in-out | `forge.css:2041-2072` |
| Card enter on filter change `fg-card-enter` | 0.55s, 0.06s stagger | `forge.css:1857-1865` |
| Contact glow `fg-contact-breathe` | 5.5s | `forge.css:1389-1407` |
| Embers (canvas) | 46 particles, 26 on coarse pointers; stoked ×1.9 count, ×1.5 speed, ×1.25 size, hues 12–38 instead of 195–265; DPR capped at 2; paused while the tab is hidden | `EmberField.tsx:31-41`, `98-106` |
| Hero parallax (`translateY(y * 0.1)`, fade over 620px), marquee drift (`y * 0.35`), timeline rail | rAF-throttled scroll | `ForgeSite.tsx:174-233` |

Reduced motion is driven only by `html[data-motion]` (`src/lib/motion.ts`), never the media query directly:

- CSS: under `html[data-motion="reduce"]` every animation and transition inside `.forge-root` is cut to 0.001s and one iteration; reveal, entrance, stack and timeline items are forced visible; the marquee, pipeline pulse, background blobs and contact glow lose their animation and transform; the heading shimmer and lede swap stop; embers are hidden; the pipeline tilt and heading words are reset (`forge.css:1666-1699`, `1867-1870`, `2073-2076`). Purely decorative loops are written behind `html:not([data-motion="reduce"])` instead (for example `forge.css:1857`, `1934`, `1977`, `2000`, `2064`, `2202`).
- JS: each effect checks `motionReduced()` before starting — lede rotation, uptime clock, build log typing, marquee drift, scroll effects, grid glow, embers, tilt and magnetic hover (`ForgeSite.tsx:141`, `176`, `204`, `357`, `380`, `1022`; `EmberField.tsx:25`; `src/hooks/useTilt.ts:10`; `src/hooks/useMagnetic.ts:11`). "Run build" still works but steps with 0ms delays (`ForgeSite.tsx:437-452`). `j / k` use `behavior: "auto"` instead of smooth scrolling (`ForgeSite.tsx:875`).

## Cursor and shared chrome

- CursorFX: the root carries `data-cursor-accent="forge"` (`ForgeSite.tsx:1044`), so the overlay switches to `data-cur="forge"`. Look (`src/cursor-fx.css:430-492`): an 8px ember core (white centre into the accent), a 30px ring that appears and scales in over interactive targets with a springy `cubic-bezier(0.5, 1.8, 0.5, 1)`, a 0.4s "strike" ring on click, and 4px glowing spark particles. Behaviour (`src/CursorFX.tsx`): dot and ring follow at `[0.45, 0.2]` per frame (`:31`); fast movement (speed > 6) throws upward sparks (`:194-202`); a click bursts 8 sparks (`:349-354`). The accent is read live from `--fg-cyan` (`:52`), so the cursor turns orange in stoked mode. The overlay is hidden on coarse pointers and under `html[data-motion="reduce"]` (`src/cursor-fx.css:504-514`).
- Interface switcher tokens, scoped to `.forge-root .iswitcher` (`forge.css:1703-1711`): `--sw-bg: rgba(12, 12, 12, 0.55)`, `--sw-border: var(--fg-line)`, `--sw-text: var(--fg-text)`, `--sw-dim: var(--fg-faint)`, `--sw-num: rgba(215, 226, 234, 0.34)`, `--sw-accent: var(--fg-cyan)`, `--sw-active-bg: rgba(125, 211, 252, 0.12)`. The switcher hides at ≤760px (`forge.css:1572-1574`).
- Scroll chrome: `ScrollChrome` maps `forge` to `#7dd3fc` (`src/components/ScrollChrome.tsx:13`) for the top progress bar and the back-to-top button. This value is fixed and does not follow stoked mode. Forge also draws its own heat bar under the nav (`forge.css:1878-1889`).

## Accessibility

- Landmarks: `<nav aria-label="Main">` and the hero `<header>` sit inside `<main className="forge-main">`; the footer is outside `main` (`ForgeSite.tsx:311`, `463`, `1049-1061`). There is no skip link in this edition. Labelled regions: "Live stats", "Things I have built", "Build pipeline demo" (`role="group"`), "Filter projects" (`role="group"`).
- Headings: one `h1` in the hero, `h2` per section, `h3` per card. `StaggerHeading` puts the full text in `aria-label` and hides the per-word spans (`ForgeSite.tsx:411-423`). The rotating lede is `aria-hidden`; a static `sr-only` sentence replaces it (`ForgeSite.tsx:475-480`).
- Hidden duplicates: the second marquee group and repeated items are `aria-hidden` (`ForgeSite.tsx:612`, `619`). The card face not shown is `aria-hidden` and `inert` (`ForgeSite.tsx:741`, `786`).
- State: filters and the stoke toggle use `aria-pressed`; the hamburger uses `aria-expanded` / `aria-controls` (`ForgeSite.tsx:327-338`, `502`, `906`); the run-build button is `disabled` while running.
- Focus: links and buttons get a 2px `--fg-cyan` outline at 3px offset (`forge.css:36-41`); nav links blur after click so the outline does not stick (`ForgeSite.tsx:306-309`).
- Keyboard: `j` / `k` step through project cards (adds `.is-focus` and scrolls to it), `f` cycles the filter; ignored with modifiers or inside inputs (`ForgeSite.tsx:859-886`). Digits 1–7 are left to the site-wide edition shortcuts (`src/App.tsx:71-92`).
- Targets: nav links, project links, flip buttons and footer links get `min-height: 28px` (`forge.css:2298-2299`); switcher items are at least 28×28px (`src/interface-switcher/interface-switcher.css:20-21`).
- Contrast: see the table under Colour. Body, muted and faint text all pass AA.

## Rules for changes

- Do take colours from the `--fg-*` tokens. Anything that should turn orange in stoked mode must use `var(--fg-cyan)` (or `color-mix` on it). Several older rules hard-code `rgba(125, 211, 252, …)` (for example `forge.css:285`, `546`, `1039`, `2273`) and stay cyan when stoked.
- Do check the bottom of `forge.css` before editing a card, heading, glint or timeline rule. The later blocks ("Forge polish" from line 1712, "Forge additions" from 1872, and the block moved from `src/styles/motion.css` from 2221) override earlier rules with equal or higher specificity, such as card hover, card glow and timeline item entrance.
- Do gate every new animation twice: CSS behind `html:not([data-motion="reduce"])` or in the reduce block, and JS behind `motionReduced()` at the start of the effect.
- Do drive scroll and pointer effects with passive listeners, one `requestAnimationFrame` per frame, and CSS custom properties (`--sp`, `--tl`, `--gx`/`--gy`, `--mx`/`--my`, `--rx`/`--ry`), not React state.
- Do keep project facts in the shared data modules imported at `ForgeSite.tsx:17-22`. Forge should not hard-code project names, metrics or links.
- Do give a new section a `SECTION_META` entry (`ForgeSite.tsx:84-91`), use `SectionEyebrow` and `StaggerHeading`, and add its id to `useForgeSpy` if it gets a nav link.
- Do give new controls a visible focus style and at least a 28px hit area, matching `forge.css:2299`.
- Don't bind digit keys or modified keys in Forge; digits switch editions site-wide.
- Don't remove the `aria-hidden` / `inert` pairs on duplicated or off-face content (marquee copies, card faces).
- Don't let new canvas or particle work run on hidden tabs or without a cap; follow `EmberField` (count by pointer type, DPR ≤ 2, `visibilitychange` pause).


### Motion polish (2026-11-10)
- Hero heading runs `text-reveal` and `fg-head-shimmer` in one animation list.
- Stats skip the count-up under reduced motion; the ember canvas pauses off screen.
- Pipeline panel floats with `float-y` (fine pointers); stack cards fold in; interface cards fan in; About children stagger.
