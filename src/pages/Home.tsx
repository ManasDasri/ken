import RetroPixelButton from '@/components/rareui/RetroPixelButton';
import KoiPond from '@/components/KoiPond';
import Curtain from '@/components/Curtain';
import EvidenceBoard from '@/components/EvidenceBoard';

export default function Home() {
  return (
    <>
      {/* the door */}
      <Curtain />

      <header className="chrome"></header>
      <div className="toast" id="toast" role="status"></div>
      <main>
        {/* hero */}
        <section className="hero" id="home">
          <span className="frame-label"># hello</span>
          <span className="coords" aria-hidden="true">X <b id="cx">0</b>&nbsp;&nbsp;Y <b id="cy">0</b></span>

          <div className="doodles" aria-hidden="true">
            <img className="dd dd-1" src="/img/doodles/clumsy.svg" alt="" />
            <img className="dd dd-2" src="/img/doodles/chilling.svg" alt="" />
            <img className="dd dd-3" src="/img/doodles/coffee.svg" alt="" />
            <img className="dd dd-4" src="/img/doodles/strolling.svg" alt="" />
          </div>
          <div className="hero-in">
            <p className="hi">hi there, it’s</p>
            <div className="box" id="namebox">
              <span className="box-label" id="boxlabel">researcher <b>0.97</b></span>
              <h1 className="name">Manas</h1>
              <span className="hanko" lang="ja" title="Manas, in katakana">マナス</span>
              <i className="h h1"></i><i className="h h2"></i><i className="h h3"></i><i className="h h4"></i>
              <img className="stk stk-hero" src="/img/stickers/sparkle-four.svg" alt="" />
            </div>
            <p className="role">ML research &amp; developer tools</p>
            <div className="pixels" id="pixels" aria-hidden="true"></div>

            <p className="pitch">
              <span className="line">I train models
                <span className="chip chip-loss" aria-hidden="true"><svg viewBox="0 0 60 22"><path id="losspath" d="M2 3 C 10 6, 12 14, 20 15 S 34 17, 40 18 S 52 19, 58 19" /><circle className="dot" r="2.6"><animateMotion dur="3s" repeatCount="indefinite" begin="2.4s"><mpath href="#losspath" /></animateMotion></circle></svg><em>loss ↓</em></span>
                then try to break them,</span>
              <span className="line">ship tools you can
                <span className="chip chip-term"><code id="term">$ brew install sprout</code><i className="caret"></i></span></span>
              <span className="line">and build most of it myself
                <span className="toggle" role="group" aria-label="Research or code"><span className="slider" aria-hidden="true"></span>
                  <button className="on" data-mode="research" aria-pressed="true"><svg viewBox="0 0 16 16"><path d="M6 2h4M7 2v4L3 13h10L9 6V2" /></svg>Research</button>
                  <button data-mode="code" aria-pressed="false"><svg viewBox="0 0 16 16"><path d="M5.5 4 2 8l3.5 4M10.5 4 14 8l-3.5 4" /></svg>Code</button>
                </span>
                with <a className="chip chip-claude" href="https://claude.com/claude-code" target="_blank" rel="noopener"><img src="https://cdn.simpleicons.org/claude" alt="" width="20" height="20" />Claude<span className="tip"><b>pair programmer</b></span></a> riding shotgun</span>
              <span className="line">My code lives inside
                <a className="chip chip-org" href="https://github.com/gleam-lang/gleam/pull/6361" target="_blank" rel="noopener"><img src="https://github.com/gleam-lang.png?size=64" alt="" width="22" height="22" />Gleam<span className="tip"><b>#6361 · merged</b>Link to the Hex diff when a dependency changes version</span></a>
                <a className="chip chip-org" href="https://github.com/bazel-contrib/rules_go/pull/4791" target="_blank" rel="noopener"><img src="https://github.com/bazel-contrib.png?size=64" alt="" width="22" height="22" />rules_go<span className="tip"><b>#4791 · merged</b>nogo builds against golang.org/x/tools v0.53.0 again</span></a></span>
            </p>

            <div className="cta">
              <RetroPixelButton href="mailto:dasarimanas049@gmail.com" pixelColor="#22c55e">Email me</RetroPixelButton>
              <RetroPixelButton href="resume.pdf" target="_blank" rel="noopener" pixelColor="#a855f7">Résumé</RetroPixelButton>
            </div>
          </div>
          <span className="scroll-hint" aria-hidden="true">scroll</span>
        </section>

        {/* work */}
        <section className="work" id="work">
          <span className="frame-label"># the proof</span>
          <div className="sec-head">
            <h2 className="glitch">Receipts, not résumés.</h2>
            <p>Before anything about me, the proof. Six projects, real numbers, one corkboard. Drag the photos around, or open a file.</p>
            <img className="stk stk-arrow" src="/img/stickers/down-arrow.svg" alt="" />
          </div>
          <EvidenceBoard />
          <div className="more-bar">
            <span>Want the whole story? Every project has a full case study.</span>
            <RetroPixelButton href="work.html" pixelColor="#f5b800">See all the work</RetroPixelButton>
          </div>
        </section>

        {/* what I do */}
        <section className="do" id="do">
          <span className="frame-label"># for you</span>
          <div className="sec-head">
            <h2 className="glitch big-px">Bring me a problem.</h2>
            <p>Hover one. Each comes with a receipt.</p>
          </div>
          <ol className="svc">
            <li><a href="https://kenx049-clause-risk-review.static.hf.space/index.html" target="_blank" rel="noopener">
              <span className="n">01</span><span className="t">ML research</span><svg viewBox="0 0 16 16"><path d="M3 8h10M9 4l4 4-4 4" /></svg>
              <span className="d"><span><span className="d-copy">Experiments built to be checked: splits per person or per contract, thresholds tuned on validation only, permutation tests against chance, and the nulls written up too.</span><span className="tags">PyTorch · Transformers · scikit-learn · MNE · statsmodels</span></span></span>
              <span className="pv c-yellow"><b>FRAME</b><i>#</i><img src="/img/clause.jpg" alt="" loading="lazy" /><small>Clause Risk Review · results</small></span></a></li>
            <li><a href="https://sprout-devlabs.github.io/sprout-web/" target="_blank" rel="noopener">
              <span className="n">02</span><span className="t">Developer tools</span><svg viewBox="0 0 16 16"><path d="M3 8h10M9 4l4 4-4 4" /></svg>
              <span className="d"><span><span className="d-copy">Tools developers install. Sprout maps a codebase for you and your AI agent over MCP; Forme is 53 React components you own as source.</span><span className="tags">Go · MCP · React · TypeScript · WebGL</span></span></span>
              <span className="pv c-green"><b>FRAME</b><i>#</i><img src="/img/sprout.jpg" alt="" loading="lazy" /><small>Sprout · site</small></span></a></li>
            <li><a href="https://github.com/pulls?q=is%3Apr+author%3AManasDasri+-user%3AManasDasri" target="_blank" rel="noopener">
              <span className="n">03</span><span className="t">Open source</span><svg viewBox="0 0 16 16"><path d="M3 8h10M9 4l4 4-4 4" /></svg>
              <span className="d"><span><span className="d-copy">Fixes sent upstream to editors, compilers and build tools: Zed, Gleam, rules_go, gpui-kit, Netcatty. 25 merged so far, 6 in review.</span><span className="tags">Rust · Go · TypeScript · C</span></span></span>
              <span className="pv c-blue"><b>FRAME</b><i>#</i><span className="diff"><code>gleam-lang/gleam #6361</code><code className="add">+ Changed gleam_stdlib v0.40 → v0.41</code><code className="add">+   diff: hex.pm/diff/gleam_stdlib/…</code><code className="del">- Changed gleam_stdlib v0.40 → v0.41</code><code className="ok">✓ merged</code></span><small>Gleam · merged PR</small></span></a></li>
            <li><a href="https://flow-study.me" target="_blank" rel="noopener">
              <span className="n">04</span><span className="t">Real-time products</span><svg viewBox="0 0 16 16"><path d="M3 8h10M9 4l4 4-4 4" /></svg>
              <span className="d"><span><span className="d-copy">Apps people use: Flow’s shared study rooms over WebRTC, Velora’s forecasts from thousands of simulated paths.</span><span className="tags">WebRTC · Supabase · Express · Monte Carlo</span></span></span>
              <span className="pv c-pink"><b>FRAME</b><i>#</i><img src="/img/flow.jpg" alt="" loading="lazy" /><small>Flow · home</small></span></a></li>
            <li><a href="https://gradientworksai.in/" target="_blank" rel="noopener">
              <span className="n">05</span><span className="t">Models for teams</span><svg viewBox="0 0 16 16"><path d="M3 8h10M9 4l4 4-4 4" /></svg>
              <span className="d"><span><span className="d-copy">Through Gradient Works, my applied AI studio: a metric agreed up front, a baseline to beat, held-out testing and a written result.</span><span className="tags">PyTorch · Hugging Face · FastAPI</span></span></span>
              <span className="pv c-purple"><b>FRAME</b><i>#</i><img src="/img/gradient.jpg" alt="" loading="lazy" /><small>Gradient Works · studio</small></span></a></li>
          </ol>
        </section>

        {/* contact */}
        <section className="contact" id="contact">
          <div className="ascii" id="ascii" aria-hidden="true"></div>
          <span className="frame-label"># say hi</span>
          <div className="cbox">
            <div className="cbox-copy">
              <p className="kicker">GOT A HUNCH?</p>
              <h2 className="glitch">Let’s go test it.</h2>
              <p>Internship, research gig, or a model that has to actually work? Pick a day and I’ll get back to you to set up a call.</p>
            </div>
            <div className="cal" id="cal">
              <div className="cal-head"><button id="cal-prev" aria-label="Previous month"><svg viewBox="0 0 16 16"><path d="M10 3 5 8l5 5" /></svg></button><b id="cal-title"></b><button id="cal-next" aria-label="Next month"><svg viewBox="0 0 16 16"><path d="m6 3 5 5-5 5" /></svg></button></div>
              <div className="cal-grid" id="cal-grid" role="grid"></div>
              <p className="cal-pick" id="cal-pick">Pick a day</p>
              <RetroPixelButton id="cal-go" href="mailto:dasarimanas049@gmail.com?subject=Let%E2%80%99s%20talk" className="w-full" pixelColor="#22c55e">Request a call</RetroPixelButton>
            </div>
          </div>
          <div className="tiles">
            <a href="https://github.com/ManasDasri" target="_blank" rel="noopener"><b>GitHub</b><small>ManasDasri</small><span>↗</span></a>
            <a href="https://www.linkedin.com/in/manas-dasari-2a52163a5/" target="_blank" rel="noopener"><b>LinkedIn</b><small>in/manas-dasari</small><span>↗</span></a>
            <a href="https://x.com/ManasDmg9" target="_blank" rel="noopener"><b>X</b><small>@ManasDmg9</small><span>↗</span></a>
            <a href="https://leetcode.com/u/ManasDasari/" target="_blank" rel="noopener"><b>LeetCode</b><small>ManasDasari</small><span>↗</span></a>
            <a href="resume.pdf" target="_blank" rel="noopener"><b>Résumé</b><small>one page, PDF</small><span>↗</span></a>
            <button id="copy"><b>Email</b><small>dasarimanas049@gmail.com</small><span>⧉</span></button>
          </div>
        </section>
      </main>

      <KoiPond />
    </>
  );
}
