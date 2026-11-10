import { useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { STARTER_QUESTIONS } from "../../lib/ai/followups";

interface Props {
  items?: string[];
  onPick: (q: string) => void;
  disabled?: boolean;
  /** "chips" is the compact row shown under an answer. */
  variant?: "list" | "chips";
}

export function SuggestedQuestions({ items = STARTER_QUESTIONS, onPick, disabled, variant = "list" }: Props) {
  const chips = variant === "chips";
  // The chosen question confirms (accent edge) while the rest of the empty state lifts away.
  const [picked, setPicked] = useState<string | null>(null);
  return (
    <ul className={`pa-suggest${chips ? " pa-suggest--chips" : ""}`} aria-label={chips ? "Follow-up questions" : "Suggested questions"}>
      {items.map((q) => (
        <li key={q}>
          <button type="button" className={picked === q ? "is-picked" : undefined} onClick={() => { setPicked(q); onPick(q); }} disabled={disabled}>
            <span>{q}</span>{!chips && <ArrowUpRight aria-hidden />}
          </button>
        </li>
      ))}
    </ul>
  );
}
