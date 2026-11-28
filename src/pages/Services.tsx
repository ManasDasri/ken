export default function Services() {
  return (
    <>
      <header className="chrome"></header>
      <main className="subpage">
        <section className="do" id="do">
          <span className="frame-label"># services</span>
          <div className="sec-head">
            <h1 className="glitch big-px">Bring me a problem.</h1>
            <p>Hover one to see what I’ve already done about it.</p>
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
        <section className="ab-cta">
          <p className="kicker">NOT SURE WHICH ONE?</p>
          <h2 className="glitch ab-h">Tell me the problem instead.</h2>
          <div className="cta"><a className="btn" href="contact.html">Pick a day to talk <svg viewBox="0 0 16 16"><path d="M3 8h10M9 4l4 4-4 4" /></svg></a><a className="btn ghost" href="work.html">See the work</a></div>
        </section>
      </main>
      <footer className="foot"></footer>
    </>
  );
}
