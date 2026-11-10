export const ASK_EVENT = "vardhan-ai:ask";

/** Open the floating assistant from anywhere on the site and ask it a question. */
export function askAssistant(question: string) {
  window.dispatchEvent(new CustomEvent<string>(ASK_EVENT, { detail: question }));
}

export const aboutProject = (name: string) => `Tell me about ${name}`;
