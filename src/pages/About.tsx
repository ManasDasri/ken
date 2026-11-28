import Shell from '@/kit/Shell';
import { Section, Stack } from '@/kit/ui';

const STORY = [
  ['I started with the web and stayed for the models.', 'I built web apps first: shared study rooms, a stock forecaster, dashboards. Then I started training models, and found the part I actually love: finding out whether something is true.'],
  ['A good-looking number is the easy part.', 'With a small dataset, a model that knows nothing can still look impressive. So I split by person or by contract, tune thresholds on validation data only, and compare every score against chance.'],
  ['My failed experiments get a page too.', 'Legal-BERT didn’t beat BERT. The EEG expertise result was confounded by sex. Both sit on the results pages, not buried in a footnote.'],
  ['I build the tools I need.', 'Opening an unfamiliar repo means guessing which files matter, so I built Sprout: a Go binary on Homebrew that coding agents call over MCP.'],
  ['When the laptop’s shut.', 'Weekend animal-welfare events with Barket, ricing KDE Plasma on Linux until it looks right, and following markets and how trading systems work.'],
];
const RULES = [
  ['Split before I look.', 'Train, validation and test are fixed per person or per contract and saved to disk before a model ever runs, so nothing leaks across.'],
  ['Beat a baseline, or say so.', 'Every score sits next to chance and a simple baseline. If a model only matches “sex alone” or “time on task”, that is the result.'],
  ['Report the nulls.', 'The predictions that failed go on the same page as the ones that held, with the same detail.'],
  ['Ship it with tests.', '90 tests pin the decisions in Clause Risk Review; Forme’s accessibility badges fail CI when the code doesn’t back them.'],
];
const WHEN = [
  ['Nov 2026', 'Released Flow v1.0', 'Study rooms with a shared sunset timer.'],
  ['Nov 2026', 'First PRs merged into rules_go and gpui-kit', 'Plus Netcatty, gpui-fast and agent-manager the same month.'],
  ['Oct 2026', 'First PR merged into Gleam', 'Hex diff links in the CLI. Attended IndiaFOSS 2026 in Bengaluru.'],
  ['Sep 2026', 'Shipped Sprout, and Smart India Hackathon', 'Homebrew tap, Scoop bucket and Linux packages; FieldLensAI for SIH.'],
  ['Aug 2026', 'Exercism’s VB.NET track, and Kaggle', 'Twelve exercises synced; ML fundamentals from scratch.'],
  ['Jun 2026', 'Started Flow', 'Virtual study rooms, peer to peer.'],
  ['Dec 2025', 'Started Atmos', 'Air-quality sensor placement for Bengaluru.'],
];

export default function About() {
  return (
    <Shell page="about">
      <div className="intro">
        <h2 style={{ marginTop: 6 }}>I build models, then try to prove them wrong.</h2>
        <p>The short version: I care more about whether a result holds than whether it looks good. CSE undergrad at Amrita School of Engineering, class of 2028.</p>
      </div>
      <Section title="The longer version">
        {STORY.map(([t, d]) => <div className="tl" key={t} style={{ gridTemplateColumns: '1fr' }}><div><b>{t}</b><p>{d}</p></div></div>)}
      </Section>
      <Section title="Four rules on every project" note="the same four, every time" side="l">
        <div className="grid2">
          {RULES.map(([t, d], i) => (
            <div className="cell" key={t}>
              <span className="ic" style={{ font: '12px var(--mono)', color: 'var(--mute)' }}>0{i + 1}</span>
              <span><span className="t">{t}</span><p>{d}</p></span>
            </div>
          ))}
        </div>
      </Section>
      <Section title="Where I’ve been">
        {WHEN.map(([w, t, d]) => <div className="tl" key={t}><span>{w}</span><div><b>{t}</b><p>{d}</p></div></div>)}
      </Section>
      <Section title="The tools I work in" note="from the first notebook to the release">
        <Stack />
      </Section>
    </Shell>
  );
}
