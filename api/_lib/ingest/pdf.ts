import { extractText, getDocumentProxy } from "unpdf";
import { AppError } from "../errors.js";
import type { KnowledgeDocument } from "../store.js";

export const MAX_PDF_BYTES = 5 * 1024 * 1024;

const HEADINGS = [
  "summary", "professional summary", "profile", "objective", "about", "education", "experience", "work experience", "professional experience",
  "internships", "projects", "personal projects", "skills", "technical skills", "certifications", "certificates",
  "achievements", "awards", "publications", "leadership", "activities", "languages", "interests", "contact",
];

export function isPdf(bytes: Uint8Array) {
  return bytes.length > 4 && bytes[0] === 0x25 && bytes[1] === 0x50 && bytes[2] === 0x44 && bytes[3] === 0x46; // %PDF
}

export async function pdfToText(bytes: Uint8Array): Promise<string> {
  if (bytes.byteLength > MAX_PDF_BYTES) throw new AppError(413, "too_large", "PDF is larger than 5 MB.");
  if (!isPdf(bytes)) throw new AppError(415, "not_pdf", "File is not a PDF.");
  try {
    const pdf = await getDocumentProxy(new Uint8Array(bytes));
    const { text } = await extractText(pdf, { mergePages: false });
    return (Array.isArray(text) ? text : [text]).join("\n\n");
  } catch (err) {
    throw new AppError(422, "pdf_unreadable", "Could not read text from the PDF.", { cause: err });
  }
}

/** Split resume text at recognisable section headings, so citations can point at "Experience" etc. */
export function splitResumeSections(text: string): { section: string; body: string }[] {
  const lines = text.replace(/\r/g, "").split("\n").map((l) => l.trim());
  const sections: { section: string; body: string[] }[] = [{ section: "Header", body: [] }];
  for (const line of lines) {
    const key = line.toLowerCase().replace(/[:•\-–—|]/g, "").trim();
    const isHeading = line.length <= 40 && HEADINGS.includes(key);
    if (isHeading) sections.push({ section: titleCase(key), body: [] });
    else if (line) sections[sections.length - 1].body.push(line);
  }
  return sections.map((s) => ({ section: s.section, body: s.body.join("\n").trim() })).filter((s) => s.body.length >= 20);
}

const titleCase = (s: string) => s.replace(/\b\w/g, (c) => c.toUpperCase());

/** Phone numbers stay out of the index — the assistant shares email/LinkedIn from site data instead. */
export function redactPhones(text: string) {
  return text.replace(/(?:\+?\d{1,3}[\s.-]?)?(?:\(?\d{2,5}\)?[\s.-]?){2,4}\d{3,5}/g, (m) => (m.replace(/\D/g, "").length >= 9 ? "[phone removed]" : m));
}

export function resumeDocuments(text: string, origin: { id: string; title: string; url?: string }): KnowledgeDocument[] {
  return splitResumeSections(redactPhones(text)).map((s) => ({
    sourceType: "resume" as const,
    sourceId: `resume:${origin.id}:${s.section.toLowerCase().replace(/\s+/g, "-")}`,
    title: `${origin.title} — ${s.section}`,
    sourceUrl: origin.url,
    metadata: { section: s.section, origin: origin.id },
    content: `${s.section}\n${s.body}`,
  }));
}
