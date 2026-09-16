import { useState } from "react";
import { site } from "../data/site";
import { Reveal } from "../hooks/useReveal";
import { TypeCmd } from "./TypeCmd";

const strip = (u: string) => u.replace(/^https?:\/\/(www\.)?/, "");
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function Contact() {
  const [from, setFrom] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [status, setStatus] = useState<{ text: string; err?: boolean } | null>(null);
  const [copied, setCopied] = useState(false);
  const fromInvalid = from.length > 0 && !EMAIL_RE.test(from);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!EMAIL_RE.test(from)) {
      setStatus({ text: "E: from: is not a valid address — fix it and :wq again.", err: true });
      return;
    }
    const target = `mailto:${site.email}?subject=${encodeURIComponent(subject || "hello from your site")}&body=${encodeURIComponent(
      `${body}\n\n— ${from} (via ${site.host})`
    )}`;
    window.location.href = target;
    setStatus({ text: "message staged — your mail app should have opened ✓" });
    window.setTimeout(() => setStatus(null), 4000);
  };

  const copyEmail = () => {
    navigator.clipboard?.writeText(site.email).then(
      () => {
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1800);
      },
      () => setStatus({ text: "E: clipboard unavailable — select the address manually.", err: true })
    );
  };

  const now = new Date().toUTCString();

  return (
    <section className="section" id="contact" aria-labelledby="contact-title">
      <div className="container">
        <div className="shell">
          <Reveal>
            <div className="shell-head">
              <TypeCmd cmd="sudo ./sendmail --to vardhan" />
              <h2 className="shell-title" id="contact-title">
                CONTACT_OPS <span className="dim">// ack required</span>
              </h2>
            </div>
            <p className="shell-sub">
              one shell prompt away. response time: usually within a day, exit status: 0.
            </p>
          </Reveal>

          <Reveal>
            <div className="term">
              <div className="term-bar" aria-hidden="true">
                <span className="term-dot r" />
                <span className="term-dot a" />
                <span className="term-dot g" />
                <span className="term-title">
                  <b>vardhan@folio</b>:~$ mail --compose <span className="bracket">— insert</span>
                </span>
              </div>
              <div className="term-body compose">
                <form className="mail-form" onSubmit={onSubmit} noValidate>
                  <div className="mail-row">
                    <label className="lbl" htmlFor="cf-from">from:</label>
                    <input
                      id="cf-from"
                      className="mail-input"
                      type="email"
                      required
                      value={from}
                      onChange={(e) => setFrom(e.target.value)}
                      placeholder="you@somewhere.com"
                      autoComplete="email"
                      aria-invalid={fromInvalid || undefined}
                      aria-describedby="cf-status"
                    />
                  </div>
                  <div className="mail-row">
                    <label className="lbl" htmlFor="cf-subject">subject:</label>
                    <input
                      id="cf-subject"
                      className="mail-input"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="hello human / want to build something"
                    />
                  </div>
                  <div className="mail-row">
                    <label className="lbl" htmlFor="cf-body">body:</label>
                    <textarea
                      id="cf-body"
                      className="mail-input"
                      value={body}
                      onChange={(e) => setBody(e.target.value)}
                      placeholder="type your message… cargo, not clutter."
                    />
                  </div>
                  <div className="mail-actions">
                    <button type="submit" className="btn btn-solid">
                      :wq <span className="bracket"># send</span>
                    </button>
                    <span id="cf-status" className={`mail-status ${status?.err ? "is-err" : ""}`} role="status" aria-live="polite">
                      {status ? status.text : "opens your mail app · nothing is stored here"}
                    </span>
                  </div>
                </form>

                <aside className="mail-preview" aria-label="Message preview">
                  <div className="mail-preview-head">
                    <span className="bracket">~/outbox/draft.eml</span>
                  </div>
                  <pre className="mail-preview-body">
{`From:    ${from || "<you>"}
To:      ${site.email}
Subject: ${subject || "hello from your site"}
Date:    ${now}
X-Via:   ${site.host}

${body || "(empty body — say hi, ask a question, or pitch a problem.)"}

-- 
${from ? from.split("@")[0] : "visitor"}`}
                  </pre>
                </aside>

                <div className="contact-channels">
                  <div>
                    <span className="ch">$ whois </span>
                    <a href={`mailto:${site.email}`}>{site.email}</a>
                    <button type="button" className="copy-btn" onClick={copyEmail} aria-live="polite">
                      {copied ? "copied ✓" : "copy"}
                    </button>
                  </div>
                  <div>
                    <span className="ch">$ ping </span>
                    <a href={site.github} target="_blank" rel="noopener noreferrer">{strip(site.github)}</a>
                  </div>
                  <div>
                    <span className="ch">$ tty </span>
                    <a href={site.linkedin} target="_blank" rel="noopener noreferrer">{strip(site.linkedin)}</a>
                  </div>
                  <div>
                    <span className="ch">$ curl </span>
                    <a href={site.resume} download>resume.pdf</a>
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
