import { useState } from "react";
import { Mail, FileText, ExternalLink, Copy, Check, Send } from "lucide-react";
import { GithubIcon, LinkedinIcon } from "../../lib/icons";
import { useToast } from "../../components/ui/Toast";
import { Reveal } from "../../components/ui/Reveal";
import { site } from "../../data/site";

export function ContactPage() {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sending, setSending] = useState(false);

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(site.email);
    } catch {
      /* clipboard unavailable */
    }
    setCopied(true);
    toast("Email copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "Name required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Valid email required";
    if (form.message.trim().length < 10) e.message = "At least 10 characters";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    setSending(true);
    setTimeout(() => {
      setSending(false);
      toast(`Thanks ${form.name.split(" ")[0]} — opening your mail app…`);
      window.location.href = `mailto:${site.email}?subject=${encodeURIComponent(
        `Portfolio: message from ${form.name}`
      )}&body=${encodeURIComponent(`${form.message}\n\n— ${form.name} (${form.email})`)}`;
      setForm({ name: "", email: "", message: "" });
    }, 700);
  };

  const channels = [
    { label: "Email", value: site.email, href: `mailto:${site.email}`, icon: Mail, action: "link" as const },
    { label: "GitHub", value: site.githubUser, href: site.github, icon: GithubIcon, action: "link" as const },
    { label: "LinkedIn", value: "vardhan-v23", href: site.linkedin, icon: LinkedinIcon, action: "link" as const },
    { label: "Resume", value: "Download PDF", href: site.resume, icon: FileText, action: "link" as const },
  ];

  return (
    <div className="mac-page">
      <div className="page-header">
        <div className="page-header__eyebrow">Contact</div>
        <h1 className="page-header__title">Say hello.</h1>
        <p className="page-header__subtitle">
          Open to opportunities, collaborations, and interesting conversations. Replies within 24 hours.
        </p>
      </div>

      <Reveal>
        <a className="contact-mail" href={`mailto:${site.email}`}>{site.email}</a>
      </Reveal>
      <div className="contact-channels">
        {channels.map((ch, i) => (
          <Reveal key={ch.label} index={Math.min(i, 3)}>
            <a
              className="contact-channel"
              href={ch.href}
              target={ch.href.startsWith("mailto") ? undefined : "_blank"}
              rel="noopener noreferrer"
            >
              <ch.icon size={18} />
              <div style={{ flex: 1 }}>
                <div className="contact-channel__label">{ch.label}</div>
                <div className="contact-channel__value">{ch.value}</div>
              </div>
              <ExternalLink style={{ width: 14, height: 14, color: "var(--text-tertiary)" }} />
            </a>
          </Reveal>
        ))}
        <Reveal index={3}>
          <button className="contact-channel" onClick={copyEmail} style={{ width: "100%", textAlign: "left" }}>
            {copied ? <Check size={18} /> : <Copy size={18} />}
            <div style={{ flex: 1 }}>
              <div className="contact-channel__label">{copied ? "Copied ✓" : "Copy email"}</div>
              <div className="contact-channel__value">{site.email}</div>
            </div>
          </button>
        </Reveal>
      </div>

      <div className="mac-section">
        <Reveal>
          <h2 className="mac-section-title">
            <Send /> Send a message
          </h2>
        </Reveal>
        <Reveal index={1}>
          <form className="mac-form" onSubmit={submit} noValidate>
            <div className="mac-form__row">
              <label className="mac-field">
                <span>Your name</span>
                <input
                  value={form.name}
                  onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
                  placeholder="Ada Lovelace"
                  aria-invalid={!!errors.name}
                />
                {errors.name && <em>{errors.name}</em>}
              </label>
              <label className="mac-field">
                <span>Email</span>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((s) => ({ ...s, email: e.target.value }))}
                  placeholder="ada@analytical.engine"
                  aria-invalid={!!errors.email}
                />
                {errors.email && <em>{errors.email}</em>}
              </label>
            </div>
            <label className="mac-field">
              <span>Message</span>
              <textarea
                value={form.message}
                onChange={(e) => setForm((s) => ({ ...s, message: e.target.value }))}
                placeholder="Tell me about your idea, role, or project…"
                rows={4}
                aria-invalid={!!errors.message}
              />
              {errors.message && <em>{errors.message}</em>}
            </label>
            <div className="mac-form__foot">
              <button type="submit" className="mac-btn mac-btn--primary" disabled={sending}>
                {sending ? "Preparing…" : "Send message →"}
              </button>
              <span className="mac-form__hint">Opens your mail app — nothing is stored.</span>
            </div>
          </form>
        </Reveal>
      </div>
    </div>
  );
}
