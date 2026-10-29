/**
 * Terminal-edition view of the CV. Derived from src/classic/data/experience.ts so the
 * two editions can never drift — only the log-style shaping lives here.
 */
import {
  experience as fullExperience,
  education as fullEducation,
  certifications as fullCertifications,
} from "../../classic/data/experience";

export const experience = fullExperience.map((e) => ({
  company: e.company,
  role: e.role,
  period: e.period,
  points: e.points.slice(0, 3),
}));

const primary = fullEducation[0];
export const education = {
  school: primary.school,
  degree: primary.degree,
  period: primary.period,
};

export const certifications: string[] = [...fullCertifications];

export const process = [
  { step: "01", label: "Understand", text: "Clarify the problem before choosing the technology." },
  { step: "02", label: "Design", text: "Define the data flow and user experience." },
  { step: "03", label: "Build", text: "Implement the smallest useful version." },
  { step: "04", label: "Test", text: "Find failure cases and improve reliability." },
  { step: "05", label: "Ship", text: "Deploy, observe, and iterate." },
];
