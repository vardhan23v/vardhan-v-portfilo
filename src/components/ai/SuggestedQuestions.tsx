const DEFAULT_SUGGESTIONS = [
  "What has Vardhan built with AI?",
  "Explain the architecture of Extension AI",
  "What is his tech stack?",
  "How can I contact him?",
];

export function SuggestedQuestions({ items = DEFAULT_SUGGESTIONS, onPick, disabled }: { items?: string[]; onPick: (q: string) => void; disabled?: boolean }) {
  return (
    <ul className="pa-suggest" aria-label="Suggested questions">
      {items.map((q) => (
        <li key={q}><button type="button" onClick={() => onPick(q)} disabled={disabled}>{q}</button></li>
      ))}
    </ul>
  );
}
