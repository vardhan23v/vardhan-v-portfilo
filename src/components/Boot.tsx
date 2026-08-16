import { useEffect, useRef, useState } from "react";

const LINES: { text: string; tone: "ok" | "warn" | "sys" | "" }[] = [
  { text: "[ PORTFOLIO OS v2.5.1 ]", tone: "sys" },
  { text: "> BIOS: CRT display detected ............ 640x480@70Hz", tone: "ok" },
  { text: "> phosphor module ............. OK", tone: "ok" },
  { text: "> scanline generator .......... OK", tone: "ok" },
  { text: "> loading fonts [VT323 / JetBrains Mono] ......... OK", tone: "" },
  { text: "> mounting /home/vardhan ............... OK", tone: "ok" },
  { text: "> connecting human @ 23vvardhan@gmail.com", tone: "warn" },
  { text: "> handshake completed. welcome, visitor_", tone: "ok" },
];

const REDUCED = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export function Boot({ onDone }: { onDone: () => void }) {
  const [shown, setShown] = useState(0);
  const doneRef = useRef(false);

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    if (REDUCED) {
      setShown(LINES.length);
      timers.push(setTimeout(onDone, 250));
      return () => timers.forEach(clearTimeout);
    }
    LINES.forEach((_, i) => {
      timers.push(setTimeout(() => setShown(i + 1), 140 + i * 170));
    });
    timers.push(
      setTimeout(() => {
        doneRef.current = true;
        onDone();
      }, 140 + LINES.length * 170 + 480)
    );
    return () => {
      timers.forEach(clearTimeout);
      if (!doneRef.current) onDone();
    };
  }, [onDone]);

  return (
    <div className={`boot ${doneRef.current ? "done" : ""}`} aria-hidden="true">
      <button type="button" className="boot-skip" onClick={onDone} aria-hidden="true" tabIndex={-1}>
        [ skip — press enter ]
      </button>
      <pre className="boot-lines">
        <code>
          {LINES.slice(0, shown).map((l, i) => (
            <div key={i} className={`${l.tone}${l.tone ? "" : ""}`}>
              {l.text}
            </div>
          ))}
          <div className="sys">_</div>
        </code>
      </pre>
    </div>
  );
}