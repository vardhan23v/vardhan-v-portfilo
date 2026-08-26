export interface Feature {
  label: string;
  icon: string;
}

export interface Project {
  name: string;
  slug: string;
  tagline: string;
  problem: string;
  features: string[];
  tech: string[];
  github: string;
  live?: string;
  accent: [string, string, string];
  emoji: string;
  highlight?: boolean;
}

export const featuredProjects: Project[] = [
  {
    name: "Extension AI",
    slug: "extension-ai",
    tagline: "Build Chrome Extensions with plain-English prompts.",
    problem:
      "Building a browser extension from scratch takes boilerplate, manifest config, and API wiring. Extension AI turns a natural-language prompt into a working extension.",
    features: [
      "Natural-language extension generation",
      "Multi-provider LLM integration",
      "Live preview",
      "Template gallery",
      "One-click ZIP download",
    ],
    tech: ["React", "Node.js", "Express", "MongoDB", "Gemini", "Claude", "Groq", "Manifest V3"],
    github: "https://github.com/vardhan23v/extension-AI",
    live: "https://extension-ai-five.vercel.app/",
    accent: ["#7c6cff", "#38bdf8", "#a78bfa"],
    emoji: "🧩",
    highlight: true,
  },
  {
    name: "AI Code Reviewer",
    slug: "ai-code-reviewer",
    tagline: "AI-powered code review with structured feedback on bugs, quality, performance, and security.",
    problem:
      "Getting a second pair of eyes on your code usually means waiting for a reviewer. This tool paste-or-upload code and returns structured, multi-dimensional AI feedback instantly.",
    features: [
      "Paste / upload code",
      "Bug detection",
      "Code quality feedback",
      "Performance suggestions",
      "Security analysis",
      "Structured AI output",
      "Analytics visualization",
    ],
    tech: ["React", "Vite", "Monaco Editor", "Groq", "Claude", "Recharts"],
    github: "https://github.com/vardhan23v/codereviewer",
    accent: ["#38bdf8", "#22d3ee", "#818cf8"],
    emoji: "🛡️",
  },
  {
    name: "CareerForge Pro",
    slug: "careerforge-pro",
    tagline: "AI-powered resume builder and career toolkit.",
    problem:
      "Writing an ATS-friendly resume is painful. CareerForge Pro generates tailored, keyword-optimized resumes with AI assistance and exports them ready to send.",
    features: [
      "AI-assisted resume creation",
      "ATS-oriented optimization",
      "AI suggestions",
      "Professional generation",
      "PDF export",
      "Multi-provider AI fallback",
    ],
    tech: ["React", "Express", "Gemini", "Groq", "JavaScript"],
    github: "https://github.com/vardhan23v/career-forge-pro",
    accent: ["#34d399", "#2dd4bf", "#6ee7b7"],
    emoji: "📄",
  },
  {
    name: "Vard AI",
    slug: "vard-ai",
    tagline: "Voice-first AI assistant with streaming conversations and tool integration.",
    problem:
      "Most assistants are chat-only. Vard AI focuses on voice-first interaction with streaming responses, persistent memory, and MCP tool use.",
    features: [
      "Voice-first interaction",
      "Streaming AI responses",
      "MCP tools",
      "Persistent memory",
      "Authentication",
      "Customizable themes",
    ],
    tech: ["TypeScript", "React", "Groq", "MCP", "Supabase"],
    github: "https://github.com/vardhan23v/Vard-AI",
    accent: ["#f472b6", "#a78bfa", "#38bdf8"],
    emoji: "🎙️",
  },
  {
    name: "DisasterMind AI",
    slug: "disastermind-ai",
    tagline: "AI-driven emergency operations digital twin with live tactical visualization.",
    problem:
      "Emergency response teams need one live picture of a disaster — assets, routes, and threats. DisasterMind AI simulates the situation and routes help in real time.",
    features: [
      "Live tactical map",
      "Cyclone simulation",
      "Fleet dispatch",
      "Agent feeds",
      "SOS triage",
      "PDF situation reports",
    ],
    tech: ["React", "TypeScript", "Vite", "Leaflet", "Zustand"],
    github: "https://github.com/vardhan23v/Disastermind-ai",
    accent: ["#f97316", "#fb923c", "#facc15"],
    emoji: "🛰️",
  },
  {
    name: "DriveNest",
    slug: "drivenest",
    tagline: "Full-stack vehicle rental platform with an animated interface and MySQL backend.",
    problem:
      "Rental booking flows are usually clunky. DriveNest pairs a polished animated frontend with a database-driven booking, billing, and reservation workflow.",
    features: [
      "Vehicle management",
      "Booking workflow",
      "Search & filtering",
      "Reservations",
      "Billing / invoice flow",
      "Database-driven backend",
    ],
    tech: ["HTML", "CSS", "JavaScript", "Node.js", "MySQL"],
    github: "https://github.com/vardhan23v/Drivenest",
    accent: ["#22d3ee", "#38bdf8", "#67e8f9"],
    emoji: "🚗",
  },
  {
    name: "HPL Auction",
    slug: "hpl-auction",
    tagline: "Live cricket auction platform with real-time WebSocket bidding.",
    problem:
      "Running a live cricket auction means six teams bidding at once, a countdown that can't drift, and purses that must never go out of sync. HPL Auction makes it real-time — server-authoritative timer & purse engine, captain dashboards, and an auctioneer console.",
    features: [
      "Real-time WebSocket bidding",
      "Server-authoritative timer",
      "Purse engine & constraints",
      "Auctioneer console",
      "Captain dashboards",
      "Live leaderboard",
    ],
    tech: ["Next.js 16", "Socket.IO", "Prisma", "MySQL", "Railway"],
    github: "https://github.com/vardhan23v/hpl-auction",
    live: "https://hpl-web-production.up.railway.app",
    accent: ["#22c55e", "#16a34a", "#4ade80"],
    emoji: "🏏",
  },
  {
    name: "Apex Retail ERP",
    slug: "apex-retail-erp",
    tagline: "Inventory & billing ERP for retail stores — POS, GST invoices, stock audit.",
    problem:
      "Retail stores juggle stock, billing, and GST invoices across disconnected tools. Apex Retail ERP centralizes POS with barcode scanning, GST tax invoices via PDFKit, stock audit trails, analytics, and role-based access.",
    features: [
      "POS with barcode scanning",
      "GST tax invoices (PDFKit)",
      "Stock audit trail",
      "Analytics dashboards",
      "RBAC",
      "Inventory management",
    ],
    tech: ["React", "Vite", "Express", "Sequelize", "MySQL", "PDFKit"],
    github: "https://github.com/vardhan23v/inventory-management",
    live: "https://inventory-management-mu-sandy.vercel.app",
    accent: ["#0ea5e9", "#0284c7", "#38bdf8"],
    emoji: "🧾",
  },
  {
    name: "Dayflow HRMS",
    slug: "dayflow-hrms",
    tagline: "Employee directory, attendance, leave, and payroll with PDF payslips.",
    problem:
      "HR teams manage employees, attendance, leave, and payroll in spreadsheets. Dayflow HRMS brings them together — employee directory, attendance, time-off, payroll with PDF payslips, and LinkedIn OAuth — in a TypeScript monorepo deployed serverless.",
    features: [
      "Employee directory",
      "Attendance & time-off",
      "Payroll with PDF payslips",
      "LinkedIn OAuth",
      "Role-based dashboards",
      "Serverless on Vercel",
    ],
    tech: ["TypeScript", "React", "Vite", "Express", "MySQL", "Vercel"],
    github: "https://github.com/vardhan23v/Human-Resource-Management-System",
    live: "https://frontend-iota-two-70.vercel.app",
    accent: ["#8b5cf6", "#7c3aed", "#a78bfa"],
    emoji: "👥",
  },
];

export interface MiniProject {
  name: string;
  description: string;
  tech: string[];
  github: string;
  emoji: string;
}

export const otherProjects: MiniProject[] = [
  {
    name: "LoanEase",
    description:
      "Production-grade multi-step loan application wizard with real-time validation, auto-save, and a pre-approval dashboard.",
    tech: ["React 19", "TypeScript", "Tailwind", "Zod", "Recharts"],
    github: "https://github.com/vardhan23v/LoanEase-Multi-Step-Form",
    emoji: "🏦",
  },
  {
    name: "Logic Link",
    description:
      "Deterministic number-matching puzzle — match equal numbers or pairs summing to 10, with solver-validated boards.",
    tech: ["TypeScript", "Puzzle engine"],
    github: "https://github.com/vardhan23v/logic-link",
    emoji: "🧮",
  },
  {
    name: "Task Tracker SaaS",
    description:
      "Premium production-ready task management app built with the MERN stack and a glassmorphism design.",
    tech: ["MERN", "Node.js", "MongoDB"],
    github: "https://github.com/vardhan23v/task-tracker-saas",
    emoji: "✅",
  },
  {
    name: "PricePulse",
    description:
      "Smart product price tracker with heuristic forecasting for Amazon and Flipkart.",
    tech: ["JavaScript", "Forecasting"],
    github: "https://github.com/vardhan23v/pricepulse",
    emoji: "📈",
  },
  {
    name: "UNO Game",
    description:
      "Fully playable UNO card game with a smart AI opponent — vanilla JavaScript, HTML, and CSS.",
    tech: ["JavaScript", "HTML", "CSS"],
    github: "https://github.com/vardhan23v/uno-game",
    emoji: "🃏",
  },
  {
    name: "THE PARADISE",
    description:
      "Cinematic landing page for the Telugu film — rain effects, particles, glassmorphism, scroll-driven reveals.",
    tech: ["Canvas", "CSS", "Animation"],
    github: "https://github.com/vardhan23v/paradise",
    emoji: "🎬",
  },
  {
    name: "Greenzy",
    description:
      "Farm-to-table green product marketplace built with pure HTML, CSS, and vanilla JavaScript.",
    tech: ["HTML", "CSS", "JavaScript"],
    github: "https://github.com/vardhan23v/Greenzy-main",
    emoji: "🌱",
  },
  {
    name: "NoteVault",
    description:
      "Interactive PDF reader and study hub for engineering students — organized notes, question banks, MCQs, and slides.",
    tech: ["HTML", "PDF", "Dark UI"],
    github: "https://github.com/vardhan23v/NoteVault",
    emoji: "📚",
  },
  {
    name: "PromptLab Sprint",
    description:
      "React app that turns feature ideas into implementation plans — task boards, completion tracking, and prompt logging.",
    tech: ["React", "Vite", "Task board"],
    github: "https://github.com/vardhan23v/promptlab-sprint",
    emoji: "⚡",
  },
  {
    name: "Playground",
    description:
      "Accessible React components — Modal, Tabs, and Disclosure with WAI-ARIA patterns.",
    tech: ["TypeScript", "WAI-ARIA"],
    github: "https://github.com/vardhan23v/playground",
    emoji: "🧪",
  },
  {
    name: "Campus Compass",
    description:
      "College discovery & comparison for Indian students — search, filter, compare, and review with smart recommendations. Next.js 16, PostgreSQL, Prisma, NextAuth.",
    tech: ["Next.js 16", "PostgreSQL", "Prisma", "NextAuth"],
    github: "https://github.com/vardhan23v/campus-compass",
    emoji: "🎓",
  },
  {
    name: "SEM5 Learning Hub",
    description:
      "Animated revision site for B.Tech CSE Sem 5 Unit-I — 4 courses (CNC, TOC, DS, OS) with live SVG visualizations, automata simulators & CPU scheduler.",
    tech: ["HTML", "SVG", "Visualization"],
    github: "https://github.com/vardhan23v/sem5-learning-hub",
    emoji: "🧠",
  },
  {
    name: "SEM5",
    description:
      "PDF reader & study material hub for 5th semester engineering students — organized notes and PDFs with a dark UI.",
    tech: ["HTML", "Dark UI", "PDF"],
    github: "https://github.com/vardhan23v/sem5",
    emoji: "📖",
  },
];