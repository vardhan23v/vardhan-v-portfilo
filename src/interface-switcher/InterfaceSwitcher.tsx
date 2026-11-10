import { useRef, type FocusEvent, type PointerEvent as ReactPointerEvent } from "react";
import { Link } from "react-router-dom";
import { EDITIONS } from "../editions";
import { prefetchEdition } from "../lib/editionLoaders";
import "./interface-switcher.css";

const ROLE_SHORT: Record<string, string> = { term: "Developer", classic: "Professional", paper: "Editorial", aurora: "Visual", forge: "Builder", mac: "Application", atlas: "Explorer" };
const editionRoutes = EDITIONS.map((e) => ({ num: e.num, label: e.label, role: ROLE_SHORT[e.tone], to: e.to, key: e.tone === "term" ? "terminal" : e.tone }));

/**
 * The 1–7 edition switcher. The active edition keeps a static marker; hover, keyboard focus
 * and press move one shared highlight (.iswitcher-glide) between items instead of seven
 * separate tints. Every intent (hover, focus, touch) starts downloading that edition.
 * State is per instance (Terminal mounts two switchers), measured on demand, never per frame.
 */
export function InterfaceSwitcher({ current }: { current: string }) {
  const navRef = useRef<HTMLElement>(null);
  const snapRaf = useRef(0);

  const glideTo = (item: HTMLElement) => {
    const nav = navRef.current;
    if (!nav) return;
    nav.style.setProperty("--gx", `${item.offsetLeft}px`);
    nav.style.setProperty("--gy", `${item.offsetTop}px`);
    nav.style.setProperty("--gw", `${item.offsetWidth}px`);
    nav.style.setProperty("--gh", `${item.offsetHeight}px`);
    if (nav.dataset.glide === "on") return;
    // first show: appear in place (opacity only), then travel from there
    nav.dataset.glide = "snap";
    cancelAnimationFrame(snapRaf.current);
    snapRaf.current = requestAnimationFrame(() => {
      snapRaf.current = requestAnimationFrame(() => {
        if (nav.dataset.glide === "snap") nav.dataset.glide = "on";
      });
    });
  };

  const hide = () => {
    const nav = navRef.current;
    if (!nav) return;
    cancelAnimationFrame(snapRaf.current);
    nav.dataset.glide = "off";
  };

  const onIntent = (to: string) => (e: ReactPointerEvent<HTMLElement> | FocusEvent<HTMLElement>) => {
    prefetchEdition(to);
    if (e.type === "focus" && !(e.currentTarget as HTMLElement).matches(":focus-visible")) return;
    glideTo(e.currentTarget as HTMLElement);
  };

  return (
    <nav
      ref={navRef}
      className="iswitcher"
      aria-label="Switch interface"
      data-glide="off"
      onPointerLeave={(e) => {
        // touch keeps the pressed item lit until the next page takes over
        if (e.pointerType === "touch") return;
        const f = document.activeElement as HTMLElement | null;
        if (f && navRef.current?.contains(f) && f.matches(":focus-visible")) glideTo(f);
        else hide();
      }}
      onBlur={(e) => {
        if (!navRef.current?.contains(e.relatedTarget as Node | null)) hide();
      }}
    >
      <span className="iswitcher-glide" aria-hidden="true" />
      {editionRoutes.map((it) => {
        const active = it.key === current;
        return (
          <Link
            key={it.to}
            to={it.to}
            viewTransition
            className={`iswitcher-item ${active ? "iswitcher-item--active" : ""}`}
            aria-current={active ? "page" : undefined}
            title={`${it.label} — ${it.role}`}
            onPointerEnter={onIntent(it.to)}
            onPointerDown={onIntent(it.to)}
            onFocus={onIntent(it.to)}
            onTouchStart={() => prefetchEdition(it.to)}
          >
            <span className="iswitcher-num" aria-hidden="true">
              {it.num}
            </span>
            <span className="iswitcher-name">{it.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
