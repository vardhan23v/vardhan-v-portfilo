import { education, experience } from "../data/experience";
import { site } from "../data/site";

export function About() {
  const school = education[0];
  const latest = experience[0];
  return (
    <section className="about" id="about" aria-labelledby="about-h2">
      <div className="wrap">
        <div className="section-head">
          <h2 className="h2" id="about-h2">About</h2>
        </div>
        <div className="about-grid">
          <div className="about-copy">
            <p className="about-lead">
              I study computer science at {school.school.replace(" (NITTE)", "")} ({school.period.replace(" — ", " to ")}) and build AI products from the interface to the model behind them, then keep them running once they are live.
            </p>
            <p>
              The latest one turns a plain-English prompt into a working Chrome extension. Since March 2026 I have held {experience.length} roles, currently as {latest.role.toLowerCase().startsWith("ai") ? "an" : "a"} {latest.role} at {latest.company}, and I write TypeScript end to end.
            </p>
            <p>
              Hackathons are where I build the real-time and agent-based systems, and every project is on GitHub with its source. I am {site.availability.toLowerCase().replace("&", "and")}.
            </p>
          </div>
          <dl className="about-facts">
            <div><dt>Focus</dt><dd>Generative AI products and full-stack web apps</dd></div>
            <div><dt>Works in</dt><dd>TypeScript, React, Node.js and Python</dd></div>
            <div><dt>AI tools</dt><dd>Gemini, Groq, Claude and OpenAI APIs, CrewAI, MCP</dd></div>
          </dl>
        </div>
      </div>
    </section>
  );
}
