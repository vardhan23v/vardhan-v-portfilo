import { useEffect, useRef, useState } from "react";
import { motionReduced } from "../../lib/motion";

/**
 * How HPL Auction keeps six bidders in sync. Every fact comes from the project's entry in
 * `src/classic/data/projects.ts` (six teams, auctioneer console, captain dashboards,
 * server-authoritative timer and purse engine, Socket.IO, Prisma, Cloud MySQL).
 * While on screen it walks through the four steps: the step and the matching part of the drawing
 * light together, and the arrows flow in the direction data travels. Hover a step to hold it.
 * The numbered list carries the same information in text, so the drawing is hidden from screen readers.
 */
const STEPS = [
  { t: "Bid.", d: "A captain’s dashboard or the auctioneer console sends a bid over Socket.IO." },
  { t: "Check.", d: "The server’s purse engine accepts it only if that team can afford it, and the server-side timer decides whether it arrived in time." },
  { t: "Store.", d: "Accepted bids are written through Prisma to Cloud MySQL." },
  { t: "Broadcast.", d: "The new price, leader and remaining time go back to every screen at once." },
];

export function SyncDiagram() {
  const ref = useRef<HTMLElement>(null);
  const [step, setStep] = useState(-1);
  const [held, setHeld] = useState<number | null>(null);
  const [live, setLive] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || motionReduced() || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(([e]) => setLive(e.isIntersecting), { threshold: 0.35 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!live || held !== null) return;
    const t = window.setInterval(() => setStep((s) => (Math.max(s, 0) + 1) % STEPS.length), 2400);
    return () => window.clearInterval(t);
  }, [live, held]);

  const on = held ?? (live && step < 0 ? 0 : step);
  return (
    <figure className={`sync${live ? " is-live" : ""}`} aria-labelledby="sync-title" ref={ref}>
      <div className="sync-text">
        <h3 className="h3" id="sync-title">How HPL Auction stays in sync</h3>
        <p className="sync-lead">Six teams bid at once against one countdown. The server owns the clock and every purse, so no client can drift or overspend.</p>
        <ol className="sync-steps" onMouseLeave={() => setHeld(null)}>
          {STEPS.map((s, i) => (
            <li key={s.t} className={on === i ? "is-on" : undefined} onMouseEnter={() => setHeld(i)}>
              <strong>{s.t}</strong> {s.d}
            </li>
          ))}
        </ol>
        <p className="sync-links">
          <a href="#work-hpl-auction">Back to the HPL Auction project</a>
        </p>
      </div>
      <svg className={`sync-svg${on >= 0 ? ` is-step-${on}` : ""}`} viewBox="0 0 400 452" role="presentation" aria-hidden="true" focusable="false">
        <defs>
          <marker id="sync-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M0 0 10 5 0 10z" className="sync-head" />
          </marker>
        </defs>
        <g className="part part-clients">
          <rect className="sync-box" x="16" y="16" width="168" height="56" rx="4" />
          <text className="sync-label" x="100" y="40" textAnchor="middle">Auctioneer console</text>
          <text className="sync-sub" x="100" y="58" textAnchor="middle">1 screen</text>
          <rect className="sync-box" x="216" y="16" width="168" height="56" rx="4" />
          <text className="sync-label" x="300" y="40" textAnchor="middle">Captain dashboards</text>
          <text className="sync-sub" x="300" y="58" textAnchor="middle">6 teams</text>
        </g>
        <g className="part part-bids">
          <line className="sync-line flow-down" x1="88" y1="76" x2="88" y2="140" markerEnd="url(#sync-arrow)" />
          <line className="sync-line flow-down" x1="288" y1="76" x2="288" y2="140" markerEnd="url(#sync-arrow)" />
        </g>
        <g className="part part-broadcast">
          <line className="sync-line sync-line--accent flow-up" x1="116" y1="140" x2="116" y2="76" markerEnd="url(#sync-arrow)" />
          <line className="sync-line sync-line--accent flow-up" x1="316" y1="140" x2="316" y2="76" markerEnd="url(#sync-arrow)" />
        </g>
        <text className="sync-sub" x="200" y="104" textAnchor="middle">bids in · state out</text>
        <text className="sync-sub" x="200" y="120" textAnchor="middle">Socket.IO</text>
        <g className="part part-server">
          <rect className="sync-box sync-box--core" x="16" y="144" width="368" height="148" rx="4" />
          <text className="sync-label" x="32" y="170">Server: the single source of truth</text>
          <rect className="sync-box" x="32" y="186" width="160" height="88" rx="3" />
          <text className="sync-label" x="112" y="218" textAnchor="middle">Countdown timer</text>
          <text className="sync-sub" x="112" y="238" textAnchor="middle">one clock for</text>
          <text className="sync-sub" x="112" y="254" textAnchor="middle">every screen</text>
          <circle className="timer-track" cx="48" cy="258" r="7" />
          <circle className="timer-ring" cx="48" cy="258" r="7" pathLength={1} transform="rotate(-90 48 258)" />
          <rect className="sync-box" x="208" y="186" width="160" height="88" rx="3" />
          <text className="sync-label" x="288" y="218" textAnchor="middle">Purse engine</text>
          <text className="sync-sub" x="288" y="238" textAnchor="middle">rejects bids a team</text>
          <text className="sync-sub" x="288" y="254" textAnchor="middle">cannot afford</text>
        </g>
        <g className="part part-store">
          <line className="sync-line flow-down" x1="200" y1="292" x2="200" y2="334" markerEnd="url(#sync-arrow)" />
          <rect className="sync-box" x="96" y="338" width="208" height="40" rx="4" />
          <text className="sync-label" x="200" y="363" textAnchor="middle">Prisma</text>
          <line className="sync-line flow-down" x1="200" y1="378" x2="200" y2="396" markerEnd="url(#sync-arrow)" />
          <rect className="sync-box" x="96" y="400" width="208" height="40" rx="4" />
          <text className="sync-label" x="200" y="425" textAnchor="middle">Cloud MySQL</text>
        </g>
      </svg>
    </figure>
  );
}
