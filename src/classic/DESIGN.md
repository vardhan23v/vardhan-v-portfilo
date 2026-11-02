# Classic — design

> The recruiter edition, painted after Van Gogh's The Starry Night: a swirling night sky behind Prussian-blue surfaces, pale-highlight text and star-yellow actions, with every colour sampled from the painting. Route `/classic`. Main files: `src/classic/ClassicSite.tsx`, `src/classic/styles/classic.css`, `src/classic/components/NightSky.tsx`, `src/classic/components/StarSky3D.tsx`, `src/classic/useEffects.ts`, `src/classic/content.ts`, `src/classic/data/`.

## Concept and audience

Edition 02, "for recruiters · start here" (`src/editions.ts:24`): "real screens of every live product, the facts under each, experience and contact". The page order is Hero, Stats, About, Projects, Experience, Skills, How I work, Contact (`src/classic/ClassicSite.tsx:57-66`). Four projects lead (`FEATURED_SLUGS`, `src/classic/content.ts:8`); the rest are filterable and searchable.

Facts come from the shared data in `src/classic/data/` (projects, experience, skills, site, stats). Classic-only wording lives in `src/classic/content.ts`, which says it only restates facts from the data or the résumé (`src/classic/content.ts:1-5`). The shared data files are also read by other editions, so they stay untouched for Classic wording.

## Colour

All tokens live on `.classic-root` (`src/classic/styles/classic.css:4-63`). None of them is redefined by the later passes; the passes change which token or literal a component uses (noted below). The comment at `classic.css:5-10` records the method: values sampled from the painting, lightness lifted (hue kept) only where a text colour fell short of 4.5:1 on `--surface-2`.

Contrast ratios below were computed with the WCAG 2 formula against `--bg` / `--surface` / `--surface-2`.

| Token | Value | Role |
|---|---|---|
| `--bg`, `--sky` | `#1d274e` | page and deep sky; also `html`/`body` behind Classic (`classic.css:68`) and the browser theme colour (`src/seo.ts:55`) |
| `--surface`, `--sky-deep` | `#263257` | night; inputs, secondary buttons, dialog |
| `--surface-2`, `--accent-soft` | `#30437a` | Prussian; screenshot wells, hover fills, focus ring on inputs |
| `--village` | `#2e3945` | bottom of the page gradient (`classic.css:74`), footer background (`classic.css:946`), far hills |
| `--ground` | `#23282c` | near hills |
| `--ink`, `--accent-strong` | `#cfcfbb` | pale highlight; body text. 9.15 / 7.93 / 6.02 |
| `--ink-2` | `#b5b885` | sage `#b2b580`, lifted; secondary text. 6.99 / 6.06 / 4.60 |
| `--muted` | `#abb9b3` | grey-teal `#8d9f97`, lifted; labels, meta. 7.11 / 6.16 / 4.67 |
| `--accent` | `#c2b75d` | star yellow `#bbaf4a`, lifted; primary button fill, focus outline, role and category labels. 7.04 / 6.10 / 4.63 |
| `--accent-ink` | `#1d274e` | text on the accent fill. 7.04 on `--accent` |
| `--star` | `#bbaf4a` | star and moon yellow as sampled; decoration only. 6.43 / 5.57 / 4.23 |
| `--ochre`, `--starlight` | `#bba327` | moon rings, hero status dot |
| `--line` | `#4f6173` | slate; rules and card borders (decorative, 2.27 on `--bg`) |
| `--line-strong` | `#7f97b0` | light swirl blue lifted; input and secondary-button borders. 4.79 / 4.15 / 3.15 |
| `--rule` | `rgba(207,207,187,.38)` | section-head rule, glance and contact top rule |
| `--indigo` | `#3f5a8f` | ultramarine; brush stroke 0, process line |
| `--cerulean` / `--swirl-light` | `#5e7ba6` / `#6e89a2` | brush strokes 1 and 2; most `rgba(110,137,162,…)` glows and borders |
| `--sage` / `--teal` | `#b2b580` / `#7a9296` | brush strokes 3 and 4; outer halos (`classic.css:943`) |
| `--cypress` / `--cypress-mid` | `#1d211f` / `#424834` | the cypress and its highlight stroke |
| `--danger` | `#ff9b8f` | form errors only; the one colour not in the painting (`classic.css:38`). 7.12 / 6.17 / 4.68 |

Notes on what actually wins:
- The header comment at `classic.css:3` ("body text 14:1+, muted 6:1+") is out of date; the figures at `classic.css:9-10` match the computed values above.
- Halos end as `--ink` strokes at 0.7 opacity with `--sage` outer rings at 0.5 (`classic.css:942-945`), overriding the star/ochre versions at `classic.css:717-718` and `:772-773`.
- Primary buttons are pinned to the accent fill by `.btn:not(.btn--secondary):not(.btn--ghost)` (`classic.css:736`), which out-specifies the hover rule at `classic.css:121`; hero buttons get a light sweep on hover instead (`classic.css:494`, `:501`).
- The project dialog `.pd` repeats token values as hex literals (`classic.css:607-628`).
- Page chrome: scrollbar `rgba(110,137,162,.55)` on `#1d274e` (`classic.css:947-948`).

## Typography

- **Fraunces Variable** (`--font-head`, `classic.css:47`) for h1-h4, nav mark, skill group names, build names, stat numbers, contact address. Declared globally in `src/styles/fonts.css:28-58`; Classic also imports `@fontsource-variable/fraunces` (`src/classic/ClassicSite.tsx:1`).
- **Inter Variable** (`--font-text`, `classic.css:48`) for everything else, 16px / 1.6 (`classic.css:76-78`).
- A system mono stack (`ui-monospace, "SF Mono", Menlo, monospace`) only for the screenshot address bar (`classic.css:508`) and process step numbers (`classic.css:583`).
- Headings end at weight 600, `-0.01em` (`classic.css:699`); class rules below override where noted.

| Size | Where |
|---|---|
| `clamp(42px, 3.2vw + 22px, 68px)`, 650, `-0.02em`, lh 1.02 | hero name (`classic.css:492`, `:700`); `--t-display` is no longer used |
| `clamp(30px, 1.4vw + 22px, 42px)` (`--t-h2`), `-0.022em` | section titles `.h2` (`classic.css:94`, `:485`) |
| `clamp(30px, 2vw + 18px, 42px)`, 700 | stat numbers (`classic.css:576`) |
| `clamp(26px, 1.4vw + 16px, 34px)` | flagship project name (`classic.css:469`) |
| 26px | mobile menu links (`classic.css:144`) |
| `clamp(24px, 2vw + 14px, 32px)` | dialog title (`classic.css:613`) |
| 22px (20px at ≤720px) | featured project names (`classic.css:184`, `:393`) |
| 20px (`--t-h3`) | `.h3`, role titles, contact address (`classic.css:95`, `:244`, `:336`) |
| 19px | About lead (`classic.css:262`) |
| 18px (`--t-lead`; 17px at ≤720px) | hero intro (`classic.css:162`, `:388`); also nav mark, compact names, process labels, footer name |
| 17px | skill group names (`classic.css:328`) |
| 16px (`--t-body`) | body, inputs, build names |
| 15px | nav links, buttons, spec rows, project links, points, footer columns |
| 14px (`--t-small`) | meta lines, glance and spec labels, filters, stat labels, field errors |
| 13px | hero role (650, `0.14em`, uppercase, `classic.css:491`), status pill, categories, chips, copy button |
| 12px / 11.5px / 11px | button note, kbd, mono step numbers / address bar / chip counts |

## Layout and spacing

- Container `.wrap`: `max-width: var(--max)` = 1160px, inline padding `--pad` = `clamp(16px, 4vw, 40px)` (`classic.css:40-41`, `:93`).
- Rhythm: `--gap: clamp(16px, 2vw, 24px)`, section top padding `--section: clamp(64px, 8vw, 112px)`; radii `--r-sm` 6px, `--r` 12px (`classic.css:42-45`).
- Sticky nav, 64px min height (`classic.css:127-129`); sections scroll to 72px below the top (`classic.css:702`), with `scroll-padding-top: 84px` on the document (`classic.css:947`).
- Grids at full width: hero 7fr/5fr (`classic.css:157`); features 3 columns with the flagship spanning the row as 7fr/5fr (`classic.css:466-467`); More projects 2 columns of 148px thumb + text (`classic.css:215-216`); experience 190px period + card (`classic.css:241`); skills 3 cards (`classic.css:548`); process 5 steps (`classic.css:580`); builds 3 (`classic.css:595`); stats 4 (`classic.css:572`); footer `4fr + 3 × 2.4fr` (`classic.css:353`).
- Breakpoints that exist:
  - 1240px: cypress hidden (`classic.css:729`).
  - 1024px: hero 1fr/1fr, period column 150px, More projects 1 column, skills and builds 2, process 3 (`classic.css:368-374`, `:559`, `:634-638`).
  - 900px: nav links give way to the Menu button; hero, about, contact, features and flagship go to one column; footer 2 columns; the sky mask and diorama tilt switch off (`classic.css:375-382`, `:472-476`, `:837-840`). Supporting features show only the Stack row (`classic.css:692-694`).
  - 720px: phone type sizes, single-column experience with the rail at the left edge, hidden live-frame bar, 1-column footer (`classic.css:385-409`).
  - 640px: skills, process and builds 1 column, stats 2×2, glance panel hidden, compact thumbnails hidden (`classic.css:560-565`, `:639-648`, `:684-690`).
  - 380px: hero buttons full width (`classic.css:410-414`).
  - `min-width: 901px` for the swirl rail (`classic.css:888`); the WebGL sky uses `min-width: 900px` in script (`NightSky.tsx:139`).
- The hero's bottom padding ends at `clamp(96px, 10vw, 150px)` at every width (`classic.css:705`); the 8px phone value at `classic.css:686` comes earlier in the file and loses.

## Components

- Root, skip link and section order: `src/classic/ClassicSite.tsx:45`.
- Fixed star backdrop `NightSky`: 92 seeded stars in two depth layers, up to 8 twinkle, some warm with halos, one shooting star (`src/classic/components/NightSky.tsx:22-77`). Masked to 22% across the reading column (`classic.css:268-272`).
- Painted hero `HeroPainting`, a CSS 3D diorama: SVG layers at `--z` depths (wave -30, spiral B -45, spiral A -60, stars -90, moon -120, hills 20, cypress 40) with a turbulence brush filter (`NightSky.tsx:107-211`); stage perspective 1200px (`classic.css:790-795`).
- WebGL sky `Sky3D` / `StarSky3D`: lazy plain three.js points at depth -140 (`NightSky.tsx:134-151`, `src/classic/components/StarSky3D.tsx:98`).
- Night shift wash and swirl rail (reading progress): `ClassicSite.tsx:52`, `src/classic/components/SwirlRail.tsx:12`, `classic.css:860-869`.
- Navbar with sliding active underline, section progress hairline and mobile sheet: `src/classic/components/Navbar.tsx:13`.
- Hero copy and "At a glance" list: `src/classic/components/Hero.tsx:6`.
- Stats strip with count-up: `src/classic/components/Stats.tsx:6`, `src/classic/components/Count.tsx:9`.
- About: `src/classic/components/About.tsx:4`.
- Projects: featured card with framed screenshot `src/classic/components/Work.tsx:34`, compact row `Work.tsx:61`, filters and search `Work.tsx:106-120`, live app embed `src/classic/components/LiveFrame.tsx:8`, details dialog `src/classic/components/ProjectDialog.tsx:8`, smaller builds `src/classic/components/Builds.tsx:8`.
- Experience timeline with role cards: `src/classic/components/Experience.tsx:7`.
- Skills cards with usage counts: `src/classic/components/Skills.tsx:18`.
- How I work: `src/classic/components/Process.tsx:4` (reads `src/terminal/data/experience`).
- Contact form and copy-email button: `src/classic/components/Contact.tsx:8`, `src/classic/components/CopyEmail.tsx:4`.
- Footer with other editions, IST time and key hints: `src/classic/components/Footer.tsx:7`.

## Motion

- One curve, `cubic-bezier(0.22, 1, 0.36, 1)` (`--ease-out`, `--ease-cinema`), and durations `--t-press` 120ms, `--t-ui` 180ms, `--t-med` 320ms, `--t-slow` 560ms (`classic.css:57-62`).
- Load: the name rises out of a mask, 820ms from 80ms; the other hero lines rise 560ms with `--d` delays 40-460ms (`classic.css:438-439`, `Hero.tsx:14-32`). The painting fades in over 1100ms (`classic.css:760`).
- Ambient: brush wave 22s, spiral A 26s, spiral B 19s, moon breathe 9s, halos 5s (`classic.css:755-759`); twinkle 8s base, 7-10s per star from script (`classic.css:280`, `NightSky.tsx:63`); shooting star every 16s after 4s (`classic.css:297`); hero status pulse 2.6s (`classic.css:498`).
- Observer reveals, both directions: opacity 0, 14px rise and 6px blur, cleared over 560ms with a 60ms sibling stagger (`classic.css:751-752`, `useEffects.ts:36-75`). Section heads, features and roles also fold up from `rotateX(14deg)` (`classic.css:824-827`). Stat numbers flip in over 700ms (`classic.css:829-831`); the count-up runs 900ms (`Count.tsx:23`).
- Scroll-driven, both directions, where `animation-timeline` is supported: blocks fold in on entry and soften on exit (`classic.css:906-918`), section rules draw (`:920-921`), titles brighten (`:924`), screenshots drift inside their frames (`:928`), skill chips stagger (`:931-937`), the experience rail draws (`:455`), star layers drift -50px / -140px (`:288-295`), the hero stage drops 120px over the first 900px (`:761-763`), the night wash moves (`:893`) and the swirl rail draws (`:889-890`). `useEffects.ts` leaves these blocks out of the observer when `view()` is supported (`useEffects.ts:11`, `:36`).
- Pointer: the hero stage tilts up to 3deg/4deg and the copy shifts a few pixels (`classic.css:791-804`); cards and screenshots tilt on hover (`classic.css:815-820`); a radial glow follows the pointer through `--mx/--my` (`useEffects.ts:80-96`). The nav slides away while reading down past 200px and returns on scroll up (`Navbar.tsx:42-46`, `classic.css:872-875`). Filter, show-more and skill toggles use a View Transition (`src/classic/lib/vt.ts:5`).
- Reduced motion: every animation is wrapped in `@media (prefers-reduced-motion: no-preference)` and `html:not([data-motion="reduce"])`. Explicit resets for the reduce case are at `classic.css:321-322`, `:364-365`, `:833-836`, and the site-wide gate `src/styles/motion.css:46-51` removes all animations. Script checks `motionReduced()` (`src/lib/motion.ts:54`) in `useEffects.ts:33` (no reveals, no pointer tracking), `Count.tsx:14`, `Navbar.tsx:42` and `vt.ts:7`. Reveal pre-states only exist under `.js`, set before first paint (`useEffects.ts:27`), and never on a hidden page (`useEffects.ts:33`, `:114`).
- 3D and WebGL gating: `Sky3D` mounts only when `(min-width: 900px) and (hover: hover) and (pointer: fine)` matches and a WebGL2 or WebGL context can be created, then waits for `requestIdleCallback` (2s timeout) or 800ms (`NightSky.tsx:138-143`). It is code-split with `lazy()` and wrapped in an error boundary that leaves the SVG painting as the poster (`NightSky.tsx:124-130`). It fades in over 1200ms once the first frame renders, and the painted strokes drop to 0.62 opacity (`classic.css:797-801`). The renderer uses no antialiasing, `low-power`, pixel ratio up to 2; three point clouds (2,200 field and wave points, 1,400 and 800 vortex points); it stops off screen and in hidden tabs, and under reduced motion renders one still frame without a pointer listener (`StarSky3D.tsx:103-160`). The CSS diorama tilt is off under reduced motion and at ≤900px (`classic.css:833-840`).

## Cursor and shared chrome

- Cursor: the root sets `data-cursor-accent="classic"` (`ClassicSite.tsx:50`), so `CursorFX` writes `data-cur="classic"`. The look is a four-point star in `#bbaf4a` with a `#f4efc4` centre, locked to the pointer (`src/CursorFX.tsx:419-428`), inside two brushed swirl strokes (`#6e89a2` 2.2px, `#cfcfbb` 1.1px) turning every 9s and trailing the pointer slowly (ring follow 0.09, `CursorFX.tsx:28`). Over interactive targets the swirl opens into three halos (24/38/54px) and the star turns 45deg; a click sends the halos out as ripples over 0.8s, held 900ms (`src/cursor-fx.css:232-331`, `CursorFX.tsx:40`). The overlay is hidden on coarse pointers and under `html[data-motion="reduce"]` (`cursor-fx.css:504`, `:512`).
- Interface switcher: Classic does not render `InterfaceSwitcher` and defines no `--sw-*` tokens. Other editions are linked from the footer's "Other editions" list (`Footer.tsx:24-29`).
- Scroll chrome: accent `#bbaf4a` (`src/components/ScrollChrome.tsx:9`). The site-wide progress bar is hidden on Classic in favour of the swirl rail (`classic.css:856`). The back-to-top button is restyled to `rgba(38,50,87,.9)` with a star-yellow border and `#cfcfbb` arrow; on hover it fills with the accent and the arrow turns `#1d274e` (6.43:1) (`classic.css:949-950`).

## Accessibility

- Landmarks: skip link to `#main` (`ClassicSite.tsx:55`, `classic.css:90-91`); `header.nav` with `nav` "Sections" (`Navbar.tsx:119-128`); `main#main`; `footer` "Footer" with two labelled `nav`s (`Footer.tsx:10-29`). Each section is `aria-labelledby` its heading; the stats strip is labelled "In numbers" and the hero list "At a glance".
- The active nav link gets `aria-current="location"` (`Navbar.tsx:125`). The mobile sheet is `role="dialog"` `aria-modal`, focuses its first link, traps Tab, closes on Escape and returns focus to the Menu button (`Navbar.tsx:98-115`). The nav never hides while it holds focus or the menu is open (`Navbar.tsx:42`, `:59`; `classic.css:874`).
- Keyboard: `g` then `a/p/e/s/c` jumps to a section and focuses its `h2` (`ClassicSite.tsx:24-43`), hinted in the footer except on touch (`classic.css:433`). Focus is a 2px accent outline at 3px offset (`classic.css:88`); inputs use an accent border plus a 3px `--accent-soft` ring (`classic.css:344`). Scroll-driven folds are cancelled inside any block that holds focus (`classic.css:951-952`).
- Target sizes: buttons, nav links, project links, filters, social links, search 44px; inputs 46px; dialog close 44×44; compact links, copy button, live-frame toggle and footer links 36px (`classic.css:110`, `:132`, `:190`, `:211`, `:225`, `:342`, `:357`, `:428`, `:612`).
- Contrast decisions: sampled text colours lifted in lightness only, so ink, ink-2, muted and accent stay at 4.6:1 or more even on `--surface-2` (see Colour). The star sky is masked thin behind the text column so no star sits under text (`classic.css:269`).
- Content: decorative SVGs, the canvas and the swirl rail are `aria-hidden`; counters expose the final number to screen readers (`Count.tsx:50`); the project list announces "Showing n of m" (`Work.tsx:121`); new-tab links carry sr-only text; form errors use `aria-invalid` and `aria-describedby`, and the status line is `aria-live="polite"` (`Contact.tsx:49-66`). Project details use a native modal `<dialog>` with backdrop-click close (`ProjectDialog.tsx:19`).

## Rules for changes

- Use the tokens on `.classic-root` (`classic.css:11-38`). A new colour must be sampled from The Starry Night; if it carries text and falls short of 4.5:1 on `--surface-2`, lift its lightness and keep the hue, as the existing tokens do. `--danger` is the only exception.
- If you change a token value, also update the hex literals in the `.pd` dialog block (`classic.css:607-628`), the SVG gradient stops in `NightSky.tsx:50-51`, `:187` and `SwirlRail.tsx:18-21`, and the three.js colours in `StarSky3D.tsx:15-19`.
- Facts come only from `src/classic/data/` and `src/classic/content.ts`. Put Classic-only wording in `content.ts`; do not edit the shared data files for Classic copy, since other editions read them. Copy hard-coded in components (`Hero.tsx:20`, `About.tsx:15-28`, `Stats.tsx:8-11`, `Experience.tsx:14`) must stay true to that data.
- `classic.css` is a stack of appended passes; later rules win. Read to the end of the file before editing a selector, and change the rule that actually wins rather than adding another override.
- Gate every new animation with both `@media (prefers-reduced-motion: no-preference)` and `html:not([data-motion="reduce"])`; in script, check `motionReduced()`. Hidden pre-states belong under `.classic-root.js` and must never be painted on screen.
- Keep reveal state in data attributes (`data-reveal`, `data-in`, `data-scrolling`), not classes, because React rewrites `className` (`useEffects.ts:15-16`). A block that gets a `view()` timeline must also be added to `SCROLL_DRIVEN` (`useEffects.ts:11`).
- Scroll-driven effects animate transform, opacity and stroke-dashoffset only, and nothing in the middle of the viewport may sit below full opacity (`classic.css:846-853`).
- The WebGL sky stays optional: lazy, gated to wide fine-pointer screens with WebGL, inside the error boundary, with the SVG painting as the poster. No content may depend on it.
- Keep primary controls at 44px minimum and secondary text controls at 36px.
- Two families only: Fraunces for headings and Inter for text (the footer says so, `Footer.tsx:39`).
