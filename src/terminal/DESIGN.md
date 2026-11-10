# Terminal — design

> The portfolio as a retro CRT shell: a working command line in the hero, every section dressed as a command's output, and a tmux/vim status bar as the only chrome. Routes: `/terminal`, `/terminal/work/:slug`. Main files: `src/terminal/TerminalLayout.tsx`, `src/terminal/components/Hero.tsx`, `src/terminal/lib/shell.ts`, `src/terminal/styles/global.css`.

## Concept and audience

- Edition 01, role "for engineers", blurb "Type `ls work`, read man pages, and tab-complete your way through the projects." (`src/editions.ts:21-23`).
- The layout (`src/terminal/TerminalLayout.tsx:72-85`) renders, in order: an optional boot screen, a CRT sweep band, a skip link, `<main id="main">` with the route outlet, the footer, and the status line.
- The home route stacks Hero, Work, Experience, Process, Tech, About, OpenSource, Contact (`src/terminal/TerminalHome.tsx:10-22`). Each section opens with a typed command (`TypeCmd`) and an upper-snake title such as `SELECTED_PROJECTS` (`src/terminal/components/Work.tsx:13-16`).
- The case page `/terminal/work/:slug` is laid out as `cat ~/work/<slug>/README.md` in a vim-titled window (`src/terminal/components/WorkDetail.tsx:104-116`).
- Everything is written in lower-case shell voice. Data comes from `src/terminal/data/*.ts` and is never hard-coded in components.

## Colour

All tokens live on `.terminal-root` (`src/terminal/styles/global.css:60-84`). `--green` is the phosphor accent, not always green: the `data-phosphor` palettes redefine it.

| token or selector | value | role |
|---|---|---|
| `--bg` | `#050807` | page background, boot screen |
| `--bg-2` | `#0a100c` | boot progress bar, case screenshots |
| `--bg-3` | `#0e1710` | vim `:` command-line mode in the status bar |
| `--bg-rgb` | `5, 8, 7` | translucent panels: `.term`, `.term-bar`, inputs, status bar |
| `--line` | `#17271d` | quiet dividers, status-bar cell borders |
| `--line-2` | `#234034` | window borders, dashed separators, button borders |
| `--green` / `--green-rgb` | `#36e57c` / `54, 229, 124` | phosphor accent: prompt, links, focus ring, selection, glows |
| `--green-2` | `#8df5b8` | hover for solid buttons and project names, status-bar messages |
| `--green-dim` | `#1d8a52` | line numbers, list bullets, project index, arrows |
| `--amber` | `#ffb347` | hero tag, man-page headings, INSERT mode, link hover |
| `--cyan` | `#4cc9f0` | paths, chips, tree directories, case-page links |
| `--red` / `--red-rgb` | `#ff5f6b` / `255, 95, 107` | errors, invalid inputs, red window dot |
| `--ink` | `#d9f3e3` | body text |
| `--ink-2` | `#93bda4` | secondary text |
| `--ink-3` | `#6a8b79` | tertiary text, brackets, placeholders |
| `--on-accent` | `#03140a` | text on a `--green` surface (solid button, NORMAL mode, skip link) |
| `--glow` | `0 0 14px rgba(var(--green-rgb), 0.22)` | text glow on hover |
| `.term-dot.a` / `.term-dot.g` | `#ffbd2e` / `#28c840` | window-chrome dots (`global.css:284-285`) |

Phosphor palettes (`global.css:2688-2740`), set by `data-phosphor` on the root and persisted in `localStorage` key `folio.phosphor` (`src/terminal/lib/phosphor.ts:6-31`). Green is the default and is stored by removing the key.

| `data-phosphor` | `--bg` | `--green` | `--green-2` | `--green-dim` | `--amber` | `--ink` / `--ink-2` / `--ink-3` |
|---|---|---|---|---|---|---|
| `amber` | `#080604` | `#ffb347` | `#ffd58f` | `#ad7a2e` | `#4cc9f0` (swapped to cyan) | `#f4e8d3` / `#c6ad86` / `#8e7b62` |
| `cyan` | `#04080a` | `#4cc9f0` | `#a3e6fb` | `#3a8ca6` | `#ffb347` | `#d8f1f8` / `#8fbccb` / `#69858e` |
| `white` | `#070707` | `#ededed` | `#ffffff` | `#8c8c8c` | `#ffb347` | `#e6e6e6` / `#a8a8a8` / `#808080` |

Contrast, computed with the WCAG 2 relative-luminance formula against each palette's `--bg`:

- Green: `--ink` 17.12:1, `--ink-2` 9.63:1, `--ink-3` 5.35:1 (4.86:1 on `--bg-3`), `--green` 12.12:1, `--green-dim` 4.61:1, `--amber` 11.29:1, `--cyan` 10.46:1, `--red` 6.80:1. `--on-accent` on `--green` is 11.42:1. The comment at `global.css:75` records both figures.
- Amber / cyan / white: `--ink-3` is 4.97:1, 5.12:1 and 5.10:1 on `--bg` (at least 4.6:1 on `--bg-3`). `--green-dim` is 5.39:1, 5.25:1 and 5.99:1 on `--bg` (amber and cyan were lifted from `#a5701f` and `#1f7f9c` so dim text stays above 4.5:1 on `--bg-3`).
- The hard-coded legacy block (and its always-running `.shell-input` caret glow) was removed on 2026-11-10; every colour now comes from the phosphor tokens.

## Typography

- JetBrains Mono 400/500/700 is loaded site-wide (`src/main.tsx:5-10`). VT323 400 is loaded only by this edition (`src/terminal/TerminalLayout.tsx:1-2`).
- `--font-mono` is JetBrains Mono and is the body face. `--font-crt` is VT323 and is used for display (`global.css:76-77`).
- Root text is 15px / line-height 1.7 (`global.css:90-91`). Weights in use: 400, 500 (link labels, `b` in meta lines) and 700 (`.exp-role`, `.pipe-label`, `.remote-name`, status-bar mode).

VT323 (`--font-crt`) sizes:

- `.case-title` `clamp(34px, 5vw, 52px)` (`global.css:1168`)
- `.shell-title` `clamp(22px, 3.4vw, 32px)` (`:370`)
- `.prog-name` 27px, `.prog-idx` 26px (`:969-976`)
- `.pipe-step` 20px, `.exit` 20px (`:1589`, `:2225`)
- `.sl-brand` 19px, or 17px at 640px and below (`:2379`, `:2677`)

JetBrains Mono sizes:

- `.hero-banner` `clamp(6.5px, calc((100vw - 48px) / 34), 12.5px)`, and 13.5px from 1100px up (`:693`, `:713`)
- `.exp-role` 16.5px
- `.hero-tag` `clamp(13px, 1.9vw, 15px)`, uppercase, 0.14em tracking
- `.man-h` 14.5px
- 14px for `.hero-intro`, `.shell-sub`, `.case-lead`
- 13.5px for `.cmdline`, `.btn`, `.prog-desc`, `.shell-input`, `.man-p`
- 13px for `.shell-lines`, `.tree`, `.exp-points li`, `.contact-channels`
- 12.5px for `.btn-sm`, `.prog-links`, `.case-meta`, `.footer`
- 12px for `.term-title`, `.hero-status`
- 11.5px for `.chip`, `.statusline`, `.shell-foot`
- 11px for `.badge`, `.boot-progress`
- 10.5px for `.pipe-chip`
- 10px for the `sl` train

## Layout and spacing

- `.container`: `max-width: var(--max-w)` (1080px), padding 0 28px, dropping to 18px at 760px and below (`global.css:232-250`). Each `main > section` gets 84px vertical padding, or 56px at 760px and below.
- The root reserves `padding-bottom: var(--bar-h)` (34px) for the fixed status line (`:88`). `html:has(.terminal-root)` sets `scroll-padding-top: 28px` (`:105-108`).
- Window chrome: `.term` has a 1px `--line-2` border and `--radius` 10px. Inner cards use 8px. `.term-bar` has 10px 14px padding. `.term-body` has 20px 22px padding, or 16px 14px at 640px and below (`:254-311`).
- Breakpoints in the CSS: `max-width` 640, 760, 900 and 1100px; `min-width` 900 and 1100px.
- Grids:
  - Hero: `minmax(0,5fr) minmax(0,6fr)` with a 34px gap, one column at 900px and below (`:663-668`, `:814-822`).
  - Project rows (`.prog`): `52px minmax(0,1fr) auto`, becoming `40px 1fr` at 760px and below (`:958`, `:1036`).
  - `.other-grid`: two columns from 900px (`:1072`).
  - `.compose`: `1.15fr / 0.85fr` from 900px (`:1936`).
  - `.tree-grid`: `repeat(auto-fit, minmax(230px, 1fr))` (`:1713`).
  - `.case-shots-grid`: `auto-fit, minmax(280px, 1fr)` (`:2751`).
  - `.case-prevnext`: two columns, one at 640px and below.
  - Process pipeline: a wrapping flex row with `──▶` connectors, becoming a column with `▼` connectors at 900px and below (`:1550-1698`).
- Status bar responsiveness (`:2643-2679`):
  - 1100px and below: the clock is hidden.
  - 900px and below: the windows, switcher and crt toggle are hidden, the phosphor button shows only its dot, and a burger opens a bottom sheet.
  - 640px and below: the progress fill is hidden.

## Components

- Layout root, boot gate (`sessionStorage` key `folio.booted`), scroll-to-hash and the `folio:navigate` bridge: `src/terminal/TerminalLayout.tsx:14-87`.
- Boot overlay: 8 lines at 170ms each, a skip button, a tap-anywhere target and a progress bar: `src/terminal/components/Boot.tsx:20-83`.
- Hero: `src/terminal/components/Hero.tsx:153`.
  - Matrix-rain canvas that reads `--bg` / `--green-2` / `--green-rgb` from CSS (`:8-91`).
  - Figlet banner (`src/terminal/lib/banner.ts:46`).
  - Quick-command chips (`:511-517`).
  - Interactive shell window (`:538-600`).
  - Snake game, 24×10, 120ms tick (`:96-147`, `:269-281`).
  - Live `top` table (`:211-236`).
- Shell engine:
  - Pure `runLine()` with `;` / `&&` chains and `|` into grep / head / tail / wc / sort / uniq (`src/terminal/lib/shell.ts:793`).
  - `runCmd()` switch (`:268`), `MAN_PAGES` (`:127`), `ALIASES` (`:180`), tab completion (`:814`).
  - History is kept in `localStorage` key `folio.history`, capped at 50 (`:72-89`).
- Typed command / text: `TypeCmd` at 38ms per char and `TypeText`, both started by an IntersectionObserver (`src/terminal/components/TypeCmd.tsx:38`, `:49`).
- Home sections:
  - Work list and "also built" grid: `src/terminal/components/Work.tsx:6`.
  - Experience log: `Experience.tsx:7`.
  - Pipeline: `Process.tsx:9`.
  - Skills tree: `Tech.tsx:9`.
  - ID card and numbered text: `About.tsx:23`.
  - Remotes: `OpenSource.tsx:10`.
  - Mail compose form with live `.eml` preview and copy button: `Contact.tsx:10-182`.
- Case page:
  - `[` / `]` keys go to the previous / next case, and legacy slugs redirect (`src/terminal/components/WorkDetail.tsx:6`, `:23-39`).
  - Architecture tree (`:131-149`), decisions written as git log (`:155-169`), previous/next nav (`:198-209`).
- Status line: `src/terminal/components/StatusLine.tsx:31-306`.
  - Mode cell (NORMAL / INSERT / `:` input).
  - Brand link and windows `0:~` to `5:mail`.
  - Message / progress fill, interface switcher, phosphor cycle, crt toggle, `ln N · %` position, clock.
  - Burger and bottom sheet with a scrim.
- Footer, with an EOF banner and a session summary (uptime, history count, phosphor): `src/terminal/components/Footer.tsx:9-57`.
- Shared `Reveal` wrapper, which adds `.reveal` and then `.is-visible`: `src/hooks/useReveal.tsx:115` (re-exported by `src/terminal/hooks/useReveal.tsx`).
- Spotlight: `useSpotlight` writes `--mx` / `--my` on any `[data-spot]` for the radial hover glow (`src/terminal/hooks/useSpotlight.ts`, `global.css:2812-2836`).

## Motion

- CRT overlays:
  - Vignette is `::before`. Scanlines are `::after`, flickering on `crt-flicker` 5s `steps(1)`. A sweep band runs `crt-sweep` 12s linear (`global.css:116-187`).
  - `data-crt="off"` (`localStorage` key `folio.crt`) removes all three (`:166-170`, `src/terminal/lib/phosphor.ts:41-60`).
- Entrances:
  - Root `tfade` 0.3s.
  - Hero column children `thero-in` 0.55s `cubic-bezier(0.22, 1, 0.36, 1)`, staggered 0.04–0.34s (`:670-688`).
  - Status bar `sl-in` 0.5s after a 0.4s delay (`:2315`).
  - `.reveal` 0.5s opacity/translate (`:2232-2241`), then child staggers of `calc(var(--i) * 0.09s)` (`:2840-2863`).
- Shell:
  - Each line `ln-in` 0.22s, commands also `cmd-flash` 0.5s (`:844-871`).
  - Caret `caret-blink` 0.9s `steps(1)`.
  - Banner `banner-flicker` 6s.
  - Title glitch 0.4s on hover (`:379-389`).
  - `sl` train 3.2s linear.
- Pipeline: `rail-fill` 1.6s after a 0.4s delay, `chip-in` staggered 0.28s, `pipe-flash` 0.9s (`:1600-1649`, `:2850-2863`).
- JS timings: boot steps 170ms with a 450ms fade; matrix rain throttled to one frame per 50ms and paused off-screen (`Hero.tsx:53`, `:69-75`); auto-typed `neofetch` at 70ms per char, starting `bootDelay + 2600ms` after load (`Hero.tsx:457-481`); `top` refreshes every 500ms, 8 times.
- Reduced motion (`html[data-motion="reduce"]`, written by `src/lib/motion.ts` and the inline script in `index.html`):
  - CSS: smooth scroll off (`:110-112`); sweep hidden and flicker stopped (`:172-178`); `.reveal` shown at once (`:2244-2248`); all animations and transitions cut to 0.001s and 1 iteration (`:2249-2255`); staggered rules set to `animation: none` (`:2866-2878`). On top of that, `src/styles/motion.css:46-51` sets `animation: none !important` site-wide.
  - JS: `MatrixRain` never starts; boot shows every line and closes after 250ms; `TypeCmd` / `TypeText` render the full text; the auto-`neofetch` is skipped; `snake` refuses to start and the `sl` train is skipped; every `scrollIntoView` / `scrollTo` uses `behavior: "auto"`.
  - `.pipe-chip` starts at `opacity: 0` and `.pipe-rail i` at `scaleX(0)`, and only their animations reveal them, so the reduce block pins them to their finished state (`opacity: 1`, `scaleX(1)`).

## Cursor and shared chrome

- CursorFX: the root carries `data-cursor-accent="term"` (`TerminalLayout.tsx:72`), so the overlay uses `data-cur="term"`.
  - The look is a 9×17px block caret that snaps to a 9×18px character grid, sits beside the pointer and leaves fading afterglow cells (`src/CursorFX.tsx:161-169`, `src/cursor-fx.css:157-194`).
  - It blinks at rest (1.06s) and holds solid while moving.
  - Over interactive elements the caret collapses and `[ ]` brackets frame the pointer (`cursor-fx.css:196-230`). The ring follow factor is 0.32 with an offset of `[6, 10]` (`CursorFX.tsx:28`, `:37`).
  - `--cur-accent` is copied live from the root's `--green`, so it follows `data-phosphor` (`CursorFX.tsx:50-51`, `:261-276`).
- Interface switcher tokens (`global.css:2791-2799`): `--sw-bg: rgba(var(--bg-rgb), 0.72)`, `--sw-border: var(--line-2)`, `--sw-text: var(--ink)`, `--sw-dim: var(--ink-2)`, `--sw-num: var(--ink-3)`, `--sw-accent: var(--green)`, `--sw-active-bg: rgba(var(--green-rgb), 0.1)`.
  - Inside the status bar it is flattened: transparent, no border, numbers only (`:2454-2470`).
  - In the phone sheet it gets its own pill (`:2618-2632`).
  - The switcher is rendered with `current="terminal"` (`StatusLine.tsx:247`, `:296`).
- Scroll chrome: the `term` accent is the fixed `#36e57c` (`src/components/ScrollChrome.tsx:8`). It does not follow the phosphor. The back-to-top button is lifted to `bottom: 50px` to clear the status bar (`global.css:2682-2684`).

## Accessibility

- Landmarks:
  - Skip link to `#main` (`TerminalLayout.tsx:77-79`, styled `global.css:2259-2274`) and `<main id="main">`.
  - The status line is `role="navigation"` with an `aria-label`, and contains a `Sections` nav (`StatusLine.tsx:189`, `:217`).
  - The footer is a `<footer>`.
  - Each section is a `<section>` with `aria-labelledby` pointing at its `h2`.
  - On the home route the `h1` is visually hidden (`Hero.tsx:496-498`). On the case page it is `.case-title` (`WorkDetail.tsx:58`).
- Live regions:
  - Shell output is `role="log"`, with `aria-live="polite"` except while `top` or `snake` runs (`Hero.tsx:563`).
  - The mode and status-bar messages are `role="status"`.
  - The mail status is `role="status" aria-live="polite"` (`Contact.tsx:129`).
  - Boot is `role="dialog" aria-modal="true"` and focuses its skip button. Enter, Escape and Space finish it (`Boot.tsx:49-62`).
  - The boot progress is a `progressbar` with value attributes.
- Decorative content is `aria-hidden`: banner, window bars, train, matrix canvas, `TypeCmd` lines, index numbers, arrows.
- Keyboard:
  - `` ` `` or `?` focuses the shell from anywhere (`?` also runs `help`) (`Hero.tsx:426-454`).
  - In the shell: Tab completes, ↑/↓ walk history, Ctrl+L clears, Ctrl+C cancels, Esc blurs.
  - `:` opens a vim command line (`:1`–`:5`, `:e <edition>`, `:theme`, `:set nocrt`, `:q`, `:!cmd`).
  - `j` / `k` / `gg` / `G` scroll (`StatusLine.tsx:54-105`, `:155-181`).
  - `[` / `]` move between case studies.
  - All of these ignore keys typed into inputs. The site-wide number keys `1`–`7` switch editions (`src/App.tsx:71-92`).
- Focus: `:focus-visible` draws a 2px `--green` outline with a 3px offset (`global.css:212-216`).
- Forms:
  - Labelled inputs with `aria-invalid` and `aria-describedby`.
  - Invalid inputs get a `--red` border.
  - `noValidate`, with a custom error line (`Contact.tsx:22-27`, `:91-103`).
- Target sizes (WCAG 2.5.8):
  - Links (`.tlink`, footer, case nav, prev/next) and `.shell-input` get `min-height: 24px`. `.contact-channels a` gets 26px (`global.css:2883-2887`).
  - The status bar is 34px tall.
- Contrast: see the Colour section. The default green palette meets 4.5:1 for every text token. The other phosphors' `--ink-3` does not.

## Rules for changes

- Colour through tokens only: `--ink*`, `--green*`, `--amber`, `--cyan`, `--red`, `--line*`, and `rgba(var(--green-rgb), a)` / `rgba(var(--bg-rgb), a)` for translucency. Hard-coded hex breaks the phosphor themes.
- Treat `--green` as "the phosphor accent". Any new phosphor must define the full set: `--bg`, `--bg-2`, `--bg-3`, `--line`, `--line-2`, `--bg-rgb`, `--green`, `--green-rgb`, `--green-2`, `--green-dim`, `--amber`, `--on-accent`, `--ink`, `--ink-2`, `--ink-3`. Also add it to `PHOSPHORS` in `src/terminal/lib/phosphor.ts`.
- Put text on a `--green` surface in `--on-accent`, never in black or white.
- Scope every selector under `.terminal-root`. This file is loaded with the edition's chunk, and unscoped rules would leak to other editions.
- Use `--font-crt` (VT323) only for display: titles, indices, brand. Body copy and controls stay in `--font-mono`.
- New sections follow the existing pattern: `<section className="section" id=… aria-labelledby=…>`, a `.container`, a `.shell`, a `Reveal` holding `.shell-head` (a `TypeCmd` plus an `h2.shell-title`), then a `.term` window. To have a section show up in the status line, add it to `WINDOWS` in `StatusLine.tsx:11-18`.
- New shell commands go in `runCmd()` and return lines plus `ShellEffect`s. Keep the engine pure: DOM work belongs in `runEffects` (`Hero.tsx:283-334`). Add a `MAN_PAGES` entry so `help`, `man` and tab completion pick it up.
- Read motion state from `motionReduced()` (`src/lib/motion.ts`) and gate CSS with `html[data-motion="reduce"]`, never with the media query directly. Anything that starts hidden and is revealed by an animation also needs a visible end state under reduce.
- Keep controls at 24px or more in both dimensions, and keep the 34px `--bar-h` reserved at the bottom for any new fixed UI.


### Motion polish (2026-11-10)
- Case page: man sections, screenshots and commits print in as they scroll into view (`case-pre` → `case-in`); the title types once.
- Work `.prog` rows stagger with `--i`.

### UI polish (2026-11-10)
- Removed the dead legacy block at the top of `global.css` (`.boot-line`, `.shell-prompt`, `.term-window`, `.work-detail`, and the infinite text-shadow `caret-glow` that relaid the page out every frame).
- Shell prompt has a real block cursor (`.shell-field` / `.shell-caret`): moves by `translateX(col × 1ch)`, blinks with `caret-blink 0.9s`, restarts solid on each edit (re-keyed), turns hollow when unfocused. The native caret takes over (`data-native`) for selections, IME composition, overflowing text and snake; forced-colors mode always uses the native caret.
- Typed hero intro reserves its final box with a hidden ghost layer (`.type-stack` / `.type-ghost` / `.type-live`, text exposed once via `.visually-hidden`), and on desktop `.shell-lines` has a fixed height, so neither the intro nor the auto-neofetch pushes the page (phone CLS ≈ 0.58 → ≈ 0.02). No `text-wrap` on `.hero-intro`.
- `useTyped` types on rAF by elapsed time and stops when done (no intervals left running).
- Shell output prints line by line (`--d` × 18ms, capped at 16); quick-command chips type into the prompt (16ms a character) before running, without raising the phone keyboard; the auto-neofetch waits until the shell window is 40% on screen. Chips have a pressed state.
- `scroll-padding-bottom` on the document and a nudge after output keep the focused prompt clear of the fixed status bar.
- Boot closes with a CRT power-off: `.boot-screen` collapses to a line, a `.boot-flash` phosphor line fades, the overlay fades (≈0.42s, inside FADE). Boot lines enter with `ln-in`.
- `banner-flicker` actually runs again (listed with `thero-in` on the more specific selector) and pauses while the hero is off-screen (`.hero[data-off]`, set by MatrixRain's observer).
- ALSO_BUILT shows 8 cards with an `ls -a  # N more` / `ls | head -8` toggle (aria-expanded, focus moves to the first new card); the list stagger is capped.
- Case pages: prev/next cards are real stacked cards again (direction, slug, tagline) with hover/focus nudge and press; they pass `vtDir` for the shared directional transition. The title re-types per case (keyed `h1`, the nav keeps focus). `case-print` lost its brightness filter; the flash moved to the `.man-h` heading (`cmd-flash`). Architecture notes hang under their text; the ↓ arrows hide on phones; the case nav stacks as `$ command` / `# status` lines on phones.
- In-edition View Transitions: the status bar is pinned (`view-transition-name: term-statusline`), and undirected swaps use a short stepped `term-vt-out` / `term-vt-in` with no blur.
- Status bar: no backdrop blur (bg .97), the progress fill is `scaleX(var(--p))` written from the scroll rAF, the scroll range is cached (ResizeObserver), and the `ln · %` readout and the clock are their own small components, so scrolling and the 1s tick no longer re-render the whole bar.
- Phone menu sheet and scrim transition out as well as in (sheet `inert` while closed, links stagger in).
- Line-break polish: hero tag breaks only at `::`, status line only at `·`, `text-wrap: balance/pretty` on titles and paragraphs, EOF rules hide on phones, tighter CTA padding at ≤480px; neofetch wraps the role under the value column and drops the logo column in a narrow shell.
- `useActiveSection` no longer reads a stale value between sections.

