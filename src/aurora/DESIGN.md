# Aurora — design

> Glass panels floating over slow, blurred colour fields, with a searchable project gallery, a quick-view modal and a Stack Lab that filters the work. Route `/aurora`. Main files: `src/aurora/AuroraSite.tsx` and `src/aurora/styles/aurora.css`.

## Concept and audience

Aurora is edition 04 in `src/editions.ts:30`. Its role is "for exploring", its call to action is "Step into the light", and its blurb is "Glass panels over drifting auroras, with a searchable project gallery and a stack lab." The interface switcher's short name for it is "Visual" (`src/interface-switcher/InterfaceSwitcher.tsx:6`).

The page is a single long scroll: hero, tech marquee, stats, Selected work, Stack lab, Experience, Education, About, Contact, footer. Everything is interactive and can be explored. You can search and filter the gallery, open any project in a modal and step through projects there, roll a random project, pick a hue preset, and expand experience rows. All content comes from the shared data in `src/classic/data/*` (`src/aurora/AuroraSite.tsx:12-17`). The edition does not hold its own copy of the facts.

## Colour

All tokens are declared on `.aurora-root` (`src/aurora/styles/aurora.css:5-29`). The page is dark only.

| Token or selector | Value | Role |
| --- | --- | --- |
| `.aurora-root` background | `#0a0a18` | Page base under the glows |
| `--ink` | `#f5f4ff` | Headings, primary text |
| `--ink-2` | `rgba(216, 223, 255, 0.74)` | Body copy, taglines, links |
| `--ink-3` | `rgba(216, 223, 255, 0.62)` | Labels, ranks, meta, placeholders |
| `--glass` / `--glass-2` / `--glass-3` | white at 0.06 / 0.11 / 0.16 | Panel fill, hover fill (`--glass-3` is declared but not referenced) |
| `--glass-border` / `--glass-border-2` | white at 0.13 / 0.24 | Panel border, hover border |
| `--violet` | `#a78bfa` | Main accent: focus rings, active pills, dots, selection |
| `--pink` | `#f472b6` | Wordmark dot, glow tint |
| `--cyan` | `#22d3ee` | Typewriter caret, rails, glow tint |
| `--mint` | `#34d399` | "Live" signals: availability, system online, toast dot, copied state, skill filter chip |
| `.aurora-grad` | `linear-gradient(105deg, #f0abfc, #a78bfa 35%, #67e8f9 70%, #86efac)` | Gradient text in the hero (`aurora.css:268`) |
| `.aurora-btn-solid` | `linear-gradient(120deg, #c2458b, #7a5ce0)`, text `#fff` | Primary buttons (`aurora.css:345`) |
| `.au-card-tech span` | text `#c9c2ff` on violet at 14% | Tech chips on cards |
| `.au-form-field em` | `#fca5a5` | Form error text |
| `.au-modal` | `rgba(18, 16, 36, 0.96)` | Near-opaque modal surface |
| `--pa1` (inline per card) | `p.accent[0]` from project data | Card hover bloom, featured visual, modal head tint |
| `--au-hue` (inline on root) | `0deg`, `-70deg`, `40deg` or `-120deg` | Hue preset rotation |

**Hue presets.** `HUES` (`src/aurora/AuroraSite.tsx:73-78`) defines Violet (0deg), Cyan (-70deg), Pink (40deg) and Mint (-120deg). The chosen id is saved to `localStorage["au.hue"]` (`AuroraSite.tsx:80`, `:754-760`). It is written to the root as `data-hue` and as `--au-hue` (`AuroraSite.tsx:881`). The CSS applies `filter: hue-rotate(var(--au-hue, 0deg))` with a `0.9s` transition. This covers only `.aurora-bg`, `.aurora-grad`, `.au-contact .grad` and `.au-ft-visual` (`aurora.css:2815-2821`). Buttons, pills, focus rings and other `--violet` uses do not rotate. The cursor also follows the preset (see below).

**Glass recipe.** Panels combine a translucent white fill, a 1px white border and a backdrop blur:

- Nav: `rgba(10, 10, 24, 0.5)`, rising to `0.72` once scrolled, with `blur(20px) saturate(150%)` (`aurora.css:122-145`).
- Cards, stats, lab: `var(--glass)` with `blur(18px)`–`blur(24px)` and `saturate(140%)`–`saturate(150%)` (`aurora.css:538`, `:686`, `:933`, `:2064`).
- Darker insets (certifications, form, lab "exploring", random button): `rgba(10, 10, 24, 0.5)`–`0.55`.
- Hover states move a panel one step up: `--glass` to `--glass-2`, and `--glass-border` to `--glass-border-2`.

**Contrast** (WCAG 2 relative luminance, alpha composited onto `#0a0a18`):

- `--ink`: 18.0:1. `--ink-2`: 8.3:1. `--ink-3`: 6.1:1.
- On a `--glass` panel (white 6% over the base): `--ink-2` 7.7:1, `--ink-3` 5.8:1.
- On the modal surface: `--ink-2` 8.1:1, `--ink-3` 6.0:1.
- White on the solid button ends: 4.65:1 on `#c2458b` and 4.74:1 on `#7a5ce0`. Both pass AA for normal text.
- `#fca5a5` errors 10.3:1. `--mint` 10.2:1. `--violet` 7.2:1. Card chip text `#c9c2ff` 8.4:1.

These figures ignore the glow layers. The glows sit behind the panels at low opacity and only lighten the backdrop slightly.

## Typography

- **Space Grotesk** (`--display`) at weights 500, 600 and 700, imported at the top of `AuroraSite.tsx:1-6`. The CSS uses 600 and 700. It is used for the wordmark, headings, names, the lede and stat values.
- **Inter Variable** (`--sans`, the root font) from `src/styles/fonts.css` is used for body copy, buttons and inputs.
- **JetBrains Mono** (`--mono`) at 400, 500 and 700, loaded site-wide in `src/main.tsx:5-10`. It is used for eyebrows, ranks, labels, filters, tags, the marquee, the hero system panel and the footer hints. These are usually uppercase with `0.08em`–`0.18em` tracking.

Size scale (`aurora.css` line in brackets):

| Size | Family / weight | Where |
| --- | --- | --- |
| `clamp(52px, 6.2vw, 82px)`, ≤560px `clamp(40px, 11vw, 54px)` | Display 700, `-0.03em`, lh 1.02 | Hero `h1` `.aurora-title` (258, 1550) |
| `clamp(34px, 4.6vw, 56px)` | Display 700 | Contact `h2` (1350) |
| `clamp(34px, 3.6vw, 46px)` | Display 700 | Section `h2` (655, 1244) |
| `clamp(30px, 3.4vw, 40px)` | Display 700, gradient text | Stat values (564) |
| `clamp(28px, 2.8vw, 36px)` | Display 700 | Featured project name (760) |
| `clamp(21px, 1.7vw, 25px)` | Display 700 | Card names (986) |
| `clamp(20px, 2vw, 26px)` | Display 600 | Hero name line (240) |
| 24px | Display 700 | Modal title, featured visual name (1992, 881) |
| `clamp(18px, 1.6vw, 21px)` | Display 600 | Hero lede (282) |
| `clamp(17px, 1.5vw, 21px)` | Display 600 | Experience role (1207) |
| 19px | Display 700 | Wordmark (165) |
| 16–16.5px | Inter | Hero sub, subheads, about prose, contact copy, featured tagline (291, 662, 1268, 768) |
| 14–14.5px | Inter | Card tagline, buttons, skill items, modal body, search, form inputs (1000, 306, 1329, 2005) |
| 13–13.5px | Inter | Card links, lab categories, experience bullets, toast (1026, 2125, 2188, 1602) |
| 12–12.5px | Mono | Eyebrow, filters, section tags, marquee, footer (225, 610, 670, 515, 1416) |
| 10–11.5px | Mono | Ranks, stat labels, engineering labels, hints, chips, dot labels (752, 577, 1123, 1675, 457) |

## Layout and spacing

- `.aurora-inner` is the single content column: `max-width: 1280px` (1320px at ≥1700px), centred, gutter `clamp(20px, 4vw, 40px)` (`aurora.css:105-118`). The background `.aurora-bg` is `position: fixed; inset: 0` at z-index 0, and the content sits at z-index 1.
- Sections: `.aurora-section` has padding `64px 0 104px` and `scroll-margin-top: 92px` so the sticky nav clears anchors (`aurora.css:596`). At ≤800px this becomes `48px 0 80px` and the margin 84px.
- Hero: two-column grid `6fr / 6fr` with gap `clamp(40px, 5vw, 72px)` (`aurora.css:206`). It becomes one column at ≤1024px.
- Stats: 4 columns, 2 at ≤800px (`aurora.css:531`, `:588`).
- Featured project: grid `7fr / 5fr`, one column at ≤800px (`aurora.css:686`, `:1530`). Rest of the gallery: `.aurora-grid` with 2 columns and an 18px gap, 1 column at ≤800px. List view (`.is-list`) is one column with row cards, which stack again at ≤700px (`aurora.css:913`, `:1866-1884`).
- About: `4fr / 8fr`, with an inner `8fr / 4fr` for prose and meta. Both collapse at ≤1024px (`aurora.css:1238-1266`, `:1470`).
- Education `7fr / 5fr`, one column at ≤900px. Contact grid `5fr / 7fr`, one column at ≤860px. Lab categories and the "exploring" grid have 2 columns, 1 at ≤700px. Form name/email row is 2 columns, 1 at ≤560px.
- Stacking: background z-index 0, content 1, section dots 15, nav 20, modal backdrop 55, toast 60 (`aurora.css:34`, `:107`, `:2654`, `:125`, `:1926`, `:1607`).
- Spacing is set per component in px. There is no spacing token scale. Gaps between sibling panels are mostly 14–18px, and pill rows use 8–10px.
- Radii scale with surface size: 32px contact panel, 28px featured card, 24px hero panel / lab / modal, 22px cards, 18px nav / stats / education, 14px buttons, 999px for every pill.
- Breakpoints present: `min-width: 1700px`, and `max-width` 1180 (section dots hidden), 1024, 900 (education, switcher chrome), 860, 800, 700, 560, plus `pointer: coarse` (spotlight off).

## Components

- **Background**: three blurred radial glows (`.au-glow-purple/-blue/-cyan`, 720/620/560px, `blur(110px)`) and a 640px `.au-mouse-glow` that follows the pointer (`AuroraSite.tsx:882-887`, `aurora.css:56-88`, `:1584`).
- **Section dots**: a fixed right-edge `<nav aria-label="Sections">` with one link per `SECTIONS` entry. Labels appear on hover or focus. It is hidden at ≤1180px (`AuroraSite.tsx:901-917`, `aurora.css:2650-2711`).
- **Top nav**: a sticky glass bar with the wordmark link to `/`, `ExpandableTabs` (Home, Projects, Experience | About, Contact) and the `InterfaceSwitcher` (`AuroraSite.tsx:927-940`). An IntersectionObserver highlights the tab for the section in view (`:670-687`). Its bottom light line doubles as scroll progress via `--sp` (`:719-736`, `aurora.css:2641`). At ≤800px the tabs drop to their own scrollable row, and once scrolled the wordmark and switcher hide (`aurora.css:1490-1514`).
- **Hero** `header#home`: name, eyebrow, `h1`, lede, sub, availability and IST clock chips, three buttons, keyboard hints and the hue swatch group (`AuroraSite.tsx:943-1003`). On the right is an `aria-hidden` "build system" panel with a typewriter cycling project names, a five-step rail and counts (`:1004-1037`).
- **Tech marquee**: two copies of the skill list scrolling at `-50%`, `aria-hidden` (`AuroraSite.tsx:1040-1045`).
- **Stats**: four `AuroraStat` glass tiles (featured products, roles, stack technologies, GitHub followers) that count up when 40% visible (`AuroraSite.tsx:237-275`, `:1047-1051`).
- **Project toolbar**: a search input (matches name, tagline, tech, slug), a sort `<select>` (Featured, A → Z, Most stack), a random button and a grid/list toggle with `aria-pressed` (`AuroraSite.tsx:1066-1122`). Category filters with counts, an active skill chip and "clear" follow (`:1124-1148`). The filtering logic is at `:801-818`.
- **Gallery**: the first filtered project renders as `FeaturedProject` with `useTilt(4)` (`AuroraSite.tsx:429-478`). The rest render as `AuroraCard` with `useTilt(5)` (`:480-516`). Each card opens the quick view in two ways: a real `<button class="au-open">` on the project name with `aria-label="Open {name} quick view"` (`:442`, `:492`), and a click anywhere on the `<article>`. The name button and the links row call `stopPropagation` so GitHub, Live Demo and Case study links do not also open the modal. `.au-open` is styled with `all: unset` so it reads as a heading (`aurora.css:3033`). The featured card also embeds `AuroraDetails`, an expandable "engineering details" disclosure (`AuroraSite.tsx:196-235`). There is an empty state with a "Clear filters" button (`:1152-1164`), and a footer line showing the count and sort (`:1185-1192`).
- **Quick-view modal** `ProjectModal`: `role="dialog" aria-modal="true"` (`AuroraSite.tsx:279-427`). It has a close button, previous/next with an "n / total" counter, an accent-tinted head with live GitHub stars and last push (fetched once per session and cached in `sessionStorage`, `:107-141`), then problem, features, stack, and actions (GitHub, Live Demo, Case study, Copy link, Close). Opening it writes `#p=<slug>` to the URL, and loading `/aurora#p=<slug>` reopens it (`:762-778`). Stepping walks the current filtered list (`:849-861`).
- **Stack Lab** `section#stack`: up to 28 unique project technologies as toggle pills (`aria-pressed`). Clicking one sets the skill filter on the gallery and scrolls to `#work`. Below are skill categories and a "currently exploring" list (`AuroraSite.tsx:834-838`, `:1196-1249`).
- **Experience** `section#experience`: a timeline list with accent-coloured dots. Each row has a "details / hide" toggle with `aria-expanded` that opens its bullet points through a `grid-template-rows` transition. The first row starts open (`AuroraSite.tsx:1251-1291`, `aurora.css:2151-2200`).
- **Education** `section#education`: school cards with a violet→cyan left bar, plus a certifications chip panel (`AuroraSite.tsx:1294-1328`).
- **About** `section#about`: prose with highlights, a `<dl>` of location, education, focus and current status, and a skills spec list (`AuroraSite.tsx:1330-1383`).
- **Contact** `section#contact`: a gradient-tinted glass panel with a mailto button, `CopyEmail` (10 spark particles on copy, label flips to "copied ✓" for 2s), LinkedIn and GitHub pills, and `ContactForm` (`AuroraSite.tsx:1385-1415`). The form validates name, email and a message of at least 10 characters, and links each error by `aria-describedby`. It sends through `sendMessage`. With no key it opens a `mailto:` fallback, and on failure it shows an `role="alert"` hint with a direct email link (`:550-643`).
- **Toast**: a fixed bottom-centre pill, `role="status" aria-live="polite"`, cleared after 3.2s (`AuroraSite.tsx:665-668`, `:919-924`).
- **Footer**: copyright with edition name and IST time, plus links to editions, GitHub, Email and a "top ↑" button (`AuroraSite.tsx:1419-1431`).

## Motion

- **Background glows.** Two rule sets exist. The first block assigns `auglow1-3` (62s/74s/68s, translations up to 70px; `aurora.css:63-103`). A later block, "moved from src/styles/motion.css", sets `.aurora-root .au-glow` to `float-gentle 8s`, the blue glow to `float-gentle-reverse 10s` and the cyan glow to `float-gentle 12s alternate-reverse` (`aurora.css:2917-2926`). Its selectors are more specific, so the 6px vertical `float-gentle` loops are the ones that actually run. The keyframes live in `src/styles/motion.css:13-20`.
- **Pointer glow.** `.au-mouse-glow` moves with `left/top` transitions of 0.35s, driven by a `mousemove` listener that stores the pointer position in React state (`AuroraSite.tsx:780-786`).
- **Entrances.** The hero copy children stagger in with `auin` (0.55s, `cubic-bezier(0.22, 1, 0.36, 1)`, 0.08s steps; `aurora.css:215-223`, `:2474-2476`). `.au-reveal` groups use a scroll-driven `view()` timeline where supported (`aurora.css:1450`). Elsewhere they fall back to an IntersectionObserver that adds `.is-in` (`AuroraSite.tsx:702-717`, `aurora.css:2523-2531`). Children of stats, filters, lab pills, experience rows, education cards, certifications and skills stagger on `.is-in` with `auin` or the springy `auPop` (`cubic-bezier(0.34, 1.56, 0.64, 1)`; `aurora.css:2534-2577`).
- **Hero panel boot.** The rail draws over 1.1s, rows fade in from 0.6s, the "deployed" chip pops at 1.6s, then a signal patrols the rail (3.6s loop) and markers ping in turn (`aurora.css:2479-2514`). The typewriter types at 46ms per character, deletes at 24ms and holds for 1.7s (`AuroraSite.tsx:144-184`).
- **Cards.** A pointer spotlight (`--sx/--sy`, 240px radial) runs on cards, the featured card and stats (`AuroraSite.tsx:187-192`, `aurora.css:2733-2751`). `useTilt` writes `--rx/--ry`, which the base `.au-card`/`.au-ft` transforms read (`aurora.css:700`, `:946`). The later `.aurora-root .au-card:hover` rule keeps those angles and adds the lift: `perspective(1100px) rotateX(var(--rx)) rotateY(var(--ry)) translateY(-6px) scale(1.015)`, plus a `card-shine` sweep (`aurora.css:2933-2956`), so cards tilt toward the pointer while lifted.
- **Modal.** The backdrop fades in over 0.28s. The card enters with `auModalCard` and, when stepping, slides 28px from the side you moved toward (`auSlideL/R`, 0.34s; `aurora.css:1933-1955`, `:2788-2801`).
- **Small loops and effects.** Availability and status dots pulse (2.2–3.2s). The gradient text drifts (`augrad` 9s). The marquee runs 38s linear and pauses on hover. The featured glyph floats (5s) and its name shimmers (7s). Solid buttons get a 0.7s light sweep. The random die rolls for 0.5s and the pick lands after 520ms. Stat counters run 1.2s with ease-out cubic.
- **Reduced motion.** JS checks `motionReduced()` from `src/lib/motion.ts`, which reads `html[data-motion]`. Under reduce, the typewriter shows the first word statically, counters jump to their value, tilt is not attached, the random pick is instant, and nav and dot scrolling use `behavior: "auto"`. In CSS, `html[data-motion="reduce"] .aurora-root *` cuts every animation and transition to 0.001s with one iteration, `.au-reveal` loses its animation, and `.au-mouse-glow` is hidden (`aurora.css:1567-1577`, `:1599`). Every rule that parks content at `opacity: 0` is gated on `html:not([data-motion="reduce"])` (`aurora.css:2428-2431`). The Stack Lab pill scroll and the footer "top ↑" button also switch to `behavior: "auto"` under reduce.

## Cursor and shared chrome

- **Cursor.** The root carries `data-cursor-accent="aurora"` (`AuroraSite.tsx:881`), so `src/CursorFX.tsx` sets `data-cur="aurora"` on the overlay. The look is a 5px white `.cur-core` with a 64px `.cur-glow` built from three radial gradients at hue 265deg, 190deg and 225deg, offset by `--cur-hue` (`src/cursor-fx.css:383-426`). The dot follows at a lerp of 0.55 and the glow at 0.075 per frame, so the glow trails behind (`src/CursorFX.tsx:30`). The glow stretches and rotates along the direction of travel (`:228-232`). It scales to 1.55 over interactive elements and flares for 600ms on click (`:40`). `LIVE_VARS.aurora` copies `--au-hue` from the root into `--cur-hue`, and a MutationObserver on `data-hue` and `style` keeps it in sync, so the cursor follows the visitor's hue preset (`:53`, `:262-275`). The overlay is hidden on coarse pointers and under `html[data-motion="reduce"]` (`src/cursor-fx.css:504-514`).
- **Interface switcher.** `.aurora-root .iswitcher` maps the tokens as follows: `--sw-bg: var(--glass)`, `--sw-border: var(--glass-border)`, `--sw-text: var(--ink)`, `--sw-dim: var(--ink-2)`, `--sw-num: var(--ink-3)`, `--sw-accent: var(--violet)`, `--sw-active-bg: rgba(167, 139, 250, 0.16)` (`aurora.css:2410-2418`). At ≤900px its border, background and blur are removed (`:2420-2427`). Items use `useMagnetic(".iswitcher-item", 0.22, 6)` (`src/interface-switcher/InterfaceSwitcher.tsx:10`).
- **Scroll chrome.** `src/components/ScrollChrome.tsx:12` maps `aurora` to `#f0abfc`. That colour drives the 2px top progress bar and the back-to-top button's `--sc-accent`.

## Accessibility

- **Landmarks.** The decorative background, section dots, toast and modal sit outside `<main>`. The top `<nav aria-label="Main">` is also outside. All page content (hero `header#home` through `section#contact`) is inside `<main id="main">` (`AuroraSite.tsx:942-1417`). The footer follows `</main>`. Each section has `aria-labelledby` pointing at its `h2`. The hero has the only `h1`.
- **Decorative layers.** The background, hero system panel, marquee, featured visual, spotlights, sparks and arrow glyphs are `aria-hidden`.
- **Keyboard.** A global `:focus-visible` outline (2px `--violet`, 3px offset) applies, with extra rules for filters, view buttons and experience toggles (`aurora.css:49-52`, `:3020-3030`). Card articles are not focusable. The keyboard path into the quick view is the `.au-open` name button, and focusing it brightens the card border through `:has(.au-open:focus-visible)` (`aurora.css:3034`). In the modal, Escape closes it, the arrow keys step projects, a click on the backdrop closes it, and body scroll is locked (`AuroraSite.tsx:305-327`). On open, focus moves to the Close button; Tab and Shift+Tab stay inside the dialog; on close, focus returns to whatever opened it (usually the project's `.au-open` button).
- **State.** Filters, view mode, hue swatches and lab pills expose `aria-pressed`. Disclosures expose `aria-expanded` and `aria-controls`. Section dots and switcher items use `aria-current`. The search and sort controls have `aria-label`s.
- **Contrast.** Even the faintest text token (`--ink-3`) is at least 5.8:1 on glass panels. Solid buttons use darker gradient stops (`#c2458b`, `#7a5ce0`) so white text clears 4.5:1.
- **Target sizes.** A dedicated block sets 24px minimums for hue swatches, a 32px minimum height for search and sort, and a 26px minimum height for card links, the engineering toggle, footer links and "top ↑" (`aurora.css:3036-3039`). Modal step buttons are 26×26px, view buttons 36×32px and the modal close button 36×36px. The search clear button is 22×22px.

## Rules for changes

- Scope every selector under `.aurora-root` or an `au-`/`aurora-` class, and use the root tokens (`--ink*`, `--glass*`, `--violet` and so on) rather than new literal colours.
- Later blocks in `aurora.css` override earlier ones (the glow animations above are one example, and the card hover once hid the tilt). Before you edit a rule, search the whole file for the selector.
- Any rule that hides content at `opacity: 0` must be gated on `html:not([data-motion="reduce"])`. In JS, check `motionReduced()` and never the media query directly.
- Keep the project name as the real `<button class="au-open">`. Any new interactive element inside a card must call `stopPropagation` so it does not also open the quick view.
- When you add a section, give it an `id`, an `h2` with `aria-labelledby`, and the `.aurora-section` class for scroll margin. Add it to `SECTIONS` (dots) and, if needed, `NAV_TABS`.
- When you add a layer that should follow the hue preset, add it to the `hue-rotate` list at `aurora.css:2815`. Do not hard-code hue-dependent colours elsewhere expecting them to rotate.
- Take counts and copy from `src/classic/data/*` (projects, experience, skills, stats, site). Do not type numbers into the markup.
- Keep new controls at least 24×24px, following the touch-target block at the end of `aurora.css`.
- Keep decorative additions `aria-hidden` and outside the reading order, the same way the hero panel and marquee are.
