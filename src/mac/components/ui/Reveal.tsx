import type { CSSProperties, ReactNode } from "react";
import { useReveal } from "../../hooks/useReveal";

/** Scroll-triggered fade-rise wrapper. Pass `--i` via index for stagger. */
export function Reveal({
  children,
  index = 0,
  className = "",
  as: Tag = "div",
}: {
  children: ReactNode;
  index?: number;
  className?: string;
  as?: "div" | "section" | "article" | "li";
}) {
  const ref = useReveal<HTMLDivElement>();
  return (
    <Tag
      ref={ref as never}
      className={`rv ${className}`}
      style={{ "--i": index } as CSSProperties}
    >
      {children}
    </Tag>
  );
}
