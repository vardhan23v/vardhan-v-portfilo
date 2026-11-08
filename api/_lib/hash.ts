import { createHash, timingSafeEqual } from "node:crypto";

export const sha256 = (s: string | Uint8Array) => createHash("sha256").update(s).digest("hex");

export function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(sha256(a));
  const bb = Buffer.from(sha256(b));
  return timingSafeEqual(ab, bb) && a.length === b.length;
}
