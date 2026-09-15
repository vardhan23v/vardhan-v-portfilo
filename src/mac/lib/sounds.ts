/** Tiny synthesized UI sounds (no assets). Respects the volume + sounds prefs. */
type Kind = "chime" | "pop" | "ding" | "whoosh" | "tick";

let ctx: AudioContext | null = null;
const ac = () => {
  if (typeof window === "undefined") return null;
  const AC = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AC) return null;
  if (!ctx) ctx = new AC();
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
};

function tone(c: AudioContext, freq: number, t0: number, dur: number, gain: number, type: OscillatorType = "sine") {
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, t0);
  g.gain.setValueAtTime(0, t0);
  g.gain.linearRampToValueAtTime(gain, t0 + 0.012);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  o.connect(g).connect(c.destination);
  o.start(t0);
  o.stop(t0 + dur + 0.02);
}

function readPrefs(): { volume: number; sounds: boolean } {
  try {
    const p = JSON.parse(localStorage.getItem("mac-preferences") || "{}");
    return { volume: typeof p.volume === "number" ? p.volume : 0.6, sounds: p.sounds !== false };
  } catch {
    return { volume: 0.6, sounds: true };
  }
}

export function play(kind: Kind) {
  const { volume, sounds } = readPrefs();
  if (!sounds || volume <= 0) return;
  const c = ac();
  if (!c) return;
  const v = Math.min(1, volume) * 0.18;
  const t = c.currentTime;
  switch (kind) {
    case "chime": // boot: soft major triad rising
      tone(c, 523.25, t, 0.9, v, "sine");
      tone(c, 659.25, t + 0.12, 0.9, v * 0.8, "sine");
      tone(c, 783.99, t + 0.24, 1.1, v * 0.7, "sine");
      tone(c, 1046.5, t + 0.36, 1.3, v * 0.5, "triangle");
      break;
    case "pop": // dock launch
      tone(c, 660, t, 0.09, v * 0.9, "triangle");
      tone(c, 880, t + 0.04, 0.12, v * 0.6, "sine");
      break;
    case "ding": // notification
      tone(c, 1318.5, t, 0.35, v * 0.7, "sine");
      tone(c, 1760, t + 0.08, 0.45, v * 0.4, "sine");
      break;
    case "whoosh": { // window close / minimize: filtered noise
      const len = Math.floor(c.sampleRate * 0.25);
      const buf = c.createBuffer(1, len, c.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len) ** 2;
      const src = c.createBufferSource();
      src.buffer = buf;
      const f = c.createBiquadFilter();
      f.type = "bandpass";
      f.frequency.setValueAtTime(1200, t);
      f.frequency.exponentialRampToValueAtTime(300, t + 0.25);
      const g = c.createGain();
      g.gain.setValueAtTime(v * 0.8, t);
      src.connect(f).connect(g).connect(c.destination);
      src.start(t);
      break;
    }
    case "tick":
      tone(c, 2000, t, 0.03, v * 0.35, "square");
      break;
  }
}
