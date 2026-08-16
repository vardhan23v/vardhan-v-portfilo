import { useEffect } from "react";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { Navbar } from "./components/Navbar";
import { Footer } from "./components/Footer";
import { Hero } from "./components/Hero";
import { Principles } from "./components/Principles";
import { SelectedWork } from "./components/SelectedWork";
import { Experience } from "./components/Experience";
import { Process } from "./components/Process";
import { Tech } from "./components/Tech";
import { About } from "./components/About";
import { OpenSource } from "./components/OpenSource";
import { Contact } from "./components/Contact";
import { WorkDetail } from "./components/WorkDetail";
import "./styles/global.css";

function ScrollManager() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash && pathname === "/") {
      const id = hash.slice(1);
      requestAnimationFrame(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    } else {
      window.scrollTo({ top: 0, behavior: "auto" });
    }
  }, [pathname, hash]);

  return null;
}

function Home() {
  return (
    <>
      <Hero />
      <Principles />
      <SelectedWork />
      <Experience />
      <Process />
      <Tech />
      <About />
      <OpenSource />
      <Contact />
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ScrollManager />
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <Navbar />
      <main id="main">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/work/:slug" element={<WorkDetail />} />
          <Route path="*" element={<Home />} />
        </Routes>
      </main>
      <Footer />
    </BrowserRouter>
  );
}