import { useEffect, useRef, useState } from "react";
import { motionReduced } from "../../lib/motion";
import { site } from "../data/site";
import { OS_VERSION } from "../lib/shell";

const LINES: { text: string; tone: "ok" | "warn" | "sys" | "" }[] = [
  { text: `[ PORTFOLIO OS v${OS_VERSION} ]`, tone: "sys" },
  { text: "> BIOS: CRT display detected ............ 640x480@70Hz", tone: "ok" },
  { text: "> phosphor module ............. OK", tone: "ok" },
  { text: "> scanline generator .......... OK", tone: "ok" },
  { text: "> loading fonts [VT323 / JetBrains Mono] ......... OK", tone: "" },
  { text: "> mounting /home/vardhan ............... OK", tone: "ok" },
  { text: `> connecting human @ ${site.email}`, tone: "warn" },
  { text: "> handshake completed. welcome, visitor_", tone: "ok" },
];

const STEP = 170;
const FADE = 450;

export function Boot({ onDone }: { onDone: () => void }) {
  const reduced = motionReduced();
  const [shown, setShown] = useState(0);
  const [done, setDone] = useState(false);
  const finishing = useRef(false);
  const skipRef = useRef<HTMLButtonElement | null>(null);

  // Fade out, then hand control back (the CSS transition needs the class to actually apply).
  const finish = () => {
    if (finishing.current) return;
    finishing.current = true;
    setShown(LINES.length);
    setDone(true);
    window.setTimeout(onDone, reduced ? 0 : FADE);
  };

  useEffect(() => {
    const timers: number[] = [];
    if (reduced) {
      setShown(LINES.length);
      timers.push(window.setTimeout(finish, 250));
      return () => timers.forEach(window.clearTimeout);
    }
    LINES.forEach((_, i) => timers.push(window.setTimeout(() => setShown(i + 1), 140 + i * STEP)));
    timers.push(window.setTimeout(finish, 140 + LINES.length * STEP + 480));
    return () => timers.forEach(window.clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    skipRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Enter" || e.key === "Escape" || e.key === " ") finish();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const pct = Math.round((shown / LINES.length) * 100);

  return (
    <div className={`boot${done ? " done" : ""}`} role="dialog" aria-modal="true" aria-label="Portfolio OS is booting">
      <button type="button" className="boot-skip" ref={skipRef} onClick={finish}>
        [ skip — press enter ]
      </button>
      <button type="button" className="boot-tap" onClick={finish} aria-label="Skip boot sequence" tabIndex={-1} />
      <pre className="boot-lines" aria-live="off">
        <code>
          {LINES.slice(0, shown).map((l, i) => (
            <div key={i} className={l.tone}>
              {l.text}
            </div>
          ))}
          <div className="sys">_</div>
        </code>
      </pre>
      <div className="boot-progress" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label="Boot progress">
        <i style={{ width: `${pct}%` }} />
        <span>loading portfolio_os … {pct}%</span>
      </div>
    </div>
  );
}
