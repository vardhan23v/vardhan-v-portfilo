/**
 * Reading progress as one of the painting's swirling brushstrokes: a faint track down the right edge of
 * the page, and a stroke in star yellow that draws itself as you scroll down and undraws as you scroll up
 * (a CSS scroll timeline on the root scroller; no script). Decorative, so hidden from assistive tech; it is
 * not shown at all below 900px, under reduced motion, or where scroll timelines are unsupported.
 */
const STROKE =
  "M20 0 C32 30 32 60 20 90 S8 150 20 180 S32 240 22 262 C14 280 4 292 12 306 C20 320 36 312 34 296 C32 282 18 282 18 294 C18 304 28 304 28 296 " +
  "C34 330 32 360 20 390 S8 450 20 480 S32 540 20 570 C12 588 6 600 10 612 C16 628 34 626 34 610 C34 596 20 592 18 604 C17 612 26 616 28 608 " +
  "C34 640 32 680 20 710 S10 770 20 800";

export function SwirlRail() {
  return (
    <div className="swirl-rail" aria-hidden="true">
      <svg viewBox="0 0 40 800" focusable="false">
        <defs>
          <linearGradient id="swirl-rail-ink" x1="0" y1="0" x2="0" y2="800" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#cfcfbb" />
            <stop offset="0.35" stopColor="#bbaf4a" />
            <stop offset="0.7" stopColor="#bba327" />
            <stop offset="1" stopColor="#b2b580" />
          </linearGradient>
        </defs>
        <path className="swirl-rail-track" d={STROKE} pathLength={1} />
        <path className="swirl-rail-ink" d={STROKE} pathLength={1} stroke="url(#swirl-rail-ink)" />
      </svg>
    </div>
  );
}
