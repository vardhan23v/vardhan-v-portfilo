import { Link } from "react-router-dom";
import { EDITIONS } from "../editions";
import { useMagnetic } from "../hooks/useMagnetic";
import "./interface-switcher.css";

const ROLE_SHORT: Record<string, string> = { term: "Developer", classic: "Professional", paper: "Editorial", aurora: "Visual", forge: "Builder", mac: "Application" };
const editionRoutes = EDITIONS.map((e) => ({ num: e.num, label: e.label, role: ROLE_SHORT[e.tone], to: e.to, key: e.tone === "term" ? "terminal" : e.tone }));

export function InterfaceSwitcher({ current }: { current: string }) {
  useMagnetic(".iswitcher-item", 0.22, 6);
  return (
    <nav className="iswitcher" aria-label="Switch interface">
      {editionRoutes.map((it) => {
        const active = it.key === current;
        return (
          <Link
            key={it.to}
            to={it.to}
            viewTransition
            className={`iswitcher-item ${active ? "iswitcher-item--active" : ""}`}
            aria-current={active ? "true" : undefined}
            title={`${it.label} — ${it.role}`}
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
