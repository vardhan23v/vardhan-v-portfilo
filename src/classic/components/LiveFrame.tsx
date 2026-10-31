import { useEffect, useRef, useState, type ReactNode } from "react";

/**
 * A real screenshot first. "Try it live" swaps in the running app, scaled to the frame; "Back to
 * screenshot" returns. Nothing loads until asked, so the page stays light. Wide screens only:
 * on phones the card's "Live app" link opens the site instead.
 */
export function LiveFrame({ url, name, poster }: { url: string; name: string; poster: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [ready, setReady] = useState(false);
  const [scale, setScale] = useState(0.5);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(([e]) => setScale(e.contentRect.width / 1440));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const close = () => { setOpen(false); setReady(false); };

  return (
    <div className={`live-frame${open ? " is-open" : ""}${ready ? " is-ready" : ""}`} ref={ref} style={{ "--scale": scale } as React.CSSProperties}>
      <div className="live-frame-poster" aria-hidden={ready ? "true" : undefined}>{poster}</div>
      {open && (
        <iframe className="live-frame-embed" src={url} title={`${name}, the live app`} referrerPolicy="no-referrer" onLoad={() => setReady(true)} />
      )}
      <div className="live-frame-bar">
        {open && !ready && <span className="live-frame-note" role="status">Loading the live app…</span>}
        <button type="button" className="live-frame-toggle" onClick={() => (open ? close() : setOpen(true))} aria-pressed={open}>
          {open ? "Back to screenshot" : "Try it live"}
        </button>
      </div>
    </div>
  );
}
