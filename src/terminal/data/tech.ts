export const techGroups = [
  {
    label: "Languages",
    items: ["JavaScript", "TypeScript", "Python", "Java", "C", "SQL", "HTML", "CSS"],
  },
  {
    label: "Frontend",
    items: [
      "React",
      "Next.js",
      "TanStack Start",
      "Vite",
      "Tailwind CSS",
      "Framer Motion",
      "Zustand",
      "React Router",
    ],
  },
  {
    label: "Backend",
    items: ["Node.js", "Express", "REST APIs", "Socket.IO", "JWT / NextAuth", "Sequelize", "Zod"],
  },
  {
    label: "Data",
    items: ["MongoDB", "MySQL", "Cloud MySQL", "PostgreSQL", "Prisma", "Supabase"],
  },
  {
    label: "AI / LLM",
    items: [
      "Muse Spark 1.2",
      "DeepSeek",
      "Kimi",
      "Groq",
      "Gemini",
      "Claude",
      "MCP",
      "Prompt engineering",
      "AI agents",
      "Streaming",
    ],
  },
  {
    label: "Cloud & Tools",
    items: [
      "Railway",
      "Vercel",
      "Cloudinary API",
      "Git",
      "GitHub",
      "Postman",
      "VS Code",
      "Jest / Vitest",
      "Playwright",
      "Recharts",
      "Leaflet",
      "PDFKit / jsPDF",
      "Monaco Editor",
    ],
  },
];

/**
 * Public repos shown in OPEN_SOURCE — derived from the case studies and the
 * also-built list so there is one source of truth (see data/work.ts).
 */
import { caseStudies, otherWork } from "./work";

const langFor = (tech: string[]) => (tech.some((x) => /typescript|tanstack/i.test(x)) ? "TypeScript" : tech.some((x) => /python/i.test(x)) ? "Python" : "JavaScript");

export const fallbackRepos: { name: string; description: string; language: string; url: string }[] = [
  ...caseStudies.map((p) => ({ name: p.github.split("/").pop() ?? p.slug, description: p.description, language: langFor(p.tech), url: p.github })),
  ...otherWork.slice(0, 3).map((o) => ({ name: o.url.split("/").pop() ?? o.name, description: o.note.split(". ")[0] + ".", language: o.lang ?? "JavaScript", url: o.url })),
];
