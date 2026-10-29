import { site } from "../data/site";

const LINKS = [
  { href: "#work", label: "Work" },
  { href: "#about", label: "About" },
  { href: "#ledger", label: "Experience" },
  { href: "#contact", label: "Contact" },
];

export function Navbar() {
  return (
    <header className="nav">
      <a className="nav-mark" href="#top">{site.name}</a>
      <nav className="nav-links" aria-label="Sections">
        {LINKS.map((l) => (
          <a key={l.href} href={l.href}>{l.label}</a>
        ))}
      </nav>
      <a className="btn btn--sm" href={site.resume} download="sree-vardhan-v-resume.pdf">Résumé</a>
    </header>
  );
}
