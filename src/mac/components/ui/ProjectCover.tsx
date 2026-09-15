import type { CSSProperties } from "react";
import type { Project } from "../../data/projects";

type CoverProject = Pick<Project, "name" | "slug" | "accent" | "emoji"> & Partial<Pick<Project, "cover">>;

/**
 * Project hero image. Uses `project.cover` when present, always over a
 * generated gradient so a missing or slow image still looks intentional.
 */
export function ProjectCover({
  project,
  ratio = "16/9",
  size = "md",
  src,
  className = "",
}: {
  project: CoverProject;
  ratio?: "16/9" | "4/3" | "1/1" | "21/9";
  size?: "sm" | "md" | "lg";
  /** override image (e.g. a screenshot strip item) */
  src?: string;
  className?: string;
}) {
  const [a, b, c] = project.accent;
  const style = {
    "--cv-a": a,
    "--cv-b": b,
    "--cv-c": c,
    aspectRatio: ratio,
  } as CSSProperties;
  const img = src ?? project.cover;
  return (
    <div className={`mac-cover mac-cover--${size}${img ? " has-img" : ""} ${className}`} style={style}>
      <div className="mac-cover__gen" aria-hidden="true">
        <span className="mac-cover__emoji">{project.emoji}</span>
        <span className="mac-cover__name">{project.name}</span>
        <span className="mac-cover__slug">/{project.slug}</span>
      </div>
      {img && <img className="mac-cover__img" src={img} alt={`${project.name} screenshot`} loading="lazy" decoding="async" />}
      <span className="mac-cover__sheen" aria-hidden="true" />
    </div>
  );
}
