import { useEffect, useRef } from "react";
import { featuredProjects } from "../data/projects";
import { site } from "../data/site";
import { stats } from "../data/stats";
import { embeddable, framesOf, hostOf } from "../lib/frames";
import { LiveFrame } from "./LiveFrame";
import { WordRotator } from "../motion/WordRotator";
import { useTilt } from "../../hooks/useTilt";

const flagship = featuredProjects.find((p) => p.highlight) ?? featuredProjects[0];

const STRENGTHS = [
  { k: "End to end", v: "Interface, API, database and deploy, all mine." },
  { k: "AI in production", v: "Gemini, Groq and Claude behind real features." },
  { k: "Real-time systems", v: "Sockets, server clocks and state that stays in sync." },
];

export function Hero() {
  const frames = framesOf(flagship);
  const phone = flagship.screenshots?.find((s) => s.includes("phone"));
  const live = embeddable(flagship);
  const sectionRef = useRef<HTMLElement>(null);
  const sideRef = useTilt<HTMLDivElement>(5, ".device");
  useEffect(() => {
    // The backdrop only drifts while the hero is on screen.
    const el = sectionRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(([e]) => el.classList.toggle("is-offscreen", !e.isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  }, []);
  const poster = frames[0] ? (
    <picture>
      {phone && <source media="(max-width: 720px)" srcSet={phone} width={390} height={844} />}
      <img src={frames[0]} alt={`${flagship.name}, the live app`} width={1440} height={900} fetchPriority="high" decoding="async" />
    </picture>
  ) : null;

  return (
    <section className="hero" id="top" aria-labelledby="hero-h1" ref={sectionRef}>
      <div className="hero-bg" aria-hidden="true">
        <span className="hero-grid-dots" />
        <span className="hero-glow hero-glow--a" />
        <span className="hero-glow hero-glow--b" />
      </div>
      <div className="wrap hero-grid">
        <div className="hero-copy">
          <p className="hero-status" data-load style={{ "--d": "60ms" } as React.CSSProperties}>
            <span className="hero-dot" aria-hidden="true" />
            {site.availability.replace("&", "and")}
          </p>
          <h1 className="hero-title" id="hero-h1">
            <span className="line"><span data-line style={{ "--i": 0 } as React.CSSProperties}>Sree Vardhan V</span></span>
          </h1>
          <p className="hero-role" data-load style={{ "--d": "260ms" } as React.CSSProperties}>
            Generative AI and full-stack developer, building{" "}
            <WordRotator words={["AI products", "full-stack systems", "real-time apps", "developer tools"]} label="AI products, full-stack systems, real-time apps and developer tools." />
          </p>
          <p className="hero-intro" data-load style={{ "--d": "340ms" } as React.CSSProperties}>
            Computer-science undergraduate at NMAM Institute of Technology. I build AI-powered products from the interface to the model behind it, and keep them running: {stats.featured} shipped, {stats.live} of them live on the web right now.
          </p>
          <div className="hero-actions" data-load style={{ "--d": "420ms" } as React.CSSProperties}>
            <a className="btn btn--magnetic" href="#work">View projects</a>
            <a className="btn btn--secondary btn--magnetic" href="#contact">Contact me</a>
            <a className="btn btn--ghost" href={site.resume} download="sree-vardhan-v-resume.pdf">Résumé</a>
            <a className="btn btn--ghost" href={site.github} target="_blank" rel="noopener noreferrer">GitHub</a>
          </div>
          <ul className="hero-strengths" data-load style={{ "--d": "500ms" } as React.CSSProperties}>
            {STRENGTHS.map((s) => (
              <li key={s.k}><strong>{s.k}</strong><span>{s.v}</span></li>
            ))}
          </ul>
          <p className="hero-seek" data-load style={{ "--d": "580ms" } as React.CSSProperties}>
            <strong>Looking for:</strong> an internship or freelance work on AI products or full-stack systems, remote or in India.
          </p>
        </div>

        <div className="hero-side" data-open ref={sideRef}>
          <div className="device-float">
          <div className="device">
            <div className="device-bar" aria-hidden="true">
              <span className="device-dots"><i /><i /><i /></span>
              <span className="device-url">{flagship.live ? hostOf(flagship.live) : flagship.name}</span>
            </div>
            <div className="device-body">
              {live && poster ? <LiveFrame url={live} name={flagship.name} poster={poster} /> : poster}
            </div>
            <span className="device-glare" aria-hidden="true" />
          </div>
          </div>
          <p className="device-note">
            <strong>{flagship.name}</strong>, the latest product: {flagship.tagline.replace(/\.$/, "").toLowerCase()}.
            {flagship.live && <> <a href={flagship.live} target="_blank" rel="noopener noreferrer">Open it</a></>}
            {" "}or <a href={`#work-${flagship.slug}`}>read the facts</a>.
          </p>
        </div>
      </div>
    </section>
  );
}
