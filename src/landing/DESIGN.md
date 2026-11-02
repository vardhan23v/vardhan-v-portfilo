# Landing — design

> An editorial dark-glass front door that previews all seven editions live and lets the visitor pick one, with a wallpaper whose hue follows the edition on stage. Routes: `/` and `/editions`. Main files: `src/landing/Landing.tsx`, `src/landing/skins.tsx`, `src/landing/Landing.css`, `src/styles/base.css`.

## Concept and audience

- The page is the edition picker. Both `/` and `/editions` render `<Landing />` (`src/App.tsx:139-140`). Edition data (route, label, number, role, blurb, CTA) comes only from `EDITIONS` in `src/editions.ts:20-42`.
- Page order (`src/landing/Landing.tsx:328-437`):
  1. Sticky top bar.
  2. Hero: dateline, name, tagline, CTAs, pipeline, and a rotating stage that previews each edition.
  3. Tech marquee.
  4. Four stats.
  5. The grid of seven edition cards (`#editions`).
  6. A ledger of featured projects (`#work`).
  7. A closing quote and the footer.
- It is for anyone arriving cold. The section copy says "pick the one that suits how you read" (`Landing.tsx:396`). The Classic card carries the role "for recruiters · start here" (`src/editions.ts:24`).
- All copy and numbers come from `src/classic/data/*` (`site`, `featuredProjects`, `experience`, `skillCategories`) and `useGithub()`. Nothing is hard-coded in the page.

## Colour

Global tokens (`src/styles/base.css:4-21`) and landing-only values (`src/landing/Landing.css`):

| token or selector | value | role |
|---|---|---|
| `--bg` | `#0b0f1a` | body background, default portal background |
| `--text` | `#f2f3f8` | primary text |
| `--text-2` | `#a9afc3` | secondary text: nav, tagline, body, card blurbs |
| `--text-3` | `#8690ab` | mono microcopy: dateline, labels, footer |
| `--border` / `--border-2` | `rgba(255,255,255,0.09)` / `rgba(255,255,255,0.2)` | hairlines / stronger outlines and hover borders |
| `--card` / `--card-strong` | `rgba(18,24,40,0.62)` / `rgba(18,24,40,0.86)` | glass for cards and stats / glass for the stage frame |
| `--accent` | `#6ea8ff` | kicker text, italic emphasis, primary CTA, focus ring, progress segments |
| `--accent-2` | `#b48cff` | defined, but no rule in `Landing.css` uses it |
| `.lt-hire`, `.l-cta-primary` text / hover bg | `#061024` / `#8dbaff` | ink on the accent button / accent hover (`Landing.css:32-33`, `:52-54`) |
| `::selection` | `rgba(110,168,255,0.35)` (base.css), later overridden by `rgba(167,139,250,0.32)` in `src/styles/motion.css:133-136` | text selection |
| `--wp-h1/h2/h3` | default `225 / 262 / 196`, one triple per `data-tone` (`Landing.css:6-12`) | wallpaper hues: `term 150/170/120`, `paper 30/20/45`, `aurora 300/190/330`, `forge 20/350/40`, `atlas 150/40/185`, `classic` and `mac` keep the default |
| `.land-wall` | `linear-gradient(165deg, hsl(h1 45% 8%), hsl(h2 40% 12%) 55%, hsl(h3 40% 9%))` plus three radial glows | fixed wallpaper (`Landing.css:13-20`) |
| `.stage-screen` | `#0a0d14` | stage viewport behind the skins |
| `.stage-dot.r/.y/.g` | `#ff5f57` / `#febc2e` / `#28c840` | window dots on the stage bar |
| `.ed-portal--<tone>` | e.g. term `#05100a` / `#36e57c`, paper `#f6f1e7` / `#1b1710`, atlas `#0a0a0a` / `#ece8df` | portal background / foreground for each edition (`Landing.css:216-225`) |
| card hover CTA | term `#36e57c`, paper `#f0d9a8`, aurora `#ff7ac6`, forge `#ffab5e`, mac `#6ea8ff`, atlas `#ff5b24`; the rest use `--accent` | `.ed-<tone>:hover .ed-cta` (`Landing.css:147-148`, `:498`, `:831`) |
| `.lr-status.is-live` | `--pa`, i.e. the project's `accent[0]`, passed inline | live badge in the ledger; the row name hovers to `--pb` (`accent[2]`) |

The skin previews (`Landing.css:238-833`) carry each edition's own colours (for example `.stage-term` `#060a08` / `#36e57c`, `.stage-paper` `#f3f0ea` / `#1a1815`). They are miniatures, not landing tokens.

Contrast, computed with the WCAG 2 formula:

- On `--bg` `#0b0f1a`: `--text` 17.27:1, `--text-2` 8.75:1, `--text-3` 6.01:1, `--accent` 7.93:1.
- `#061024` on `--accent` is 7.86:1, and 9.57:1 on the `#8dbaff` hover.
- `--text-3` against the wallpaper's middle stop `hsl(h2 40% 12%)`, with the glows left out: 4.71:1 for term (the lowest), 4.88:1 for aurora and atlas, 5.20:1 for paper, 5.49:1 for forge, 5.64:1 for classic and mac. This matches the "4.7:1 min" note at `base.css:8`.
- `.stage-term .dim` `#63917a` on `#060a08` computes to 5.56:1 (`Landing.css:247`).

## Typography

- Families are loaded site-wide in `src/main.tsx:4-11` and `src/styles/fonts.css`:
  - Inter Variable, weight 100–900: `--font-sans`, the body face.
  - Fraunces Variable, with the wght, opsz, SOFT and WONK axes: `--font-display`.
  - JetBrains Mono 400/500/700: `--font-mono`.
- Kanit 400/500/600/700 is imported by the landing itself, only for the Forge skin and the Forge portal name (`Landing.tsx:1-8`).
- Display sizes (Fraunces):
  - `.landing-title` `clamp(2.8rem, 6.4vw, 5.6rem)`, weight 400, line-height 0.96, tracking −0.035em, `font-variation-settings: "opsz" 144, "SOFT" 30`. Its italic `em` is set in `--accent` (`Landing.css:42-43`).
  - `.ed-portal__name` `clamp(3rem, 9vw, 7rem)`, italic. The term portal uses mono, forge uses Kanit 700, and atlas is set upright at weight 500.
  - `.section-title` `clamp(2rem, 4vw, 3.2rem)`, weight 400, with an italic accent `em`.
  - `.land-stat-num` `clamp(2.2rem, 3.4vw, 3rem)`, tabular numerals.
  - `.landing-tagline` `clamp(1.35rem, 2.4vw, 2rem)`.
  - `.landing-note` `clamp(1.3rem, 2.6vw, 2rem)`, italic.
  - `.ed-meta h3` 1.5rem, weight 500. `.lr-name` 1.15rem, weight 500. `.lt-mark` 1.05rem. `.stage-tone` 0.95rem, italic.
- Body sizes (Inter):
  - `.landing-what` `clamp(1rem, 1.15vw + 0.6rem, 1.2rem)`, line-height 1.6, max 52ch.
  - `.section-sub` 15px.
  - `.l-cta` 14px, weight 500, dropping to 13px at 480px and below.
  - `.ed-meta p` 13.5px. `.lr-tag` 12.5px.
- Mono microcopy (uppercase, 0.04–0.12em tracking, mostly `--text-3`):
  - 11.5px for nav links, the pipeline, marquee items and `.ed-cta`.
  - 11px for the dateline, `.section-kicker`, `.stage-url`, `.ed-num`, `.lr-n` and the footer.
  - 10.5px for `.stage-count`, `.land-stat-label`, `.ed-role`, `.ed-key` and `.lr-tech`.
  - 10px for `.lr-status`.

## Layout and spacing

- The root is a column flex container with `min-height: 100vh` and `overflow-x: clip` (`Landing.css:5`).
- The wallpaper is `position: fixed; inset: 0; z-index: 0`. Content sits at `z-index: 1`, and the top bar is sticky at `z-index: 5`.
- Container: `.landing-main` and `.landing-foot` use `width: min(1180px, 100%)`, centred, with `padding: 0 clamp(18px, 4vw, 48px)`. The top bar uses the same side padding (`:25`, `:36`, `:171`).
- Vertical rhythm:
  - Hero: `padding: clamp(56px, 9vh, 110px) 0 40px`.
  - Marquee and stats: 44px top margin each.
  - `.section-head`: `margin: 96px 0 28px`, max 64ch, reduced to 64px top margin at 720px and below.
  - Closing note: 80px top and 40px bottom margin.
- Grids:
  - Hero: `1.05fr 0.95fr` with a `clamp(28px, 5vw, 64px)` gap (`:38`).
  - `.land-stats`: `repeat(4, 1fr)`, gap 14px.
  - `.edition-grid`: `repeat(3, 1fr)`, gap 14px. A seventh card on its own row spans the full width (`:833`).
  - `.land-row`: `34px 32px 1fr auto auto 24px` (`:152`).
- Breakpoints (`Landing.css:181-183`, `:829`, `:834-835`):
  - 1080px and below: the hero becomes one column with the stage capped at 640px, editions and stats go to two columns, and the last odd card spans both.
  - 720px and below: editions go to one column, nav links other than "Hire me" are hidden, the ledger loses its tech column, and the hero top padding is 40px.
  - 480px and below: stats use `1fr 1fr` with a 10px gap, and CTAs get smaller padding.
  - From 1081px: the wide Atlas card shows all four summit labels instead of two.
- Radii and sizes:
  - Stage frame, edition cards and portal: 20px. Stats: 16px. Ledger rows: 8px.
  - Pills (`999px`): CTAs, nav links, `.lr-status`, `.stage-enter`.
  - The stage screen is `aspect-ratio: 16 / 10.5`, the stage bar is 36px tall, and card previews are 158px tall.

## Components

- `Landing`:
  - Page root, with `data-cursor-accent="landing"` and `data-tone` set to the staged edition (`src/landing/Landing.tsx:292-439`, `:329`).
  - The number-key handler (`:308-323`).
  - Hooks: `useRevealOnScroll` (`:44`), `useWallpaperParallax`, which writes `--px` / `--py` (`:59`), and `usePortal` (`:95`).
- `EditionStage`:
  - Glass browser frame with a fake URL and counter (`:189-193`).
  - All seven skins stacked with a crossfade (`:194-199`).
  - A full-area link (`:200-207`).
  - Segmented progress tabs (`:210-227`), a pause button (`:228-230`) and a role line (`Landing.tsx:145-235`).
  - Auto-advances every `STAGE_INTERVAL_MS` = 4200ms (`:27`, `:158-162`).
- `EditionCard`: a tilt wrapper (`useTilt(5, ".edition-card")`), a key hint `kbd`, a mini skin, then number, label, role, blurb and CTA. Sets `data-cursor={tone}` (`Landing.tsx:237-255`).
- `PortalOverlay`: the clicked preview grows to the full viewport before navigation. It is themed by `.ed-portal--<tone>` (`Landing.tsx:132-143`, `Landing.css:203-233`).
- `Stat`: a counter that counts up when scrolled into view. The repo stat links to GitHub and shows `··` while loading (`Landing.tsx:257-288`).
- Marquee: two copies of the skills list, so the 50% translate loops seamlessly (`Landing.tsx:375-383`).
- Ledger rows: one per featured project, linking to the live URL or the repo, with per-project accent variables (`Landing.tsx:411-422`).
- `Skin`: picks one skin per tone at `stage` or `mini` size. Atlas draws real contours from `src/atlas/terrain` (`src/landing/skins.tsx:67-97`).
- `MotionToggle` in the footer cycles follow-system → on → off (`src/components/MotionToggle.tsx:7-22`, styled `.landing-motion`, `Landing.css:226-228`).

## Motion

- Easings: `--ease: cubic-bezier(0.2, 0.7, 0.2, 1)` and `--spring: cubic-bezier(0.34, 1.4, 0.64, 1)` (`base.css:18-19`).
- Hero entrance: `rise` 0.8–0.9s with staggered delays of 0–0.35s. The surname uses `tilt-in` 1.1s on `--spring`. The stage uses `stage-in` 1.1s with `rotateX(6deg)` (`Landing.css:40-69`).
- Wallpaper:
  - Glows drift on `wallA` 46s and `wallB` 58s (`ease-in-out infinite alternate`).
  - The background transitions over 1.2s when `data-tone` changes.
  - Glow layers shift with the pointer through `--px` / `--py` at up to 40px.
  - The masthead fades and moves at 0.16× scroll speed over the first 500px (`Landing.tsx:59-89`).
- Stage:
  - Skins crossfade with opacity 600ms and scale 900ms.
  - The active segment fills linearly over `--stage-interval`. Rotation pauses on hover, on focus, or from the pause button (`:83-96`, `Landing.tsx:151-162`, `:182-185`).
  - The frame tilts with the pointer and floats on `float-gentle` 6s (`:73`, `:753-758`).
- Cards and rows:
  - Reveal over 700ms with 70ms / 140ms column staggers (`:124-127`).
  - Pointer tilt up to 5°.
  - Hover lift `translateY(-4px) scale(1.01)` with a `card-shine` sweep of 0.9s (`:772-790`).
  - CTA arrows nudge on `--spring`.
  - Where `animation-timeline: view()` is supported, cards and stats also run `scroll-rise` (`src/styles/motion.css:111-130`).
- Other:
  - Marquee 70s linear, paused on hover.
  - Pipeline arrows on `pulse-glow` 1.8s.
  - Scroll cue `scroll-drop` 1.8s.
  - Stats count up over 1100ms with ease-out-cubic (`Landing.tsx:268-273`).
  - Magnetic CTAs (`useMagnetic(".l-cta", 0.25, 10)`, fine pointers only).
- Portal timing: grow 60ms → hold until 640ms → navigate with `viewTransition` → clear after 400ms. Geometry transitions take 620ms (`Landing.tsx:28-30`, `:102-118`). Modifier-clicks and middle-clicks go straight through (`:121-125`).
- Reduced motion (`html[data-motion="reduce"]`):
  - CSS:
    - Wallpaper, marquee, scroll cue and segment animations are off.
    - Stage, card and CTA transforms are forced to `none`.
    - The hero entrance animations are removed.
    - Reveals are shown at once (`Landing.css:184-200`).
    - The portal is `display: none` (`:233`).
    - `src/styles/motion.css:46-51` removes every animation and shortens transitions site-wide.
  - JS (`usePrefersReducedMotion` / `motionReduced`):
    - The portal is skipped and navigation happens at once.
    - The stage does not auto-advance.
    - Stats show their final value.
    - Parallax, tilt and magnetic effects never attach.
    - The view-transition crossfade snaps (`motion.css:94-97`).

## Cursor and shared chrome

- CursorFX: the root's `data-cursor-accent="landing"` selects the landing look.
  - A 9px violet comet core (`#7c6cff` / `#b7adff`) with a 46×4px tail. The tail is rotated against the direction of travel and stretched by speed, up to 1.8× (`src/CursorFX.tsx:26`, `:236-242`, `src/cursor-fx.css:114-150`).
  - Over interactive targets the core scales 1.7×. A click flashes it from 2.4× (`cursor-fx.css:139-150`).
- Edition cards set `data-cursor={tone}`. Over a card the overlay switches to that edition's own cursor as a preview (`CursorFX.tsx:309`, `:315`).
- The macOS card swaps the native pointer for the edition's CSS hand cursor (`cursor-fx.css:494-495`). The overlay is hidden for `mac` (`CursorFX.tsx:332`).
- The overlay is not shown on coarse pointers or under reduced motion (`cursor-fx.css:504-514`).
- Interface switcher: not rendered on the landing, so no `--sw-*` tokens are defined here. Edition switching happens through the cards, the stage and the number keys.
- Scroll chrome: the accent key is `landing` → `#7c6cff` for the 2px progress bar and the back-to-top button (`src/components/ScrollChrome.tsx:7`, `:26-27`).

## Accessibility

- Landmarks and headings:
  - `<header>` with `nav aria-label="Quick links"`, `<main id="main">`, and `<footer>` (`Landing.tsx:333-343`, `:428`).
  - Sections use `aria-labelledby`. The stats section has `aria-label="By the numbers"`.
  - Heading order: one `h1` (`#landing-h1`), then `h2` for Editions and Work, then `h3` per card.
  - There is no skip link on this page.
- Stage semantics:
  - `aria-roledescription="carousel"` with an `aria-label` (`:186-187`).
  - The segment buttons form a `role="tablist"` with roving `tabIndex`. Arrow Left/Right, Home and End move between tabs (`:164-176`, `:210-226`).
  - The screen is a `role="tabpanel"` with `aria-live="polite"`. The skins inside are `aria-hidden`.
  - The overlay link has its own label, "Open the X edition".
  - The pause button exposes `aria-pressed` and a changing label.
- Cards are `role="listitem"` inside `role="list"`. Each link has the label "Open the X edition — role". Previews, key hints and numbers are `aria-hidden`.
- Links that open a new tab carry `.sr-only` text saying so (`:286`, `:338`, `:361`, `:418`). Decorative layers (wallpaper, pipeline, marquee, scroll cue, portal) are `aria-hidden`. The tagline is `aria-hidden`.
- Keyboard:
  - Keys `1`–`7` (up to `EDITIONS.length`) run the portal from the matching card and enter that edition. The handler runs in the capture phase and stops other handlers, and it ignores modifiers and text inputs (`Landing.tsx:308-323`).
  - The visible copy says "Press 1–7" (`:396`), matching the seven editions.
- Focus: base `:focus-visible` is a 2px `--accent` outline with a 3px offset (`base.css:29`). The stage link's outline is inset 3px (`Landing.css:82`).
- Target sizes:
  - Stage segments are at least 24×24px and the pause button is 28×28px (`Landing.css:89`, `:94`).
  - Footer links and the motion toggle have `min-height: 24px` (`:837-838`).
- Contrast: see the Colour section. The lowest computed text pair is `--text-3` on the term wallpaper mid-stop, at 4.71:1.

## Rules for changes

- Add or rename editions only in `src/editions.ts`. The stage, cards, number keys, URL bar and counter all derive from `EDITIONS`. Each new tone also needs:
  - a `Skin` in `skins.tsx`
  - a `data-tone` hue triple (`Landing.css:6-12`)
  - an `.ed-portal--<tone>` theme
  - a hover CTA colour
  - a `Cur` entry in `CursorFX.tsx`
- Use the `base.css` tokens (`--text*`, `--border*`, `--card*`, `--accent`, `--font-*`, `--ease`, `--spring`) for page UI. Raw hex values belong only inside the skin miniatures and portal themes, which imitate other editions.
- Keep microcopy in `--font-mono`, uppercase, at `--text-3` or brighter. Do not go dimmer: `--text-3` is already at 4.71:1 on the darkest-contrast wallpaper.
- Feed page data from `src/classic/data/*` and hooks. Do not type counts or project names into the page.
- Gate every new animation with `html[data-motion="reduce"]` in CSS and `usePrefersReducedMotion()` / `motionReduced()` in JS. Never query `prefers-reduced-motion` directly.
- Anything that navigates to an edition should go through `usePortal().enter` / `onLinkClick`, so modifier-clicks, reduced motion and the view transition behave the same everywhere.
- Mark decorative layers `aria-hidden` and keep the visible label in the accessible name. If a link opens a new tab, add `.sr-only` text saying so.
- Keep controls at 24×24px or larger, and make sure the 1080px, 720px and 480px breakpoints still collapse the grids cleanly when a card is added.
- `.landing-title .landing-grad` and `.land-project-item` (`Landing.css:759-804`) match nothing in `Landing.tsx`. Check them before you build on them.
