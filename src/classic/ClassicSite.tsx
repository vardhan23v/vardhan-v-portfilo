import "@fontsource-variable/bricolage-grotesque";
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
export function ClassicSite() {
  return (
    <div className="classic-root" data-cursor-accent="classic">
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
