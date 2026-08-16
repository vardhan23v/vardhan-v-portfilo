import { site } from "../data/site";
import { education, certifications } from "../data/experience";
import { Reveal } from "../hooks/useReveal";
import "./About.css";

export function About() {
  return (
    <section id="about">
      <div className="container">
        <Reveal>
          <header className="section-head">
            <span className="section-index">05 — About</span>
            <h2 className="section-title">Early career, serious about the craft.</h2>
          </header>
        </Reveal>

        <div className="about-grid">
          <div className="about-identity">
            <p className="about-name">{site.fullName}</p>
            <p className="about-role">{site.role}</p>
            <p className="about-year">
              CS undergraduate · {education.school} · {education.degree} · {education.period}
            </p>
            <p className="about-location">{site.location}</p>
          </div>

          <div className="about-story">
            <p>
              I'm a Computer Science undergraduate building at the intersection of AI and
              full-stack development. My work spans React interfaces, Node.js APIs, and
              databases — tied together by LLM integrations that turn prompts into working
              product features.
            </p>
            <p>
              Most of what I know came from shipping: AI-powered developer tools, a Chrome
              extension generator, career platforms, a voice-first assistant, and an
              emergency-operations prototype. I'm most interested in{" "}
              <span className="about-mark">Generative AI</span>,{" "}
              <span className="about-mark">AI agents</span>, and{" "}
              <span className="about-mark">developer tooling</span> — products that make
              building software faster and more capable.
            </p>

            <div className="about-cred">
              <h3>Education</h3>
              <p>
                {education.school} — {education.degree}, {education.period}
              </p>
            </div>

            <div className="about-cred">
              <h3>Certifications</h3>
              <ul className="about-certs">
                {certifications.map((c) => (
                  <li key={c}>{c}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}