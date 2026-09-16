import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { site } from "../data/site";
import { usePhosphor } from "../hooks/usePhosphor";
import { OS_VERSION, loadHistory, uptime } from "../lib/shell";

export function Footer() {
  const phosphor = usePhosphor();
  const [tick, setTick] = useState(0);

  // once a minute is plenty for uptime and the clock
  useEffect(() => {
    const t = setInterval(() => setTick((n) => n + 1), 60000);
    return () => clearInterval(t);
  }, []);

  const commands = loadHistory().length;
  const stamp = new Date().toISOString().slice(0, 16).replace("T", " ");
  void tick;

  return (
    <footer className="footer">
      <div className="exit" aria-hidden="true">
        ─── EOF · connection closed · thank you for visiting ───
      </div>
      <div className="container">
        <div className="footer-inner">
          <span>
            <span className="green">© 2026</span> {site.fullName} <span className="bracket">·</span> built with
            react + typescript <span className="bracket">·</span> no template was harmed
          </span>
          <span>
            <Link to="/">↺ editions</Link> <span className="bracket">·</span> <Link to="/terminal#work">~/work</Link>{" "}
            <span className="bracket">·</span>{" "}
            <a href={site.github} target="_blank" rel="noopener noreferrer">
              github
            </a>{" "}
            <span className="bracket">·</span>{" "}
            <a href={site.linkedin} target="_blank" rel="noopener noreferrer">
              linkedin
            </a>
          </span>
        </div>
        <div className="footer-session" aria-label="Session summary">
          <span><b>session</b> {stamp} utc</span>
          <span><b>uptime</b> {uptime()}</span>
          <span><b>commands</b> {commands} in history</span>
          <span><b>phosphor</b> {phosphor}</span>
          <span><b>os</b> portfolio_os {OS_VERSION}</span>
          <span><b>tty</b> 1</span>
        </div>
      </div>
    </footer>
  );
}
