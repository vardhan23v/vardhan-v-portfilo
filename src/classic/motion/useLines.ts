import { useEffect, type RefObject } from "react";
import { motionReduced } from "../../lib/motion";

/**
 * "Lines that rise on scroll" (taste-skill motion.md): split a plain-text element into the lines it
 * actually wrapped to, reveal them once with a stagger, then give the plain text back so it rewraps
 * normally. Plain text only — no links or emphasis inside the element.
 */
export function useLines<T extends HTMLElement>(ref: RefObject<T | null>, stagger = 90) {
  useEffect(() => {
    const el = ref.current;
    if (!el || motionReduced() || typeof IntersectionObserver === "undefined") return;
    const text = (el.textContent ?? "").trim().replace(/\s+/g, " ");
    if (!text) return;
    let restored = false;
    const restore = () => {
      if (restored) return;
      restored = true;
      el.textContent = text;
      el.classList.remove("is-split", "is-in");
    };
    const split = () => {
      el.textContent = "";
      const words = text.split(" ").map((word) => {
        const s = document.createElement("span");
        s.style.display = "inline-block";
        s.textContent = word;
        el.append(s, " ");
        return s;
      });
      const lines: { top: number; words: string[] }[] = [];
      for (const w of words) {
        const last = lines[lines.length - 1];
        if (last && Math.abs(last.top - w.offsetTop) < 4) last.words.push(w.textContent ?? "");
        else lines.push({ top: w.offsetTop, words: [w.textContent ?? ""] });
      }
      el.textContent = "";
      lines.forEach((line, i) => {
        const outer = document.createElement("span");
        outer.className = "line";
        const inner = document.createElement("span");
        inner.style.transitionDelay = `${i * stagger}ms`;
        inner.textContent = line.words.join(" ");
        outer.append(inner);
        el.append(outer);
      });
      el.classList.add("is-split");
    };
    let io: IntersectionObserver | null = null;
    let timer = 0;
    const run = async () => {
      try { await document.fonts?.ready; } catch { /* no font API */ }
      if (restored) return;
      split();
      io = new IntersectionObserver((entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          el.classList.add("is-in");
          io?.disconnect();
          // Hand the plain text back once the last line has risen.
          timer = window.setTimeout(restore, 900 + stagger * el.querySelectorAll(".line").length + 100);
        }
      }, { rootMargin: "0px 0px -12% 0px", threshold: 0.1 });
      io.observe(el);
    };
    void run();
    const onResize = () => restore();
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      io?.disconnect();
      window.clearTimeout(timer);
      restore();
    };
  }, [ref, stagger]);
}
