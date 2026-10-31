import { useEffect, useState } from "react";

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
      <span aria-hidden="true">{copied ? "Copied" : "Copy"}</span>
      <span className="sr-only" role="status">{copied ? "Copied to clipboard" : ""}</span>
    </button>
  );
}
