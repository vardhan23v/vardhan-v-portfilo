import type { Project } from "../data/projects";
import { featuredProjects, otherProjects } from "../data/projects";
import { SectionHead } from "./SectionHead";
import { Reveal } from "../hooks/useReveal";
import { Icon } from "../lib/icons";
import { site } from "../data/site";
import "./Projects.css";

function ProjectCard({ project }: { project: Project }) {
  const [a1, a2, a3] = project.accent;
  return (
    <article
      className={`project-card card ${project.highlight ? "project-card-featured" : ""}`}
      style={
        {
          "--pa1": a1,
          "--pa2": a2,
          "--pa3": a3,
        } as React.CSSProperties
      }
    >
      <div className="project-visual" aria-hidden="true">
        <div className="project-chrome">
          <span className="terminal-dot terminal-dot-r" />
          <span className="terminal-dot terminal-dot-y" />
          <span className="terminal-dot terminal-dot-g" />
          <span className="project-chrome-path">{project.slug}.tsx</span>
          <span className="project-chrome-icon">{project.emoji}</span>
        </div>
        <div className="project-code">
          <span style={{ "--pi": 0 } as React.CSSProperties}>&gt; {project.slug}.build()</span>
          <span style={{ "--pi": 1 } as React.CSSProperties}>&gt; llm.connect("groq")</span>
          <span style={{ "--pi": 2 } as React.CSSProperties}>&gt; dispatch(&#123; deploy: true &#125;)</span>
          <span className="project-code-ok" style={{ "--pi": 3 } as React.CSSProperties}>&gt; ✓ shipped</span>
        </div>
      </div>

      <div className="project-body">
        <div className="project-top">
          <div>
            <h3 className="project-name">{project.name}</h3>
            <p className="project-tagline">{project.tagline}</p>
          </div>
          {project.highlight && <span className="project-badge">Flagship</span>}
        </div>

        <p className="project-problem">
          <span className="project-problem-label">The problem</span>
          {project.problem}
        </p>

        <ul className="project-features">
          {project.features.slice(0, project.highlight ? 6 : 4).map((f) => (
            <li key={f}>
              <Icon.check width={14} height={14} />
              {f}
            </li>
          ))}
        </ul>

        <div className="project-tech">
          {project.tech.map((t) => (
            <span key={t}>{t}</span>
          ))}
        </div>

        <div className="project-links">
          <a href={project.github} target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-sm">
            <Icon.github width={16} height={16} /> GitHub
          </a>
          {project.live && (
            <a href={project.live} target="_blank" rel="noopener noreferrer" className="btn btn-primary btn-sm">
              <Icon.external width={15} height={15} /> Live Demo
            </a>
          )}
        </div>
      </div>
    </article>
  );
}

export function Projects() {
  return (
    <section id="projects">
      <div className="container">
        <SectionHead
          eyebrow="Featured Projects"
          title={<>Things I've actually <span className="grad-text">built and shipped</span></>}
          sub="AI-powered developer tools, assistants, and full-stack apps — each one solving a real problem."
        />

        <div className="projects-grid">
          {featuredProjects.map((p, i) => (
            <Reveal key={p.slug} as="div" className={p.highlight ? "project-wrap-featured" : ""} delay={i % 2 ? "reveal-d1" : undefined}>
              <ProjectCard project={p} />
            </Reveal>
          ))}
        </div>

        <Reveal>
          <div className="others">
            <h3 className="others-title">
              <Icon.folder width={20} height={20} /> Other things I've built
            </h3>
            <div className="others-grid">
              {otherProjects.map((p) => (
                <a
                  key={p.name}
                  href={p.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="others-card card"
                >
                  <div className="others-card-top">
                    <span className="others-card-icon" aria-hidden="true">
                      {p.emoji}
                    </span>
                    <Icon.external width={16} height={16} className="others-card-ext" />
                  </div>
                  <h4>{p.name}</h4>
                  <p>{p.description}</p>
                  <div className="others-tech">
                    {p.tech.slice(0, 3).map((t) => (
                      <span key={t}>{t}</span>
                    ))}
                  </div>
                </a>
              ))}
            </div>
            <div className="others-more">
              <a href={site.github} target="_blank" rel="noopener noreferrer" className="btn btn-ghost">
                View All Projects on GitHub <Icon.arrowRight width={17} height={17} />
              </a>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}