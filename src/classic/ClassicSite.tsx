import "@fontsource/kanit/latin-400.css";
import "@fontsource/kanit/latin-ext-400.css";
import "@fontsource/kanit/latin-500.css";
import "@fontsource/kanit/latin-ext-500.css";
import { Navbar } from "./components/Navbar";
import { Hero } from "./components/Hero";
import { Work } from "./components/Work";
import { About } from "./components/About";
import { Ledger } from "./components/Ledger";
import { Figures } from "./components/Figures";
import { Contact } from "./components/Contact";
import { Footer } from "./components/Footer";
import "./styles/classic.css";

/**
 * Classic — the recruiter edition. Art direction: "the contact sheet" (taste-skill v2, seed 216873363):
 * soot ground, one lime action colour, Kanit for the few large things, Inter for everything else,
 * and the real screens of the twelve live products as the only pictures.
 */
export function ClassicSite() {
  return (
    <div className="classic-root" data-cursor-accent="classic">
      <a href="#main" className="skip-link">Skip to content</a>
      <Navbar />
      <main id="main">
        <Hero />
        <Work />
        <About />
        <Ledger />
        <Figures />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}
