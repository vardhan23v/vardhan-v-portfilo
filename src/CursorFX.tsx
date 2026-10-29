import { useEffect, useRef } from "react";
import "./cursor-fx.css";
import { motionReduced } from "./lib/motion";

export function CursorFX() {
  const fxRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fx = fxRef.current;
    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!fx || !dot || !ring) return;
    if (window.matchMedia("(pointer: coarse)").matches) return;

    let x = -100;
    let y = -100;
    let rx = -100;
    let ry = -100;
    let raf = 0;
    let off = false; // over a [data-cursor-off] element
    let reduced = motionReduced(); // follows <html data-motion> at runtime

    const stop = () => {
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
    };
    const start = () => {
      if (!raf && !off && !reduced && !document.hidden) raf = requestAnimationFrame(tick);
    };

    const tick = () => {
      rx += (x - rx) * 0.16;
      ry += (y - ry) * 0.16;
      dot.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%)`;
      ring.style.transform = `translate(${rx}px, ${ry}px) translate(-50%, -50%)`;
      raf = requestAnimationFrame(tick);
    };

    const onMove = (e: MouseEvent) => {
      x = e.clientX;
      y = e.clientY;
      start();
    };

    const onOver = (e: MouseEvent) => {
      const t = e.target as HTMLElement;
      const offEl = t.closest("[data-cursor-off]");
      const card = t.closest("[data-cursor]");
      const accent = t.closest("[data-cursor-accent]");
      const interactive = t.closest("a, button, .iswitcher-item, [data-cursor]");
      fx.classList.toggle("cur-hidden", !!offEl);
      fx.classList.toggle("cur-interactive", !!interactive && !offEl);
      fx.setAttribute(
        "data-cur",
        card ? card.getAttribute("data-cursor") || "" : accent ? accent.getAttribute("data-cursor-accent") || "" : ""
      );
      off = !!offEl;
      if (off) stop();
      else start();
    };

    let pulseTimer = 0;
    const onClick = () => {
      if (reduced) return;
      fx.classList.remove("cur-pulse");
      void fx.offsetWidth;
      fx.classList.add("cur-pulse");
      window.clearTimeout(pulseTimer);
      pulseTimer = window.setTimeout(() => fx.classList.remove("cur-pulse"), 450);
    };

    // The motion toggle / OS setting write <html data-motion>; start or stop the loop live.
    const onMotion = () => {
      reduced = motionReduced();
      if (reduced) stop();
      else start();
    };
    const mo = new MutationObserver(onMotion);
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-motion"] });

    const onVisibility = () => (document.hidden ? stop() : start());

    window.addEventListener("mousemove", onMove, { passive: true });
    document.addEventListener("mouseover", onOver, { passive: true });
    document.addEventListener("mousedown", onClick, { passive: true });
    document.addEventListener("visibilitychange", onVisibility);

    start();
    return () => {
      mo.disconnect();
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseover", onOver);
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("visibilitychange", onVisibility);
      window.clearTimeout(pulseTimer);
      stop();
    };
  }, []);

  return (
    <div ref={fxRef} className="cur-fx" aria-hidden="true">
      <div className="cur-ring-wrap">
        <div ref={ringRef} className="cur-ring">
          <span className="cur-ring-inner" />
        </div>
      </div>
      <div ref={dotRef} className="cur-dot" />
    </div>
  );
}
