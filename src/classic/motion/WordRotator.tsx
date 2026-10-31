import { useEffect, useState } from "react";
import { motionReduced, subscribeMotion } from "../../lib/motion";

/**
 * Cycles a few words in a masked line. Screen readers get one static sentence (`label`); the
 * moving words are hidden from them. Pauses while the tab is hidden; reduced motion shows the first word.
 */
export function WordRotator({ words, label, interval = 2600 }: { words: string[]; label: string; interval?: number }) {
  const [i, setI] = useState(0);
  const [still, setStill] = useState(() => motionReduced());

  useEffect(() => subscribeMotion(() => setStill(motionReduced())), []);

  useEffect(() => {
    if (still || words.length < 2) return;
    let timer = 0;
    const tick = () => { if (!document.hidden) setI((n) => (n + 1) % words.length); };
    timer = window.setInterval(tick, interval);
    return () => window.clearInterval(timer);
  }, [still, words.length, interval]);

  const on = still ? 0 : i;
  return (
    <span className="rot">
      <span className="sr-only">{label}</span>
      <span className="rot-track" aria-hidden="true">
        {/* The longest word sizes the slot so the line never reflows. */}
        <span className="rot-sizer">{words.reduce((a, b) => (b.length > a.length ? b : a), "")}</span>
        {words.map((w, n) => (
          <span key={w} className={`rot-word${n === on ? " is-on" : ""}${n === (on - 1 + words.length) % words.length && !still ? " is-out" : ""}`}>{w}</span>
        ))}
      </span>
    </span>
  );
}
