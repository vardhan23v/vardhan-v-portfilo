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
      { name: "HTML", icon: "html" },
      { name: "CSS", icon: "css" },
    ],
  },
  {
    label: "Frontend",
    icon: "layout",
    items: [
      { name: "React", icon: "react" },
      { name: "Next.js", icon: "next" },
      { name: "TanStack Start", icon: "tanstack" },
      { name: "Vite", icon: "vite" },
      { name: "Tailwind CSS", icon: "tailwind" },
      { name: "Framer Motion", icon: "motion" },
      { name: "Zustand", icon: "zustand" },
      { name: "React Router", icon: "router" },
    ],
  },
  {
    label: "Backend",
    icon: "server",
    items: [
      { name: "Node.js", icon: "node" },
      { name: "Express.js", icon: "express" },
      { name: "REST APIs", icon: "rest" },
      { name: "Socket.IO", icon: "socket" },
      { name: "JWT / NextAuth", icon: "jwt" },
      { name: "Sequelize", icon: "sequelize" },
      { name: "Zod", icon: "zod" },
    ],
  },
  {
    label: "Databases",
    icon: "database",
    items: [
      { name: "MongoDB", icon: "mongo" },
      { name: "MySQL", icon: "mysql" },
      { name: "Cloud MySQL", icon: "cloudmysql" },
      { name: "PostgreSQL", icon: "postgres" },
      { name: "Prisma", icon: "prisma" },
      { name: "Supabase", icon: "supabase" },
    ],
  },
  {
    label: "AI / LLM",
    icon: "sparkles",
    items: [
      { name: "Muse Spark 1.2", icon: "spark" },
      { name: "DeepSeek", icon: "deepseek" },
      { name: "Kimi", icon: "kimi" },
      { name: "Groq API", icon: "groq" },
      { name: "Gemini API", icon: "gemini" },
      { name: "Claude API", icon: "claude" },
      { name: "MCP", icon: "mcp" },
      { name: "Prompt Engineering", icon: "prompt" },
      { name: "AI Agents", icon: "agent" },
      { name: "Streaming", icon: "stream" },
    ],
  },
  {
    label: "Cloud & Tools",
    icon: "tools",
    items: [
      { name: "Railway", icon: "railway" },
      { name: "Vercel", icon: "vercel" },
      { name: "Cloudinary API", icon: "cloudinary" },
      { name: "Git", icon: "git" },
      { name: "GitHub", icon: "gh" },
      { name: "Postman", icon: "postman" },
      { name: "VS Code", icon: "vscode" },
      { name: "Jest / Vitest", icon: "vitest" },
      { name: "Playwright", icon: "playwright" },
      { name: "Recharts", icon: "recharts" },
      { name: "Leaflet", icon: "leaflet" },
      { name: "PDFKit / jsPDF", icon: "pdf" },
      { name: "Monaco Editor", icon: "monaco" },
    ],
  },
];

export const exploring = [
  { name: "Advanced TypeScript", note: "Generics deeper than the docs" },
  { name: "Real-time systems", note: "Socket.IO, server-authoritative state, single clock" },
  { name: "Full-stack testing", note: "Jest, Vitest, and Playwright in production ERPs" },
  { name: "AI Agent Architectures", note: "Multi-step reasoning, MCP tools, streaming" },
  { name: "System Design", note: "Scaling past the prototype — ERPs & auction engines" },
];
