import { useEffect, useRef, useState, type ReactNode } from "react";
import "./expandable-tabs.css";

export type ExpandableTabItem =
  | { type: "separator" }
  | { type: "tab"; title: string; icon?: ReactNode; value?: string };

export type ExpandableTabsProps = {
  tabs: readonly ExpandableTabItem[];
  className?: string;
  activeColor?: string;
  selected?: number | null;
  onSelect?: (index: number | null) => void;
};

export function ExpandableTabs({
  tabs,
  className,
  activeColor,
  selected,
  onSelect,
}: ExpandableTabsProps) {
  const [internal, setInternal] = useState<number | null>(null);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const sel = selected ?? internal;

  useEffect(() => {
    const onDown = (e: MouseEvent | TouchEvent) => {
      const t = e.target as Node | null;
      if (rootRef.current && t && !rootRef.current.contains(t)) {
        setInternal(null);
        onSelect?.(null);
      }
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("touchstart", onDown);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("touchstart", onDown);
    };
  }, [onSelect]);

  const pick = (i: number) => {
    const item = tabs[i];
    if (!item || item.type !== "tab") return;
    setInternal(i);
    onSelect?.(i);
  };

  return (
    <div ref={rootRef} className={["et", className ?? ""].filter(Boolean).join(" ")}>
      {tabs.map((item, i) =>
        item.type === "separator" ? (
          <span key={i} className="et-sep" aria-hidden="true" />
        ) : (
          <button
            key={item.title}
            type="button"
            className={["et-tab", sel === i ? activeColor ?? "" : ""].filter(Boolean).join(" ")}
            data-selected={sel === i}
            aria-label={item.title}
            onClick={() => pick(i)}
          >
            <span className="et-icon" aria-hidden="true">
              {item.icon}
            </span>
            <span className="et-title">
              <span>{item.title}</span>
            </span>
          </button>
        )
      )}
    </div>
  );
}