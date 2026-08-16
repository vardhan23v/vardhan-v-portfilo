interface DiagramStep {
  label: string;
  note?: string;
}

export function WorkDiagram({ steps, className = "" }: { steps: DiagramStep[]; className?: string }) {
  return (
    <div className={`diagram ${className}`.trim()} aria-hidden="true">
      {steps.map((s, i) => (
        <div key={s.label} className="diagram-row">
          <div className="diagram-label">{s.label}</div>
          {s.note && <div className="diagram-note">{s.note}</div>}
          {i < steps.length - 1 && <div className="diagram-connector" />}
        </div>
      ))}
    </div>
  );
}