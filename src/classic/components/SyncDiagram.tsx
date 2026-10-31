/**
 * How HPL Auction keeps six bidders in sync. Every fact comes from the project's entry in
 * `src/classic/data/projects.ts` (six teams, auctioneer console, captain dashboards,
 * server-authoritative timer and purse engine, Socket.IO, Prisma, Cloud MySQL). The numbered list
 * carries the same information in text, so the drawing is hidden from screen readers.
 */
export function SyncDiagram() {
  return (
    <figure className="sync" aria-labelledby="sync-title">
      <div className="sync-text">
        <h3 className="h3" id="sync-title">How HPL Auction stays in sync</h3>
        <p className="sync-lead">Six teams bid at once against one countdown. The server owns the clock and every purse, so no client can drift or overspend.</p>
        <ol className="sync-steps">
          <li><strong>Bid.</strong> A captain’s dashboard or the auctioneer console sends a bid over Socket.IO.</li>
          <li><strong>Check.</strong> The server’s purse engine accepts it only if that team can afford it, and the server-side timer decides whether it arrived in time.</li>
          <li><strong>Store.</strong> Accepted bids are written through Prisma to Cloud MySQL.</li>
          <li><strong>Broadcast.</strong> The new price, leader and remaining time go back to every screen at once.</li>
        </ol>
        <p className="sync-links">
          <a href="#work-hpl-auction">HPL Auction above</a>
        </p>
      </div>
      <svg className="sync-svg" viewBox="0 0 400 452" role="presentation" aria-hidden="true" focusable="false">
        <defs>
          <marker id="sync-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M0 0 10 5 0 10z" className="sync-head" />
          </marker>
        </defs>
        {/* clients */}
        <rect className="sync-box" x="16" y="16" width="168" height="56" rx="4" />
        <text className="sync-label" x="100" y="40" textAnchor="middle">Auctioneer console</text>
        <text className="sync-sub" x="100" y="58" textAnchor="middle">1 screen</text>
        <rect className="sync-box" x="216" y="16" width="168" height="56" rx="4" />
        <text className="sync-label" x="300" y="40" textAnchor="middle">Captain dashboards</text>
        <text className="sync-sub" x="300" y="58" textAnchor="middle">6 teams</text>

        {/* bids down, state up */}
        <line className="sync-line" x1="88" y1="76" x2="88" y2="140" markerEnd="url(#sync-arrow)" />
        <line className="sync-line" x1="288" y1="76" x2="288" y2="140" markerEnd="url(#sync-arrow)" />
        <line className="sync-line sync-line--accent" x1="116" y1="140" x2="116" y2="76" markerEnd="url(#sync-arrow)" />
        <line className="sync-line sync-line--accent" x1="316" y1="140" x2="316" y2="76" markerEnd="url(#sync-arrow)" />
        <text className="sync-sub" x="200" y="104" textAnchor="middle">bids in · state out</text>
        <text className="sync-sub" x="200" y="120" textAnchor="middle">Socket.IO</text>

        {/* the authority */}
        <rect className="sync-box sync-box--core" x="16" y="144" width="368" height="148" rx="4" />
        <text className="sync-label" x="32" y="170">Server: the single source of truth</text>
        <rect className="sync-box" x="32" y="186" width="160" height="88" rx="3" />
        <text className="sync-label" x="112" y="218" textAnchor="middle">Countdown timer</text>
        <text className="sync-sub" x="112" y="238" textAnchor="middle">one clock for</text>
        <text className="sync-sub" x="112" y="254" textAnchor="middle">every screen</text>
        <rect className="sync-box" x="208" y="186" width="160" height="88" rx="3" />
        <text className="sync-label" x="288" y="218" textAnchor="middle">Purse engine</text>
        <text className="sync-sub" x="288" y="238" textAnchor="middle">rejects bids a team</text>
        <text className="sync-sub" x="288" y="254" textAnchor="middle">cannot afford</text>

        {/* persistence */}
        <line className="sync-line" x1="200" y1="292" x2="200" y2="334" markerEnd="url(#sync-arrow)" />
        <rect className="sync-box" x="96" y="338" width="208" height="40" rx="4" />
        <text className="sync-label" x="200" y="363" textAnchor="middle">Prisma</text>
        <line className="sync-line" x1="200" y1="378" x2="200" y2="396" markerEnd="url(#sync-arrow)" />
        <rect className="sync-box" x="96" y="400" width="208" height="40" rx="4" />
        <text className="sync-label" x="200" y="425" textAnchor="middle">Cloud MySQL</text>
      </svg>
    </figure>
  );
}
