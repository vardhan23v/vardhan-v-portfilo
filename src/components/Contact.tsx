import { useState } from "react";
import { site } from "../data/site";
import { Reveal } from "../hooks/useReveal";

const channels = [
  {
    label: "Email",
    value: site.email,
    href: `mailto:${site.email}`,
    icon: "✉",
    bg: "linear-gradient(135deg, #a78bfa, #6366f1)",
  },
  {
    label: "GitHub",
    value: "github.com/vardhan23v",
    href: site.github,
    icon: "⌥",
    bg: "linear-gradient(135deg, #34d399, #0d9488)",
  },
  {
    label: "LinkedIn",
    value: "linkedin.com/in/vardhan-v23",
    href: site.linkedin,
    icon: "◈",
    bg: "linear-gradient(135deg, #22d3ee, #3b82f6)",
  },
];

export function Contact() {
  const [from, setFrom] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [sent, setSent] = useState(false);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    window.location.href = `mailto:${site.email}?subject=${encodeURIComponent(
      subject || "Hello from your portfolio"
    )}&body=${encodeURIComponent(`${body}\n\n— ${from}`)}`;
    setSent(true);
    setTimeout(() => setSent(false), 4500);
  };

  return (
    <section className="section" id="contact" aria-labelledby="contact-title">
      <div className="container">
        <Reveal>
          <div className="sec-head" style={{ marginBottom: 44 }}>
            <span className="eyebrow">contact</span>
            <h2 className="sec-title" id="contact-title">
              Let's build something
            </h2>
            <p className="sec-sub">
              Open to internships, freelance, and interesting problems. I usually reply within a day.
            </p>
          </div>
        </Reveal>

        <div className="contact-grid">
          <Reveal>
            <div className="contact-ch">
              {channels.map((c) => (
                <a key={c.label} href={c.href} target={c.href.startsWith("mailto") ? undefined : "_blank"} rel="noopener noreferrer">
                  <span className="ci" style={{ background: c.bg }} aria-hidden="true">
                    {c.icon}
                  </span>
                  <span>
                    <span className="cn">{c.label}</span>
                    <span className="chd">{c.value}</span>
                  </span>
                </a>
              ))}
            </div>
          </Reveal>

          <Reveal>
            <div className="mail-panel">
              <form className="mail-form" onSubmit={onSubmit}>
                <div className="field">
                  <label htmlFor="cf-from">Your name or email</label>
                  <input
                    id="cf-from"
                    value={from}
                    onChange={(e) => setFrom(e.target.value)}
                    placeholder="you@example.com"
                    autoComplete="email"
                  />
                </div>
                <div className="field">
                  <label htmlFor="cf-subject">Subject</label>
                  <input
                    id="cf-subject"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Want to build something together"
                  />
                </div>
                <div className="field">
                  <label htmlFor="cf-body">Message</label>
                  <textarea
                    id="cf-body"
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    placeholder="Tell me about the problem, the stack, and the timeline."
                  />
                </div>
                <button type="submit" className="btn btn-primary">
                  Send message
                </button>
                <span className="mail-hint" role="status">
                  {sent
                    ? "✓ Your mail client should have opened with the message ready to send."
                    : "Opens your mail client — no backend, no spam, no tracking."}
                </span>
              </form>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}