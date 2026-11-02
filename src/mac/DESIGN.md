# macOS — design

> "Vardhan OS 2.0", a working glass desktop in the browser: windows, Dock, menu bar, Spotlight, Finder, Settings, Mission Control and more, all driven by the portfolio data. Route: `/mac` (`/mac?noboot=1` skips the boot and login screens). Main files: `src/mac/MacPortfolio.tsx`, `src/mac/components/desktop/Desktop.tsx`, `src/mac/hooks/useWindowManager.tsx`, `src/mac/hooks/usePreferences.tsx`, `src/mac/styles/tokens.css`, `src/cursors/mac-cursors.css`.

## Concept and audience

- Edition 06 in `src/editions.ts:36-38`: role "for fun", blurb "A working desktop — Finder, Notes, Messages, Terminal, Launchpad and Mission Control, all real".
- The Settings "About" row names it "Vardhan OS 2.0 · glass edition (2026)" (`src/mac/apps/SettingsApp.tsx:446`). The menu bar shows "Vardhan OS" when no window is active (`src/mac/components/desktop/MenuBar.tsx:134`).
- Flow: boot (wordmark and progress bar) → login card → desktop (`src/mac/components/boot/BootScreen.tsx:18-82`). Boot is skipped when `?noboot=1` is set or `sessionStorage["mac-booted"]` is `"1"` (`src/mac/hooks/useShell.tsx:41-49`).
- The seven portfolio pages (Overview, About, Projects, Experience, Skills, Achievements, Contact) open as windows; OS apps (Finder, Terminal, Messages / Vardhan AI, Settings, About This Mac, Notes, Photos, Preview) render from the same data (`src/mac/apps/AppContent.tsx:13-32`).
- Provider order: Theme → WindowManager → Preferences → Shell → Palette → Nav → Toast → ContextMenu (`src/mac/MacPortfolio.tsx:17-63`).

## Colour

Everything is scoped to `.mac-root`. The root carries `data-theme`, `data-accent`, `data-mac-motion` and `data-cursor-accent="mac"` (`src/mac/MacPortfolio.tsx:22-29`). Theme starts from `localStorage["mac-theme"]`, else `prefers-color-scheme` (`src/mac/hooks/useTheme.tsx:14-18`); accent defaults to `"blue"` (`src/mac/hooks/usePreferences.tsx:19-31`).

Theme tokens (`src/mac/styles/tokens.css:51-136`):

| Token | Dark (default) | Light | Role |
| --- | --- | --- | --- |
| `--ink` | `#0b0f1a` | `#eef0f5` | Root background |
| `--bg` | `#0d1220` | `#eef0f5` | Base background |
| `--surface` | `#141a2b` | `#ffffff` | Window surface (windows use it at 84% via `color-mix`) |
| `--glass-bg` / `--glass-bg-strong` | `rgba(18, 24, 40, 0.62)` / `0.86` | `rgba(255, 255, 255, 0.58)` / `0.86` | Dock, menus, popovers, palette |
| `--glass-border` | `rgba(255, 255, 255, 0.11)` | `rgba(255, 255, 255, 0.7)` | Glass edges |
| `--toolbar-bg` | `rgba(14, 18, 32, 0.55)` | `rgba(255, 255, 255, 0.5)` | Menu bar |
| `--text-primary` | `#f2f3f8` | `#12151f` | Main text |
| `--text-secondary` | `#a9afc3` | `#565c70` | Secondary text, menu triggers |
| `--text-tertiary` | `#6d7590` | `#8b91a6` | Captions, `.mac-caps`, shortcuts |
| `--border` / `--border-strong` | `rgba(255,255,255,0.08)` / `0.16` | `rgba(0,0,0,0.08)` / `0.15` | Hairlines |
| `--overlay` | `rgba(4, 6, 12, 0.55)` | `rgba(20, 24, 40, 0.35)` | Launchpad, Mission Control, help backdrop |
| `--traffic-close` / `--traffic-minimize` / `--traffic-maximize` | `#ff5f57` / `#febc2e` / `#28c840` | same | Window controls |
| `--traffic-inactive` | `rgba(255, 255, 255, 0.18)` | `rgba(0, 0, 0, 0.15)` | Controls of background windows |
| `--ok` | `#4ade80` | `#16a34a` | Status dots |
| `--el-1` … `--el-4` | black shadows, 0.25–0.65 | navy `rgba(20,30,60,…)`, 0.08–0.28 | Elevation scale |

Accent matrix (`src/mac/styles/tokens.css:91-93`, `132-134`, `139-157`). `data-accent` also sets the wallpaper hues `--wp-h1/2/3`. Light themes keep `--accent-ink: #ffffff` for every accent (set once at `tokens.css:132`).

| `data-accent` | Wallpaper hues | Dark `--accent` / hover / ink | Light `--accent` / hover |
| --- | --- | --- | --- |
| `blue` (default, no attribute rule) | 225 / 262 / 196 | `#6ea8ff` / `#8dbaff` / `#061024` | `#2563eb` / `#1d4ed8` |
| `purple` | 258 / 290 / 230 | `#b48cff` / `#c6a6ff` / `#14082b` | `#7c3aed` / `#6d28d9` |
| `pink` | 330 / 355 / 280 | `#ff7ab3` / `#ff9cc6` / `#2b0815` | `#db2777` / `#be185d` |
| `orange` | 22 / 350 / 45 | `#ffab5e` / `#ffc084` / `#2b1400` | `#ea580c` / `#c2410c` |
| `green` | 165 / 200 / 120 | `#5fe3a1` / `#86ecb9` / `#032116` | `#059669` / `#047857` |
| `graphite` | 225 / 230 / 215 | `#c7cbd8` / `#e0e3ec` / `#0b0f1a` | `#3f4757` / `#2b3140` |

Each accent also defines `--accent-subtle` (0.14–0.15 alpha dark, 0.1 light), `--accent-border` (0.4–0.42 dark, 0.35 light) and `--input-focus`. Graphite desaturates app glyphs (`tokens.css:158`, `shell.css:244`). The Settings swatches use separate display colours (`#0a84ff`, `#bf5af2`, `#ff375f`, `#ff9f0a`, `#30d158`, `#98989d`) that are not the tokens (`src/mac/apps/SettingsApp.tsx:25-32`).

Wallpaper: a 165deg gradient plus three radial layers built from `hsl(var(--wp-h*) …)`, grain and vignette, with separate light values (`src/mac/styles/shell.css:30-65`), and a time-of-day tint from the IST hour (`shell.css:424-428`, `src/mac/components/desktop/Wallpaper.tsx:11-17`).

Contrast (WCAG 2 formula, against the opaque `--surface`; real windows are 84% surface over the wallpaper, so treat these as approximate):

| Pair | Dark | Light |
| --- | --- | --- |
| `--text-primary` | 15.63:1 | 18.22:1 |
| `--text-secondary` | 7.92:1 | 6.64:1 |
| `--text-tertiary` | 3.79:1 | 3.13:1 |
| `--accent` on surface (blue / purple / pink / orange / green / graphite) | 7.18 / 6.71 / 7.17 / 9.27 / 10.71 / 10.69 | 5.17 / 5.70 / 4.60 / 3.56 / 3.77 / 9.33 |
| `--accent-ink` on `--accent` (same order) | 7.86 / 7.40 / 7.57 / 9.34 / 10.53 / 11.81 | 5.17 / 5.70 / 4.60 / 3.56 / 3.77 / 9.33 |

Light orange and light green fall below 4.5:1 for white text on the accent (highlighted menu items, palette selection, primary buttons). Tertiary text is below 4.5:1 in both themes.

## Typography

- Families (`src/mac/styles/tokens.css:7-10`): `--font-ui` Inter Variable, `--font-display` Fraunces Variable, `--font-mono` JetBrains Mono. None are imported by the edition; they come from the site-wide `src/styles/fonts.css` (Inter and Fraunces variable, weight axis 100–900, Fraunces also italic) and `src/main.tsx:5-10` (JetBrains Mono 400 / 500 / 700).
- Root: Inter at `--text-base` (0.9375rem), line-height 1.55, `font-feature-settings: "ss01", "cv11"` (`tokens.css:162-175`). `.mac-serif` sets Fraunces with `"opsz" 144, "SOFT" 40`, weight 500 (`tokens.css:195`). `.mac-caps` is mono `--text-meta` (0.6875rem), 0.09em tracking, uppercase, tertiary (`tokens.css:188-194`); window titles use it (`src/mac/components/window/WindowFrame.tsx:603`).

| Token / size | Value | Where used |
| --- | --- | --- |
| `--text-display` | `clamp(2.4rem, 4.2vw + 0.5rem, 4.4rem)` | Overview name `.ov-name`, Fraunces 400 (`pages.css:8-9`) |
| `--text-h1` | `clamp(1.8rem, 2.2vw + 0.6rem, 2.6rem)` | `.page-header__title`, Fraunces 500 (`components.css:66`) |
| `--text-h2` | `clamp(1.25rem, 1vw + 0.7rem, 1.6rem)` | Section titles, Settings heading, empty-desktop title (`components.css:59`, `apps.css:82`, `shell.css:24`) |
| `--text-2xl` / `--text-lg` / `--text-sm` / `--text-xs` | 1.5 / 1.0625 / 0.8125 / 0.75rem | Inline styles in Projects, About, Skills, Experience, Achievements pages |
| `--text-base` | 0.9375rem | Body |
| `--text-meta` | 0.6875rem | `.mac-caps`, page eyebrows |
| `--text-xl`, `--text-3xl`, `--text-4xl` | 1.25 / 1.875 / 2.25rem | Defined, not referenced |
| Fixed sizes | 13px menu items and triggers, 14.5px Fraunces italic app name, 12px mono clock, 10.5px mono Dock tips, 1.15rem Fraunces palette input, 13.5px palette items | `shell.css:84-121`, `228-231`; `components.css:171-175` |
| Display moments | Boot wordmark `clamp(2.6rem, 6vw, 4.6rem)`; screensaver clock `clamp(3.4rem, 14vw, 11rem)` weight 300; lock clock `clamp(3.4rem, 12vw, 8rem)` | `shell.css:282`, `443`, `493` |

## Layout and spacing

- Root fills the viewport: `height: 100dvh; width: 100vw; overflow: hidden` (`tokens.css:168-170`). Spacing scale `--sp-1` 4px … `--sp-16` 64px; radii 6 / 10 / 14 / 18 / 999px (`tokens.css:26-28`).
- z scale (`tokens.css:31-33`): bg 0, icons 5, window 10, dock 40, menubar 50, popover 60, overlay 100, launchpad 150, palette / modal 200, boot 900, toast 1000. The Dock wrapper is raised to 160 so it sits above Launchpad (`smooth.css:168`). Window z starts at 10 and is renormalised once any window passes 500 (`useWindowManager.tsx:165-173`).
- Geometry constants: `MENU_H = 28`, `DOCK_H = 84` (`useWindowManager.tsx:38-39`).
- Menu bar: 28px tall, 10px side padding, 20px blur (`shell.css:68-80`); triggers 22px tall; status buttons 24×24px.
- Default window bounds (`useWindowManager.tsx:70-80`): width 980px for Projects, Finder, Photos, Notes; 760px for Terminal and Preview; 820px for Messages; 860px otherwise, capped at 86% of the viewport; height `min(620, 78% of vh)`; each new window cascades by 28px. Bounds are refit on resize: minimum 360×260, 8px margins, kept between the menu bar and the Dock (`useWindowManager.tsx:60-68`, `114-142`).
- Snap / tile (`useWindowManager.tsx:42-48`): left or right half of the width from `y = 28` down to the Dock; "full" is inset 8px with `y = 32`. Dragging to x ≤ 10, x ≥ vw − 10 or y ≤ 30 previews a snap (`WindowFrame.tsx:31-37`, `shell.css:412-421`).
- Window chrome (`window.css:2-53`): 16px radius (0 when maximized), 38px header, 12px traffic lights with 8px gap, 52px right spacer to balance the lights, 20×20px resize handle in the bottom-right corner. Page content: `.mac-page` max 880px, padding 36 / 44 / 56px (`window.css:58`).
- Dock (`shell.css:205-239`, `smooth.css:64-98`): centred, `bottom: calc(10px + env(safe-area-inset-bottom))`, padding 7px 9px, radius 22px, 46px glyphs (`Dock.tsx:301`). Magnification grows the tile under the pointer to 1.6× with a cosine falloff over 120px (`Dock.tsx:41-42`, `92-109`); scale lifts the tile by up to 14px and adds side margin.
- Other sizes: desktop icons 84px wide with 52px glyphs; Launchpad grid 6 columns, max 880px; Widgets 340px; Spotlight 600px; Control Center 312px; Dev panel 340px; menus at least 232px; context menu at least 196px; App switcher 64px glyphs.
- Breakpoints (`responsive.css:2-51`, `smooth.css:92-98`, `shell.css:452`, `498`): 1024px (page padding 28px, Launchpad 4 columns, Finder preview hidden), 760px (page grids single column), 640px (phone).
- Phone layout (≤640px): every window is full-bleed below the menu bar (`x 0, y 28, w = vw, h = vh − 112`) in both default and refit bounds (`useWindowManager.tsx:62`, `72`); windows lose their radius; drag, resize, double-click zoom and tiling are disabled (`WindowFrame.tsx:285`, `378`, `437`, `443`, `495-497`). The menu bar keeps only the ✦ and app menus; the Dock drops magnification, tips and the separator, uses 38px glyphs and scrolls sideways; desktop icons and the snap preview are hidden; Launchpad goes to 3 columns; Widgets go full width; Finder hides its sidebar; Settings collapses to a 52px icon rail. Dock reordering is off at ≤640px (`Dock.tsx:173`).

## Components

- `Desktop` — wallpaper, menu bar, `<main id="main" aria-label="Desktop">` window layer, Dock and overlays; hot corners, page shortcuts, system shortcuts, Mission Control layout and Spotlight shell commands (`src/mac/components/desktop/Desktop.tsx:34-294`, main at `:252-283`).
- `WindowFrame` — one window: open zoom from the Dock tile, FLIP for zoom / tile / refit, genie minimise and restore, drag, resize, snap hints, tiling menu on the green light, title-bar context menu, Mission Control and Show Desktop transforms (`src/mac/components/window/WindowFrame.tsx:97-619`; genie `:52-72`).
- `useWindowManager` — window list, focus, z order, open / close / minimise / maximise / snap / cycle (`src/mac/hooks/useWindowManager.tsx:103-302`).
- `MenuBar` — ✦ (system), active-app, File, Edit, View, Window, Help menus with hover switching; IST clock opens Widgets; optional Developer Mode chip; Control Center; Spotlight; theme toggle with a circular View Transition reveal (`src/mac/components/desktop/MenuBar.tsx:65-352`; reveal `:91-120`).
- `Dock` — fixed Finder first and Settings last, running apps before the separator, magnification, drag-to-reorder with FLIP (saved to `mac-dock-order`), launch bounce, context menus, auto-hide with a 14px hot zone (`src/mac/components/desktop/Dock.tsx:46-332`).
- `CommandPalette` (Spotlight) — fuzzy search over registered commands, grouped list, ⌘K / Ctrl+K toggle (`src/mac/components/command-palette/CommandPalette.tsx:55-322`). The site-wide palette stands down on `/mac` (`src/components/CommandPalette.tsx:83-84`).
- `ControlCenter` — Wi-Fi, Bluetooth, AirDrop, Focus tiles, appearance segment, brightness, Reduce motion, volume, Dock auto-hide (`src/mac/components/desktop/ControlCenter.tsx:19-153`).
- `SettingsApp` — Appearance (accent swatches, theme, Reduce motion, site-wide Animations On / Off / System), Desktop (wallpapers), Focus, Dock, Network, Sound, General (`src/mac/apps/SettingsApp.tsx:25-503`).
- `FinderApp` — Places sidebar, icon / list views, preview pane, Space for Quick Look (`src/mac/apps/FinderApp.tsx:23-188`).
- Mission Control and Show Desktop are overlay states of `useShell` (`src/mac/hooks/useShell.tsx:3-117`), laid out in `Desktop.tsx:122-144` and applied as transforms in `WindowFrame.tsx:508-509`.
- Also: `Launchpad` (`Launchpad.tsx:29`), `AppSwitcher` ⌥Tab (`AppSwitcher.tsx:6`), `WidgetsPanel` (`WidgetsPanel.tsx:23`), `DesktopIcons` (`DesktopIcons.tsx:96`), `Screensaver` after 120s idle or `?saver=1` (`Screensaver.tsx:6-30`), `SystemStates` lock / sleep / restart / shut down (`SystemStates.tsx:10`), `HelpOverlay` (`HelpOverlay.tsx:3`), `Toast` banners (`Toast.tsx:21`, region `:112`), context menus (`src/mac/hooks/useContextMenu.tsx:35`), `BootScreen` (`BootScreen.tsx:18`), `Wallpaper` (`Wallpaper.tsx:19`), apps `TerminalApp.tsx:35`, `VardhanAIApp.tsx:174`, `NotesApp.tsx:86`, `PhotosApp.tsx:23`, `PreviewApp.tsx:10`, `AboutMacApp.tsx:10`.
- Persisted state: `localStorage` `mac-preferences`, `mac-theme`, `mac-dock-order`, `mac-desktop-icons`; `sessionStorage` `mac-booted`, `mac-greeted`.

## Motion

- Curves and durations (`tokens.css:36-40`): `--ease-cinema` / `--ease-out` `cubic-bezier(0.2, 0.7, 0.2, 1)` (also `EASE` in `WindowFrame.tsx:28`), `--ease-spring` `cubic-bezier(0.34, 1.4, 0.64, 1)`, `--ease-smooth` `cubic-bezier(0.4, 0, 0.2, 1)`; 160 / 320 / 640ms.
- Windows (Web Animations API, `WindowFrame.tsx`): open zoom from the Dock tile 320ms (240ms from the centre when there is no tile, `:134-165`); FLIP on bound changes 340ms (`:168-217`); genie minimise 560ms and restore 480ms (`:52-72`, `:252-280`); close 0.18s (`smooth.css:153-154`); drag and resize move the frame directly each frame and commit at pointer-up (`:283-434`). CSS layout transitions on windows are turned off (`smooth.css:8-14`).
- Mission Control and Show Desktop glide with `--win-tx: 460ms`; `settling` keeps the transition on for 520ms after leaving (`smooth.css:28-33`, `useShell.tsx:69-78`).
- Dock: magnification `transform` / `margin` 90ms linear, settle 300ms spring, bounce 0.9s × 2, reorder FLIP 200ms, drop 260ms (`smooth.css:66-83`, `Dock.tsx:161-164`, `232`).
- Shell: menu drop 0.16s with 20ms item stagger, menu fade-out 140ms, Control Center tiles 0.32s spring with stagger, Launchpad 220 / 260ms in and 200ms out with 28ms app stagger, widgets 0.45s with 55ms stagger, theme reveal 620ms circle (`shell.css:103-105`, `motion.css:52-97`, `smooth.css:135-139`, `MenuBar.tsx:114-117`).
- Ambient: wallpaper drift 46 / 58 / 38s plus pointer parallax (900ms transition), screensaver orbs 22 / 28s, boot shimmer 2.2s and avatar breathe 3s (`motion.css:5-10`, `shell.css:39-56`, `447-451`, `motion.css:171-182`).
- Two gates, both in `tokens.css`:
  - `html[data-motion="reduce"] .mac-root *` — site-wide preference from `src/lib/motion.ts`; animations and transitions drop to 0.001ms, scroll-behavior becomes auto (`tokens.css:206-213`).
  - `.mac-root[data-mac-motion="off"] *` — the in-app Reduce motion switch (`prefs.reduceMotion`, toggled in Control Center and Settings), same reset without the scroll rule (`tokens.css:214-220`; `ControlCenter.tsx:104-108`; `SettingsApp.tsx:138-149`).
- JS checks both gates before starting WAAPI work: `motionOff()` in `WindowFrame.tsx:130-131` and `Dock.tsx:63-66`; the theme reveal (`MenuBar.tsx:94`); wallpaper parallax (`Wallpaper.tsx:32`); boot goes straight to the login card (`BootScreen.tsx:20-23`); `useTilt` skips when `data-mac-motion="off"` (`src/hooks/useTilt.ts:12`). The hot-corner flash checks only `motionReduced()` (`Desktop.tsx:284`); with the in-app switch on, its CSS animation is still zeroed by the gate.
- Settings also exposes the site-wide preference (On / Off / System) next to the in-app switch (`SettingsApp.tsx:159-189`).

## Cursor and shared chrome

- CursorFX overlay is off: any `cur === "mac"` sets `off` and stops the loop (`src/CursorFX.tsx:332-337`), and `.cur-fx[data-cur="mac"]` has `opacity: 0` (`src/cursor-fx.css:500-502`).
- Instead `src/cursors/mac-cursors.css` swaps in static SVG cursor images, tinted per accent and theme (`:5-16`). Arrow hotspot `5 3` with `default` fallback, hand hotspot `10 2` with `pointer` fallback. Fill colours equal the dark / light `--accent` values from the matrix above (for example `#6ea8ff` dark blue, `#2563eb` light blue). The hand goes on links, buttons, ARIA buttons / links / tabs / switches, form toggles and a few edition classes; menus, title bars and toasts keep the arrow; text fields and the Terminal app keep the I-beam; dragging shows `grabbing`, the resize handle `nwse-resize`, and the screensaver and sleep state hide the cursor (`:18-43`).
- Interface switcher: the edition does not render `InterfaceSwitcher` and defines no `--sw-*` tokens. Other editions are reached from ✦ → "Browse Other Editions…" (`MenuBar.tsx:176`).
- Scroll chrome: `ScrollChrome` has no `mac` entry in `ACCENTS`, so the key falls back to `#7c6cff` (`src/components/ScrollChrome.tsx:6-27`). Because `.mac-root` is fixed to the viewport with `overflow: hidden`, the window never scrolls, so the progress bar stays at 0 and the back-to-top button stays hidden. Page windows draw their own accent progress bar, `.mac-scrollprogress` (`window.css:57`).
- Site-wide digit shortcuts are disabled on `/mac` so 1–7 can open page windows (`src/App.tsx:76-77`).

## Accessibility

- Landmarks: `<header aria-label="Menu bar">` with `<nav aria-label="Application menus">` (`MenuBar.tsx:287-289`); `<main id="main" aria-label="Desktop">` for the window layer (`Desktop.tsx:252-255`); `<nav aria-label="Dock">` (`Dock.tsx:314-316`). Each window is `role="dialog"` labelled by its title (`WindowFrame.tsx:527-528`). Spotlight, Launchpad and Help are `aria-modal` dialogs; Control Center, App switcher and Quick Look are dialogs; toasts sit in an `aria-live="polite"` region with `role="status"` (`Toast.tsx:112-118`).
- Menus: triggers have `aria-haspopup="menu"` / `aria-expanded`, dropdowns use `role="menu"` / `menuitem` / `separator`; Escape or an outside pointerdown closes them (`MenuBar.tsx:35-62`, `143-164`, `292-306`). Context menus support ↑ / ↓ / Home / End / Tab / Escape (`useContextMenu.tsx:86-123`). The tiling menu opens from the keyboard with ↓ or ⌥↵ on the green light and supports arrows and Escape (`WindowFrame.tsx:458-473`, `559-564`).
- Shortcuts (`Desktop.tsx:174-232` and the listed components): 1–7 open page windows (skipped in text fields and while an overlay is open); ⌘ / Ctrl+M minimise; Ctrl+↑ or F3 Mission Control; ⇧⌘D Show Desktop; ⌘\` cycle windows; Ctrl+⌥+← / → / ↵ tile left / right / fill; ⌘, Settings; ⇧⌘T theme; Ctrl+⌘Q lock; Escape leaves Mission Control and Show Desktop; ⌘K Spotlight; ⌥Tab app switcher; `?` help; Launchpad arrows / Enter / Escape; Space Quick Look in Finder; Enter or Space on a desktop icon (`DesktopIcons.tsx:80`); Enter, Escape or Space finishes boot (`BootScreen.tsx:37-41`). Modified shortcuts work inside text fields on purpose (`Desktop.tsx:198-199`).
- State: Control Center tiles and switches use `aria-pressed`; Show Desktop windows become `inert` and `aria-hidden` (`WindowFrame.tsx:516-517`).
- Focus: `:focus-visible` draws a 2px `--accent` outline at 2px offset (`tokens.css:184`); highlighted menu and context items use accent fill instead (`shell.css:110`, `smooth.css:113`).
- Target sizes: `.mac-link` gets at least 24px (`src/mac/styles.css:11-12`). Menu bar triggers (22px tall), the clock and the 12px traffic lights are intentionally native-sized to match macOS; the status buttons are 24×24px.
- Contrast decisions: see the tables under Colour. Primary and secondary text pass AA in both themes; tertiary does not; light orange and light green accents fall under 4.5:1 with white text.

## Rules for changes

- Do take every colour from the theme and accent tokens. A new accent needs four pieces: wallpaper hues and dark / light rules in `tokens.css`, an entry in `ACCENTS` (`SettingsApp.tsx:25-32`), and a dark / light cursor pair in `src/cursors/mac-cursors.css`.
- Do gate motion against both `html[data-motion="reduce"]` and `data-mac-motion="off"`. CSS is covered by the resets in `tokens.css:206-220`; any WAAPI or rAF animation must check both, using the `motionOff()` pattern in `WindowFrame.tsx:130` or `Dock.tsx:63`.
- Do change window bounds only through `useWindowManager` (it clamps to 360×260, `MENU_H`, `DOCK_H`). During a gesture, move the frame with `transform` and commit once at pointer-up, as `WindowFrame` does.
- Do animate windows as transforms. `smooth.css` loads last and removes layout transitions (`left` / `top` / `width` / `height`); check it before adding window or Dock CSS, because it overrides `shell.css` and `motion.css`.
- Do use the `--z-*` scale for new layers; window z values must stay below the overlay layers.
- Do keep phone behaviour in both places: CSS at ≤640px (`responsive.css`, `smooth.css`) and the JS checks (`vw <= 640` in `useWindowManager.tsx`, `isMobileViewport()` in `WindowFrame.tsx`, `window.innerWidth <= 640` in `Dock.tsx`).
- Do add Spotlight commands through `usePalette().register` (as `Desktop.tsx:235-244` does) rather than a second palette.
- Do skip unmodified shortcuts in inputs, textareas and contenteditable, as the 1–7 and `?` handlers do; keep system shortcuts on a modifier.
- Don't enlarge the menu bar items or traffic lights to meet the 24px target rule; they are native-sized by design. New controls elsewhere should reach 24px.
- Don't render the interface switcher or the site CursorFX overlay inside `.mac-root`; the edition uses the menu bar link and CSS cursor images instead.
