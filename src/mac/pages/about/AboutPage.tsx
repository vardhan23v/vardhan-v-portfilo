import { site } from "../../data/site";

export function AboutPage() {
  return (
    <div className="mac-page">
      <div className="page-header">
        <div className="page-header__eyebrow">About</div>
        <h1 className="page-header__title">About Me</h1>
      </div>

      <div className="about-section">
        <h2 className="about-section__title">Who I Am</h2>
        <p className="about-section__text">
          I'm {site.name}, a Computer Science student at NMAM Institute of Technology (NITTE)
          and a Generative AI Developer & Full-Stack Developer based in {site.location}.
          I build AI-powered web applications, developer tools, and full-stack products — not just
          prototypes, but production systems that ship.
        </p>
      </div>

      <div className="about-section">
        <h2 className="about-section__title">What I Build</h2>
        <p className="about-section__text">
          I focus on the intersection of AI and full-stack engineering. My work spans
          LLM-powered developer tools, real-time systems, browser extensions, ERP platforms,
          and interactive data visualizations. I'm drawn to problems where AI can meaningfully
          accelerate a workflow — not as a gimmick, but as a core engine.
        </p>
      </div>

      <div className="about-section">
        <h2 className="about-section__title">Current Focus</h2>
        <p className="about-section__text">
          Building AI agents with MCP tool use, multi-provider LLM orchestration,
          streaming architectures, and production-grade TypeScript. I'm also exploring
          real-time systems with Socket.IO and server-authoritative state management.
        </p>
      </div>

      <div className="about-section">
        <h2 className="about-section__title">Philosophy</h2>
        <p className="about-section__text">
          I build with AI. I ship with code. Every project I work on follows the same principle:
          understand the real problem first, then engineer a solution that's honest about what
          it does. No inflated metrics, no buzzword stacking — just products that work and
          code I'm proud of.
        </p>
      </div>
    </div>
  );
}
