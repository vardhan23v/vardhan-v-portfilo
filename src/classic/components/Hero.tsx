import { useEffect, useState } from "react";
import { site } from "../data/site";
import { Icon } from "../lib/icons";
import { Terminal } from "./Terminal";
import { Reveal } from "../hooks/useReveal";
import "./Hero.css";

const roles = [
  "Generative AI Developer",
  "Full-Stack Developer",
  "AI Product Builder",
];

function useTypewriter(words: string[]) {
  const [text, setText] = useState("");

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setText(words[0]);
      return;
    }
    let word = 0;
    let char = 0;
    let deleting = false;
    let timer: number;
    const tick = () => {
      const target = words[word];
      if (!deleting) {
        char += 1;
        setText(target.slice(0, char));
        if (char >= target.length) {
          deleting = true;
          timer = window.setTimeout(tick, 2200);
        } else {
          timer = window.setTimeout(tick, 58);
        }
      } else {
        char -= 1;
        setText(target.slice(0, char));
        if (char <= 0) {
          deleting = false;
          word = (word + 1) % words.length;
          timer = window.setTimeout(tick, 350);
        } else {
          timer = window.setTimeout(tick, 30);
        }
      }
    };
    timer = window.setTimeout(tick, 400);
    return () => window.clearTimeout(timer);
  }, [words]);

  return text;
}

export function Hero() {
  return (
    <section className="hero" id="top">
      <div className="container hero-grid">
        <div className="hero-copy">
          <Reveal>
            <p className="hero-availability">
              <span className="hero-availability-dot" aria-hidden="true" />
              Open to internships & AI product builds
            </p>
          </Reveal>

          <Reveal delay="reveal-d1">
            <h1 className="hero-name">
              Sree Vardhan <span className="grad-text">V</span>
            </h1>
          </Reveal>

          <Reveal delay="reveal-d2">
            <p className="hero-role">
              <span className="hero-type" aria-label={roles.join(", ")}>
                {useTypewriter(roles)}
              </span>
              <span className="hero-type-cursor" aria-hidden="true" />
            </p>
          </Reveal>

          <Reveal delay="reveal-d3">
            <p className="hero-desc">
              Computer Science undergraduate who ships AI-powered products end-to-end —
              from LLM integration to deployed app. Latest flagship: Extension AI, which
              turns plain-English prompts into Chrome extensions.
            </p>
          </Reveal>

          <Reveal delay="reveal-d3">
            <p className="hero-tagline">
              <Icon.sparkles width={17} height={17} />
              {site.tagline}
            </p>
          </Reveal>

          <Reveal delay="reveal-d4">
            <div className="hero-actions">
              <a href="#projects" className="btn btn-primary">
                View Projects <Icon.arrowRight width={17} height={17} />
              </a>
              <a href={site.resume} className="btn btn-ghost" download>
                <Icon.download width={17} height={17} /> Download Resume
              </a>
            </div>
          </Reveal>

          <Reveal delay="reveal-d4">
            <div className="hero-links">
              <a href={site.github} target="_blank" rel="noopener noreferrer">
                <Icon.github width={17} height={17} /> GitHub
              </a>
              <a href={site.linkedin} target="_blank" rel="noopener noreferrer">
                <Icon.linkedin width={16} height={16} /> LinkedIn
              </a>
              <a href={`mailto:${site.email}`}>
                <Icon.mail width={17} height={17} /> Email
              </a>
              <span className="hero-location">
                <Icon.mapPin width={15} height={15} /> {site.location}
              </span>
            </div>
          </Reveal>
        </div>

        <div className="hero-visual">
          <div className="hero-neural" aria-hidden="true">
            <span className="hero-node n1" />
            <span className="hero-node n2" />
            <span className="hero-node n3" />
            <span className="hero-node n4" />
            <span className="hero-node n5" />
            <svg className="hero-lines" viewBox="0 0 400 400" fill="none">
              <path d="M90 70 L200 190" stroke="url(#lg1)" />
              <path d="M310 70 L200 190" stroke="url(#lg1)" />
              <path d="M90 70 L70 300" stroke="url(#lg2)" />
              <path d="M310 70 L330 300" stroke="url(#lg2)" />
              <path d="M200 190 L70 300" stroke="url(#lg3)" />
              <path d="M200 190 L330 300" stroke="url(#lg3)" />
              <path d="M70 300 L330 300" stroke="url(#lg1)" opacity="0.5" />
              <defs>
                <linearGradient id="lg1" x1="0" y1="0" x2="1" y2="1">
                  <stop stopColor="#7c6cff" stopOpacity="0.55" />
                  <stop offset="1" stopColor="#38bdf8" stopOpacity="0.18" />
                </linearGradient>
                <linearGradient id="lg2" x1="1" y1="0" x2="0" y2="1">
                  <stop stopColor="#38bdf8" stopOpacity="0.4" />
                  <stop offset="1" stopColor="#7c6cff" stopOpacity="0.12" />
                </linearGradient>
                <linearGradient id="lg3" x1="0" y1="0" x2="1" y2="1">
                  <stop stopColor="#a78bfa" stopOpacity="0.4" />
                  <stop offset="1" stopColor="#38bdf8" stopOpacity="0.15" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <Reveal delay="reveal-d2">
            <Terminal />
          </Reveal>
        </div>
      </div>

      <div className="hero-float hero-float-code" aria-hidden="true">
        <Icon.code width={16} height={16} /> const ship = (idea) =&gt; build(idea)
      </div>
      <div className="hero-float hero-float-llm" aria-hidden="true">
        <Icon.sparkles width={16} height={16} /> model.groq · 70B
      </div>
      <div className="hero-float hero-float-ts" aria-hidden="true">
        λ stream.toJSON()
      </div>
    </section>
  );
}