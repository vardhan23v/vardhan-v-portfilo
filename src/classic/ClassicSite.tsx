import { useEffect, useState } from "react";
import { Navbar } from "./components/Navbar";
import { Hero } from "./components/Hero";
import { Figures } from "./components/Figures";
import { Work } from "./components/Work";
import { About } from "./components/About";
import { Experience } from "./components/Experience";
import { Skills } from "./components/Skills";
import { Contact } from "./components/Contact";
import { Footer } from "./components/Footer";
import "./styles/classic.css";

/**
 * Classic — the recruiter edition. Cream ground, warm ink, one burnt-orange accent, Inter throughout; the flagship
 * product runs live beside the introduction and every project is a card with the real app in it.
 */
export function ClassicSite() {
  // Motion pre-states only apply once script has run (".js"), so nothing is ever hidden without it.
  const [js, setJs] = useState(false);
  useEffect(() => setJs(true), []);
  return (
    <div className={`classic-root${js ? " js" : ""}`} data-cursor-accent="classic">
      <a href="#main" className="skip-link">Skip to content</a>
      <Navbar />
      <main id="main">
        <Hero />
        <Figures />
        <Work />
        <About />
        <Experience />
        <Skills />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}
