import { Link } from "react-router-dom";
import { EDITIONS } from "../editions";
import "./not-found.css";

/** Soft-404 for the SPA catch-all: keeps the dark-glass look, offers the six editions. */
export function NotFound() {
  return (
    <main className="nf" id="main">
      <div className="nf-card">
        <span className="nf-kicker">404 · nothing at this address</span>
        <h1 className="nf-title">That page isn't <em>here.</em></h1>
        <p className="nf-sub">The portfolio lives at the front door and in six editions.</p>
        <nav className="nf-links" aria-label="Editions">
          <Link to="/" className="nf-link nf-link--primary">Front door →</Link>
          {EDITIONS.map((e) => <Link key={e.to} to={e.to} className="nf-link">{e.num} {e.label}</Link>)}
        </nav>
      </div>
    </main>
  );
}
