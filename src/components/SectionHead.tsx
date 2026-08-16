import { Reveal } from "../hooks/useReveal";

interface SectionHeadProps {
  eyebrow: string;
  title: React.ReactNode;
  sub?: string;
  delay?: string;
}

export function SectionHead({ eyebrow, title, sub, delay }: SectionHeadProps) {
  return (
    <div className="section-head">
      <Reveal delay={delay}>
        <span className="section-eyebrow">{eyebrow}</span>
        <h2 className="section-title">{title}</h2>
        {sub && <p className="section-sub">{sub}</p>}
      </Reveal>
    </div>
  );
}