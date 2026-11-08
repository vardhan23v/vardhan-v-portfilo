import { forwardRef } from "react";
import { MessageCircle, X } from "lucide-react";

export const AssistantLauncher = forwardRef<HTMLButtonElement, { open: boolean; onToggle: () => void }>(function AssistantLauncher({ open, onToggle }, ref) {
  return (
    <button
      ref={ref}
      type="button"
      className={`pa-launcher${open ? " is-open" : ""}`}
      onClick={onToggle}
      aria-expanded={open}
      aria-controls="pa-panel"
      aria-label={open ? "Close Vardhan AI" : "Ask Vardhan AI"}
      data-cursor="pointer"
    >
      {open ? <X aria-hidden /> : <MessageCircle aria-hidden />}
      {!open && <span className="pa-launcher__label">Ask AI</span>}
    </button>
  );
});
