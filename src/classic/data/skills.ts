export interface SkillCategory {
  label: string;
  icon: string;
  items: { name: string; icon: string }[];
}

export const skillCategories: SkillCategory[] = [
  {
    label: "Languages",
    icon: "code",
    items: [
      { name: "JavaScript", icon: "js" },
      { name: "TypeScript", icon: "ts" },
      { name: "Python", icon: "py" },
      { name: "Java", icon: "java" },
      { name: "C", icon: "c" },
      { name: "SQL", icon: "sql" },
    ],
  },
  {
    label: "Frontend",
    icon: "layout",
    items: [
      { name: "React", icon: "react" },
      { name: "Next.js", icon: "next" },
      { name: "Vite", icon: "vite" },
      { name: "HTML", icon: "html" },
      { name: "CSS", icon: "css" },
    ],
  },
  {
    label: "Backend",
    icon: "server",
    items: [
      { name: "Node.js", icon: "node" },
      { name: "Express.js", icon: "express" },
      { name: "REST APIs", icon: "rest" },
      { name: "JWT", icon: "jwt" },
    ],
  },
  {
    label: "Databases",
    icon: "database",
    items: [
      { name: "MongoDB", icon: "mongo" },
      { name: "MySQL", icon: "mysql" },
      { name: "PostgreSQL", icon: "postgres" },
      { name: "Prisma", icon: "prisma" },
    ],
  },
  {
    label: "AI / LLM",
    icon: "sparkles",
    items: [
      { name: "Gemini API", icon: "gemini" },
      { name: "Claude API", icon: "claude" },
      { name: "Groq API", icon: "groq" },
      { name: "LLM APIs", icon: "llm" },
      { name: "Prompt Engineering", icon: "prompt" },
      { name: "AI Agents", icon: "agent" },
      { name: "MCP", icon: "mcp" },
    ],
  },
  {
    label: "Tools",
    icon: "tools",
    items: [
      { name: "Git", icon: "git" },
      { name: "GitHub", icon: "gh" },
      { name: "Vercel", icon: "vercel" },
      { name: "Postman", icon: "postman" },
      { name: "VS Code", icon: "vscode" },
    ],
  },
];

export const exploring = [
  { name: "Advanced TypeScript", note: "Generics deeper than the docs" },
  { name: "System Design", note: "Scaling past the prototype" },
  { name: "AI Agent Architectures", note: "Multi-step reasoning and tools" },
  { name: "MCP", note: "Giving models real capabilities" },
  { name: "Modern AI developer tooling", note: "Building with, not just around, AI" },
];