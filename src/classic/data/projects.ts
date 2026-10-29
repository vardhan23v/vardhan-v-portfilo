export interface Feature {
  label: string;
  icon: string;
}

export type ProjectCategory = "ai" | "full-stack" | "tool";

export const CATEGORY_LABEL: Record<ProjectCategory, string> = {
  ai: "AI",
  "full-stack": "Full-stack",
  tool: "Tools",
};

export interface Project {
  name: string;
  slug: string;
  /** Drives every edition's filter and category label. */
  category: ProjectCategory;
  /** Short uppercase label shown on case cards (Forge); defaults to the category label. */
  kicker?: string;
  /** Who built it — shown on case-study pages. Defaults to "sole builder". */
  role?: string;
  /** Year shipped; defaults to the current year in the UI. */
  year?: string;
  tagline: string;
  problem: string;
  features: string[];
  tech: string[];
  github: string;
  live?: string;
  accent: [string, string, string];
  emoji: string;
  highlight?: boolean;
  /** Optional hero image (public path). Falls back to a generated cover. */
  cover?: string;
  /** Optional screenshot strip (public paths). */
  screenshots?: string[];
}

export const featuredProjects: Project[] = [
  {
    name: "Extension AI",
    slug: "extension-ai",
    category: "ai",
    kicker: "AI PRODUCT · DEVELOPER TOOL",
    tagline: "Build Chrome Extensions with plain-English prompts.",
    problem:
      "Building a browser extension from scratch takes boilerplate, manifest config, and API wiring. Extension AI turns a natural-language prompt into a working extension.",
    features: [
      "Natural-language extension generation",
      "Gemini + Groq with provider fallback",
      "Live preview",
      "Template gallery",
      "One-click ZIP download",
    ],
    tech: ["React", "Node.js", "Express", "MongoDB", "Gemini 2.0 Flash", "Groq Llama 3.3", "JWT", "Manifest V3"],
    github: "https://github.com/vardhan23v/extension-AI",
    live: "https://extension-ai-five.vercel.app/",
    cover: "/shots/extension-ai/desktop.jpg",
    screenshots: ["/shots/extension-ai/desktop.jpg", "/shots/extension-ai/desktop-2.jpg", "/shots/extension-ai/phone.jpg"],
    accent: ["#7c6cff", "#38bdf8", "#a78bfa"],
    emoji: "🧩",
    highlight: true,
  },
  {
    name: "TrustLens AI",
    slug: "trustlens-ai",
    category: "ai",
    kicker: "AI · TRUST & FORENSICS",
    role: "Hackathon build — ACM × MLH Hack Days 2026",
    tagline: "Evidence-backed trust reports for images, video, audio and text.",
    problem:
      "A single real/fake label is not evidence. TrustLens analyses an image, video, audio clip or piece of text and returns a report: the likelihood, the evidence behind it, how confident that evidence makes it, and what it could not check.",
    features: [
      "Image, video, audio & text analysis",
      "CrewAI agent pipeline",
      "Image forensics on ONNX Runtime",
      "Whisper transcription",
      "Explainable trust report",
      "Single-container deploy",
    ],
    tech: ["Python", "FastAPI", "CrewAI", "Gemini", "ONNX Runtime", "Whisper", "React", "Vite", "TypeScript", "Tailwind CSS", "Docker", "Railway"],
    github: "https://github.com/vardhan23v/trustlens-ai",
    live: "https://trustlens-ai-production-5b04.up.railway.app",
    cover: "/shots/trustlens-ai/desktop.jpg",
    screenshots: ["/shots/trustlens-ai/desktop.jpg", "/shots/trustlens-ai/desktop-2.jpg", "/shots/trustlens-ai/phone.jpg"],
    accent: ["#22d3ee", "#8e75b2", "#67e8f9"],
    emoji: "🔍",
  },
  {
    name: "LaunchRadar",
    slug: "launchradar",
    category: "ai",
    kicker: "AI · MARKET RESEARCH",
    tagline: "A market question in, evidence-backed product opportunities out.",
    problem:
      "Market research from a chat model is unverifiable. LaunchRadar makes SerpApi the only source of facts — every claim traces to a verbatim quote pinned to a recorded search — and uses Groq for synthesis only. Runs survive a closed tab and stream a resumable research log.",
    features: [
      "SerpApi-only facts, with receipts",
      "Groq synthesis (gpt-oss-120b)",
      "Durable Object jobs survive closed tabs",
      "Resumable SSE research log",
      "Cloudflare D1 storage",
      "50 tests and CI",
    ],
    tech: ["Next.js 16", "React 19", "TypeScript", "Tailwind CSS", "Cloudflare Workers", "Durable Objects", "Cloudflare D1", "Groq", "SerpApi", "Vercel"],
    github: "https://github.com/vardhan23v/launchradar",
    live: "https://launchradar-psi.vercel.app",
    cover: "/shots/launchradar/desktop.jpg",
    screenshots: ["/shots/launchradar/desktop.jpg", "/shots/launchradar/desktop-2.jpg", "/shots/launchradar/phone.jpg"],
    accent: ["#0e9f6e", "#f38020", "#6366f1"],
    emoji: "📡",
  },
  {
    name: "ChitChain",
    slug: "chitchain",
    category: "ai",
    kicker: "AI · BLOCKCHAIN",
    role: "24-hour buildathon — MST × NEWRRO 2026",
    tagline: "A trust-minimised chit fund where the pot lives in a smart contract.",
    problem:
      "Informal chit circles depend on one organiser who holds the pot and keeps the ledger. ChitChain moves the pot, collateral and reserve into a Solidity contract on the MST testnet, prices collateral with an AI risk engine, and lets a CrewAI agent bid on a member's behalf. Testnet only — no real money.",
    features: [
      "ChitChain.sol on MST testnet",
      "AI risk engine for collateral",
      "CrewAI bidding agent",
      "Join → contribute → auction → settle",
      "BridgeKey wallet flow",
      "49 Hardhat + 68 backend tests",
    ],
    tech: ["Next.js", "TypeScript", "Solidity", "Hardhat", "ethers", "Express", "Prisma", "PostgreSQL", "Python", "FastAPI", "CrewAI", "Groq", "Railway"],
    github: "https://github.com/vardhan23v/chitchain",
    accent: ["#d7263d", "#7c3aed", "#f472b6"],
    emoji: "⛓️",
  },
  {
    name: "AI Code Reviewer",
    slug: "ai-code-reviewer",
    category: "ai",
    kicker: "AI · DEVELOPER TOOL",
    tagline: "AI-powered code review with structured feedback on bugs, quality, performance, and security.",
    problem:
      "Getting a second pair of eyes on your code usually means waiting for a reviewer. Paste or upload code and it returns structured, multi-dimensional AI feedback instantly.",
    features: [
      "Paste / upload code",
      "Bug detection",
      "Code quality feedback",
      "Performance suggestions",
      "Security analysis",
      "Structured AI output",
      "Analytics visualization",
    ],
    tech: ["React", "Vite", "Monaco Editor", "Groq Llama 3.3", "Gemini 2.0 Flash", "GPT-4o Mini", "Recharts"],
    github: "https://github.com/vardhan23v/codereviewer",
    live: "https://codereviewer-eta.vercel.app",
    cover: "/shots/ai-code-reviewer/desktop.jpg",
    screenshots: ["/shots/ai-code-reviewer/desktop.jpg", "/shots/ai-code-reviewer/desktop-2.jpg", "/shots/ai-code-reviewer/phone.jpg"],
    accent: ["#38bdf8", "#22d3ee", "#818cf8"],
    emoji: "🛡️",
  },
  {
    name: "CareerForge Pro",
    slug: "careerforge-pro",
    category: "ai",
    kicker: "AI · CAREER PLATFORM",
    tagline: "AI-powered resume builder and career toolkit.",
    problem:
      "Writing an ATS-friendly resume is painful. CareerForge Pro generates tailored, keyword-optimized resumes with AI assistance and exports them ready to send.",
    features: [
      "AI-assisted resume creation",
      "ATS-oriented optimization",
      "AI suggestions",
      "Professional generation",
      "PDF export",
      "Gemini-powered suggestions",
    ],
    tech: ["React", "Express", "Gemini", "Cloudinary API"],
    github: "https://github.com/vardhan23v/career-forge-pro",
    live: "https://career-forge-pro-phi.vercel.app",
    accent: ["#34d399", "#2dd4bf", "#6ee7b7"],
    emoji: "📄",
  },
  {
    name: "Vard AI",
    slug: "vard-ai",
    category: "ai",
    kicker: "AI ASSISTANT",
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
    tech: ["TypeScript", "React", "TanStack Start", "Groq Llama 3.3", "MCP", "Supabase", "Tailwind CSS"],
    github: "https://github.com/vardhan23v/Vard-AI",
    live: "https://vard-ai.lovable.app",
    cover: "/shots/vard-ai/desktop.jpg",
    screenshots: ["/shots/vard-ai/desktop.jpg", "/shots/vard-ai/desktop-2.jpg", "/shots/vard-ai/phone.jpg"],
    accent: ["#f472b6", "#a78bfa", "#38bdf8"],
    emoji: "🎙️",
  },
  {
    name: "DisasterMind AI",
    slug: "disastermind-ai",
    category: "ai",
    kicker: "AI · EMERGENCY OPERATIONS",
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
    tech: ["React", "TypeScript", "Vite", "Leaflet", "Zustand", "Multi-agent simulation", "Vitest"],
    github: "https://github.com/vardhan23v/Disastermind-ai",
    live: "https://disastermind-ai.vercel.app",
    cover: "/shots/disastermind-ai/desktop.jpg",
    screenshots: ["/shots/disastermind-ai/desktop.jpg", "/shots/disastermind-ai/phone.jpg"],
    accent: ["#f97316", "#fb923c", "#facc15"],
    emoji: "🛰️",
  },
  {
    name: "DriveNest",
    slug: "drivenest",
    category: "full-stack",
    kicker: "FULL-STACK · DATABASE",
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
    tech: ["React", "Node.js", "MySQL", "Cloud MySQL", "Railway", "Cloudinary API"],
    github: "https://github.com/vardhan23v/Drivenest",
    accent: ["#22d3ee", "#38bdf8", "#67e8f9"],
    emoji: "🚗",
  },
  {
    name: "HPL Auction",
    slug: "hpl-auction",
    category: "full-stack",
    kicker: "FULL-STACK · REAL-TIME",
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
    tech: ["React", "Next.js 16", "Socket.IO", "Prisma", "Cloud MySQL", "Railway", "Cloudinary API", "Tailwind CSS"],
    github: "https://github.com/vardhan23v/hpl-auction",
    live: "https://hpl-web-production.up.railway.app",
    cover: "/shots/hpl-auction/desktop.jpg",
    screenshots: ["/shots/hpl-auction/desktop.jpg", "/shots/hpl-auction/desktop-2.jpg", "/shots/hpl-auction/phone.jpg"],
    accent: ["#22c55e", "#16a34a", "#4ade80"],
    emoji: "🏏",
  },
  {
    name: "Apex Retail ERP",
    slug: "apex-retail-erp",
    category: "full-stack",
    kicker: "FULL-STACK · ERP",
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
    tech: ["React", "Vite", "Express", "Sequelize", "Cloud MySQL", "Railway", "Cloudinary API", "Tailwind CSS"],
    github: "https://github.com/vardhan23v/inventory-management",
    live: "https://inventory-management-mu-sandy.vercel.app",
    cover: "/shots/apex-retail-erp/desktop.jpg",
    screenshots: ["/shots/apex-retail-erp/desktop.jpg", "/shots/apex-retail-erp/phone.jpg"],
    accent: ["#0ea5e9", "#0284c7", "#38bdf8"],
    emoji: "🧾",
  },
  {
    name: "Dayflow HRMS",
    slug: "dayflow-hrms",
    category: "full-stack",
    kicker: "FULL-STACK · HRMS",
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
    tech: ["React", "TypeScript", "Vite", "Express", "Cloud MySQL", "Railway", "Cloudinary API", "Tailwind CSS"],
    github: "https://github.com/vardhan23v/Human-Resource-Management-System",
    accent: ["#8b5cf6", "#7c3aed", "#a78bfa"],
    emoji: "👥",
  },
];

export interface MiniProject {
  name: string;
  description: string;
  tech: string[];
  github: string;
  live?: string;
  emoji: string;
  category?: ProjectCategory;
}

export const otherProjects: MiniProject[] = [
  {
    name: "Skyline Student Association",
    description:
      "Club website and operations platform — memberships with dues and renewals, event tickets with QR check-in, merch shop, fundraisers, and an append-only finance ledger. 116 API tests.",
    tech: ["React", "TypeScript", "Express", "MySQL", "Knex", "Railway"],
    github: "https://github.com/vardhan23v/skyline_student-association",
    live: "https://skyline-student-association.up.railway.app",
    emoji: "🌅",
    category: "full-stack",
  },
  {
    name: "NexLevr",
    description:
      "Role-based SaaS for marketing agencies — clients, campaigns, leads, tasks and analytics. Next.js 16, Express, Prisma, PostgreSQL, JWT.",
    tech: ["Next.js 16", "Express", "Prisma", "PostgreSQL", "shadcn/ui"],
    github: "https://github.com/vardhan23v/NexLevr",
    live: "https://frontend-erpiwotlq-vardhan23vs-projects.vercel.app",
    emoji: "📣",
    category: "full-stack",
  },
  {
    name: "NitteSync",
    description:
      "Campus event management for Nitte — students register, clubs submit events, admins approve. Jakarta Faces 4.0, CDI, JDBC and MySQL on Tomcat.",
    tech: ["Java 21", "Jakarta Faces", "JDBC", "MySQL"],
    github: "https://github.com/vardhan23v/NitteSync",
    emoji: "🏫",
    category: "full-stack",
  },
  {
    name: "create-frontend skill",
    description:
      "Open-source Agent Skill for Claude Code, Codex, Cursor and Copilot that turns “build me a frontend” into a classified, verified, deploy-ready workflow.",
    tech: ["Agent Skills", "Claude Code", "CI"],
    github: "https://github.com/vardhan23v/frontend-skill",
    emoji: "🧰",
    category: "tool",
  },
  {
    name: "ShadowSpec",
    description:
      "Agent skill that reverse-engineers the actual behaviour of an unfamiliar repository into an evidence-backed spec and characterization tests.",
    tech: ["Agent Skills", "Behavioural testing", "Python"],
    github: "https://github.com/vardhan23v/shadowspec",
    emoji: "🕵️",
    category: "tool",
  },
  {
    name: "LoanEase",
    description:
      "Production-grade multi-step loan application wizard with real-time validation, auto-save, and a pre-approval dashboard.",
    tech: ["React 19", "TypeScript", "Tailwind", "Zod", "Recharts"],
    github: "https://github.com/vardhan23v/LoanEase-Multi-Step-Form",
    live: "https://pro1-pied.vercel.app",
    emoji: "🏦",
  },
  {
    name: "Logic Link",
    description:
      "Deterministic number-matching puzzle — match equal numbers or pairs summing to 10, with solver-validated boards.",
    tech: ["TypeScript", "Puzzle engine"],
    github: "https://github.com/vardhan23v/logic-link",
    live: "https://logic-link-rust.vercel.app",
    emoji: "🧮",
  },
  {
    name: "Task Tracker SaaS",
    description:
      "Premium production-ready task management app built with the MERN stack and a glassmorphism design.",
    tech: ["MERN", "Node.js", "MongoDB"],
    github: "https://github.com/vardhan23v/task-tracker-saas",
    live: "https://task-tracker-rose-ten-60.vercel.app",
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
    live: "https://uno-game-pink.vercel.app",
    emoji: "🃏",
  },
  {
    name: "THE PARADISE",
    description:
      "Cinematic landing page for the Telugu film — rain effects, particles, glassmorphism, scroll-driven reveals.",
    tech: ["Canvas", "CSS", "Animation"],
    github: "https://github.com/vardhan23v/paradise",
    live: "https://vardhan23v.github.io/paradise/",
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
    live: "https://vardhan23v.github.io/NoteVault/",
    emoji: "📚",
  },
  {
    name: "PromptLab Sprint",
    description:
      "React app that turns feature ideas into implementation plans — task boards, completion tracking, and prompt logging.",
    tech: ["React", "Vite", "Task board"],
    github: "https://github.com/vardhan23v/promptlab-sprint",
    live: "https://submission-iota-seven.vercel.app",
    emoji: "⚡",
  },
  {
    name: "Playground",
    description:
      "Accessible React components — Modal, Tabs, and Disclosure with WAI-ARIA patterns.",
    tech: ["TypeScript", "WAI-ARIA"],
    github: "https://github.com/vardhan23v/playground",
    live: "https://playground-six-sigma.vercel.app",
    emoji: "🧪",
  },
  {
    name: "Campus Compass",
    description:
      "College discovery & comparison for Indian students — search, filter, compare, and review with smart recommendations. Next.js 16, PostgreSQL, Prisma, NextAuth.",
    tech: ["Next.js 16", "PostgreSQL", "Prisma", "NextAuth"],
    github: "https://github.com/vardhan23v/campus-compass",
    live: "https://campus-compass-fawn.vercel.app",
    emoji: "🎓",
  },
  {
    name: "SEM5 Learning Hub",
    description:
      "Animated revision site for B.Tech CSE Sem 5 Unit-I — 4 courses (CNC, TOC, DS, OS) with live SVG visualizations, automata simulators & CPU scheduler.",
    tech: ["HTML", "SVG", "Visualization"],
    github: "https://github.com/vardhan23v/sem5-learning-hub",
    live: "https://vardhan23v.github.io/sem5-learning-hub/",
    emoji: "🧠",
  },
  {
    name: "SEM5",
    description:
      "PDF reader & study material hub for 5th semester engineering students — organized notes and PDFs with a dark UI.",
    tech: ["HTML", "Dark UI", "PDF"],
    github: "https://github.com/vardhan23v/sem5",
    live: "https://vardhan23v.github.io/sem5/",
    emoji: "📖",
  },
];