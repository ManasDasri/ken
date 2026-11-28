import KoiPond from '@/components/KoiPond';
export default function OpenSource() {
  return (
    <>
      <header className="chrome"></header>
      <main className="subpage">
        <section className="up" id="upstream">
          <span className="frame-label"># open source</span>
          <div className="sec-head">
            <h1 className="glitch big-px">Living rent-free in other people’s repos.</h1>
            <p>Pull requests to other people’s projects. <a href="https://github.com/pulls?q=is%3Apr+author%3AManasDasri+-user%3AManasDasri" target="_blank" rel="noopener">See all on GitHub ↗</a></p>
          </div>
          <div className="stats-row"><div><b id="st-merged">25</b><span>merged into other people’s projects</span></div><div><b id="st-open">6</b><span>open, in review</span></div><div><b id="st-repos">10</b><span>repositories, Zed to Exercism</span></div></div>
          <div className="oss-head"><h2 className="glitch ab-h">The greatest hits.</h2><p className="ab-sub left">Hand-picked, with what each one fixed. Their status comes live from GitHub.</p></div>
          <div className="prs prs-grid" id="prs">
            <a className="pr c-blue" href="https://github.com/zed-industries/zed/pull/67329" target="_blank" rel="noopener"><header><img src="https://github.com/zed-industries.png?size=64" alt="" /><b>zed-industries/zed</b><em>in review</em></header><p>Re-open buffers with the language server after their worktree root moves, so it stops answering for stale paths.</p><small>#67329 · +199 −2</small></a>
            <a className="pr c-pink" href="https://github.com/gleam-lang/gleam/pull/6361" target="_blank" rel="noopener"><header><img src="https://github.com/gleam-lang.png?size=64" alt="" /><b>gleam-lang/gleam</b><em>merged</em></header><p>When a dependency changes version, the CLI links to the diff on Hex as a terminal hyperlink.</p><small>#6361 · +94 −7</small></a>
            <a className="pr c-green" href="https://github.com/bazel-contrib/rules_go/pull/4791" target="_blank" rel="noopener"><header><img src="https://github.com/bazel-contrib.png?size=64" alt="" /><b>bazel-contrib/rules_go</b><em>merged</em></header><p>nogo stopped compiling against golang.org/x/tools v0.53.0. Ported it to the new facts decoder.</p><small>#4791 · +56 −71</small></a>
            <a className="pr c-yellow" href="https://github.com/longbridge/gpui-kit/pull/4018" target="_blank" rel="noopener"><header><img src="https://github.com/longbridge.png?size=64" alt="" /><b>longbridge/gpui-kit</b><em>merged</em></header><p>The Linux title bar follows the desktop’s window-button layout instead of a hard-coded one.</p><small>#4018 · +109 −22</small></a>
            <a className="pr c-purple" href="https://github.com/binaricat/Netcatty/pull/4202" target="_blank" rel="noopener"><header><img src="https://github.com/binaricat.png?size=64" alt="" /><b>binaricat/Netcatty</b><em>merged</em></header><p>Move a terminal tab into its own window and keep the same live SSH session.</p><small>#4202 · +1832 −44</small></a>
            <a className="pr c-orange" href="https://github.com/longbridge/gpui-fast/pull/161" target="_blank" rel="noopener"><header><img src="https://github.com/longbridge.png?size=64" alt="" /><b>longbridge/gpui-fast</b><em>merged</em></header><p>Pause Metal display links while a macOS window is hidden, and reuse them when it returns.</p><small>#161 · +102 −7</small></a>
            <a className="pr c-blue" href="https://github.com/wainmann/agent-manager/pull/1104" target="_blank" rel="noopener"><header><img src="https://github.com/wainmann.png?size=64" alt="" /><b>wainmann/agent-manager</b><em>merged</em></header><p>Fast typing arrived as one merged key event; each rune now counts as its own press.</p><small>#1104 · +90 −12</small></a>
            <a className="pr c-green" href="https://github.com/exercism/vbnet/pulls?q=is%3Apr+is%3Amerged+author%3AManasDasri" target="_blank" rel="noopener"><header><img src="https://github.com/exercism.png?size=64" alt="" /><b>exercism/vbnet</b><em>merged ×12</em></header><p>Twelve VB.NET exercises synced with the shared problem specifications.</p><small>12 pull requests</small></a>
            <a className="pr c-pink" href="https://github.com/c4punks/CWIST/pull/695" target="_blank" rel="noopener"><header><img src="https://github.com/c4punks.png?size=64" alt="" /><b>c4punks/CWIST</b><em>merged</em></header><p>Template render errors report the source location and tag, through nested templates too.</p><small>#695 · +584 −248</small></a>
            <a className="pr c-yellow" href="https://github.com/openslop/openslop/pulls?q=is%3Apr+author%3AManasDasri+is%3Amerged" target="_blank" rel="noopener"><header><img src="https://github.com/openslop.png?size=64" alt="" /><b>openslop/openslop</b><em>merged ×6</em></header><p>Run a step’s tool calls together, refuse edits from a stale read, captions from the media library, and more.</p><small>6 pull requests</small></a>
            <a className="pr c-purple" href="https://github.com/gleam-lang/gleam/pull/6405" target="_blank" rel="noopener"><header><img src="https://github.com/gleam-lang.png?size=64" alt="" /><b>gleam-lang/gleam</b><em>in review</em></header><p>A clear syntax error for attributes an import can’t take, where they used to be ignored silently.</p><small>#6405 · +151 −0</small></a>
            <a className="pr c-orange" href="https://github.com/zed-industries/zed/pull/67156" target="_blank" rel="noopener"><header><img src="https://github.com/zed-industries.png?size=64" alt="" /><b>zed-industries/zed</b><em>in review</em></header><p>A subagent card stayed red after a successful retry; it now follows the retried run.</p><small>#67156 · +266 −5</small></a>
          </div>
          <div className="feed-wrap">
            <div className="oss-head"><h2 className="glitch ab-h">Every merge, live.</h2><p className="ab-sub left">Straight from the GitHub API, newest first. When a pull request of mine gets merged, it lands here on its own.</p></div>
            <ol className="feed" id="feed"><li className="feed-msg">Asking GitHub…</li></ol>
          </div>
          <div className="graph-wrap">
            <h2 className="glitch ab-h">A year in green squares.</h2>
            <p className="ab-sub left">My GitHub contributions over the last year, live from GitHub. Hover a day.</p>
            <div className="graph" id="graph" aria-label="GitHub contributions, last 12 months"><p className="graph-msg">Loading contributions…</p></div>
            <p className="graph-foot"><span id="graph-total"></span><span className="legend">less <i className="l0"></i><i className="l1"></i><i className="l2"></i><i className="l3"></i><i className="l4"></i> more</span></p>
          </div>
        </section>
      </main>
      <KoiPond />
    </>
  );
}
