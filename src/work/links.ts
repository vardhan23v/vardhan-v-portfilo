import { caseStudies } from "../terminal/data/work";

const STUDIED = new Set(caseStudies.map((c) => c.slug));

/** True for the projects that have a long-form case study at /work/<slug>. */
export const hasCaseStudy = (slug: string) => STUDIED.has(slug);

export const caseStudyPath = (slug: string) => `/work/${slug}`;
