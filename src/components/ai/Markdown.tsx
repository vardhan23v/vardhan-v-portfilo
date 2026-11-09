import { Fragment, type ReactNode } from "react";
import { parseMarkdown, type Inline } from "../../lib/ai/markdown";

interface Props {
  text: string;
  /** Called for `app:<id>` links (macOS window targets). Without it they render as plain text. */
  onAppLink?: (target: string) => void;
  /** Citation numbers that have a matching source; others render as plain text. */
  citations?: Set<number>;
  onCite?: (n: number) => void;
  className?: string;
}

/** Render assistant Markdown as React elements — no innerHTML, links sanitized in the parser. */
export function Markdown({ text, onAppLink, citations, onCite, className }: Props) {
  const node = (n: Inline, i: number): ReactNode => {
      switch (n.t) {
        case "text": return <Fragment key={i}>{n.v}</Fragment>;
        case "strong": return <strong key={i}>{inline(n.c)}</strong>;
        case "em": return <em key={i}>{inline(n.c)}</em>;
        case "code": return <code key={i}>{n.v}</code>;
        case "cite":
          return citations?.has(n.n) ? (
            <button key={i} type="button" className="pa-cite" onClick={() => onCite?.(n.n)} aria-label={`Source ${n.n}`}>{n.n}</button>
          ) : null;
        case "link":
          if (n.href.startsWith("app:")) {
            return onAppLink ? (
              <button key={i} type="button" className="pa-applink aiapp__link" onClick={() => onAppLink(n.href.slice(4))}>{inline(n.c)}</button>
            ) : <Fragment key={i}>{inline(n.c)}</Fragment>;
          }
          return n.href.startsWith("/") ? (
            <a key={i} href={n.href}>{inline(n.c)}</a>
          ) : (
            <a key={i} href={n.href} target="_blank" rel="noopener noreferrer">{inline(n.c)}</a>
          );
      }
  };

  // Neighbouring citations share a no-wrap group, so [1][2] can't split across lines.
  const inline = (nodes: Inline[]): ReactNode => {
    const out: ReactNode[] = [];
    let run: ReactNode[] = [];
    const flush = () => {
      if (run.length) out.push(<span key={`c${out.length}`} className="pa-cites">{run}</span>);
      run = [];
    };
    nodes.forEach((n, i) => {
      if (n.t === "cite") { run.push(node(n, i)); return; }
      flush();
      out.push(node(n, i));
    });
    flush();
    return out;
  };

  return (
    <div className={className}>
      {parseMarkdown(text).map((b, i) => {
        if (b.t === "p") return <p key={i}>{inline(b.c)}</p>;
        if (b.t === "pre") return <pre key={i}><code>{b.v}</code></pre>;
        if (b.t === "h") return <p key={i} className="pa-md-h"><strong>{inline(b.c)}</strong></p>;
        const List = b.t;
        return <List key={i}>{b.items.map((it, j) => <li key={j}>{inline(it)}</li>)}</List>;
      })}
    </div>
  );
}
