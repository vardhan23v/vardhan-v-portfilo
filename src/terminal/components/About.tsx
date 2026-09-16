import { site } from "../data/site";
import { techGroups } from "../data/tech";
import { education } from "../data/experience";
import { Reveal } from "../hooks/useReveal";
import { TypeCmd } from "./TypeCmd";

const toolbelt = techGroups.find((g) => /tools/i.test(g.label))?.items.slice(0, 6).join(" · ") ?? "";

const PARAGRAPHS = [
  "computer science undergraduate at nmam institute of technology. I build across the whole stack — interfaces, APIs, databases, and the LLM layer on top — and I ship what I build.",
  "my rule of thumb: the demo works before the design is praised.",
  "lately I have been compiling: ai products with real fallback chains, deterministic multi-agent simulations, streaming assistants with server-side auth, and chrome extensions generated end-to-end by llms.",
];

const PRINCIPLES = [
  "understand the problem before picking the stack.",
  "build the smallest useful thing, then let usage drive the rest.",
  "reliability beats features — fallbacks, tests, and honest failure states.",
];

export function About() {
  return (
    <section className="section" id="about" aria-labelledby="about-title">
      <div className="container">
        <div className="shell">
          <Reveal>
            <div className="shell-head">
              <TypeCmd cmd="cat -n ~/about.txt" />
              <h2 className="shell-title" id="about-title">
                WHOAMI <span className="dim">// 0041</span>
              </h2>
            </div>
          </Reveal>

          <Reveal>
            <div className="term">
              <div className="term-bar" aria-hidden="true">
                <span className="term-dot r" />
                <span className="term-dot a" />
                <span className="term-dot g" />
                <span className="term-title">
                  <b>vardhan@folio</b>:~$ id &amp;&amp; cat -n about.txt
                </span>
              </div>
              <div className="term-body about-body">
                <div className="cmdline">
                  <span className="dollar">$</span> id <span className="bracket"># who is running this</span>
                </div>
                <div className="idcard" role="table" aria-label="Identity">
                  <div className="idcard-row" role="row">
                    <span role="cell" className="idcard-k">uid</span>
                    <span role="cell"><span className="prompt">1000(vardhan)</span> gid=1000(developer) groups=1000(builder),27(ships)</span>
                  </div>
                  <div className="idcard-row" role="row"><span role="cell" className="idcard-k">name</span><span role="cell">{site.fullName}</span></div>
                  <div className="idcard-row" role="row"><span role="cell" className="idcard-k">role</span><span role="cell" className="amber">{site.role.toLowerCase()}</span></div>
                  <div className="idcard-row" role="row"><span role="cell" className="idcard-k">base</span><span role="cell">{site.location}</span></div>
                  <div className="idcard-row" role="row"><span role="cell" className="idcard-k">edu</span><span role="cell">{education.degree.toLowerCase()} · {education.school} · {education.period}</span></div>
                  <div className="idcard-row" role="row"><span role="cell" className="idcard-k">status</span><span role="cell"><span className="ok">●</span> building · open to interesting problems</span></div>
                </div>

                <div className="cmdline about-cmd">
                  <span className="dollar">$</span> cat -n ~/about.txt
                </div>
                <ol className="numbered-text">
                  {PARAGRAPHS.map((p, i) => (
                    <li key={i} className={i === 1 ? "is-rule" : ""}>{p}</li>
                  ))}
                  <li className="is-link">
                    more in <a className="tlink" href="#work">./work/</a> — every entry has a readme, a repo and a decision log.
                  </li>
                </ol>

                <div className="cmdline about-cmd">
                  <span className="dollar">$</span> grep -n "principle" ~/notes.md
                </div>
                <ul className="learn-list">
                  {PRINCIPLES.map((p) => (
                    <li key={p}>{p}</li>
                  ))}
                </ul>

                <hr className="sep" />
                <div className="cmdline">
                  <span className="dollar">$</span> cat ~/about.txt --meta
                </div>
                <p className="about-meta">
                  <b>environment:</b> {site.location} · <b>editor:</b> vs code · <b>toolbelt:</b> {toolbelt}
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
