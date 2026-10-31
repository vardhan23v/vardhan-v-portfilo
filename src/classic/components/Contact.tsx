import { useRef, useState, type FormEvent } from "react";
import { site } from "../data/site";
import { mailtoHref, sendMessage } from "../../lib/contact";
import { Reveal } from "../hooks/useReveal";
import { useLines } from "../motion/useLines";

type Status = "idle" | "sending" | "sent" | "mailto" | "error";

export function Contact() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [tried, setTried] = useState(false);
  const titleRef = useRef<HTMLHeadingElement>(null);
  useLines(titleRef);
  const fallback = mailtoHref({ name: name || "visitor", email, message });
  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const valid = name.trim().length > 0 && emailOk && message.trim().length > 0;

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setTried(true);
    if (!valid || status === "sending") return;
    setStatus("sending");
    const r = await sendMessage({ name, email, message, source: "classic" });
    if (r.ok) { setStatus("sent"); setName(""); setEmail(""); setMessage(""); setTried(false); return; }
    if (r.reason === "no-key") { window.location.href = fallback; setStatus("mailto"); return; }
    setStatus("error");
  };

  return (
    <section className="contact" id="contact" aria-labelledby="contact-h2">
      <div className="wrap">
        <Reveal as="div" className="contact-card">
          <div className="contact-copy">
            <h2 className="h2" id="contact-h2" ref={titleRef}>Let’s talk</h2>
            <p className="contact-p">Hiring for an internship, or need something built? Write a line about it and I reply {site.replyTime}.</p>
            <p className="contact-direct">
              <a href={`mailto:${site.email}`}>{site.email}</a>
            </p>
            <p className="contact-alt">
              <a href={site.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn</a>
              <a href={site.github} target="_blank" rel="noopener noreferrer">GitHub</a>
              <a href={site.resume} download="sree-vardhan-v-resume.pdf">Résumé (PDF)</a>
            </p>
          </div>
          <form className="contact-form" onSubmit={submit} noValidate>
            <div className="field">
              <label htmlFor="c-name">Your name</label>
              <input id="c-name" name="name" type="text" autoComplete="name" required value={name} onChange={(e) => setName(e.target.value)} aria-invalid={tried && !name.trim() ? true : undefined} aria-describedby={tried && !name.trim() ? "c-name-err" : undefined} />
              {tried && !name.trim() && <p className="field-err" id="c-name-err">Please add your name.</p>}
            </div>
            <div className="field">
              <label htmlFor="c-email">Your email</label>
              <input id="c-email" name="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} aria-invalid={tried && !emailOk ? true : undefined} aria-describedby={tried && !emailOk ? "c-email-err" : undefined} />
              {tried && !emailOk && <p className="field-err" id="c-email-err">Please enter a valid email address.</p>}
            </div>
            <div className="field">
              <label htmlFor="c-message">What are you building?</label>
              <textarea id="c-message" name="message" rows={5} required value={message} onChange={(e) => setMessage(e.target.value)} aria-invalid={tried && !message.trim() ? true : undefined} aria-describedby={tried && !message.trim() ? "c-message-err" : undefined} />
              {tried && !message.trim() && <p className="field-err" id="c-message-err">Please add a few words about it.</p>}
            </div>
            <div className="contact-actions">
              <button type="submit" className="btn" disabled={status === "sending"}>
                {status === "sending" ? "Sending…" : "Send message"}
                <span className="btn-arrow" aria-hidden="true">→</span>
              </button>
              <p className="contact-status" role="status" aria-live="polite">
                {status === "sent" && (
                  <span className="sent">
                    <svg className="sent-check" viewBox="0 0 20 20" width="18" height="18" aria-hidden="true"><path d="M4 10.5 8.2 14.5 16 6" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    Sent. Thank you, I will reply soon.
                  </span>
                )}
                {status === "mailto" && "Your mail app opened with the message."}
                {status === "error" && <>Could not send. <a href={fallback}>Email me directly</a> instead.</>}
              </p>
            </div>
          </form>
        </Reveal>
      </div>
    </section>
  );
}
