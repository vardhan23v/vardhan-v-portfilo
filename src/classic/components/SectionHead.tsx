import { Reveal } from "../hooks/useReveal";

interface SectionHeadProps {
  eyebrow: string;
  title: React.ReactNode;
  sub?: string;
  delay?: string;
  /** Editorial section number, e.g. "02". */
  index?: string;
}

export function SectionHead({ eyebrow, title, sub, delay, index }: SectionHeadProps) {
  return (
    <div className="section-head">
      <Reveal delay={delay}>
        <span className="section-eyebrow">
          {index && <span className="section-index" aria-hidden="true">{index}</span>}
          {eyebrow}
        </span>
        <h2 className="section-title">{title}</h2>
        {sub && <p className="section-sub">{sub}</p>}
      </Reveal>
    </div>
  );
}
