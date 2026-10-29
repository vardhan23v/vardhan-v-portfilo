/**
 * Contact-form delivery shared by every edition. POSTs to Web3Forms (static-site friendly,
 * no backend) and falls back to a mailto: link when no key is configured.
 */
import { site } from "../classic/data/site";

export interface ContactMessage {
  name: string;
  email: string;
  message: string;
  /** Which edition the form lives in — goes into the subject line. */
  source: string;
}

export type SendResult = { ok: true } | { ok: false; reason: "no-key" | "network" | "rejected" };

const ENDPOINT = "https://api.web3forms.com/submit";

export async function sendMessage({ name, email, message, source }: ContactMessage): Promise<SendResult> {
  const key = import.meta.env.VITE_WEB3FORMS_KEY as string | undefined;
  if (!key) return { ok: false, reason: "no-key" };
  try {
    const res = await fetch(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        access_key: key,
        subject: `Portfolio contact — ${name} (${source})`,
        from_name: name,
        email,
        message,
        botcheck: "",
      }),
    });
    if (!res.ok) return { ok: false, reason: "rejected" };
    const data: unknown = await res.json().catch(() => null);
    const success = typeof data === "object" && data !== null && (data as { success?: unknown }).success === true;
    return success ? { ok: true } : { ok: false, reason: "rejected" };
  } catch {
    return { ok: false, reason: "network" };
  }
}

/** Prefilled mailto: link — the no-JS / no-key fallback. */
export function mailtoHref({ name, email, message, subject }: Omit<ContactMessage, "source"> & { subject?: string }): string {
  const s = encodeURIComponent(subject ?? `Portfolio contact — ${name}`);
  const body = encodeURIComponent(`${message}\n\n— ${name} (${email})`);
  return `mailto:${site.email}?subject=${s}&body=${body}`;
}
