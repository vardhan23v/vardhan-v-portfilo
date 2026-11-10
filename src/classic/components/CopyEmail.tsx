import { useEffect, useState } from "react";
import { Icon } from "../lib/icons";

/** Copies the address to the clipboard and says so for two seconds. Falls back to mailto. */
export function CopyEmail({ email }: { email: string }) {
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    if (!copied) return;
    const t = window.setTimeout(() => setCopied(false), 2000);
    return () => window.clearTimeout(t);
  }, [copied]);
  const copy = async () => {
    try { await navigator.clipboard.writeText(email); setCopied(true); }
    catch { window.location.href = `mailto:${email}`; }
  };
  return (
    <button type="button" className={`copy${copied ? " is-copied" : ""}`} onClick={copy} aria-label={copied ? "Email address copied" : `Copy ${email}`}>
      {/* Both labels share one grid cell, so the button is sized to the wider one and the swap rolls in place. */}
      <span className="copy-roll" aria-hidden="true"><span>Copy</span><span><Icon.check width={12} height={12} /> Copied</span></span>
      <span className="copy-star" aria-hidden="true" />
      <span className="sr-only" role="status">{copied ? "Copied to clipboard" : ""}</span>
    </button>
  );
}
