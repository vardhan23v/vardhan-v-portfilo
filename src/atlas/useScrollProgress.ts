import { useEffect, type RefObject } from "react";
import { motionReduced } from "../lib/motion";

/*
 * One scroll engine for the Atlas. Every element inside `root` with `data-p` gets a `--p`
 * between 0 and 1 for how far it has travelled through its range, both ways, so scrolling
 * back up reverses each effect. Ranges:
 *   enter  (default) from its top meeting the bottom edge (minus data-start × viewport)
 *          until it has risen data-span × viewport further (default 0.6)
 *   cover  from its top at the bottom edge until its bottom leaves the top edge
 *   sticky across a tall track: 0 when its top meets the bar, 1 when its end meets the bottom
 * Elements that should rest at 0 when finished (the title sheet's parallax) use `--x` via
 * data-range="exit". Only elements near the viewport are measured, once per frame at most.
 */
const BAR = 52;
const clamp = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);

function progress(el: HTMLElement, vh: number) {
  const r = el.getBoundingClientRect();
  switch (el.dataset.range) {
    case "cover":
      return clamp((vh - r.top) / (vh + r.height));
    case "sticky":
      return clamp((BAR - r.top) / Math.max(1, r.height - (vh - BAR)));
    case "exit":
      return clamp(-r.top / Math.max(1, r.height));
    default: {
      const start = Number(el.dataset.start ?? 0), span = Number(el.dataset.span ?? 0.6);
      return clamp((vh * (1 - start) - r.top) / (vh * span));
    }
  }
}

export function useScrollProgress(root: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const host = root.current;
    if (!host) return;
    const nodes = () => host.querySelectorAll<HTMLElement>("[data-p]");
    if (motionReduced() || typeof IntersectionObserver === "undefined") {
      // Finished state everywhere; the stylesheet pins it too, so late content agrees.
      nodes().forEach((n) => n.style.setProperty(n.dataset.range === "exit" ? "--x" : "--p", n.dataset.range === "exit" ? "0" : "1"));
      return;
    }
    const near = new Set<HTMLElement>();
    const last = new WeakMap<HTMLElement, string>();
    const write = (el: HTMLElement) => {
      const v = progress(el, innerHeight).toFixed(3);
      if (last.get(el) === v) return;
      last.set(el, v);
      el.style.setProperty(el.dataset.range === "exit" ? "--x" : "--p", v);
    };
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          const el = e.target as HTMLElement;
          if (e.isIntersecting) near.add(el);
          else near.delete(el);
          write(el); // settle at 0 or 1 as it leaves, so nothing waits mid-way off screen
        }
      },
      { rootMargin: "60% 0px 60% 0px" }
    );
    const seen = new WeakSet<HTMLElement>();
    const watch = () => nodes().forEach((n) => {
      if (seen.has(n)) return;
      seen.add(n);
      io.observe(n);
    });
    watch();
    // Rows from GitHub and the contribution chart arrive after the first render.
    let raf = 0;
    const tick = () => {
      raf = 0;
      near.forEach(write);
    };
    const queue = () => {
      if (!raf) raf = requestAnimationFrame(tick);
    };
    // Late layout shifts (content arriving, fonts swapping in, a tab coming back) move
    // elements without a scroll, so they re-measure too.
    const mo = new MutationObserver(() => {
      watch();
      queue();
    });
    mo.observe(host, { childList: true, subtree: true });
    const onVisible = () => !document.hidden && queue();
    addEventListener("scroll", queue, { passive: true });
    addEventListener("resize", queue);
    addEventListener("load", queue);
    document.addEventListener("visibilitychange", onVisible);
    document.fonts?.ready.then(queue);
    return () => {
      cancelAnimationFrame(raf);
      removeEventListener("scroll", queue);
      removeEventListener("resize", queue);
      removeEventListener("load", queue);
      document.removeEventListener("visibilitychange", onVisible);
      io.disconnect();
      mo.disconnect();
    };
  }, [root]);
}
