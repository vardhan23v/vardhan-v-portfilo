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
    period: "July 2026 — Present",
    points: [
      "Selected for the OxCode Founding Builders community",
      "Tested AI-powered software engineering workflows",
      "Reported bugs and product feedback",
      "Evaluated developer experience",
      "Built and refined web applications using AI coding tools",
    ],
    accent: "#38bdf8",
  },
  {
    company: "FlyRank AI",
    role: "Front-end AI Engineering Intern",
    period: "July 2026 — Present",
    points: [
      "AI-focused frontend engineering",
      "Built intelligent interfaces",
      "Worked with modern AI + web technologies",
    ],
    accent: "#7c6cff",
  },
  {
    company: "Zetheta Algorithms Private Limited",
    role: "Full Stack Engineer",
    period: "July 2026 — August 2026",
    points: [
      "Built a multi-step loan application form",
      "Custom API integration",
      "Frontend development with multi-step form workflows",
      "Backend communication and application workflow development",
    ],
    accent: "#34d399",
  },
  {
    company: "Zaalima Development Pvt. Ltd.",
    role: "Web Development Intern",
    period: "March 2026 — June 2026",
    points: [
      "Hands-on web development experience",
      "Built web-based solutions",
      "Worked in a startup environment",
      "Hands-on problem solving",
    ],
    accent: "#f472b6",
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
  "Software Engineering Job Simulation — Electronic Arts (Forage)",
  "Introduction to Software Engineering Job Simulation — Commonwealth Bank (Forage)",
  "Full Stack Generative and Agentic AI with Python — Udemy",
  "PostgreSQL Developer — Infosys Springboard",
  "CS105: Introduction to Python",
  "Web Development Fundamentals",
  "Java 11 Essentials",
  "Java Programming Fundamentals",
];