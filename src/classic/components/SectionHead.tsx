interface SectionHeadProps {
  /** Kept for callers; no longer rendered — headings stand on their own. */
  eyebrow?: string;
  index?: string;
  delay?: string;
  title: React.ReactNode;
  sub?: string;
}

export function SectionHead({ title, sub }: SectionHeadProps) {
  return (
    <div className="section-head">
      <h2 className="section-title">{title}</h2>
      {sub && <p className="section-sub">{sub}</p>}
    </div>
  );
}
