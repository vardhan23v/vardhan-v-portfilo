import { FileText } from "lucide-react";
import { GithubIcon, LinkedinIcon } from "../lib/icons";
import { site } from "../data/site";
import { featuredProjects, otherProjects } from "../data/projects";
import { skillCategories } from "../data/skills";
import { experience } from "../data/experience";
import { useGithub } from "../hooks/useGithub";

/** About This Mac — real portfolio data only. */
export function AboutMacApp() {
  const { followers, repos, loading } = useGithub();
  const techTotal = skillCategories.reduce((a, c) => a + c.items.length, 0);

  return (
    <div className="mac-page aboutmac">
      <div className="aboutmac__hero">
        <span className="mac-avatar" style={{ width: 60, height: 60, fontSize: "1.3rem" }} aria-hidden="true">SV</span>
        <div>
          <h2 className="page-header__title">Vardhan&apos;s Mac</h2>
          <div className="aboutmac__sub">{site.title}</div>
        </div>
      </div>
      <dl className="aboutmac__specs">
        <div><dt>Experience</dt><dd>{experience.length} roles</dd></div>
        <div><dt>Projects</dt><dd>{featuredProjects.length} featured · {otherProjects.length} more</dd></div>
        <div><dt>Technologies</dt><dd>{techTotal}+ across {skillCategories.length} areas</dd></div>
        <div><dt>GitHub</dt><dd>{loading ? "…" : `${followers} followers · ${repos} repos`}</dd></div>
        <div><dt>Status</dt><dd>Building…</dd></div>
      </dl>
      <div className="aboutmac__links">
        <a className="mac-btn mac-btn--ghost" href={site.github} target="_blank" rel="noopener noreferrer"><GithubIcon size={14} /> GitHub</a>
        <a className="mac-btn mac-btn--ghost" href={site.linkedin} target="_blank" rel="noopener noreferrer"><LinkedinIcon size={14} /> LinkedIn</a>
        <a className="mac-btn mac-btn--ghost" href={site.resume} target="_blank" rel="noopener noreferrer"><FileText style={{ width: 14, height: 14 }} /> Resume</a>
      </div>
    </div>
  );
}
