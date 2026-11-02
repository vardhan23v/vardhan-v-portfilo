# Paper — design

> The light editorial edition: serif headlines, mono metadata and thin rules on warm off-white paper, the same work quietly printed. Route `/paper`. Main files: `src/paper/PaperSite.tsx`, `src/paper/styles/paper.css`.

## Concept and audience

Edition 03, "for reading" (`src/editions.ts:27`): "Light editorial — serif headlines and a magazine layout. The same work, quietly printed." The switcher calls it "Editorial" (`src/interface-switcher/InterfaceSwitcher.tsx:6`).

The page is one narrow column: masthead, Selected work, Experience, About (with skills), Contact (`src/paper/PaperSite.tsx:117-256`). It has no data of its own. Projects, roles, skills and contact details come from the shared files in `src/classic/data/` (`PaperSite.tsx:4-7`); every featured project is listed (`PaperSite.tsx:11`). The About prose is written inline in the component (`PaperSite.tsx:208-220`).

## Colour

Tokens live on `.paper-root` (`src/paper/styles/paper.css:5-16`). There is no dark variant. The browser theme colour for `/paper` is `#f5f1ea` (`src/seo.ts:55`), slightly darker than `--paper`.

Contrast ratios were computed with the WCAG 2 formula against `--paper` / `--paper-2`.

| Token or selector | Value | Role |
|---|---|---|
| `--paper` | `#faf8f4` | page background (`paper.css:19`); text on the primary button |
| `--paper-2` | `#f3f0ea` | ghost button hover fill (`paper.css:279-281`) |
| `--ink` | `#1a1815` | headlines, body emphasis, primary button fill. 16.70 / 15.58 |
| `--ink-2` | `#4c4842` | body copy, nav links, taglines, links. 8.56 / 7.98 |
| `--ink-3` | `#6d6860` | mono labels, overlines, numbers, footer. 5.21 / 4.86 |
| `--rule` | `rgba(26,24,21,.14)` | section rules, chip and link underlines (decorative, about 1.33:1) |
| `--accent` | `#be4b2a` | terracotta: italic headline words, wordmark dot, hover colour, underlines, focus outline. 4.68 / 4.37 |
| `--accent-2` | `#9a3b1f` | darker terracotta for the switcher's active number and focus ring. 6.56 / 6.11 |
| `.paper-btn-primary` | `--ink` fill, `--paper` text; hover `--accent` fill | 16.70 at rest, 4.68 on hover (`paper.css:268-277`) |
| `.paper-skip`, `.paper-root::selection` | `#fff` on `--accent` | 4.97 (`paper.css:26-29`, `:50-62`) |
| switcher active tint | `rgba(190,75,42,.09)` over paper ≈ `#f5e8e2` | `--accent-2` on it 5.80, `--accent` 4.14 (`paper.css:660-661`) |
| `.paper-root::before` | fractal-noise SVG at 0.05 opacity | fixed paper grain over the whole page, `z-index: 2`, no pointer events (`paper.css:31-38`) |

The switcher accent is 5.80:1 on the active tint; the lighter accent it replaced was 4.14:1 (`paper.css:660`).

## Typography

Three families, set as tokens at `paper.css:14-16`:
- **Fraunces Variable** (`--serif`) for the wordmark, masthead, project names and numbers, role titles and the contact headline. Global face from `src/styles/fonts.css:28-58`; the italic face is used for the `.it` words.
- **Inter Variable** (`--sans`) for body text, buttons and nav links (`paper.css:21`). Global face from `src/styles/fonts.css:10-25`.
- **JetBrains Mono** (`--mono`) for overlines, metadata, tech chips, links, labels and the skip link. Loaded site-wide at 400/500/700 (`src/main.tsx:5-10`); Paper sets no weight on it, so it renders at 400.

| Size | Weight / details | Where |
|---|---|---|
| `clamp(52px, 8.4vw, 96px)` | Fraunces 500, lh 1.02, `-0.025em` | masthead name (`paper.css:201-207`) |
| `clamp(34px, 5vw, 52px)` | Fraunces 500, lh 1.1, `-0.02em` | contact headline (`paper.css:541-548`) |
| 30px | Fraunces 550, `-0.015em` | project names (`paper.css:308-315`) |
| 21px | Fraunces 600 | wordmark (`paper.css:86-91`) |
| 20px (15px at ≤720px) | Fraunces | project numbers (`paper.css:302-306`, `:616`) |
| 20px | Fraunces 550 | role titles (`paper.css:481-485`) |
| 17px | Inter, lh 1.75 | masthead intro (`paper.css:214-220`) |
| 16px | Inter, lh 1.85 | About prose (`paper.css:502-507`) |
| 15.5px | Inter, lh 1.65 | project taglines (`paper.css:338-344`) |
| 14.5px | Inter | company names, skill lines (`paper.css:487-491`, `:519-524`) |
| 14px | Inter, lh 1.7 | engineering details body (`paper.css:437-444`) |
| 13.5px | Inter 600, `0.02em` | buttons (`paper.css:250-262`) |
| 12.5px | Inter, uppercase, `0.12em` | nav links (`paper.css:97-105`); also mono masthead meta and the footer |
| 12px | mono | project links, "engineering details" toggle (uppercase `0.06em`), periods, skill labels (uppercase `0.1em`), skip link |
| 11.5px | mono, uppercase, `0.22em` | section overlines (`paper.css:150-160`); tech chips |
| 11px | mono, uppercase, `0.16em` | engineering detail labels (`paper.css:446-454`) |

## Layout and spacing

- One centred column: nav, main and footer are each `max-width: 960px` with 32px side padding (`paper.css:74-84`, `:137-143`, `:557-571`). The nav drops to `18px 20px` at ≤720px (`paper.css:619-622`); main keeps 32px.
- Vertical rhythm: masthead `96px 0 72px` (`64px 0 48px` at ≤720px); sections `88px 0` (`60px 0` at ≤720px) with a top rule (`paper.css:145-148`, `:182-184`, `:613-614`). Overlines sit 38px above their content.
- Text measures: intro 540px, taglines and engineering details 620px, prose 640px, contact headline 560px.
- Patterns:
  - Nav: flex, space-between, wraps (`paper.css:74-84`).
  - Work rows: grid `64px 1fr`; every second row mirrors to `1fr 64px` with the number on the right (`paper.css:285-292`, `:387-398`); one column at ≤720px.
  - Experience: grid `1fr auto`, role left, period right on a shared baseline (`paper.css:467-475`); one column at ≤720px.
  - Skills: grid `130px 1fr` per line (`paper.css:519-524`); one column at ≤720px.
  - Engineering details: a grid row that opens from `0fr` to `1fr` (`paper.css:421-435`).
- Breakpoints that exist: 720px (the phone layout above; nav links move to their own full-width row and scroll sideways, `paper.css:612-634`) and 900px (the switcher loses its border, background and blur, `paper.css:664-671`). The shared switcher hides edition names at ≤720px (`src/interface-switcher/interface-switcher.css:65-75`).

## Components

- Root, skip link and section-tracking observers: `src/paper/PaperSite.tsx:53-100`.
- Nav with wordmark (links to `/`), section links and the switcher: `PaperSite.tsx:103-115`; styles `paper.css:74-133`.
- Masthead (overline, two-line name with italic accent, intro, résumé and email buttons, mono meta links): `PaperSite.tsx:118-147`; styles `paper.css:182-281`.
- Work row (number, name, tagline, up to five tech chips, github / live demo / case study links): `PaperSite.tsx:153-185`; styles `paper.css:285-398`.
- `EngineeringDetails` disclosure (problem, up to four features, full stack): `PaperSite.tsx:14-51`; styles `paper.css:400-463`.
- Experience rows: `PaperSite.tsx:188-201`; styles `paper.css:467-498`.
- About prose and skill lines: `PaperSite.tsx:203-232`; styles `paper.css:502-537`.
- Contact headline, email button and links: `PaperSite.tsx:234-255`; styles `paper.css:541-553`.
- Footer (copyright, editions, GitHub, email, back to top): `PaperSite.tsx:258-268`; styles `paper.css:557-586`.
- Shared `InterfaceSwitcher`: `PaperSite.tsx:114`, `src/interface-switcher/InterfaceSwitcher.tsx:9`.

## Motion

All Paper motion uses `cubic-bezier(0.22, 1, 0.36, 1)` unless noted.
- Page enter: `.paper-main` fades and rises 12px over 0.35s `ease` (`paper.css:142`, `:588-591`).
- Masthead: each child rises 14px over 0.65s, staggered 0.04s to 0.36s (`paper.css:186-199`).
- Scroll reveal: `[data-pp-reveal]` blocks start at opacity 0 and 16px down and settle over 0.6s with a per-item `--d` delay (`paper.css:595-605`); work rows use `min(i × 0.06, 0.3)s` (`PaperSite.tsx:158`). An IntersectionObserver adds `.pp-in` once per element, then stops watching it (`PaperSite.tsx:58-74`, `rootMargin: 0px 0px -6% 0px`, threshold 0.05). Overline rules draw in over 0.7s after 0.12s (`paper.css:171-178`).
- Active section: a second observer marks the nav link for the section in the band from 35% to 45% down the viewport (`PaperSite.tsx:76-96`); its underline scales in over 0.3s (`paper.css:112-133`).
- Hover: work rows shift 6px right (0.35s, 0.25s while hovered) and the name gets a terracotta underline over 0.45s (`paper.css:291-296`, `:317-336`, `:607-610`); experience rows indent 14px over 0.35s (`paper.css:474-479`); buttons lift 1px (`paper.css:264-266`); links and chips change colour over 0.2s.
- Disclosure: engineering details open over 0.45s (rows) and 0.35s (opacity) (`paper.css:429`).
- Switcher items drift toward the pointer through `useMagnetic` on fine pointers when motion is allowed (`InterfaceSwitcher.tsx:10`, `src/hooks/useMagnetic.ts:10-11`).
- Reduced motion: Paper has no `prefers-reduced-motion` query of its own. It keys off `html[data-motion="reduce"]`, which `src/lib/motion.ts` sets from the OS setting by default or from the site's motion toggle. Under it, reveal blocks are shown at once with no transition (`paper.css:637-641`), every animation and transition in `.paper-root` is cut to 0.001s with one iteration (`paper.css:642-648`), smooth scrolling is off (`paper.css:649-651`), and the global gate removes all animations (`src/styles/motion.css:46-51`). The hover shifts still apply, without the transition. The reveal pre-state is not gated on script having run.

## Cursor and shared chrome

- Cursor: the root sets `data-cursor-accent="paper"` (`PaperSite.tsx:99`), so `CursorFX` uses `data-cur="paper"`. The look is a 7px terracotta (`#be4b2a`) ink dot with an uneven border radius at 0.92 opacity, locked to the pointer, dropping small drops every 5px of movement that fade in 260ms (`src/cursor-fx.css:332-378`, `src/CursorFX.tsx:189-192`). Over links and buttons the dot squashes into a short underline below the pointer; a click splats it over 0.42s and throws six drops (`cursor-fx.css:356-360`, `:370-378`, `CursorFX.tsx:355-359`). Hidden on coarse pointers and under `html[data-motion="reduce"]` (`cursor-fx.css:504`, `:512`).
- Switcher tokens, scoped to `.paper-root .iswitcher` (`paper.css:654-662`): `--sw-bg: rgba(250,248,244,.85)`, `--sw-border: var(--rule)`, `--sw-text: var(--ink)`, `--sw-dim: var(--ink-2)`, `--sw-num: var(--ink-3)`, `--sw-accent: var(--accent-2)`, `--sw-active-bg: rgba(190,75,42,.09)`. At ≤900px the pill drops its border, background and blur (`paper.css:664-671`).
- Scroll chrome: accent `#be4b2a` (`src/components/ScrollChrome.tsx:11`). The top progress bar is a gradient from the accent to a lighter mix with white; the back-to-top button is a 42px circle tinted with the accent and fills with it on hover, white arrow (`src/components/scroll-chrome.css:14-49`). Paper does not restyle either.

## Accessibility

- Landmarks: skip link to `#paper-main`, off screen until focused (`PaperSite.tsx:100`, `paper.css:50-66`); `nav` "Main" (`PaperSite.tsx:103`) containing the switcher's own `nav` "Switch interface" (`InterfaceSwitcher.tsx:12`); `main#paper-main`; a `footer` outside main. The masthead is a `<header>` inside `main`, so it is not a banner landmark.
- Headings: one `h1` (the name), an `h2` overline per section that labels it through `aria-labelledby`, `h3` for project names and the contact headline. Project numbers are `aria-hidden` (`PaperSite.tsx:160`).
- Keyboard: focus is a 2px `--accent` outline at 3px offset (`paper.css:45-48`), 4.68:1 against the paper. The engineering-details toggle is a real button with `aria-expanded` and `aria-controls` (`PaperSite.tsx:19-25`). When closed, its body is collapsed with a `0fr` row and opacity 0 rather than `hidden`, so its text stays in the accessibility tree.
- Target sizes: nav, masthead meta, work and footer links and the details toggle get `min-height: 24px` to meet WCAG 2.5.8 (`paper.css:703-704`). Buttons have 12px vertical padding on 13.5px text.
- Contrast: every text token passes 4.5:1 on `--paper`; on `--paper-2` only `--accent` falls short (4.37), and Paper sets no accent text on that fill. The switcher uses `--accent-2` because `--accent` reached only 4.14 on the active tint (`paper.css:660`).
- External links open in a new tab with `rel="noopener noreferrer"`; unlike Classic, they carry no "opens in a new tab" text. Experience entries are `div`s, not a list.

## Rules for changes

- Use the tokens on `.paper-root` (`paper.css:5-16`). Keep `--accent` for large text, decoration and hover states; use `--accent-2` for small text on tinted backgrounds.
- Scope every selector under `.paper-root` or a `paper-` class prefix; the switcher is themed only through `--sw-*` on `.paper-root .iswitcher`.
- Facts come from `src/classic/data/`, shared with the other editions. Do not edit those files for Paper wording. The inline About text (`PaperSite.tsx:208-220`) and the display handles in the masthead (`PaperSite.tsx:141`, `:144`) must be kept in step with `src/classic/data/experience.ts` and `src/classic/data/site.ts` by hand.
- Keep the type roles: Fraunces for names and headlines (italic `.it` in `--accent` for the emphasised word), Inter for reading, JetBrains Mono uppercase and tracked for metadata.
- Keep the single 960px column with 32px gutters, and add layout changes at the existing 720px and 900px breakpoints.
- New scroll-in blocks use `data-pp-reveal` (and an optional `--d`), so the existing observer and the reduced-motion reset cover them.
- Any new animation must be safe when `html[data-motion="reduce"]` cuts it to 0.001s; do not add motion that only makes sense when it plays.
- Add new text-link or text-button classes to the 24px target list (`paper.css:704`).
- The `.paper-title`, `.pp-title`, `.pp-rule`, `.paper-rule`, `.pp-card`, `.paper-card`, `.pp-chip` and `.paper-chip` rules (`paper.css:673-701`) are not used by `PaperSite.tsx`; use them deliberately or leave them out.
