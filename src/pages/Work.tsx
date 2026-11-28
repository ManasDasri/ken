import Shell, { Arrow } from '@/kit/Shell';
import { Section, ProjectRows } from '@/kit/ui';
import WorkStack from '@/components/WorkStack';

const BENCH = [
  ['Gradient Works', 'My applied AI studio: models for teams, with a baseline to beat and a written result.', 'https://gradientworksai.in/', 'studio'],
  ['Analogue Risk', 'Forecasting market risk from historical analogues, re-tested on 15 new assets.', 'https://github.com/ManasDasri/analogue-risk', 'in research'],
  ['Atmos', 'Placing a cheaper, denser air-quality sensor network for Bengaluru.', 'https://github.com/ManasDasri/Atmos', 'code'],
];

export default function Work() {
  return (
    <Shell page="work">
      <div className="intro">
        <h2 style={{ marginTop: 6 }}>The evidence locker.</h2>
        <p>Six case studies: the question, how it’s built, and what came out, with the numbers on the page. Scroll to flip through them.</p>
      </div>
      <WorkStack />
      <Section title="All projects" aside="by kind" note="the number that matters, next to each">
        <ProjectRows detail />
      </Section>
      <Section title="Also on the bench">
        {BENCH.map(([n, d, u, k]) => (
          <a key={n} className="row" href={u} target="_blank" rel="noopener" style={{ gridTemplateColumns: 'auto 1fr auto 14px' }}>
            <b>{n}</b><span className="d">{d}</span><span className="k">{k}</span><Arrow />
          </a>
        ))}
      </Section>
    </Shell>
  );
}
