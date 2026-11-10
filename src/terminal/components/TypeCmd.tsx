import { useEffect, useRef, useState, type ReactNode } from "react";
import { motionReduced } from "../../lib/motion";

function useTyped(text: string, speed: number, delay: number, threshold: number) {
  const [n, setN] = useState(0);
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (motionReduced()) {
      setN(text.length);
      return;
    }
    // Frame-aligned typing driven by elapsed time: no interval outlives the text,
    // and a background tab simply pauses (rAF does not fire there).
    let raf = 0;
    let to = 0;
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting) return;
        io.disconnect();
        to = window.setTimeout(() => {
          let t0 = -1;
          const step = (t: number) => {
            if (t0 < 0) t0 = t;
            const k = Math.min(text.length, Math.floor((t - t0) / speed) + 1);
            setN(k);
            if (k < text.length) raf = requestAnimationFrame(step);
          };
          raf = requestAnimationFrame(step);
        }, delay);
      },
      { threshold }
    );
    io.observe(el);
    return () => {
      io.disconnect();
      window.clearTimeout(to);
      cancelAnimationFrame(raf);
    };
  }, [text, speed, delay, threshold]);

  return { ref, n, done: n >= text.length };
}

export function TypeCmd({ cmd, suffix, delay = 0 }: { cmd: string; suffix?: ReactNode; delay?: number }) {
  const { ref, n, done } = useTyped(cmd, 38, delay, 0.3);
  return (
    <span className="cmdline" ref={ref} aria-hidden="true">
      <span className="dollar">$</span> {cmd.slice(0, n)}
      <span className={`type-caret${done ? " is-done" : ""}`} aria-hidden="true" />
      {done ? suffix : null}
    </span>
  );
}

export function TypeText({
  text,
  className = "",
  speed = 18,
  delay = 0,
}: {
  text: string;
  className?: string;
  speed?: number;
  delay?: number;
}) {
  const { ref, n, done } = useTyped(text, speed, delay, 0.2);
  return (
    // The hidden ghost reserves the final box before typing starts, so the
    // live layer types into it without pushing the page down (no CLS).
    <span className={`type-stack ${className}`.trim()} ref={ref}>
      <span className="visually-hidden">{text}</span>
      <span className="type-ghost" aria-hidden="true">
        {text}
      </span>
      <span className="type-live" aria-hidden="true">
        {text.slice(0, n)}
        {!done && <span className="type-caret" />}
      </span>
    </span>
  );
}