export interface CaseStudy {
  slug: string;
  number: string;
  name: string;
  tagline: string;
  description: string;
  problem: string;
  approach: string;
  outcome: string;
  decisions: { title: string; text: string }[];
  learned: string[];
  architecture: { label: string; note?: string }[];
  tech: string[];
  github: string;
  live?: string;
  shot?: string;
  theme: { from: string; to: string; main: string; glow: string };
}

export const caseStudies: CaseStudy[] = [
  {
    slug: "extension-ai",
    theme: { from: "#a78bfa", to: "#6366f1", main: "#8b5cf6", glow: "rgba(139, 92, 246, 0.35)" },
    number: "01",
    name: "Extension AI",
    tagline: "AI-powered Chrome extension generator",
    description:
      "Turns natural-language prompts into working Chrome extensions using multiple LLM providers.",
    problem:
      "Building a Chrome extension means hand-writing manifest.json, background and content scripts, and a popup UI — before any of the actual logic. The boilerplate is identical for most extensions, and the first working version is hours away, not minutes.",
    approach:
      "Describe the extension in plain English. The app generates Manifest V3 compliant code — manifest, background scripts, content scripts, popup UI — through an Express API backed by two LLM providers. The result renders in a sandboxed live preview, can be iterated on with an AI copilot chat, and downloads as a ready-to-load ZIP.",
    outcome:
      "A full-stack product, live on Vercel: prompt → generated, previewable, downloadable extension. Extensions and templates persist in MongoDB with JWT-based accounts, alongside a template gallery and community sharing.",
    decisions: [
      {
        title: "Multi-provider LLM architecture",
        text: "Gemini 2.0 Flash and Groq (Llama 3.3) sit behind one generation endpoint. If one provider is unavailable or rate-limited, requests route to the other — resilience by design rather than by accident.",
      },
      {
        title: "Separate generation from rendering",
        text: "The backend owns code generation; the frontend owns preview and packaging. The sandboxed iframe preview means generated code is executed in-browser only, and the ZIP is assembled client-side for instant download.",
      },
      {
        title: "Prompt-to-workflow, not prompt-to-text",
        text: "The interesting engineering is in parsing the generated bundle as a project — manifest, scripts, popup — rather than displaying a chat answer. Output is treated as artifacts, not prose.",
      },
      {
        title: "MongoDB for user-generated content",
        text: "Extensions, templates, and user accounts map naturally to documents. Mongoose schemas keep the generated bundles and community gallery consistent as the format evolves.",
      },
    ],
    learned: [
      "Prompts need to produce structured artifacts; enforcing a manifest shape is what makes 'code generation' a product instead of a demo.",
      "Fallback chains for LLM providers are straightforward and are the highest-leverage reliability win in an AI product.",
      "Auth and ownership matter even for small tools — the community gallery only works with real accounts.",
    ],
    architecture: [
      { label: "React (Vite) + Tailwind", note: "Dashboard, live preview, template gallery" },
      { label: "Express API · JWT", note: "Generation, auth, extension CRUD" },
      { label: "MongoDB", note: "Extensions, templates, users" },
      { label: "Gemini 2.0 Flash · Groq Llama 3.3", note: "Multi-provider LLM layer" },
      { label: "Vercel", note: "Deployment (frontend + serverless API)" },
    ],
    tech: ["React", "Node.js", "Express", "MongoDB", "Gemini", "Groq", "Manifest V3"],
    github: "https://github.com/vardhan23v/extension-AI",
    live: "https://extension-ai-five.vercel.app/",
  },
  {
    slug: "code-reviewer",
    theme: { from: "#22d3ee", to: "#3b82f6", main: "#38bdf8", glow: "rgba(56, 189, 248, 0.35)" },
    number: "02",
    name: "AI Code Reviewer",
    tagline: "AI-powered code analysis and review tool",
    description:
      "Analyzes source code and produces structured feedback around bugs, quality, and improvements.",
    problem:
      "Getting structured feedback on code usually means waiting for a human reviewer. I wanted a tool that reviews pasted or uploaded code instantly — organized around the categories a real reviewer checks.",
    approach:
      "A client-only React app with a Monaco editor. Code is analyzed by an LLM that returns structured JSON, not prose — mapped to severity-coded categories (bugs, quality, performance, security, best practices). Results render beside the editor with a metrics dashboard; review history persists in localStorage.",
    outcome:
      "A working tool with a defensible design rationale: structured output as an API contract, lazy-loaded Monaco, validation before any API call, and graceful degradation at every failure point. Documented end-to-end in the repo's DESIGN_DECISIONS.md.",
    decisions: [
      {
        title: "Structured JSON over markdown",
        text: "Asking the model for JSON — with an explicit system prompt and schema — makes output parseable and consistent. Prose reviews are readable; structured reviews are usable: severity, category, and issue mapping to UI elements.",
      },
      {
        title: "Monaco over alternatives",
        text: "Monaco is the engine inside VS Code, so the editor experience is familiar. It's heavy, so it's loaded lazily and only when the editor mounts.",
      },
      {
        title: "Five categories, deliberately",
        text: "Bugs, quality, performance, security, best practices. Fine-grained categories test worse — the model drifts, and users rarely act on 20 labels.",
      },
      {
        title: "localStorage instead of a backend",
        text: "Reviews never leave the browser — privacy, offline use, zero ops. The trade-off (no cross-device sync) is documented as the known path to a backend later.",
      },
    ],
    learned: [
      "The AI response format is an API contract — define it up front and failure handling becomes simple.",
      "Lazy loading and memoization matter: a 'simple' tool with Monaco can stutter if you don't think about bundles and re-renders.",
      "Graceful failure beats clever features. Every error case got a message, a state, and a retry.",
    ],
    architecture: [
      { label: "React + Vite", note: "Client-only app, no backend" },
      { label: "Monaco Editor", note: "Lazy-loaded code editing" },
      { label: "LLM pipeline", note: "Structured JSON review output" },
      { label: "localStorage", note: "Review history, settings" },
      { label: "Recharts", note: "Metrics dashboard" },
    ],
    tech: ["React", "Vite", "Monaco Editor", "Groq", "Claude", "Recharts"],
    github: "https://github.com/vardhan23v/codereviewer",
  },
  {
    slug: "careerforge-pro",
    theme: { from: "#34d399", to: "#0d9488", main: "#2dd4bf", glow: "rgba(45, 212, 191, 0.35)" },
    number: "03",
    name: "CareerForge Pro",
    tagline: "AI-assisted career and resume platform",
    description:
      "AI-assisted resume builder and career toolkit — content generation, ATS scoring, and PDF export.",
    problem:
      "Resumes fail ATS filters because of formatting and keyword gaps. Writing 'impact bullets' is slow, and most readers never see the result problem before the screen. I wanted resume building to be assisted end-to-end: content, matching, scoring, export.",
    approach:
      "An eight-section form wizard backed by an AI content forge: describe experience in plain English and get tailored bullet points, rewrite any section, or match a pasted job description. An ATS strength score (0–100) simulates screening performance, keyword injection fills gaps, and four templates export to print-ready PDF.",
    outcome:
      "A full-stack tool with a multi-provider fallback chain — Gemini 1.5 Pro → GPT-4o Mini → Groq Llama 3.3 70B — so generation continues when any single provider fails, backed by an Express server and persisting multiple resume versions.",
    decisions: [
      {
        title: "Provider fallback chain",
        text: "Three providers, one abstraction: generation tries providers in order and fails over automatically. For a tool whose core action is an LLM call, availability is the product.",
      },
      {
        title: "Client-side PDF rendering",
        text: "Exporting through html2canvas + jsPDF keeps styling consistent with the live preview and avoids server round-trips. What you preview is what downloads.",
      },
      {
        title: "Scoring that is explainable",
        text: "The ATS score is derived from analyzable signals — sections, keywords, formatting — so the number comes with specific fixes, not a mystery grade.",
      },
      {
        title: "Auto-save as the default",
        text: "Form state persists continuously with version history. A resume builder that loses work on refresh is unusable.",
      },
    ],
    learned: [
      "Fallback chains made me treat the LLM as an unreliable dependency that needs an availability strategy.",
      "Wizard UX is a product problem: validation, autosave, and undo behavior determine whether it feels professional.",
      "Generated content needs a human review loop — scoring and suggestions must be advisory, not authoritative.",
    ],
    architecture: [
      { label: "React 19 + Vite", note: "Editor, wizard, live preview" },
      { label: "Express", note: "AI generation endpoints" },
      { label: "Gemini · GPT-4o Mini · Groq", note: "Fallback chain" },
      { label: "React Context", note: "Resume state + autosave" },
      { label: "html2canvas + jsPDF", note: "PDF export" },
    ],
    tech: ["React", "Express", "Gemini", "Groq", "OpenAI", "jsPDF"],
    github: "https://github.com/vardhan23v/career-forge-pro",
  },
  {
    slug: "vard-ai",
    theme: { from: "#f472b6", to: "#db2777", main: "#f43f5e", glow: "rgba(244, 63, 94, 0.35)" },
    number: "04",
    name: "Vard AI",
    tagline: "Voice-first AI assistant",
    description:
      "A voice-first assistant with streaming conversations, persistent memory, and MCP tool integration.",
    problem:
      "Most assistants are chat boxes with polite answers. I wanted a companion-grade assistant: speak to it, watch it stream a reply token-by-token, cancel mid-generation, and let it actually do things through tools — with accounts, memory, and branding that make it feel owned.",
    approach:
      "Built on TanStack Start — a full-stack React framework — with server-side secrets hidden from the client. Voice flows through the browser mic → WAV encoding → transcription endpoint; chat streams Groq (Llama 3.3 70B) over SSE with Escape-key abort. Supabase handles auth with a server middleware guarding every protected route; an MCP server exposes OAuth-protected tools.",
    outcome:
      "A working voice-first assistant with streaming chat, persistent memory across conversations, themes and branding controls, and reduced-motion support guarded by Playwright regression tests in CI.",
    decisions: [
      {
        title: "TanStack Start for one language, one runtime",
        text: "Server functions and API routes live beside components in the same TypeScript codebase, so secrets never reach the client and auth middleware guards routes in one place.",
      },
      {
        title: "Streaming as the interface",
        text: "Token-by-token SSE with stop/cancel controls makes the assistant feel responsive. Escaping is a first-class interaction, not an afterthought.",
      },
      {
        title: "MCP for tool extensibility",
        text: "Rather than hard-coding integrations, tools are exposed through the Model Context Protocol with per-tool OAuth consent. Adding a capability is adding a tool, not rewriting the assistant.",
      },
      {
        title: "Reduced motion as a tested requirement",
        text: "A reduced-motion mode that respects system preferences and is enforced by automated regression tests — accessibility treated as a feature with CI, not a checkbox.",
      },
    ],
    learned: [
      "Streaming meets state management: progress indicators, cancellation, and persistence each need explicit handling.",
      "Voice input is a pipeline (mic → encode → transcribe → confirm) and every stage needs feedback to feel trustworthy.",
      "Auth middleware in a full-stack framework is where security actually gets enforced — it must be server-side.",
    ],
    architecture: [
      { label: "Browser · voice + text", note: "getUserMedia → WAV → SSE" },
      { label: "/api/chat", note: "Streaming Groq Llama 3.3 70B" },
      { label: "Supabase Auth", note: "Server-side middleware, protected routes" },
      { label: "/.mcp/*", note: "OAuth-protected MCP tools" },
      { label: "Persistent memory", note: "Facts, preferences, history" },
    ],
    tech: ["TanStack Start", "React 19", "TypeScript", "Groq", "MCP", "Supabase"],
    github: "https://github.com/vardhan23v/Vard-AI",
  },
  {
    slug: "disastermind-ai",
    shot: "/work/disastermind-map.jpg",
    theme: { from: "#fbbf24", to: "#f97316", main: "#fb923c", glow: "rgba(251, 146, 60, 0.35)" },
    number: "05",
    name: "DisasterMind AI",
    tagline: "AI-powered emergency operations interface",
    description:
      "A multi-agent digital twin of a city under cyclone — tactical map, simulation, dispatch, and reporting.",
    problem:
      "During a disaster, information is fragmented across weather feeds, roads closures, hospital capacity, SOS calls, and field responders. Commanders lose minutes stitching it together by hand. I wanted an operations console that presents one coherent, explainable picture of a city in crisis.",
    approach:
      "A deterministic multi-agent simulation: ten specialized agents (weather, flood, resources, evacuation, satellite, social, call priority, shelter, chief AI, SITREP) operate as pure decision functions over a shared world state, driven by a single authoritative clock. One-way data flow — world → agents → event bus → chief AI → dispatch — feeds a Leaflet tactical map with SVG overlays, an operations feed, analytics, and automated PDF situation reports.",
    outcome:
      "A live, repeatable demo (hackathon submission) where one click simulates a 44-tick cyclone: floods spread, roads re-route, SOS calls arrive, the fleet redeploys, and the Chief AI recommends evacuation — approved by a human commander before anything dispatches. Unit-tested engine pipeline and CI on every push.",
    decisions: [
      {
        title: "Deterministic, explainable simulation",
        text: "Pure tick functions over world state mean the same input always produces the same output — reproducible for demos and, crucially, testable. Contract tests cover the tick pipeline.",
      },
      {
        title: "Agents as replaceable modules",
        text: "Each agent is an independent, pure decision module — fault-injectable and swappable for live AI/ML models without touching the rest of the system.",
      },
      {
        title: "One authoritative clock",
        text: "A single setInterval drives simulationStore.tickWorld, which every screen reads. No drifting timers, no divergent state — the map, feed, and charts can't disagree.",
      },
      {
        title: "Human-in-the-loop by design",
        text: "AI recommends → commander reviews → commander approves → city responds. The interface is a decision-support tool with explicit responsibility boundaries.",
      },
    ],
    learned: [
      "Simulation architecture is state architecture: one clock, pure transitions, and everything derived — the rest gets simple.",
      "'Explainable AI' in ops means reproducibility and an audit trail, not just model confidence scores.",
      "Even a hackathon prototype should ship with tests and a disclaimer — the README states clearly it is synthetic data, not real emergency tooling.",
    ],
    architecture: [
      { label: "React + TypeScript + Vite", note: "Tactical operations UI" },
      { label: "Simulation core · tickWorld", note: "Pure, deterministic engine" },
      { label: "10 agent modules", note: "Pure decision functions" },
      { label: "Zustand · single clock", note: "Authoritative world state" },
      { label: "Leaflet + SVG overlay", note: "Live map, fleet, flood" },
      { label: "jsPDF", note: "Automated SITREP export" },
    ],
    tech: ["React", "TypeScript", "Vite", "Leaflet", "Zustand", "Vitest"],
    github: "https://github.com/vardhan23v/Disastermind-ai",
  },
];

export const otherWork = [
  {
    name: "Campus Compass",
    note: "College discovery and comparison — Next.js, PostgreSQL, Prisma, NextAuth.",
    url: "https://github.com/vardhan23v/campus-compass",
  },
  {
    name: "DriveNest",
    note: "Vehicle rental platform — Node.js, MySQL, booking and billing flows.",
    url: "https://github.com/vardhan23v/Drivenest",
  },
  {
    name: "LoanEase",
    note: "Multi-step loan application wizard — React 19, TypeScript, validation, autosave.",
    url: "https://github.com/vardhan23v/LoanEase-Multi-Step-Form",
  },
  {
    name: "Task Tracker SaaS",
    note: "MERN task management with a glassmorphism interface.",
    url: "https://github.com/vardhan23v/task-tracker-saas",
  },
  {
    name: "NoteVault",
    note: "PDF reader and study hub for engineering students.",
    url: "https://github.com/vardhan23v/NoteVault",
  },
  {
    name: "UNO Game",
    note: "Playable card game in vanilla JavaScript with an AI opponent.",
    url: "https://github.com/vardhan23v/uno-game",
  },
];