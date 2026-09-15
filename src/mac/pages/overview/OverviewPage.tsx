import { Link } from "react-router-dom";
import { Briefcase, MapPin, GraduationCap, Rocket, ExternalLink, Sparkles, FolderKanban } from "lucide-react";
import { useNav } from "../../hooks/useNav";
import { useWindowManager } from "../../hooks/useWindowManager";
import { useGithub } from "../../hooks/useGithub";
import { useIstTime } from "../../hooks/useIstTime";
import { site } from "../../data/site";
import { status } from "../../data/status";
import { featuredProjects } from "../../data/projects";
import { experience, certifications } from "../../data/experience";
import { skillCategories, exploring } from "../../data/skills";
import { CountUp } from "../../components/ui/CountUp";
import { Reveal } from "../../components/ui/Reveal";
import { Tilt } from "../../components/ui/Tilt";
import { ProjectCover } from "../../components/ui/ProjectCover";
import { GithubIcon } from "../../lib/icons";

const EDITIONS = [
  { label: "Terminal", to: "/terminal", num: "01" },
  { label: "Classic", to: "/classic", num: "02" },
  { label: "Paper", to: "/paper", num: "03" },
  { label: "Aurora", to: "/aurora", num: "04" },
  { label: "Forge", to: "/forge", num: "05" },
];

const techTotal = skillCategories.reduce((a, c) => a + c.items.length, 0);
const [first, last] = site.name.split(" ").length > 1
  ? [site.name.split(" ").slice(0, -1).join(" "), site.name.split(" ").slice(-1)[0]]
  : [site.name, ""];

export function OverviewPage() {
  const { navigate, setOpenProject } = useNav();
  const { openWindow } = useWindowManager();
  const { followers, repos, loading } = useGithub();
  const ist = useIstTime(false);
  const lead = featuredProjects[0];
  const ledger = featuredProjects.slice(1, 5);

  const goProjects = () => {
    navigate("projects");
    openWindow("projects");
  };
  const openProject = (p: typeof lead) => {
    goProjects();
    setTimeout(() => setOpenProject(p), 80);
  };

  return (
    <div className="mac-page">
      <Reveal>
        <header className="ov-masthead">
          <div className="ov-dateline mac-caps">
            <span>{ist} IST</span>
            <span>{site.location.split(",")[0]}</span>
            <span>{status.availability}</span>
          </div>
          <h1 className="ov-name">
            {first} <em>{last}</em>
          </h1>
          <p className="ov-role">
            <b>{site.title}.</b> I build AI-powered web applications, developer tools, and full-stack products that ship.
          </p>
          <div className="ov-actions">
            <button className="mac-btn mac-btn--primary" onClick={goProjects}>
              <Briefcase /> View projects
            </button>
            <a className="mac-btn" href={site.github} target="_blank" rel="noopener noreferrer">
              <GithubIcon size={14} /> GitHub
            </a>
            <a className="mac-btn mac-btn--ghost" href={site.resume} target="_blank" rel="noopener noreferrer">
              <ExternalLink /> Resume
            </a>
          </div>
          <p className="ov-quote">{site.tagline}</p>
        </header>
      </Reveal>

      <div className="ov-front">
        <Reveal index={1}>
          <button className="ov-lead" onClick={() => openProject(lead)} aria-label={`Open ${lead.name}`}>
            <ProjectCover project={lead} size="lg" />
            <div className="ov-lead__meta">
              <span className="ov-lead__title">{lead.name}</span>
              <span className="mac-caps">{lead.highlight ? "flagship" : "featured"}</span>
            </div>
            <span className="ov-lead__tagline">{lead.tagline}</span>
          </button>
        </Reveal>
        <Reveal index={2}>
          <div className="ov-facts">
            <div className="ov-fact"><span className="mac-caps">Status</span><span className="ov-fact__v"><span className="status-badge"><span className="status-badge__dot" />Available</span></span></div>
            <div className="ov-fact"><span className="mac-caps">Location</span><span className="ov-fact__v"><MapPin />{site.location}</span></div>
            <div className="ov-fact"><span className="mac-caps">{status.headline}</span><span className="ov-fact__v"><Rocket />{status.detail}</span></div>
            <div className="ov-fact"><span className="mac-caps">Education</span><span className="ov-fact__v"><GraduationCap />B.Tech CSE — NITTE</span></div>
          </div>
        </Reveal>
      </div>

      <div className="mac-section">
        <Reveal><div className="page-header__eyebrow">By the numbers</div></Reveal>
        <div className="mac-stats">
          <Reveal index={0}><Tilt target=".mac-stat"><div className="mac-stat"><div className="mac-stat__value"><CountUp value={featuredProjects.length} /></div><div className="mac-stat__label">Featured projects</div></div></Tilt></Reveal>
          <Reveal index={1}><Tilt target=".mac-stat"><div className="mac-stat"><div className="mac-stat__value"><CountUp value={experience.length} /></div><div className="mac-stat__label">Roles held</div></div></Tilt></Reveal>
          <Reveal index={2}><Tilt target=".mac-stat"><div className="mac-stat"><div className="mac-stat__value"><CountUp value={techTotal} suffix="+" /></div><div className="mac-stat__label">Technologies</div></div></Tilt></Reveal>
          <Reveal index={3}><Tilt target=".mac-stat"><div className="mac-stat"><div className="mac-stat__value">{loading ? <span className="mac-skeleton">—</span> : <CountUp value={followers} />}</div><div className="mac-stat__label">Followers · {loading ? "…" : `${repos} repos`}</div></div></Tilt></Reveal>
        </div>
      </div>

      <div className="mac-section">
        <Reveal>
          <div className="mac-preview-head">
            <h2 className="mac-section-title"><FolderKanban /> More work</h2>
            <button className="mac-link" onClick={goProjects}>all {featuredProjects.length} →</button>
          </div>
        </Reveal>
        <div className="ov-ledger">
          {ledger.map((p, i) => (
            <Reveal key={p.slug} index={i}>
              <button className="ov-ledger__row" onClick={() => openProject(p)}>
                <span className="ov-ledger__n">0{i + 2}</span>
                <span><span className="ov-ledger__name">{p.name}</span><span className="ov-ledger__tag">{p.tagline}</span></span>
                <span className="ov-ledger__tech">{p.tech.slice(0, 3).join(" · ")}</span>
              </button>
            </Reveal>
          ))}
        </div>
      </div>

      <div className="mac-section">
        <Reveal><h2 className="mac-section-title"><Sparkles /> How I ship</h2></Reveal>
        <Reveal index={1}>
          <div className="mac-pipeline" aria-hidden="true">
            <span>frontend</span><i>→</i><span>api</span><i>→</i><span>database</span><i>→</i><span>llm</span><i>→</i><span>product</span>
          </div>
        </Reveal>
        <Reveal index={2}>
          <p className="about-section__text" style={{ marginTop: 14 }}>
            Currently exploring {exploring.slice(0, 3).map((e) => e.name.toLowerCase()).join(" · ")} — with {certifications.length} certifications behind the work.
          </p>
        </Reveal>
      </div>

      <div className="mac-section">
        <Reveal>
          <div className="mac-preview-head">
            <h2 className="mac-section-title"><GithubIcon size={16} /> Open source</h2>
            <a className="mac-link" href={site.github} target="_blank" rel="noopener noreferrer">@{site.githubUser} ↗</a>
          </div>
        </Reveal>
        <Reveal index={1}>
          <div className="mac-card" style={{ display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
            <div style={{ flex: "1 1 200px" }}>
              <div className="ov-lead__title">Building in public</div>
              <div className="ov-lead__tagline">{loading ? "Fetching live stats…" : `${repos} public repos · ${followers} followers`} — every featured project ships with source.</div>
            </div>
            <a className="mac-btn mac-btn--primary" href={site.github} target="_blank" rel="noopener noreferrer"><GithubIcon size={14} /> Follow along</a>
          </div>
        </Reveal>
      </div>

      <div className="mac-section">
        <Reveal><h2 className="mac-section-title">Five more ways in</h2></Reveal>
        <div className="mac-editions">
          {EDITIONS.map((e, i) => (
            <Reveal key={e.to} index={i}>
              <Link className="mac-edition" to={e.to}><span className="mac-edition__num">{e.num}</span><span className="mac-edition__name">{e.label}</span></Link>
            </Reveal>
          ))}
        </div>
      </div>
    </div>
  );
}
