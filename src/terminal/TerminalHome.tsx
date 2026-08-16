import { Hero } from "./components/Hero";
import { Work } from "./components/Work";
import { Experience } from "./components/Experience";
import { Process } from "./components/Process";
import { Tech } from "./components/Tech";
import { About } from "./components/About";
import { OpenSource } from "./components/OpenSource";
import { Contact } from "./components/Contact";

export function TerminalHome() {
  return (
    <>
      <Hero />
      <Work />
      <Experience />
      <Process />
      <Tech />
      <About />
      <OpenSource />
      <Contact />
    </>
  );
}