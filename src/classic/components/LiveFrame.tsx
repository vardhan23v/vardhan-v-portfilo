import { useEffect, useRef, useState, type ReactNode } from "react";

/**
 * The live product itself, scaled into the frame. The poster (a capture or a typeset card) shows
 * until the page has loaded; the embed is a quiet preview until the visitor asks to interact,
 * so wheel and touch keep scrolling the portfolio. Phones get the poster only.
 */
export function LiveFrame({ url, name, poster }: { url: string; name: string; poster: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [mount, setMount] = useState(false);
  const [ready, setReady] = useState(false);
  const [interactive, setInteractive] = useState(false);
  const [scale, setScale] = useState(0.5);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const wide = window.matchMedia("(min-width: 721px)");
    if (!wide.matches || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setMount(true); io.disconnect(); } }, { rootMargin: "600px 0px" });
    io.observe(el);
    const ro = new ResizeObserver(([e]) => setScale(e.contentRect.width / 1440));
    ro.observe(el);
    return () => { io.disconnect(); ro.disconnect(); };
  }, []);

  return (
    <div className={`live-frame${ready ? " is-ready" : ""}${interactive ? " is-interactive" : ""}`} ref={ref} style={{ "--scale": scale } as React.CSSProperties}>
      <div className="live-frame-poster" aria-hidden={ready ? "true" : undefined}>{poster}</div>
      {mount && (
        <iframe
          className="live-frame-embed"
          src={url}
          title={`${name}, the live app`}
          loading="lazy"
          referrerPolicy="no-referrer"
          onLoad={() => setTimeout(() => setReady(true), 900)}
        />
      )}
      {ready && (
        <div className="live-frame-bar">
          <span className="live-frame-live">Live</span>
          <button type="button" className="live-frame-toggle" onClick={() => setInteractive((v) => !v)} aria-pressed={interactive}>
            {interactive ? "Done" : "Try it here"}
          </button>
        </div>
      )}
    </div>
  );
}
