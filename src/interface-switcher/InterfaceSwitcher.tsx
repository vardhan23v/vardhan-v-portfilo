import { Link } from "react-router-dom";
import "./interface-switcher.css";

const editionRoutes = [
  { num: "01", label: "Terminal", role: "Developer", to: "/terminal", key: "terminal" },
  { num: "02", label: "Classic", role: "Professional", to: "/classic", key: "classic" },
  { num: "03", label: "Paper", role: "Editorial", to: "/paper", key: "paper" },
  { num: "04", label: "Aurora", role: "Visual", to: "/aurora", key: "aurora" },
  { num: "05", label: "Forge", role: "Builder", to: "/forge", key: "forge" },
];

export function InterfaceSwitcher({ current }: { current: string }) {
  return (
    <nav className="iswitcher" aria-label="Switch interface">
      {editionRoutes.map((it) => {
        const active = it.key === current;
        return (
          <Link
            key={it.to}
            to={it.to}
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