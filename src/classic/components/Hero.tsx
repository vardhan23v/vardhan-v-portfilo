import { useEffect, useRef } from "react";
import { featuredProjects } from "../data/projects";
import { site } from "../data/site";
import { stats } from "../data/stats";
import { motionReduced } from "../../lib/motion";

const frames = featuredProjects.filter((p) => p.cover).map((p) => ({ slug: p.slug, name: p.name, src: p.cover as string, phone: p.screenshots?.find((s) => s.includes("phone")), live: p.live, github: p.github }));

/** Lights the frame nearest the centre of the strip; the rest sit dim. */
function useLitFrame(ref: React.RefObject<HTMLDivElement | null>) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      const mid = el.scrollLeft + el.clientWidth / 2;
      let best: HTMLElement | null = null;
      let bestD = Infinity;
      for (const f of Array.from(el.querySelectorAll<HTMLElement>(".hero-frame"))) {
        const d = Math.abs(f.offsetLeft + f.offsetWidth / 2 - mid);
        if (d < bestD) { bestD = d; best = f; }
      }
      for (const f of Array.from(el.querySelectorAll<HTMLElement>(".hero-frame"))) f.classList.toggle("is-lit", f === best);
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update); };
    update();
    el.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => { el.removeEventListener("scroll", onScroll); window.removeEventListener("resize", onScroll); if (raf) cancelAnimationFrame(raf); };
  }, [ref]);
}

export function Hero() {
  const stripRef = useRef<HTMLDivElement>(null);
  useLitFrame(stripRef);
  useEffect(() => {
    // Start with the third frame centred so both edges are cropped, as the blueprint asks.
    const el = stripRef.current;
    if (!el || frames.length < 3) return;
    const third = el.querySelectorAll<HTMLElement>(".hero-frame")[2];
    if (third) el.scrollLeft = third.offsetLeft + third.offsetWidth / 2 - el.clientWidth / 2;
  }, []);
  const reduced = motionReduced();

  return (
    <section className="hero" id="top" aria-labelledby="hero-h1">
      <div className="hero-top">
        <h1 className="hero-title lines" id="hero-h1">
          <span className="line"><span data-line style={{ "--i": 0 } as React.CSSProperties}>Sree Vardhan V</span></span>
          <span className="line"><span data-line style={{ "--i": 1 } as React.CSSProperties}>ships AI&nbsp;products</span></span>
        </h1>
        <p className="hero-lead" data-load style={{ "--d": "420ms" } as React.CSSProperties}>
          Computer-science undergraduate in {site.location.split(",")[0]}, India. {stats.featured} products built end to end, {stats.live} of them running on the web.
        </p>
      </div>

      <div className={`hero-strip${reduced ? " is-still" : " is-drifting"}`} data-open ref={stripRef} role="group" aria-label="Screens of the live products, scroll sideways">
        {frames.map((f, i) => (
          <a className="hero-frame" href={`#work-${f.slug}`} key={f.slug}>
            <picture>
              {f.phone && <source media="(max-width: 720px)" srcSet={f.phone} width={390} height={844} />}
              <img src={f.src} alt={`${f.name} live app`} width={1440} height={900} loading={i < 4 ? "eager" : "lazy"} decoding="async" fetchPriority={i === 2 ? "high" : undefined} />
            </picture>
            <span className="hero-frame-name">{f.name}</span>
          </a>
        ))}
      </div>

      <div className="hero-foot">
        <p className="hero-sentence" data-load style={{ "--d": "520ms" } as React.CSSProperties}>React, TypeScript, Node and Python, with Gemini, Groq and Claude behind the interface. {site.availability.replace("&", "and")}.</p>
        <div className="hero-actions" data-load style={{ "--d": "580ms" } as React.CSSProperties}>
          <a className="btn" href="#contact">Contact me</a>
          <a className="hero-alt" href="#work">View projects</a>
          <a className="hero-alt" href={site.resume} download="sree-vardhan-v-resume.pdf">Résumé</a>
          <a className="hero-alt" href={site.github} target="_blank" rel="noopener noreferrer">GitHub</a>
        </div>
      </div>
    </section>
  );
}
