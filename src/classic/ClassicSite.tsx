import { Navbar } from "./components/Navbar";
import { Hero } from "./components/Hero";
import { About } from "./components/About";
import { Projects } from "./components/Projects";
import { Experience } from "./components/Experience";
import { Skills } from "./components/Skills";
import { Education } from "./components/Education";
import { GithubSection } from "./components/GithubSection";
import { Contact } from "./components/Contact";
import { Footer } from "./components/Footer";
import "./styles/global.css";

export function ClassicSite() {
  return (
    <div className="classic-root" data-cursor-accent="classic">
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <div className="bg-grid" aria-hidden="true" />
      <div className="bg-glow" aria-hidden="true" />
      <Navbar />
      <main id="main">
        <Hero />
        <About />
        <Projects />
        <Experience />
        <Skills />
        <Education />
        <GithubSection />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}