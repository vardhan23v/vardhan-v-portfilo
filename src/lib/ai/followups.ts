import { featuredProjects, otherProjects } from "../../classic/data/projects";
import type { ChatMessage } from "./useChat";

/** Shown on an empty chat, and as follow-ups when an answer isn't about one project. */
export const STARTER_QUESTIONS = [
  "What has Vardhan built with AI?",
  "Explain the architecture of Extension AI",
  "What is his tech stack?",
  "How can I contact him?",
];

const GENERAL = [...STARTER_QUESTIONS, "What work experience does he have?", "Which projects are freelance work?"];
const MAX = 3;

interface Known { name: string; repo: string; live: boolean }

// Longest names first, so "SEM5 Learning Hub" wins over "SEM5".
const KNOWN: Known[] = [...featuredProjects, ...otherProjects]
  .map((p) => ({ name: p.name, repo: (p.github.split("/").pop() ?? "").toLowerCase(), live: Boolean(p.live) }))
  .sort((a, b) => b.name.length - a.name.length);

const norm = (s: string) => s.trim().toLowerCase().replace(/[?.!]+$/, "");
const mentions = (text: string, name: string) => new RegExp(`(^|[^a-z0-9])${name.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}([^a-z0-9]|$)`).test(text.toLowerCase());

function projectFor(answer: ChatMessage, question: string): Known | undefined {
  // The question names the project most reliably; sources are the fallback, in citation order.
  const asked = KNOWN.find((p) => mentions(question, p.name));
  if (asked) return asked;
  for (const s of answer.sources ?? []) {
    const repo = s.repo?.toLowerCase();
    const hit = KNOWN.find((p) => (repo && p.repo === repo) || mentions(s.title, p.name));
    if (hit) return hit;
  }
  return undefined;
}

/** Up to three next questions for the latest finished answer. Built locally: no extra model call. */
export function followUps(messages: ChatMessage[]): string[] {
  const last = messages[messages.length - 1];
  if (!last || last.role !== "assistant" || last.status !== "done") return [];
  const users = messages.filter((m) => m.role === "user");
  const asked = new Set(users.map((m) => norm(m.content)));
  const project = last.supported === false ? undefined : projectFor(last, users[users.length - 1]?.content ?? "");
  const pool = project
    ? [
        `What is the tech stack of ${project.name}?`,
        `What problem does ${project.name} solve?`,
        ...(project.live ? [`Is ${project.name} live anywhere?`] : []),
        "What else has Vardhan built?",
        ...GENERAL,
      ]
    : GENERAL;
  return pool.filter((q) => !asked.has(norm(q))).slice(0, MAX);
}
