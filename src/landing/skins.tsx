import type { ReactElement } from "react";
import type { Tone } from "../editions";

/** Decorative edition previews. `stage` = the live hero device, `mini` = the card thumbnail.
 *  Both are aria-hidden by the caller; class names match the preserved skin CSS. */
export type SkinSize = "stage" | "mini";

function Term({ size }: { size: SkinSize }) {
  return size === "stage" ? (
    <div className="stage-term"><p>$ vardhan build --ai</p><p className="dim">▸ initializing llm…</p><p className="dim">▸ wiring react + node…</p><p className="ok">✓ shipped <i /></p></div>
  ) : (
    <div className="mini-term"><div className="mini-body"><div className="l-prompt">$ vardhan build --ai</div><div className="l-ok">✓ shipped</div><div className="l-cursor" /></div></div>
  );
}
function Classic({ size }: { size: SkinSize }) {
  return size === "stage" ? (
    <div className="stage-classic"><div className="sc-name">VARDHAN<span className="sc-dot">.</span>V</div><div className="sc-grid"><span /><span /><span /><span /></div></div>
  ) : (
    <div className="mini-classic"><div className="mc-name">VARDHAN<span className="mc-dot">.</span>V</div><div className="mc-role">generative-ai :: full-stack</div></div>
  );
}
function Paper({ size }: { size: SkinSize }) {
  return size === "stage" ? (
    <div className="stage-paper"><p className="sp-name">Sree Vardhan<br /><em>Vardhan V.</em></p><div className="sp-rule" /><p className="sp-line" /><p className="sp-line short" /></div>
  ) : (
    <div className="mini-paper"><div className="mp-name">Sree Vardhan<br /><span className="mp-it">Vardhan V.</span></div><div className="mp-rule" /><div className="mp-line" /><div className="mp-line short" /></div>
  );
}
function Aurora({ size }: { size: SkinSize }) {
  return size === "stage" ? (
    <div className="stage-aurora"><span className="sa-blob pink" /><span className="sa-blob cyan" /><p className="sa-name">Sree Vardhan <em>V.</em></p><span className="sa-chip">generative-ai · full-stack</span></div>
  ) : (
    <div className="mini-aurora"><span className="ma-blob pink" /><span className="ma-blob cyan" /><div className="ma-name">Sree Vardhan <span className="ma-it">V.</span></div><div className="ma-chip">glass · light · gradient</div></div>
  );
}
function Forge({ size }: { size: SkinSize }) {
  const pipe = <><span>frontend</span><i>→</i><span>api</span><i>→</i><span>llm</span><i>→</i><span>ship</span></>;
  return size === "stage" ? (
    <div className="stage-forge"><p className="sf-name">Sree Vardhan <span className="sf-dot">V.</span></p><div className="sf-rule" /><p className="sf-head">Where code meets intelligence.</p><div className="sf-pipe">{pipe}</div></div>
  ) : (
    <div className="mini-forge"><div className="mf-name">Sree Vardhan <span className="mf-dot">V.</span></div><div className="mf-rule" /><div className="mf-head">Where code meets intelligence.</div><div className="mf-pipe">{pipe}</div></div>
  );
}
function Mac({ size }: { size: SkinSize }) {
  return size === "stage" ? (
    <div className="stage-mac">
      <div className="sm-menubar"><span>✦</span><em>Vardhan — Overview</em></div>
      <div className="sm-window">
        <div className="sm-bar"><span className="sm-dot r" /><span className="sm-dot y" /><span className="sm-dot g" /><span className="sm-title">VARDHAN — OVERVIEW</span></div>
        <div className="sm-body"><div className="sm-name">Sree Vardhan <i>V</i></div><div className="sm-line" /><div className="sm-line short" /><div className="sm-card" /></div>
      </div>
      <div className="sm-dock"><span /><span /><span /><span /><span /><span /></div>
    </div>
  ) : (
    <div className="mini-mac">
      <div className="mm-bar"><span className="mm-dot r" /><span className="mm-dot y" /><span className="mm-dot g" /></div>
      <div className="mm-body"><div className="mm-name">Vardhan <i>V</i></div><div className="mm-line" /><div className="mm-line short" /></div>
      <div className="mm-dock"><span /><span /><span /><span /><span /></div>
    </div>
  );
}

const SKINS: Record<Tone, (p: { size: SkinSize }) => ReactElement> = { term: Term, classic: Classic, paper: Paper, aurora: Aurora, forge: Forge, mac: Mac };

export function Skin({ tone, size }: { tone: Tone; size: SkinSize }) {
  const C = SKINS[tone];
  return <C size={size} />;
}
