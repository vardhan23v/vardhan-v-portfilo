import { useCallback, useRef, useState } from "react";
import { useChat } from "../../lib/ai/useChat";
import { AssistantLauncher } from "./AssistantLauncher";
import { AssistantPanel } from "./AssistantPanel";
import "./assistant.css";

/** Global floating assistant, mounted once in the root layout so it persists across editions. */
export function PortfolioAssistant() {
  const [open, setOpen] = useState(false);
  const chat = useChat("global");
  const launcher = useRef<HTMLButtonElement>(null);

  const close = useCallback(() => {
    setOpen(false);
    // After the re-render: on phones the launcher is hidden while the sheet is open.
    requestAnimationFrame(() => launcher.current?.focus({ preventScroll: true }));
  }, []);

  return (
    <div className="pa-root" data-open={open || undefined}>
      {open && <AssistantPanel chat={chat} onClose={close} />}
      <AssistantLauncher ref={launcher} open={open} onToggle={() => (open ? close() : setOpen(true))} />
    </div>
  );
}
