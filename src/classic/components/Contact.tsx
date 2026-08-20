import { useState, type FormEvent } from "react";
import { site } from "../data/site";
import { Reveal } from "../hooks/useReveal";
import { Icon } from "../lib/icons";
import "./Contact.css";

export function Contact() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);
  const [copied, setCopied] = useState(false);

  const copyEmail = () => {
    const done = () => {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    };
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(site.email).then(done, () => fallbackCopy(done));
    } else {
      fallbackCopy(done);
    }
  };

  const fallbackCopy = (done: () => void) => {
    const ta = document.createElement("textarea");
    ta.value = site.email;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand("copy");
      done();
    } catch {
      /* clipboard unavailable */
    }
    ta.remove();
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const subject = encodeURIComponent(`Portfolio contact — ${name}`);
    const body = encodeURIComponent(`${message}\n\n— ${name} (${email})`);
    window.location.href = `mailto:${site.email}?subject=${subject}&body=${body}`;
    setSent(true);
  };

  return (
    <section id="contact">
      <div className="container">
        <div className="contact-wrap">
          <Reveal>
            <div className="contact-copy">
              <span className="section-eyebrow">Contact</span>
              <h2 className="section-title">
                Have an idea? <span className="grad-text">Let's build it.</span>
              </h2>
              <p className="contact-desc">
                I'm always interested in building interesting products, experimenting with AI, and
                working on challenging problems.
              </p>

              <div className="contact-channels">
                <div className="contact-channel">
                  <span className="contact-channel-icon">
                    <Icon.mail width={19} height={19} />
                  </span>
                  <a href={`mailto:${site.email}`} className="contact-channel-main">
                    <span className="contact-channel-label">Email</span>
                    <span className="contact-channel-value">{site.email}</span>
                  </a>
                  <button
                    type="button"
                    className={`contact-copy-btn${copied ? " is-copied" : ""}`}
                    onClick={copyEmail}
                    aria-label={copied ? "Email address copied" : "Copy email address"}
                  >
                    {copied ? <Icon.check width={14} height={14} /> : <Icon.copy width={14} height={14} />}
                    {copied ? "copied" : "copy"}
                  </button>
                </div>
                <a href={site.linkedin} target="_blank" rel="noopener noreferrer" className="contact-channel">
                  <span className="contact-channel-icon">
                    <Icon.linkedin width={18} height={18} />
                  </span>
                  <div>
                    <span className="contact-channel-label">LinkedIn</span>
                    <span className="contact-channel-value">in/vardhan-v23</span>
                  </div>
                </a>
                <a href={site.github} target="_blank" rel="noopener noreferrer" className="contact-channel">
                  <span className="contact-channel-icon">
                    <Icon.github width={19} height={19} />
                  </span>
                  <div>
                    <span className="contact-channel-label">GitHub</span>
                    <span className="contact-channel-value">vardhan23v</span>
                  </div>
                </a>
              </div>
            </div>
          </Reveal>

          <Reveal delay="reveal-d2">
            <form className="contact-form card" onSubmit={handleSubmit} aria-label="Contact form">
              <div className="form-row">
                <div className="form-field">
                  <label htmlFor="cf-name">Name</label>
                  <input
                    id="cf-name"
                    type="text"
                    required
                    autoComplete="name"
                    placeholder="Your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div className="form-field">
                  <label htmlFor="cf-email">Email</label>
                  <input
                    id="cf-email"
                    type="email"
                    required
                    autoComplete="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>
              <div className="form-field">
                <label htmlFor="cf-message">Message</label>
                <textarea
                  id="cf-message"
                  required
                  rows={5}
                  placeholder="Tell me about your idea…"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
              </div>
              <button type="submit" className="btn btn-primary form-submit">
                <Icon.send width={16} height={16} /> Send Message
              </button>
              {sent && (
                <p className="form-note" role="status">
                  Opening your email app — hit send there and I'll get back to you.
                </p>
              )}
              <p className="form-legal">
                Opens your email client — no server involved.
              </p>
            </form>
          </Reveal>
        </div>
      </div>
    </section>
  );
}