import { AppError } from "./errors.js";

interface Window { minuteStart: number; minuteCount: number; dayStart: number; dayCount: number }

/**
 * Fixed-window limiter (per minute + per day) keyed by IP and by session.
 * State is per serverless instance — it bounds bursts, and Groq's own limits plus the daily cap
 * bound the rest. Swap in a shared store (e.g. Upstash) if abuse ever needs a global view.
 */
export class RateLimiter {
  private readonly map = new Map<string, Window>();
  private readonly perMinute: number;
  private readonly perDay: number;
  private readonly now: () => number;

  constructor(perMinute: number, perDay: number, now: () => number = Date.now) {
    this.perMinute = perMinute;
    this.perDay = perDay;
    this.now = now;
  }

  /** Throws AppError(429) when any key is over its limit; otherwise counts the hit against every key. */
  hit(keys: string[]): void {
    const t = this.now();
    const windows = keys.map((k) => {
      let w = this.map.get(k);
      if (!w) { w = { minuteStart: t, minuteCount: 0, dayStart: t, dayCount: 0 }; this.map.set(k, w); }
      if (t - w.minuteStart >= 60_000) { w.minuteStart = t; w.minuteCount = 0; }
      if (t - w.dayStart >= 86_400_000) { w.dayStart = t; w.dayCount = 0; }
      return w;
    });
    for (const w of windows) {
      if (w.minuteCount >= this.perMinute) {
        throw new AppError(429, "rate_limited", "You're sending messages too quickly. Please wait a moment.", { retryAfter: Math.ceil((60_000 - (t - w.minuteStart)) / 1000) });
      }
      if (w.dayCount >= this.perDay) {
        throw new AppError(429, "rate_limited", "Daily message limit reached. Please come back tomorrow or email Vardhan directly.", { retryAfter: 3600 });
      }
    }
    for (const w of windows) { w.minuteCount++; w.dayCount++; }
    if (this.map.size > 5000) this.prune(t);
  }

  private prune(t: number) {
    for (const [k, w] of this.map) if (t - w.dayStart >= 86_400_000) this.map.delete(k);
  }
}
