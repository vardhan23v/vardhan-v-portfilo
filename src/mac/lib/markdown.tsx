import { Fragment, type ReactNode } from "react";

/** Tiny GitHub-flavoured-ish markdown → React. Headings, lists, task lists,
 *  code blocks, inline code/bold/italic/strike, links, quotes, rules. */
export function renderMarkdown(src: string, onToggleTask?: (line: number) => void): ReactNode {
  const lines = src.split("\n");
  const out: ReactNode[] = [];
  let i = 0;
  let key = 0;
  const inline = (t: string): ReactNode => {
    const parts: ReactNode[] = [];
    const re = /(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*|~~[^~]+~~|\[[^\]]+\]\([^)]+\))/g;
    let last = 0;
    let m: RegExpExecArray | null;
    while ((m = re.exec(t))) {
      if (m.index > last) parts.push(t.slice(last, m.index));
      const tok = m[0];
      if (tok.startsWith("`")) parts.push(<code key={key++}>{tok.slice(1, -1)}</code>);
      else if (tok.startsWith("**")) parts.push(<strong key={key++}>{tok.slice(2, -2)}</strong>);
      else if (tok.startsWith("~~")) parts.push(<s key={key++}>{tok.slice(2, -2)}</s>);
      else if (tok.startsWith("*")) parts.push(<em key={key++}>{tok.slice(1, -1)}</em>);
      else {
        const mm = /^\[([^\]]+)\]\(([^)]+)\)$/.exec(tok);
        if (mm) parts.push(<a key={key++} href={mm[2]} target="_blank" rel="noopener noreferrer">{mm[1]}</a>);
      }
      last = m.index + tok.length;
    }
    if (last < t.length) parts.push(t.slice(last));
    return <>{parts}</>;
  };
  while (i < lines.length) {
    const l = lines[i];
    if (l.startsWith("```")) {
      const buf: string[] = [];
      i++;
      while (i < lines.length && !lines[i].startsWith("```")) buf.push(lines[i++]);
      i++;
      out.push(<pre key={key++}><code>{buf.join("\n")}</code></pre>);
      continue;
    }
    const h = /^(#{1,3})\s+(.*)$/.exec(l);
    if (h) { const Tag = (`h${h[1].length}`) as "h1" | "h2" | "h3"; out.push(<Tag key={key++}>{inline(h[2])}</Tag>); i++; continue; }
    if (/^---+$/.test(l.trim())) { out.push(<hr key={key++} />); i++; continue; }
    if (l.startsWith("> ")) { out.push(<blockquote key={key++}>{inline(l.slice(2))}</blockquote>); i++; continue; }
    if (/^\s*[-*]\s/.test(l)) {
      const items: ReactNode[] = [];
      while (i < lines.length && /^\s*[-*]\s/.test(lines[i])) {
        const raw = lines[i].replace(/^\s*[-*]\s/, "");
        const task = /^\[( |x|X)\]\s+(.*)$/.exec(raw);
        const ln = i;
        if (task) {
          const done = task[1] !== " ";
          items.push(
            <li key={key++} className={`md-task${done ? " is-done" : ""}`}>
              <button type="button" className="md-check" onClick={() => onToggleTask?.(ln)} aria-label={done ? "Mark not done" : "Mark done"}>{done ? "✓" : ""}</button>
              <span>{inline(task[2])}</span>
            </li>
          );
        } else items.push(<li key={key++}>{inline(raw)}</li>);
        i++;
      }
      out.push(<ul key={key++}>{items}</ul>);
      continue;
    }
    if (/^\s*\d+\.\s/.test(l)) {
      const items: ReactNode[] = [];
      while (i < lines.length && /^\s*\d+\.\s/.test(lines[i])) items.push(<li key={key++}>{inline(lines[i++].replace(/^\s*\d+\.\s/, ""))}</li>);
      out.push(<ol key={key++}>{items}</ol>);
      continue;
    }
    if (l.trim() === "") { i++; continue; }
    const buf = [l];
    i++;
    while (i < lines.length && lines[i].trim() !== "" && !/^(#|```|>|\s*[-*]\s|\s*\d+\.\s|---)/.test(lines[i])) buf.push(lines[i++]);
    out.push(<p key={key++}>{buf.map((b, j) => <Fragment key={j}>{j > 0 && <br />}{inline(b)}</Fragment>)}</p>);
  }
  return <>{out}</>;
}
