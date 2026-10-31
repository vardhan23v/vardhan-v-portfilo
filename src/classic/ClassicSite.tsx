import "@fontsource-variable/bricolage-grotesque";
import { useEffect, useRef } from "react";
import { useClassicEffects } from "./useEffects";
import { Navbar } from "./components/Navbar";
import { Hero } from "./components/Hero";
import { About } from "./components/About";
import { NightSky } from "./components/NightSky";
import { Work } from "./components/Work";
import { Experience } from "./components/Experience";
import { Skills } from "./components/Skills";
import { Contact } from "./components/Contact";
import { Footer } from "./components/Footer";
import "./styles/classic.css";

/**
 * Classic — the recruiter edition, "Starry Night": a still midnight sky behind night-blue
 * surfaces, moonlight text and one celestial-blue accent; Bricolage Grotesque for headings, Inter for reading. Four projects lead, the rest are browsable,
 * and motion is kept to feedback that explains an interaction.
 */
/** "g" then a letter jumps to a section: a About, p Projects, e Experience, s Skills, c Contact. */
const JUMPS: Record<string, string> = { a: "about", p: "work", e: "experience", s: "skills", c: "contact" };
function useJumpKeys() {
  useEffect(() => {
    let armed = 0;
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const t = e.target as HTMLElement | null;
      if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;
      const k = e.key.toLowerCase();
      if (k === "g") { armed = Date.now(); return; }
      if (armed && Date.now() - armed < 1200 && JUMPS[k]) {
        const el = document.getElementById(JUMPS[k]);
        if (el) { e.preventDefault(); el.scrollIntoView({ block: "start" }); el.querySelector<HTMLElement>("h2")?.setAttribute("tabindex", "-1"); el.querySelector<HTMLElement>("h2")?.focus({ preventScroll: true }); }
      }
      armed = 0;
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
}

export function ClassicSite() {
  const rootRef = useRef<HTMLDivElement>(null);
  const js = useClassicEffects(rootRef);
  useJumpKeys();
  return (
    <div className={`classic-root${js ? " js" : ""}`} ref={rootRef} data-cursor-accent="classic">
      <NightSky />
      <a href="#main" className="skip-link">Skip to content</a>
      <Navbar />
      <main id="main">
        <Hero />
        <About />
        <Work />
        <Experience />
        <Skills />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}
