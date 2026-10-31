/**
 * Classic-only wording. Everything here restates facts already in `src/classic/data/` or the
 * résumé at `public/resume/resume.pdf`; nothing is invented. The shared data files stay untouched
 * because the other editions read them too.
 */

/** The four projects shown first, strongest evidence first. */
export const FEATURED_SLUGS = ["extension-ai", "trustlens-ai", "hpl-auction", "launchradar"] as const;

/** One line per project: the strongest technical contribution, in plain words. */
export const KEY_WORK: Record<string, string> = {
  "extension-ai": "Turns a plain-English prompt into a working Manifest V3 extension, with Gemini and Groq fallback, a live preview and one-click ZIP export.",
  "trustlens-ai": "A CrewAI agent pipeline with ONNX image forensics and Whisper transcription that returns an evidence-backed report, not a single label.",
  "hpl-auction": "A server-authoritative timer and purse engine over Socket.IO, so six teams bid at once without drifting out of sync.",
  launchradar: "Every claim traces to a recorded SerpApi search; research jobs run in Durable Objects, survive a closed tab and stream a resumable log. 50 tests and CI.",
  "ai-code-reviewer": "A Monaco editor front end and a structured AI review pipeline covering bugs, quality, performance and security, charted with Recharts.",
  "disastermind-ai": "A multi-agent cyclone simulation on a live Leaflet map, with fleet dispatch, SOS triage and PDF situation reports.",
  "vard-ai": "Voice-first chat with streaming responses, persistent memory and MCP tool calls, on TanStack Start and Supabase.",
  "apex-retail-erp": "Point of sale with barcode scanning, GST invoices generated with PDFKit, a stock audit trail and role-based access.",
  "careerforge-pro": "Gemini-assisted, ATS-oriented résumé generation with PDF export.",
  chitchain: "The pot, collateral and reserve live in a Solidity contract on the MST testnet, with an AI risk engine and a CrewAI bidding agent. 49 Hardhat and 68 backend tests.",
  drivenest: "A five-table normalised MySQL schema and 20+ SQL queries behind the search, reserve and invoice flow.",
  "dayflow-hrms": "Directory, attendance, leave and payroll with PDF payslips and LinkedIn OAuth, in a TypeScript monorepo deployed serverless.",
};

/** Who built it, when it is not a solo build (from the project data and the résumé). */
export const CREDIT: Record<string, string> = {
  "trustlens-ai": "Hackathon build, ACM × MLH Hack Days 2026",
  "ai-code-reviewer": "Built with a team of three",
  chitchain: "24-hour buildathon, MST × NEWRRO 2026",
};

/** Specific responsibilities per role. Keyed by company. */
export const ROLE_DETAIL: Record<string, string[]> = {
  OxCode: [
    "Part-time member of the OxCode Founding Builders community, testing AI software-engineering tools before public release.",
    "Evaluates product features and AI-assisted developer workflows, and reports bugs that feed pre-launch iteration.",
  ],
  "FlyRank AI": [
    "Front-end engineering on AI-driven product interfaces.",
  ],
  "Zetheta Algorithms Private Limited": [
    "Built a multi-step loan application form and its step-by-step workflow.",
    "Connected the form to custom backend APIs for submission and application processing.",
  ],
  "Zaalima Development Pvt. Ltd.": [
    "Built web features as part of a startup team.",
  ],
};
