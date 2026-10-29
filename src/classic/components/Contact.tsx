import { useState, type FormEvent } from "react";
import { featuredProjects } from "../data/projects";
import { site } from "../data/site";
import { mailtoHref, sendMessage } from "../../lib/contact";
import { framesOf } from "./Work";

type Status = "idle" | "sending" | "sent" | "mailto" | "error";

export function Contact() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const strip = featuredProjects.flatMap((p) => framesOf(p).map((src, i) => ({ src, name: p.name, i })));
  const fallback = mailtoHref({ name: email || "visitor", email, message });

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (status === "sending") return;
    setStatus("sending");
    const r = await sendMessage({ name: email, email, message, source: "classic" });
    if (r.ok) { setStatus("sent"); setEmail(""); setMessage(""); return; }
    if (r.reason === "no-key") { window.location.href = fallback; setStatus("mailto"); return; }
    setStatus("error");
  };

  return (
    <section className="contact" id="contact" aria-labelledby="contact-h2">
      {strip.length > 0 && (
        <div className="contact-strip" aria-hidden="true">
          <div className="contact-strip-track">
            {[...strip, ...strip].map((f, i) => (
              <img key={`${f.src}-${i}`} className={`contact-shot contact-shot--${(i % 3)}`} src={f.src} alt="" width={200} height={150} loading="lazy" decoding="async" />
            ))}
          </div>
        </div>
      )}
      <h2 className="contact-h2" id="contact-h2">Write to me</h2>
      <form className="contact-bar" onSubmit={submit} noValidate>
        <label className="contact-cell">
          <span className="sr-only">Your email</span>
          <input type="email" name="email" placeholder="Your email" required value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
        </label>
        <label className="contact-cell">
          <span className="sr-only">Your message</span>
          <input type="text" name="message" placeholder="What are you building?" required value={message} onChange={(e) => setMessage(e.target.value)} />
        </label>
        <button type="submit" className="contact-cell contact-send" disabled={status === "sending"}>
          {status === "sending" ? "Sending" : "Send"}
        </button>
      </form>
      <div className="contact-small">
        <p>Replies {site.replyTime}.</p>
        <p role="status">
          {status === "sent" && "Sent. Thank you."}
          {status === "mailto" && "Your mail app opened with the message."}
          {status === "error" && <>Could not send. <a href={fallback}>Email me directly</a> instead.</>}
          {(status === "idle" || status === "sending") && <>Or write to <a href={`mailto:${site.email}`}>{site.email}</a>.</>}
        </p>
      </div>
    </section>
  );
}
