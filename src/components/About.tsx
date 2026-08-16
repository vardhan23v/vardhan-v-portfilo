import { certifications, education } from "../data/experience";
import { site } from "../data/site";
import { Reveal } from "../hooks/useReveal";

const facts = [
  { label: "Based in", value: site.location },
  { label: "Currently", value: "AI + full-stack development" },
  { label: "Studying", value: `${education.degree} — ${education.school}` },
  { label: "Certifications", value: `${certifications.length} completed` },
];

const principles = [
  { icon: "◈", text: "Understand the problem before choosing the stack." },
  { icon: "✚", text: "Build the smallest useful version, then let usage drive the rest." },
  { icon: "❋", text: "Reliability beats features — fallbacks, tests, honest failure states." },
];

export function About() {
  return (
    <section className="section" id="about" aria-labelledby="about-title">
      <div className="container">
        <Reveal>
          <div className="sec-head" style={{ marginBottom: 44 }}>
            <span className="eyebrow">about</span>
            <h2 className="sec-title" id="about-title">
              A builder, not a spectator
            </h2>
          </div>
        </Reveal>

        <div className="about-grid">
          <Reveal>
            <div>
              <p className="about-text">
                I'm {site.fullName}, a Computer Science undergraduate at {education.school}. I work across the
                whole stack — interfaces, APIs, databases, and the LLM layer on top of it — and I ship what I
                build. My rule of thumb:{" "}
                <strong className="grad">the demo works before the design is praised.</strong>
              </p>
              <p className="about-text" style={{ marginTop: 14 }}>
                Lately I've been deep in AI product engineering: multi-provider LLM fallback chains,
                deterministic multi-agent simulations, streaming assistants with server-side auth, and
                extensions generated end-to-end by language models. Everything I learn lands in{" "}
                <a className="tlink" href="#work">
                  public repos
                </a>
                .
              </p>

              <ul className="about-principles">
                {principles.map((pr) => (
                  <li key={pr.text}>
                    <span className="pi" aria-hidden="true">
                      {pr.icon}
                    </span>
                    {pr.text}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>

          <Reveal>
            <div className="about-facts">
              {facts.map((f) => (
                <div className="about-fact" key={f.label}>
                  <div className="fl">{f.label}</div>
                  <div className="fv">{f.value}</div>
                </div>
              ))}
              <div className="about-fact">
                <div className="fl">Connect</div>
                <div className="fv" style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
                  <a className="tlink" href={site.github} target="_blank" rel="noopener noreferrer">
                    GitHub
                  </a>
                  <a className="tlink" href={site.linkedin} target="_blank" rel="noopener noreferrer">
                    LinkedIn
                  </a>
                  <a className="tlink" href={`mailto:${site.email}`}>
                    {site.email}
                  </a>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}