# Atlas — design

> The work drawn as a survey atlas: a contour map where every featured project is a summit, read sheet by sheet. Route `/atlas`. Main files: `src/atlas/AtlasSite.tsx`, `src/atlas/styles/atlas.css`, `src/atlas/terrain.ts`, `src/atlas/ContourField.tsx`, `src/atlas/useScrollProgress.ts`, `src/atlas/useLive.ts`.

## Concept and audience

Edition 07, "for wandering" (`src/editions.ts:39`). Its layout follows the Forkfolio atlas page (https://vardhan23v.forkfolio.dev/); every line of code and every fact is this site's own. Projects, roles, skills and contact details come from `src/classic/data/`. Two sheets are live: public repositories from the GitHub API and the last year of contributions from github-contributions-api (`src/atlas/useLive.ts:15`, `src/atlas/useLive.ts:55`). Nothing on the page is invented; when a live source fails, its sheet falls back or hides.

## Colour

Near-black map paper, warm paper-white ink, one survey orange. Tokens live on `.atlas` (`src/atlas/styles/atlas.css:5`).

| Token | Value | Role |
|---|---|---|
| `--bg` | `#0a0a0a` | page |
| `--paper` | `#0d0d0c` | title-sheet map |
| `--card` | `#121110` | plate interiors |
| `--ink` | `#ece8df` | primary text — 16.2:1 on `--bg`, 15.4:1 on `--card` |
| `--ink-2` | `#aaa69d` | secondary text — 8.2:1 on `--bg` |
| `--ink-3` | `#8f8b83` | mono labels — 5.8:1 on `--bg` |
| `--orange` | `#ff5b24` | summits, numerals, progress, focus — 6.4:1 on `--bg` |
| `--line` / `--line-2` | `rgba(236,232,223,.14)` / `.30` | rules, frames, ticks |
| index contour | `#7a5644` | every fifth contour line (map, backdrop, landing preview) |

Browser theme colour for `/atlas` is `#0a0a0a` (`src/seo.ts:55`). The shared back-to-top button uses the orange accent (`src/components/ScrollChrome.tsx:10`), and the site-wide scroll bar is hidden on this page because the Atlas bar carries its own progress line (`src/atlas/styles/atlas.css:379`).

## Typography

- **Host Grotesk** 400/500 (`--sans`) for names, headings and body; **Fragment Mono** 400 (`--mono`) for grid references, labels, counts and captions. Both are OFL, self-hosted via `@fontsource`, imported only in the Atlas chunk (`src/atlas/AtlasSite.tsx:1`).
- Display sizes, all weight 500 (400 for numerals) with tight tracking (−0.03 to −0.05em):
  - name on the title sheet `clamp(3.2rem, 6.6vw, 6.4rem)` (`atlas.css:126`)
  - section titles `clamp(3rem, 7.4vw, 6.4rem)` (`atlas.css:189`); Contact `clamp(4rem, 9vw, 8.4rem)` (`atlas.css:325`)
  - gazetteer number `clamp(5rem, 9vw, 8.4rem)` (`atlas.css:240`); contribution total `clamp(5rem, 13vw, 11rem)` (`atlas.css:276`)
- Body text 16–18px; mono labels 11–13px.

## Layout and spacing

- **One 12-column grid** for everything: `--cols: repeat(12, minmax(0, 1fr))`, `--colgap: 24px`, side gutter `--gut: clamp(16px, 3vw, 44px)` (`atlas.css:16`). The section ruler draws 13 ticks on the same columns, so every block sits on a tick.
- Placement at wide widths: numeral col 1, title cols 2–8, lead cols 9–12; plate 01 card 2–8 with caption 9–12; plate pairs 2–7 and 9–12; gazetteer number 1–3 and list 4–12; skills two groups of 6; activity total 1–7 and facts 9–12; footer 1–4 / 5–8 / 9–12. The bar uses name 1–3, section 4–7, search 8–10, switcher 11–12 (`atlas.css:52`).
- Breakpoints: 1100px (title sheet stacks, bar drops search), 960px (plate 01 sticky stage on/off), 900px and 640px (heads, lists and phone compaction, `atlas.css:462`).
- Title sheet: two frames with A–H × 1–5 coordinates in the gutter; on desktop the name card sits left and the legend bottom-right over the map; below 1100px the map art keeps its own aspect ratio above them.

## Components

| Piece | Where |
|---|---|
| Title sheet: map, summits, name card, legend | `src/atlas/AtlasSite.tsx:88` |
| Sticky bar: section, `/` search combobox, progress line, switcher | `src/atlas/AtlasSite.tsx:184` |
| Section head (ruler, numeral, title, lead, band) | `src/atlas/AtlasSite.tsx:73` |
| I · Project plates | `src/atlas/AtlasSite.tsx:284` |
| II · Gazetteer of smaller builds + live repos | `src/atlas/AtlasSite.tsx:335` |
| III · Skills index citing project numbers | `src/atlas/AtlasSite.tsx:376` |
| IV · Activity: totals, smoothed ridge, day plan, sr-only table | `src/atlas/AtlasSite.tsx:416` |
| V · Route of roles | `src/atlas/AtlasSite.tsx:478` |
| VI · Contact links + form (`sendMessage`, mailto fallback) | `src/atlas/AtlasSite.tsx:502` |
| Terrain: seeded noise, marching squares, summits, grid refs | `src/atlas/terrain.ts:139` |
| Live WebGL contour backdrop (SVG fallback) | `src/atlas/ContourField.tsx:83` |
| Scroll engine writing `--p` | `src/atlas/useScrollProgress.ts:34` |

## Motion

- **Load:** a survey sweep reveals the contours and grid outward from summit 01, the frame and gutter ticks draw in, summits drop in one by one after the sweep, card and legend fade (see the title-sheet entrance in `atlas.css`).
- **Background:** a fixed WebGL fragment shader draws the contour field; scrolling slides and slowly warps it. It renders only on scroll or resize (no idle loop), caps DPR at 1.5, pauses in hidden tabs, and falls back to static SVG contours without WebGL.
- **Scroll engine:** every `[data-p]` element gets `--p` from 0 to 1 for its range (`enter`, `cover`, `sticky`, `exit`), both ways, measured only near the viewport and re-measured after late content, font load, page load and tab return. Effects (`atlas.css:384`):
  - heads: ruler draws, contour band rises, title and lead reveal through a clip;
  - plate 01 only (`data-range="sticky"`): on a 230vh sticky stage the card grows from 0.42 to full size, then steps left as its caption slides in (≥960px); below 960px it enters like the other wide plates;
  - wide plates (04, 07, 10, and 01 on phones): the card rises and settles from 0.94 scale, then caption and grid reference reveal;
  - other plates: survey lines draw across a card corner, image settles, caption reveals;
  - gazetteer and route rows: rule draws, mark scales in, text reveals;
  - skills columns drift together; an orange front sweeps the ridge open and the peak tag appears as it passes; the compass needle swings 140° to north, passes it and settles while the bezel counter-turns; the route's dashed trail draws down through the waypoints; the title sheet lifts away in layers.
- Text never fades (it reveals with clips), so it is never shown at reduced contrast.
- **Reduced motion** (OS setting or `html[data-motion="reduce"]`): `--p` is pinned to 1, exit offsets to 0, plate 01 loses its sticky track, nothing animates, and the backdrop renders one still frame.

## Cursor and shared chrome

- Cursor `data-cur="atlas"`: a survey crosshair with an orange centre that shows the grid square under it ("C4") while over open map, but not over the card, legend or summit links (`src/CursorFX.tsx:43`, `src/cursor-fx.css:517`).
- Switcher tokens: `--sw-*` on `.atlas` (`atlas.css:20`), square items in the bar, numbers only.
- Landing preview: a miniature title sheet drawn from the same terrain (`src/landing/skins.tsx`).

## Accessibility

- One `h1` (the name), sections labelled by their `h2`, everything inside `<main id="main">`; the bar is a `<header>`; a skip link goes to the projects.
- Search is a combobox with a listbox, arrow keys and Enter; `/` focuses it.
- Summits are real links with "summit at E2" in screen-reader text; summit names that would collide with the card or legend hide visually (`.is-quiet`) but stay in the link.
- The contribution chart has a visually hidden monthly table; live sheets announce loading with `aria-busy`.
- Controls are at least 24 × 24px (switcher 28px, 24px wide at 640px and below so all seven fit, gazetteer names 28px, phone summits 32px wide). axe reports 0 issues at 1440 and 390px.

## Rules for changes

- Put every new block on the 12-column grid (`var(--cols)` and `var(--colgap)`); check its left edge lands on a ruler tick.
- Use the tokens; orange is for marks, numerals and focus, never long text.
- Facts only from `src/classic/data/` or the two live sources; don't add stars, forks or dates that aren't in the data.
- New scroll effects read `var(--p, 1)` so the finished state is the default, animate only transform, opacity or clip, and must look right at `--p: 1` under reduced motion.
- Reveal text with clips, not opacity, so contrast never drops mid-scroll.
- Keep the backdrop on-demand: no `requestAnimationFrame` loops while idle.
- Keep Host Grotesk and Fragment Mono imported only here.
- Any live source needs a fallback or a clean hide when it fails.


### Motion polish (2026-11-10)
- Plate cards and the send button lift on hover with `translate` (fine pointers). Reduced motion follows `html[data-motion]` only.

### UI polish (2026-11-10)
- Fixed: the 230vh sticky stage is keyed on `[data-range="sticky"]` (plate 01 only), not on `.atl-plate--0`, so plates 04/07/10 no longer pin for about 1,100px of dead scroll (page 23,376 → 18,811px at 1440). The scroll engine only uses the sticky formula for a track taller than 1.5 screens, so plate 01 below 960px enters smoothly instead of snapping.
- Wide plates get their own entrance (rise + settle, caption and grid ref reveal).
- Title sheet: survey-sweep load (an opaque paper disc with a growing hole, one transform, shown only inside the motion gate), frame and coordinate ticks draw in; contours no longer fade.
- Gazetteer: the sticky numeral and meta roll up or down to the current row; the current triangle grows; names get an orange rule that draws per line.
- Search: results unfold, the active row gets an orange tick and a 4px step; a "no match" note, and a persistent visually hidden status announces the match count.
- Route: one dashed trail links the waypoints and draws with scroll.
- Contact: needle overshoots north and settles (ease-out-back), bezel counter-turns, compass shown on phones (96px); links and legend rows draw an orange survey rule on hover, focus-visible and press; inputs keep the instant orange focus rule and a second line draws to thicken it; the send button shows a scanning line while busy; "Sent" lands with a triangle.
- Phones: the bar fits all seven switcher items (name truncates first); activity axis shows every other month; footer clears the floating launcher (`--floating-clearance`) and ends with a ruler on the 12 column ticks.
- Performance: each scroll frame reads then writes (bar and engine), the % label is only rewritten when it changes; the skeleton sheen is transform-only and runs only on screen; plate hover uses an opacity shade instead of a filter; title layers carry `will-change: transform` (not plate 01, whose scale must re-raster); the WebGL backdrop uses DPR 1.25 on coarse pointers, sizes from its own 100lvh height, ties the warp to scroll distance (not page height) and skips sub-pixel redraws.
