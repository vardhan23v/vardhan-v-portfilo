export interface Experience {
  company: string;
  role: string;
  period: string;
  points: string[];
  accent: string;
}

export const experience: Experience[] = [
  {
    company: "OxCode",
    role: "AI Product Beta Tester",
    period: "July 2026 — October 2026",
    points: [
      "Selected for the OxCode Founding Builders community",
      "Tested AI-powered software engineering workflows",
      "Gave feedback to improve developer experience",
      "Built and refined web apps with OxCode's AI coding assistant",
    ],
    accent: "#38bdf8",
  },
  {
    company: "FlyRank AI",
    role: "Front-end AI Engineering Intern",
    period: "July 2026 — September 2026",
    points: [
      "Completed the Front-end AI Engineering program with a certificate",
      "Built intelligent interfaces with AI and modern web technologies",
      "Hands-on, collaborative projects (remote)",
    ],
    accent: "#7c6cff",
  },
];

export interface Education {
  school: string;
  degree: string;
  period: string;
  detail: string;
}

export const education: Education[] = [
  {
    school: "NMAM Institute of Technology (NITTE)",
    degree: "B.Tech — Computer Science and Engineering",
    period: "2024 — 2028",
    detail: "Focus on full-stack development, Generative AI, AI-powered applications, and developer tools.",
  },
  {
    school: "Narayana Junior College",
    degree: "Class XII — MPC",
    period: "2022 — 2024",
    detail: "Mathematics, Physics, and Chemistry.",
  },
  {
    school: "Narayana English Medium School",
    degree: "Class X — SSC",
    period: "2022",
    detail: "",
  },
];

export const certifications = [
  "Front-end AI Engineering Internship — FlyRank AI (Sep 2026)",
  "Claude 101 — Anthropic (Jul 2026)",
  "Introduction to Software Engineering Job Simulation — Commonwealth Bank (Forage, Jul 2026)",
  "Full Stack Generative and Agentic AI with Python — Udemy",
  "PostgreSQL Developer — Infosys Springboard",
  "MST Blockchain Buildathon 2026, 24-hour buildathon — MST Blockchain (Oct 2026)",
  "ACM × MLH Hack Days 2026: Beyond Reality — ACM NMAMIT (Oct 2026)",
  "Odoo × NMIT Hackathon 2026 — Odoo (Sep 2026)",
  "Google Gemini QuizOff 2026, main quiz — Unstop (Jun 2026)",
  "Suraksha AI Panel Discussion 2025 — IIC, NMAM Institute of Technology (Mar 2025)",
];