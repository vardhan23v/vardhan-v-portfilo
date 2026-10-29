import { useEffect, useRef, useState, type FormEvent } from "react";
import { featuredProjects } from "../data/projects";
import { site } from "../data/site";
import { mailtoHref, sendMessage } from "../../lib/contact";
import { framesOf } from "./Work";
import { useReveal } from "../hooks/useReveal";
import { useLines } from "../motion/useLines";

type Status = "idle" | "sending" | "sent" | "mailto" | "error";

export function Contact() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const strip = featuredProjects.flatMap((p) => framesOf(p).map((src, i) => ({ src, name: p.name, i })));
  const fallback = mailtoHref({ name: email || "visitor", email, message });
  const h2Ref = useRef<HTMLHeadingElement>(null);
  useLines(h2Ref);
  const stripRef = useRef<HTMLDivElement>(null);
  const formRef = useReveal<HTMLFormElement>({ rootMargin: "0px 0px -12% 0px", threshold: 0.1 });
  useEffect(() => {
    // The marquee only runs while it is on screen.
    const el = stripRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(([e]) => el.classList.toggle("is-paused", !e.isIntersecting), { threshold: 0 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

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
        <div className="contact-strip" aria-hidden="true" ref={stripRef}>
          <div className="contact-strip-track">
            {[...strip, ...strip].map((f, i) => (
              <img key={`${f.src}-${i}`} className={`contact-shot contact-shot--${(i % 3)}`} src={f.src} alt="" width={200} height={150} loading="lazy" decoding="async" />
            ))}
          </div>
        </div>
      )}
      <h2 className="contact-h2" id="contact-h2" ref={h2Ref}>Write to me</h2>
      <form className="reveal contact-bar" ref={formRef} onSubmit={submit} noValidate>
        <label className="contact-cell" style={{ "--i": 0 } as React.CSSProperties}>
          <span className="sr-only">Your email</span>
          <input type="email" name="email" placeholder="Your email" required value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
        </label>
        <label className="contact-cell" style={{ "--i": 1 } as React.CSSProperties}>
          <span className="sr-only">Your message</span>
          <input type="text" name="message" placeholder="What are you building?" required value={message} onChange={(e) => setMessage(e.target.value)} />
        </label>
        <button type="submit" className="contact-cell contact-send" style={{ "--i": 2 } as React.CSSProperties} disabled={status === "sending"}>
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
