import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { site } from "../data/site";

export function Footer() {
  const [clock, setClock] = useState(() => new Date());
  const [uptime, setUptime] = useState(() => Math.floor(performance.now() / 60000));

  useEffect(() => {
    const t = setInterval(() => {
      setClock(new Date());
      setUptime(Math.floor(performance.now() / 60000));
    }, 1000);
    return () => clearInterval(t);
  }, []);

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
            <span className="amber">uptime:</span> {uptime}m <span className="bracket">·</span>{" "}
            <Link to="/">↺ editions</Link> <span className="bracket">·</span> <Link to="/terminal#work">~/work</Link> <span className="bracket">·</span>{" "}
            <a href={site.github} target="_blank" rel="noopener noreferrer">
              github
            </a>{" "}
            <span className="bracket">·</span>{" "}
            <a href={site.linkedin} target="_blank" rel="noopener noreferrer">
              linkedin
            </a>
          </span>
        </div>
        <div className="footer-inner" style={{ marginTop: 10 }}>
          <span className="bracket">{clock.toISOString().slice(0, 19).replace("T", " ")} UTC · tty 1</span>
          <span className="bracket">exit status: 0</span>
        </div>
      </div>
    </footer>
  );
}