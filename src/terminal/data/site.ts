import { site as base } from "../../classic/data/site";

export const site = {
  ...base,
  name: "Vardhan V",
  fullName: base.name,
  role: "Generative AI Developer · Full-Stack Developer",
  headline: "I build AI-powered products and full-stack systems.",
  subheadline:
    "Computer Science undergraduate focused on Generative AI, full-stack development, and developer tooling.",
  intro:
    "I enjoy taking ideas from interface to API, database, and AI integration — and turning them into working products.",
  url: "https://vardhan-v-portfilo.vercel.app",
} as const;