import { useState } from "react";
import { site } from "../data/site";
import { Reveal } from "../hooks/useReveal";
import { TypeCmd } from "./TypeCmd";

export function Contact() {
  const [from, setFrom] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [sent, setSent] = useState(false);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const target = `mailto:${site.email}?subject=${encodeURIComponent(subject || "hello from your site")}&body=${encodeURIComponent(
      `${body}\n\n— ${from} (via vardhan-v-portfilo.vercel.app)`
    )}`;
    window.location.href = target;
    setSent(true);
    setTimeout(() => setSent(false), 3500);
  };

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
              one shell prompt away. respond time: usually within a day, exit status: 0.
            </p>
          </Reveal>

          <Reveal>
            <div className="term">
              <div className="term-bar" aria-hidden="true">
                <span className="term-dot r" />
                <span className="term-dot a" />
                <span className="term-dot g" />
                <span className="term-title">
                  <b>vardhan@folio</b>:~$ mail --interactive
                </span>
              </div>
              <div className="term-body">
                <form className="mail-form" onSubmit={onSubmit}>
                  <div className="mail-row">
                    <label className="lbl" htmlFor="cf-from">
                      from:
                    </label>
                    <input
                      id="cf-from"
                      className="mail-input"
                      value={from}
                      onChange={(e) => setFrom(e.target.value)}
                      placeholder="you@somewhere.com"
                      autoComplete="email"
                    />
                  </div>
                  <div className="mail-row">
                    <label className="lbl" htmlFor="cf-subject">
                      subject:
                    </label>
                    <input
                      id="cf-subject"
                      className="mail-input"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="hello human / want to build something"
                    />
                  </div>
                  <div className="mail-row">
                    <label className="lbl" htmlFor="cf-body">
                      body:
                    </label>
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
                      send via mail client
                    </button>
                    <span className="bracket" style={{ fontSize: 12 }}>
                      {sent ? "> message staged — your mail app should have opened ✓" : "note: opens your mail app"}
                    </span>
                  </div>
                </form>

                <div className="contact-channels">
                  <div>
                    <span className="ch">$ tty </span>
                    <a href={site.linkedin} target="_blank" rel="noopener noreferrer">
                      linkedin.com/in/vardhan-v23
                    </a>
                  </div>
                  <div>
                    <span className="ch">$ ping </span>
                    <a href={site.github} target="_blank" rel="noopener noreferrer">
                      github.com/vardhan23v
                    </a>
                  </div>
                  <div>
                    <span className="ch">$ whois </span>
                    <a href={`mailto:${site.email}`}>{site.email}</a>
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