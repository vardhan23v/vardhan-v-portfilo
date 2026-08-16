import { site } from "../data/site";
import { Reveal } from "../hooks/useReveal";

const GIT = `Git · GitHub · Vercel · Postman · VS Code`;

export function About() {
  return (
    <section className="section" id="about" aria-labelledby="about-title">
      <div className="container">
        <div className="shell">
          <Reveal>
            <div className="shell-head">
              <span className="cmdline">
                <span className="dollar">$</span> cat ~/about.txt
              </span>
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
                  <b>vardhan@folio</b>:~$ whoami &amp;&amp; cat about.txt
                </span>
              </div>
              <div className="term-body">
                <div className="cmdline">
                  <span className="dollar">$</span> whoami <span className="bracket"># prints what it says on the tin</span>
                </div>
                <p className={"plain-ln"} style={{ margin: "6px 0 16px", fontSize: 14 }}>
                  <span className="prompt">uid=1000(vardhan)</span> gid=1000(developer) groups=1000(builder)
                </p>

                <p className={"plain-ln"} style={{ fontSize: 13 }}>
                  computer science undergraduate at nmam institute of technology. I build across the whole
                  stack — interfaces, APIs, databases, and the LLM layer on top — and I ship what I build.
                  my rule of thumb:{" "}
                  <span className={"plain-ln"} style={{ color: "var(--green)" }}>
                    the demo works before the design is praised.
                  </span>
                </p>

                <p className={"plain-ln"} style={{ fontSize: 13, marginTop: 12 }}>
                  lately I have been compiling: ai products with real fallback chains, deterministic
                  multi-agent simulations, streaming assistants with server-side auth, and chrome
                  extensions generated end-to-end by llms. more in <a className="tlink" href="#work">./work/</a>.
                </p>

                <p className={"plain-ln"} style={{ fontSize: 13, marginTop: 12 }}>
                  principles that survive code review:
                </p>
                <ul className="exp-points" style={{ marginTop: 6 }}>
                  <li>understand the problem before picking the stack.</li>
                  <li>build the smallest useful thing, then let usage drive the rest.</li>
                  <li>reliability beats features — fallbacks, tests, and honest failure states.</li>
                </ul>

                <hr className="sep" />
                <div className="cmdline">
                  <span className="dollar">$</span> cat ~/about.txt --meta
                  <br />
                  <span style={{ color: "var(--amber)" }}>environment:</span> {site.location} ·{" "}
                  <span style={{ color: "var(--amber)" }}>editor:</span> vs code ·{" "}
                  <span style={{ color: "var(--amber)" }}>toolbelt:</span> {GIT}
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}