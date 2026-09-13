import { Mail, FileText, ExternalLink } from "lucide-react";
import { GithubIcon, LinkedinIcon } from "../../lib/icons";
import { site } from "../../data/site";

const channels = [
  { label: "Email", value: site.email, href: `mailto:${site.email}`, icon: Mail },
  { label: "GitHub", value: site.githubUser, href: site.github, icon: GithubIcon },
  { label: "LinkedIn", value: "vardhan-v23", href: site.linkedin, icon: LinkedinIcon },
  { label: "Resume", value: "Download PDF", href: site.resume, icon: FileText },
];

export function ContactPage() {
  return (
    <div className="mac-page">
      <div className="page-header">
        <div className="page-header__eyebrow">Contact</div>
        <h1 className="page-header__title">Get in Touch</h1>
        <p className="page-header__subtitle">
          Open to opportunities, collaborations, and interesting conversations.
        </p>
      </div>

      <div className="contact-channels">
        {channels.map((ch) => (
          <a
            key={ch.label}
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
        ))}
      </div>
    </div>
  );
}
