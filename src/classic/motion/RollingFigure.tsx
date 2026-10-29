/**
 * "Rolling figures" (taste-skill motion.md): each digit is a column of 0–9 that slides to its value
 * once the parent reveal lands (`.is-visible` on an ancestor). The real number stays in text for
 * screen readers and search; reduced motion shows the value set.
 */
export function RollingFigure({ value, className = "" }: { value: number; className?: string }) {
  const chars = String(value).split("");
  let col = 0;
  return (
    <span className={`roll ${className}`.trim()}>
      <span className="sr-only">{value}</span>
      <span className="roll-digits" aria-hidden="true">
        {chars.map((ch, idx) => {
          if (!/\d/.test(ch)) return <span key={idx} data-n={ch} className="roll-sep" />;
          const i = col++;
          return (
            <span className="roll-col" key={idx}>
              <span className="roll-strip" style={{ "--d": ch, "--i": i } as React.CSSProperties}>
                {Array.from({ length: 10 }, (_, n) => <span key={n} data-n={n} />)}
              </span>
            </span>
          );
        })}
      </span>
    </span>
  );
}
