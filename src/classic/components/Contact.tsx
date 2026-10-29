import { useState, type FormEvent } from "react";
import { site } from "../data/site";
import { Reveal } from "../hooks/useReveal";
import { Icon } from "../lib/icons";
import { mailtoHref, sendMessage } from "../../lib/contact";
import "./Contact.css";

export function Contact() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "mailto" | "error">("idle");
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

  const fallbackHref = mailtoHref({ name, email, message });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (status === "sending") return;
    setStatus("sending");
    const result = await sendMessage({ name, email, message, source: "classic" });
    if (result.ok) {
      setStatus("sent");
    } else if (result.reason === "no-key") {
      window.location.href = fallbackHref;
      setStatus("mailto");
    } else {
      setStatus("error");
    }
  };

  return (
    <section id="contact">
      <div className="container">
        <div className="contact-wrap">
          <Reveal>
            <div className="contact-copy">
              <h2 className="section-title">Get in touch</h2>
              <p className="contact-desc">
                Internship offers, product ideas and hard problems are all welcome. I reply within a day.
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
              <button type="submit" className="btn btn-primary form-submit" disabled={status === "sending"}>
                <Icon.send width={16} height={16} /> {status === "sending" ? "Sending…" : "Send message"}
              </button>
              {status === "sent" && (
                <p className="form-note" role="status">
                  Message sent — I reply {site.replyTime}.
                </p>
              )}
              {status === "mailto" && (
                <p className="form-note" role="status">
                  Your email app opened with the message. Send it there and I will reply {site.replyTime}.
                </p>
              )}
              {status === "error" && (
                <p className="form-note" role="alert">
                  Could not send right now. <a href={fallbackHref}>Email me directly</a> instead — your message is kept above.
                </p>
              )}
              <p className="form-legal">
                Delivered straight to my inbox. Nothing is stored on this site.
              </p>
            </form>
          </Reveal>
        </div>
      </div>
    </section>
  );
}