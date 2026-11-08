import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { ArrowUp, Square } from "lucide-react";
import { CHAT_LIMITS } from "../../lib/ai/types";

interface Props {
  busy: boolean;
  onSend: (text: string) => void;
  onStop: () => void;
  autoFocus?: boolean;
}

/** Enter sends, Shift+Enter adds a line. Grows up to ~5 lines. */
export function ChatInput({ busy, onSend, onStop, autoFocus }: Props) {
  const [value, setValue] = useState("");
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => { if (autoFocus) ref.current?.focus({ preventScroll: true }); }, [autoFocus]);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
  }, [value]);

  const submit = () => {
    if (busy || !value.trim()) return;
    onSend(value);
    setValue("");
  };
  const onKey = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) { e.preventDefault(); submit(); }
  };
  const over = value.length > CHAT_LIMITS.maxMessageChars;

  return (
    <form className="pa-input" onSubmit={(e) => { e.preventDefault(); submit(); }}>
      <label htmlFor="pa-input-field" className="sr-only">Ask about Vardhan's work</label>
      <textarea
        id="pa-input-field"
        ref={ref}
        rows={1}
        value={value}
        maxLength={CHAT_LIMITS.maxMessageChars + 200}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={onKey}
        placeholder="Ask about projects, stack, experience…"
        aria-invalid={over || undefined}
        aria-describedby={over ? "pa-input-hint" : undefined}
      />
      {over && <span id="pa-input-hint" className="pa-input__hint">Keep it under {CHAT_LIMITS.maxMessageChars} characters</span>}
      {busy ? (
        <button type="button" className="pa-input__btn" onClick={onStop} aria-label="Stop generating"><Square aria-hidden /></button>
      ) : (
        <button type="submit" className="pa-input__btn" disabled={!value.trim() || over} aria-label="Send"><ArrowUp aria-hidden /></button>
      )}
    </form>
  );
}
