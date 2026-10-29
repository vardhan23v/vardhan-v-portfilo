import { certifications, education, experience } from "../data/experience";
import { skillCategories } from "../data/skills";
import { Reveal } from "../hooks/useReveal";

interface Row { name: string; value: string; note?: string }

function Group({ word, rows }: { word: string; rows: Row[] }) {
  return (
    <div className="ledger-group">
      <p className="ledger-word">{word}</p>
      <ul className="ledger-rows">
        {rows.map((r, i) => (
          <li className="ledger-row" key={r.name + r.value} style={{ "--i": i } as React.CSSProperties}>
            <span className="ledger-dot" aria-hidden="true" />
            <span className="ledger-name">{r.name}{r.note && <span className="ledger-note">{r.note.startsWith("at ") ? " " : ": "}{r.note}</span>}</span>
            <span className="ledger-value">{r.value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

const shortPeriod = (p: string) => p.replace(/([A-Z][a-z]{2})[a-z]* /g, "$1 ").replace(" — ", " to ").replace("Present", "now");

export function Ledger() {
  const roles: Row[] = experience.map((e) => ({ name: e.role, note: `at ${e.company}`, value: shortPeriod(e.period) }));
  const schools: Row[] = education.map((e) => ({ name: e.degree, note: e.school, value: e.period.replace(" — ", " to ") }));
  const stack: Row[] = skillCategories.map((c) => ({ name: c.label, note: c.items.map((i) => i.name).join(", "), value: `${c.items.length} tools` }));
  const certs: Row[] = certifications.map((c) => {
    const [name, issuer] = c.split(" — ");
    return { name, value: issuer ?? "Certificate" };
  });
  return (
    <section className="ledger" id="ledger" aria-labelledby="ledger-h2">
      <Reveal as="div" className="ledger-col">
        <h2 className="ledger-h2" id="ledger-h2">Where I have worked and studied</h2>
        <Reveal><Group word="Roles" rows={roles} /></Reveal>
        <Reveal><Group word="Education" rows={schools} /></Reveal>
        <Reveal><Group word="Stack" rows={stack} /></Reveal>
        <Reveal><Group word="Certificates" rows={certs} /></Reveal>
      </Reveal>
    </section>
  );
}
