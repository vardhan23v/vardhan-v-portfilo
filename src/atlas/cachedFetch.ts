/**
 * JSON fetch with a sessionStorage cache and a timeout, for the Atlas's two live sheets.
 * Resolves to null on any failure so callers can fall back without try/catch.
 */
const TTL = 1000 * 60 * 30;

export async function cachedJson<T>(key: string, url: string, timeoutMs = 6000): Promise<T | null> {
  try {
    const raw = sessionStorage.getItem(key);
    if (raw) {
      const c = JSON.parse(raw) as { at: number; data: T };
      if (Date.now() - c.at < TTL) return c.data;
    }
  } catch {
    /* storage unavailable: fetch fresh */
  }
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const r = await fetch(url, { signal: ctrl.signal });
    if (!r.ok) return null;
    const data = (await r.json()) as T;
    try {
      sessionStorage.setItem(key, JSON.stringify({ at: Date.now(), data }));
    } catch {
      /* quota or private mode: fine, just uncached */
    }
    return data;
  } catch {
    return null;
  } finally {
    clearTimeout(t);
  }
}
