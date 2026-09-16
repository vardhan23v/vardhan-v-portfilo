import { useCallback, useEffect, useRef, useState } from "react";
import { site } from "../data/site";
import { TypeText } from "./TypeCmd";
import { motionReduced } from "../../lib/motion";
import { banner } from "../lib/banner";
import { HOST, L, OS_VERSION, complete, loadHistory, runLine, saveHistory, topTable, type Line, type ShellEffect } from "../lib/shell";

function MatrixRain() {
  const ref = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    if (motionReduced()) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const hero = canvas.parentElement as HTMLElement | null;
    if (!hero) return;

    const CHARS = "ｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜ0123456789ABCDEF";
    // colours follow the active phosphor palette (see data-phosphor in global.css)
    let bg = "#050807";
    let head = "#8df5b8";
    let tail = "rgba(54, 229, 124, 0.5)";
    const readPalette = () => {
      const cs = getComputedStyle(hero);
      bg = cs.getPropertyValue("--bg").trim() || bg;
      head = cs.getPropertyValue("--green-2").trim() || head;
      const rgb = cs.getPropertyValue("--green-rgb").trim();
      if (rgb) tail = `rgba(${rgb}, 0.5)`;
    };
    const FONT = 14;
    let cols = 0;
    let drops: number[] = [];
    let raf = 0;
    let last = 0;
    let inView = true;

    const setup = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.floor(hero.clientWidth * dpr);
      canvas.height = Math.floor(hero.clientHeight * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cols = Math.max(1, Math.floor(hero.clientWidth / FONT));
      drops = Array.from({ length: cols }, () => Math.floor(Math.random() * -40));
      readPalette();
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, hero.clientWidth, hero.clientHeight);
    };

    const step = (t: number) => {
      raf = requestAnimationFrame(step);
      if (!inView || t - last < 50) return;
      last = t;
      ctx.globalAlpha = 0.12;
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, hero.clientWidth, hero.clientHeight);
      ctx.globalAlpha = 1;
      ctx.font = `${FONT}px "JetBrains Mono", monospace`;
      for (let i = 0; i < cols; i++) {
        const ch = CHARS[Math.floor(Math.random() * CHARS.length)];
        ctx.fillStyle = Math.random() < 0.08 ? head : tail;
        ctx.fillText(ch, i * FONT, drops[i] * FONT);
        if (drops[i] * FONT > hero.clientHeight && Math.random() > 0.975) drops[i] = 0;
        drops[i]++;
      }
    };

    const io = new IntersectionObserver(
      (es) => {
        inView = es[0]?.isIntersecting ?? true;
      },
      { rootMargin: "200px" }
    );
    io.observe(hero);

    setup();
    raf = requestAnimationFrame(step);
    window.addEventListener("resize", setup);
    window.addEventListener("folio:phosphor", setup);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      window.removeEventListener("resize", setup);
      window.removeEventListener("folio:phosphor", setup);
    };
  }, []);

  return <canvas ref={ref} className="matrix-canvas" aria-hidden="true" />;
}

/* ------------------------------------------------------------------ */
/* snake                                                                */

const SW = 24;
const SH = 10;
type Pt = { x: number; y: number };
interface Snake {
  body: Pt[];
  dir: Pt;
  next: Pt;
  food: Pt;
  score: number;
  dead: boolean;
}

const spawnFood = (body: Pt[]): Pt => {
  for (;;) {
    const p = { x: Math.floor(Math.random() * SW), y: Math.floor(Math.random() * SH) };
    if (!body.some((b) => b.x === p.x && b.y === p.y)) return p;
  }
};

const newSnake = (): Snake => {
  const body = [{ x: 6, y: 5 }, { x: 5, y: 5 }, { x: 4, y: 5 }];
  return { body, dir: { x: 1, y: 0 }, next: { x: 1, y: 0 }, food: spawnFood(body), score: 0, dead: false };
};

const stepSnake = (s: Snake): Snake => {
  const dir = s.next;
  const head = { x: s.body[0].x + dir.x, y: s.body[0].y + dir.y };
  if (head.x < 0 || head.y < 0 || head.x >= SW || head.y >= SH || s.body.some((b) => b.x === head.x && b.y === head.y)) {
    return { ...s, dir, dead: true };
  }
  const ate = head.x === s.food.x && head.y === s.food.y;
  const body = [head, ...s.body.slice(0, ate ? undefined : -1)];
  return { ...s, dir, body, food: ate ? spawnFood(body) : s.food, score: ate ? s.score + 10 : s.score };
};

const readHi = () => {
  try {
    return Number(localStorage.getItem("folio.snake-hi") ?? 0);
  } catch {
    return 0;
  }
};

const drawSnake = (s: Snake, hi: number): string[] => {
  const grid: string[][] = Array.from({ length: SH }, () => Array(SW).fill(" "));
  s.body.forEach((b, i) => (grid[b.y][b.x] = i === 0 ? "█" : "▓"));
  grid[s.food.y][s.food.x] = "●";
  const top = `┌${"─".repeat(SW)}┐  snake · score ${s.score} · hi ${Math.max(hi, s.score)}`;
  const rows = grid.map((r) => `│${r.join("")}│`);
  const bottom = `└${"─".repeat(SW)}┘  ${s.dead ? "game over — r to restart, q to quit" : "arrows / wasd · q quits"}`;
  return [top, ...rows, bottom];
};

const quickCmds = ["help", "whoami", "ls -la", "work", "neofetch", "snake"];

/* ------------------------------------------------------------------ */

export function Hero() {
  const [lines, setLines] = useState<Line[]>(() => [
    L(`PORTFOLIO_OS ${OS_VERSION} session established.`, "dim"),
    L("type 'help' to explore, or use the buttons below.", "dim"),
  ]);
  const [input, setInput] = useState("");
  const [remote, setRemote] = useState(false);
  const [train, setTrain] = useState(false);
  const [game, setGame] = useState<Snake | null>(null);
  const [busy, setBusy] = useState<"top" | "snake" | null>(null);
  const histIdxRef = useRef<number | null>(null);
  const boxRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const heroRef = useRef<HTMLElement | null>(null);
  const historyRef = useRef<string[]>([]);
  const remoteRef = useRef(false);
  const touchedRef = useRef(false);
  const mounted = useRef(false);
  const topTimer = useRef(0);
  const topKeys = useRef<number[]>([]);
  const gameKeys = useRef<number[]>([]);
  const gameRef = useRef<Snake | null>(null);
  const hiRef = useRef(0);
  const bootDelay = (() => {
    try {
      return sessionStorage.getItem("folio.booted") ? 250 : 1750;
    } catch {
      return 250;
    }
  })();

  useEffect(() => {
    historyRef.current = loadHistory();
    hiRef.current = readHi();
  }, []);

  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return;
    }
    boxRef.current?.scrollTo({ top: boxRef.current.scrollHeight, behavior: motionReduced() ? "auto" : "smooth" });
  }, [lines]);

  const stopTop = () => {
    window.clearInterval(topTimer.current);
    topTimer.current = 0;
    topKeys.current = [];
    setBusy((b) => (b === "top" ? null : b));
  };

  /** Replace the lines with the given keys in place (no remount, no re-animation). */
  const patch = (keys: number[], texts: string[], cls: string) =>
    setLines((prev) => {
      const map = new Map(keys.map((k, i) => [k, texts[i]] as const));
      return prev.map((l) => (map.has(l.key) ? { ...l, text: map.get(l.key)!, cls } : l));
    });

  const startTop = () => {
    stopTop();
    const first = topTable(0);
    const keys = first.map(() => 0);
    const fresh = first.map((t, i) => {
      const line = L(t, i < 2 ? "row cyan" : i === 3 ? "row b" : "row green");
      keys[i] = line.key;
      return line;
    });
    topKeys.current = keys;
    setLines((prev) => [...prev, ...fresh]);
    setBusy("top");
    let tick = 0;
    topTimer.current = window.setInterval(() => {
      tick++;
      const table = topTable(tick);
      setLines((prev) => prev.map((l) => {
        const i = topKeys.current.indexOf(l.key);
        return i === -1 ? l : { ...l, text: table[i] };
      }));
      if (tick >= 8) {
        stopTop();
        setLines((prev) => [...prev, L("top: exited after 4s — run it again any time.", "dim")]);
      }
    }, 500);
  };

  const endGame = useCallback((quit: boolean) => {
    const g = gameRef.current;
    gameRef.current = null;
    setGame(null);
    setBusy(null);
    if (g && g.score > hiRef.current) {
      hiRef.current = g.score;
      try { localStorage.setItem("folio.snake-hi", String(g.score)); } catch { /* ignore */ }
    }
    if (quit) setLines((prev) => [...prev, L(`snake: ${g ? `final score ${g.score}` : "closed"} · hi ${hiRef.current}`, "dim")]);
    gameKeys.current = [];
  }, []);

  const startSnake = () => {
    if (motionReduced()) {
      setLines((prev) => [...prev, L("snake needs animations on — see the landing footer or ⌘K → Animations.", "amber")]);
      return;
    }
    stopTop();
    const s = newSnake();
    const rows = drawSnake(s, hiRef.current);
    const fresh = rows.map((t) => L(t, "row green"));
    gameKeys.current = fresh.map((l) => l.key);
    gameRef.current = s;
    setGame(s);
    setBusy("snake");
    setLines((prev) => [...prev, ...fresh]);
    inputRef.current?.focus();
  };

  // game loop
  useEffect(() => {
    if (!game || game.dead) return;
    const t = window.setInterval(() => {
      const cur = gameRef.current;
      if (!cur || cur.dead) return;
      const next = stepSnake(cur);
      gameRef.current = next;
      setGame(next);
      patch(gameKeys.current, drawSnake(next, hiRef.current), next.dead ? "row amber" : "row green");
    }, 120);
    return () => window.clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [game?.dead, game === null]);

  const runEffects = (effects: ShellEffect[]) => {
    for (const e of effects) {
      switch (e.type) {
        case "scroll": {
          const el = e.id === "hero" ? heroRef.current : document.getElementById(e.id);
          el?.scrollIntoView({ behavior: motionReduced() ? "auto" : "smooth", block: "start" });
          break;
        }
        case "navigate":
          window.dispatchEvent(new CustomEvent("folio:navigate", { detail: e.to }));
          break;
        case "open":
          window.open(e.url, "_blank", "noopener,noreferrer");
          break;
        case "download": {
          const a = document.createElement("a");
          a.href = e.url;
          a.download = e.name;
          document.body.appendChild(a);
          a.click();
          a.remove();
          break;
        }
        case "clear":
          setLines([]);
          break;
        case "remote":
          remoteRef.current = e.on;
          setRemote(e.on);
          break;
        case "top":
          startTop();
          break;
        case "sl":
          if (!motionReduced()) {
            setTrain(true);
            window.setTimeout(() => setTrain(false), 3200);
          }
          break;
        case "snake":
          startSnake();
          break;
        case "history-clear":
          historyRef.current = [];
          saveHistory([]);
          break;
        case "announce":
          window.dispatchEvent(new CustomEvent("folio:announce", { detail: e.text }));
          break;
      }
    }
  };

  const submitRef = useRef<(raw: string) => void>(() => {});
  const submit = (rawIn: string) => {
    let raw = rawIn.trim();
    if (!raw) return;
    touchedRef.current = true;
    stopTop();
    // !n / !! history expansion
    const bang = /^!(\d+|!)$/.exec(raw);
    if (bang) {
      const h = historyRef.current;
      const entry = bang[1] === "!" ? h[h.length - 1] : h[Number(bang[1]) - 1];
      if (!entry) {
        setLines((prev) => [...prev, L(`bash: ${raw}: event not found`, "red")]);
        return;
      }
      raw = entry;
    }
    historyRef.current = [...historyRef.current.filter((c) => c !== raw), raw].slice(-50);
    saveHistory(historyRef.current);
    histIdxRef.current = null;
    const { lines: out, effects } = runLine(raw, { history: historyRef.current, remote: remoteRef.current });
    const clears = effects.some((e) => e.type === "clear");
    if (!clears && out.length) setLines((prev) => [...prev, ...out]);
    setInput("");
    runEffects(effects);
  };
  submitRef.current = submit;

  const tab = () => {
    const r = complete(input);
    if (r.value) setInput(r.value);
    else if (r.matches.length > 1) setLines((prev) => [...prev, L(r.matches.join("   "), "dim")]);
  };

  const onKey = (e: React.KeyboardEvent) => {
    // snake owns the keys while it is running
    if (gameRef.current) {
      const g = gameRef.current;
      const dirs: Record<string, Pt> = {
        ArrowUp: { x: 0, y: -1 }, w: { x: 0, y: -1 },
        ArrowDown: { x: 0, y: 1 }, s: { x: 0, y: 1 },
        ArrowLeft: { x: -1, y: 0 }, a: { x: -1, y: 0 },
        ArrowRight: { x: 1, y: 0 }, d: { x: 1, y: 0 },
      };
      e.preventDefault();
      if (e.key === "q" || e.key === "Escape") return endGame(true);
      if (e.key === "r" && g.dead) { endGame(false); startSnake(); return; }
      const d = dirs[e.key];
      if (d && !(d.x === -g.dir.x && d.y === -g.dir.y)) gameRef.current = { ...g, next: d };
      return;
    }
    if (e.key === "Enter") {
      submit(input);
    } else if (e.key === "Escape") {
      (e.target as HTMLInputElement).blur();
    } else if (e.key === "l" && e.ctrlKey) {
      e.preventDefault();
      stopTop();
      setLines([]);
      setInput("");
    } else if (e.key === "c" && e.ctrlKey) {
      e.preventDefault();
      stopTop();
      setLines((prev) => [...prev, L("^C", "dim")]);
      setInput("");
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      const h = historyRef.current;
      if (h.length === 0) return;
      const idx = histIdxRef.current === null ? h.length - 1 : Math.max(0, histIdxRef.current - 1);
      histIdxRef.current = idx;
      setInput(h[idx]);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (histIdxRef.current === null) return;
      const idx = histIdxRef.current + 1;
      if (idx >= historyRef.current.length) {
        histIdxRef.current = null;
        setInput("");
      } else {
        histIdxRef.current = idx;
        setInput(historyRef.current[idx]);
      }
    } else if (e.key === "Tab") {
      e.preventDefault();
      tab();
    }
  };

  // ` or ? focus the shell from anywhere; the bottom bar hands commands over via folio:shell
  useEffect(() => {
    const focus = () => {
      heroRef.current?.scrollIntoView({ behavior: motionReduced() ? "auto" : "smooth", block: "start" });
      inputRef.current?.focus();
    };
    const onGlobal = (e: KeyboardEvent) => {
      if (e.key !== "`" && e.key !== "?") return;
      if (e.altKey || e.ctrlKey || e.metaKey) return;
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA")) return;
      e.preventDefault();
      focus();
      if (e.key === "?") submitRef.current("help");
    };
    const onShell = (e: Event) => {
      const cmd = (e as CustomEvent<string>).detail;
      if (!cmd) return;
      touchedRef.current = true;
      focus();
      submitRef.current(cmd);
    };
    window.addEventListener("keydown", onGlobal);
    window.addEventListener("folio:shell", onShell);
    return () => {
      window.removeEventListener("keydown", onGlobal);
      window.removeEventListener("folio:shell", onShell);
      window.clearInterval(topTimer.current);
    };
  }, []);

  // First visit: the shell types `neofetch` by itself so the box is never empty.
  useEffect(() => {
    if (motionReduced()) return;
    let cancelled = false;
    const timers: number[] = [];
    const start = window.setTimeout(() => {
      if (cancelled || touchedRef.current) return;
      const cmd = "neofetch";
      cmd.split("").forEach((_, i) => {
        timers.push(window.setTimeout(() => {
          if (cancelled || touchedRef.current) return;
          setInput(cmd.slice(0, i + 1));
        }, i * 70));
      });
      timers.push(window.setTimeout(() => {
        if (cancelled || touchedRef.current) return;
        submitRef.current(cmd);
      }, cmd.length * 70 + 260));
    }, bootDelay + 2600);
    return () => {
      cancelled = true;
      window.clearTimeout(start);
      timers.forEach(window.clearTimeout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const host = remote ? "remote" : HOST;
  const Prompt = () => (
    <span className="prompt">
      vardhan@{host}<span className="path">:~</span>
      <span className="dollar">$</span>
    </span>
  );

  return (
    <section className="hero" aria-label="Introduction" ref={heroRef}>
      <MatrixRain />
      <div className="container hero-grid">
        <div>
          <h1 className="visually-hidden">
            {site.fullName} — {site.role}
          </h1>
          <pre className="hero-banner" aria-hidden="true">
            {banner("VARDHAN.V")}
          </pre>
          <div className="hero-tag">generative-ai developer :: full-stack developer</div>
          <p className="hero-intro">
            <TypeText
              text={`${site.fullName} — b.tech computer science @ nmam. I turn interfaces, APIs, databases and LLM backends into working products, and I ship them.`}
              delay={bootDelay}
              speed={16}
            />
          </p>

          <div className="hero-chips" role="group" aria-label="Quick commands">
            {quickCmds.map((c) => (
              <button key={c} type="button" className="hero-quick" onClick={() => submit(c)}>
                <b>$</b> {c}
              </button>
            ))}
          </div>

          <div className="hero-cta">
            <a className="btn btn-solid" href={site.resume} download>
              resume.pdf
            </a>
            <a className="btn" href="#work">
              see work
            </a>
            <a className="btn" href={`mailto:${site.email}`}>
              mail
            </a>
          </div>

          <p className="hero-status">
            <span className="ok">● <span className="visually-hidden">online</span></span> status: currently building
            with AI + full-stack tech <span className="bracket">·</span> location: {site.location}{" "}
            <span className="bracket">·</span> tty: 1
          </p>
        </div>

        <div className={`shell-win${busy ? ` is-${busy}` : ""}`}>
          <div className="term">
            <div className="term-bar" aria-hidden="true">
              <span className="term-dot r" />
              <span className="term-dot a" />
              <span className="term-dot g" />
              <span className="term-title">
                <b>vardhan@{host}</b>:~$ {busy ?? "interactive"}
              </span>
            </div>
            <div className="term-body">
              {train && (
                <pre className="shell-train" aria-hidden="true">
{String.raw`      ====        ________                ___________
  _D _|  |_______/        \__I_I_____===__|_________|
   |(_)---  |   H\________/ |   |        =|___ ___|
   /     |  |   H  |  |     |   |         ||_| |_||
  |      |  |   H  |__--------------------| [___] |
  | ________|___H__/__|_____/[][]~\_______|       |
  |/ |   |-----------I_____I [][] []  D   |=======|__
__/ =| o |=-~~\  /~~\  /~~\  /~~\ ____Y___________|__
 |/-=|___|=    ||    ||    ||    |_____/~\___/
  \_/      \O=====O=====O=====O_/      \_/`}
                </pre>
              )}
              <div className="shell-lines" ref={boxRef} role="log" aria-live={busy ? "off" : "polite"}>
                {lines.map((l) => (
                  <span key={l.key} className={`shell-ln ${l.cls}`}>
                    {l.cls === "cmd" ? (
                      <>
                        <Prompt />
                        {l.text.slice(2)}
                      </>
                    ) : (
                      l.text
                    )}
                  </span>
                ))}
              </div>
              <div className="shell-entry">
                <Prompt />
                <input
                  ref={inputRef}
                  className="shell-input"
                  value={input}
                  onChange={(e) => { touchedRef.current = true; setInput(e.target.value); }}
                  onFocus={() => { touchedRef.current = true; }}
                  onKeyDown={onKey}
                  placeholder={game ? "snake: arrows · q quits" : "type a command…"}
                  aria-label="Terminal — type a command and press Enter"
                  autoComplete="off"
                  spellCheck={false}
                />
              </div>
              <div className="shell-foot">
                <span>
                  [ <span className="shell-cmd">?=help · `=focus · tab</span> ] {busy ? `${busy} running` : "5 procs alive"}
                </span>
                <span className="bracket">terminal v{OS_VERSION} · port 443</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
