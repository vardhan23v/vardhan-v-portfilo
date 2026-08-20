import { useEffect, useRef, useState, type ReactNode } from "react";

function useTyped(text: string, speed: number, delay: number, threshold: number) {
  const [n, setN] = useState(0);
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setN(text.length);
      return;
    }
    let iv = 0;
    let to = 0;
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting) return;
        io.disconnect();
        to = window.setTimeout(() => {
          iv = window.setInterval(() => setN((v) => Math.min(v + 1, text.length)), speed);
        }, delay);
      },
      { threshold }
    );
    io.observe(el);
    return () => {
      io.disconnect();
      window.clearTimeout(to);
      window.clearInterval(iv);
    };
  }, [text, speed, delay, threshold]);

  return { ref, n, done: n >= text.length };
}

export function TypeCmd({ cmd, suffix, delay = 0 }: { cmd: string; suffix?: ReactNode; delay?: number }) {
  const { ref, n, done } = useTyped(cmd, 38, delay, 0.3);
  return (
    <span className="cmdline" ref={ref} aria-hidden="true">
      <span className="dollar">$</span> {cmd.slice(0, n)}
      <span className="type-caret" aria-hidden="true" />
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
    <span className={className} ref={ref} aria-label={text}>
      {text.slice(0, n)}
      {!done && <span className="type-caret" aria-hidden="true" />}
    </span>
  );
}