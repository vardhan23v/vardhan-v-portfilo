import { Component, type CSSProperties, type ErrorInfo, type ReactNode } from "react";
import { isRouteErrorResponse, useRouteError } from "react-router-dom";
import { site } from "../classic/data/site";

/* Styled with the base tokens from src/styles/base.css so it looks right on every edition. */
const wrap: CSSProperties = {
  minHeight: "100dvh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: 24,
  background: "var(--bg)",
  color: "var(--text)",
  fontFamily: "var(--font-sans)",
};
const card: CSSProperties = {
  width: "min(560px, 100%)",
  padding: 32,
  borderRadius: 22,
  background: "var(--card)",
  border: "0.5px solid var(--border-2)",
};
const kicker: CSSProperties = {
  fontFamily: "var(--font-mono)",
  fontSize: 11,
  letterSpacing: "0.12em",
  textTransform: "uppercase",
  color: "var(--accent)",
};
const title: CSSProperties = {
  margin: "10px 0 0",
  fontFamily: "var(--font-display)",
  fontSize: "clamp(1.8rem, 5vw, 2.6rem)",
  fontWeight: 400,
  letterSpacing: "-0.03em",
  lineHeight: 1.05,
};
const sub: CSSProperties = { marginTop: 12, color: "var(--text-2)" };
const detail: CSSProperties = {
  marginTop: 12,
  padding: "10px 12px",
  borderRadius: 10,
  background: "rgba(0,0,0,0.25)",
  border: "0.5px solid var(--border)",
  color: "var(--text-3)",
  fontFamily: "var(--font-mono)",
  fontSize: 12,
  whiteSpace: "pre-wrap",
  wordBreak: "break-word",
  maxHeight: 160,
  overflow: "auto",
};
const row: CSSProperties = { display: "flex", flexWrap: "wrap", gap: 8, marginTop: 22 };
const pill: CSSProperties = {
  padding: "8px 14px",
  borderRadius: 999,
  border: "0.5px solid var(--border-2)",
  background: "transparent",
  color: "var(--text)",
  fontFamily: "var(--font-mono)",
  fontSize: 12,
  letterSpacing: "0.04em",
  textDecoration: "none",
  cursor: "pointer",
};
const primary: CSSProperties = { ...pill, background: "var(--accent)", color: "#061024", borderColor: "transparent" };

export function ErrorFallback({ message }: { message?: string }) {
  return (
    <main style={wrap} id="main" role="alert">
      <div style={card}>
        <span style={kicker}>error · something went wrong</span>
        <h1 style={title}>Something broke on this page.</h1>
        <p style={sub}>Reloading usually fixes it. If it keeps happening, the front door and the source are a click away.</p>
        {message && <pre style={detail}>{message}</pre>}
        <div style={row}>
          <button type="button" style={primary} onClick={() => window.location.reload()}>
            Reload
          </button>
          {/* Plain anchors on purpose: this can render outside the router context. */}
          <a href="/" style={pill}>
            Front door →
          </a>
          <a href={site.github} target="_blank" rel="noopener noreferrer" style={pill}>
            GitHub ↗
          </a>
        </div>
      </div>
    </main>
  );
}

interface State {
  error: Error | null;
}

/** Catches render errors below it and shows the branded fallback instead of a blank page. */
export class ErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[ErrorBoundary]", error, info.componentStack);
  }

  render() {
    if (this.state.error) return <ErrorFallback message={this.state.error.message} />;
    return this.props.children;
  }
}

/** react-router `errorElement`: loader/render errors thrown inside the data router. */
export function RouteError() {
  const err = useRouteError();
  const message = isRouteErrorResponse(err)
    ? `${err.status} ${err.statusText}`
    : err instanceof Error
      ? err.message
      : typeof err === "string"
        ? err
        : undefined;
  console.error("[RouteError]", err);
  return <ErrorFallback message={message} />;
}
