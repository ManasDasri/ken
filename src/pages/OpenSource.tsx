import Shell from '@/kit/Shell';
import { Section, ProofStats, Merges, YearGraph } from '@/kit/ui';
import { usePRs, safeUrl } from '@/kit/live';

// hand-picked, in my words; their status comes live from GitHub
const HITS = [
  ['zed-industries/zed', 'https://github.com/zed-industries/zed/pull/67329', 'Re-open buffers with the language server after their worktree root moves, so it stops answering for stale paths.'],
  ['gleam-lang/gleam', 'https://github.com/gleam-lang/gleam/pull/6361', 'When a dependency changes version, the CLI links to the diff on Hex as a terminal hyperlink.'],
  ['bazel-contrib/rules_go', 'https://github.com/bazel-contrib/rules_go/pull/4791', 'nogo stopped compiling against golang.org/x/tools v0.53.0. Ported it to the new facts decoder.'],
  ['longbridge/gpui-kit', 'https://github.com/longbridge/gpui-kit/pull/4018', 'The Linux title bar follows the desktop’s window-button layout instead of a hard-coded one.'],
  ['binaricat/Netcatty', 'https://github.com/binaricat/Netcatty/pull/4202', 'Move a terminal tab into its own window and keep the same live SSH session.'],
  ['longbridge/gpui-fast', 'https://github.com/longbridge/gpui-fast/pull/161', 'Pause Metal display links while a macOS window is hidden, and reuse them when it returns.'],
  ['wainmann/agent-manager', 'https://github.com/wainmann/agent-manager/pull/1104', 'Fast typing arrived as one merged key event; each rune now counts as its own press.'],
  ['c4punks/CWIST', 'https://github.com/c4punks/CWIST/pull/695', 'Template render errors report the source location and tag, through nested templates too.'],
];

export default function OpenSource() {
  const { items } = usePRs();
  const status = (url: string) => {
    const hit = items?.find((p) => url.startsWith(p.url));
    return hit ? (hit.merged ? <span className="badge ok">merged</span> : <span className="badge wait">in review</span>) : null;
  };
  return (
    <Shell page="opensource">
      <div className="intro">
        <h2 style={{ marginTop: 6 }}>Living rent-free in other people’s repos.</h2>
        <p>Fixes I’ve sent to editors, compilers and build tools. Everything on this page comes live from GitHub.</p>
      </div>
      <Section title="By the numbers" aside="live">
        <ProofStats />
      </Section>
      <Section title="The greatest hits" note="what each one fixed, in plain words">
        <div className="grid2">
          {HITS.map(([repo, url, d]) => (
            <a key={url} className="cell" href={safeUrl(url)} target="_blank" rel="noopener">
              <span className="ic"><img src={`https://github.com/${repo.split('/')[0]}.png?size=48`} alt="" style={{ borderRadius: 5 }} /></span>
              <span style={{ minWidth: 0 }}><span className="t">{repo}{status(url)}</span><p>{d}</p></span>
            </a>
          ))}
        </div>
      </Section>
      <Section title="Every merge, live" aside="newest first" note="lands here on its own when it merges" side="l">
        <Merges show={4} all />
      </Section>
      <Section title="A year in green squares" aside="hover a day">
        <YearGraph />
      </Section>
    </Shell>
  );
}
