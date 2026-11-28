import Shell from '@/kit/Shell';
import { Section } from '@/kit/ui';

const DO = [
  ['ML research', 'Experiments built to be checked: splits per person or per contract, thresholds tuned on validation only, permutation tests against chance, and the nulls written up too.', 'PyTorch · Transformers · scikit-learn · MNE · statsmodels', 'https://kenx049-clause-risk-review.static.hf.space/index.html', 'See Clause Risk Review', '/img/clause.jpg'],
  ['Developer tools', 'Tools developers install. Sprout maps a codebase for you and your AI agent over MCP; Forme is 53 React components you own as source.', 'Go · MCP · React · TypeScript · WebGL', 'https://sprout-devlabs.github.io/sprout-web/', 'See Sprout', '/img/sprout.jpg'],
  ['Open source', 'Fixes sent upstream to editors, compilers and build tools: Zed, Gleam, rules_go, gpui-kit, Netcatty.', 'Rust · Go · TypeScript · C', '/opensource.html', 'See every merge, live', ''],
  ['Real-time products', 'Apps people use: Flow’s shared study rooms over WebRTC, Velora’s forecasts from thousands of simulated paths.', 'WebRTC · Supabase · Express · Monte Carlo', 'https://flow-study.me', 'See Flow', '/img/flow.jpg'],
  ['Models for teams', 'Through Gradient Works, my applied AI studio: a metric agreed up front, a baseline to beat, held-out testing and a written result.', 'PyTorch · Hugging Face · FastAPI', 'https://gradientworksai.in/', 'See Gradient Works', '/img/gradient.jpg'],
];

export default function Services() {
  return (
    <Shell page="services">
      <div className="intro">
        <h2 style={{ marginTop: 6 }}>Bring me a problem.</h2>
        <p>Five things I do, each with something I’ve already shipped. Open one.</p>
      </div>
      <Section title="What I do" aside="05" note="open one for the receipt">
        {DO.map(([t, d, tags, u, cta, img], i) => (
          <details className="acc" key={t} open={i === 0}>
            <summary><span className="n">0{i + 1}</span><b>{t}</b><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M8 3v10M3 8h10" /></svg></summary>
            <div className="acc-bd">
              <div>
                <p>{d}</p>
                <p style={{ font: '12px var(--mono)', color: 'var(--mute)' }}>{tags}</p>
                <a className="more" href={u} {...(u.startsWith('http') ? { target: '_blank', rel: 'noopener' } : {})}>{cta} ↗</a>
              </div>
              {img && <img src={img} alt="" loading="lazy" />}
            </div>
          </details>
        ))}
      </Section>
      <Section title="Not sure which one?" pad>
        <p style={{ margin: 0, color: 'var(--soft)' }}>Tell me the problem instead, and I’ll tell you which of these it is.</p>
        <div className="btns"><a className="btn" href="/contact.html">Pick a day to talk</a><a className="btn ghost" href="/index.html#work">See the work</a></div>
      </Section>
    </Shell>
  );
}
