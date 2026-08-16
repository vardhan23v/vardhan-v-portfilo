import { useState, type FormEvent } from "react";
import { site } from "../data/site";
import { Reveal } from "../hooks/useReveal";
import "./Contact.css";

export function Contact() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const subject = encodeURIComponent(`Portfolio inquiry — ${name}`);
    const body = encodeURIComponent(`${message}\n\n— ${name} (${email})`);
    window.location.href = `mailto:${site.email}?subject=${subject}&body=${body}`;
    setSent(true);
  };

  return (
    <section id="contact">
      <div className="container">
        <Reveal>
          <header className="section-head">
            <span className="section-index">07 — Contact</span>
            <h2 className="section-title">Let's build something.</h2>
            <p className="section-sub">
              I'm always interested in building interesting products, experimenting with AI,
              and working on challenging problems.
            </p>
          </header>
        </Reveal>

        <div className="contact-grid">
          <div className="contact-channels">
            <dl>
              <div className="contact-row">
                <dt>Email</dt>
                <dd>
                  <a href={`mailto:${site.email}`} className="text-link">
                    {site.email}
                  </a>
                </dd>
              </div>
              <div className="contact-row">
                <dt>LinkedIn</dt>
                <dd>
                  <a href={site.linkedin} target="_blank" rel="noopener noreferrer" className="text-link">
                    in/vardhan-v23
                  </a>
                </dd>
              </div>
              <div className="contact-row">
                <dt>GitHub</dt>
                <dd>
                  <a href={site.github} target="_blank" rel="noopener noreferrer" className="text-link">
                    github.com/{site.githubUser}
                  </a>
                </dd>
              </div>
              <div className="contact-row">
                <dt>Location</dt>
                <dd>{site.location} · UTC+05:30</dd>
              </div>
            </dl>
          </div>

          <form className="contact-form" onSubmit={submit} aria-label="Contact form">
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
            <div className="form-field">
              <label htmlFor="cf-message">Message</label>
              <textarea
                id="cf-message"
                required
                rows={4}
                placeholder="What are you building?"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
            </div>
            <button type="submit" className="btn btn-primary">
              Send message
            </button>
            {sent && (
              <p className="form-note" role="status">
                Your email app should open — hit send there and I'll reply.
              </p>
            )}
            <p className="form-legal">
              The form opens your email client; nothing is sent to a server.
            </p>
          </form>
        </div>
      </div>
    </section>
  );
}