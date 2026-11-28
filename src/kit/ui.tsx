import { useState, type ReactNode } from 'react';
import { PROJECTS } from '@/data/projects.js';
import { ago } from '@/data/github.js';
import { usePRs, useContributions, merged, safeUrl } from './live';
import { Arrow, SOCIAL, iconSrc } from './Shell';

// each project's own sticker (public/img/own, drawn in tools/stickers.py)
export const STICKER: Record<string, string> = { clause: 'contract', eeg: 'brain', sprout: 'sprout', forme: 'sparkle', flow: 'sunset', velora: 'forecast' };
export const sticker = (k: string) => `/img/own/${STICKER[k] ?? k}.svg`;

export function Section({ title, aside, note, side = 'r', pad, foot, children, id }: {
  title: ReactNode; aside?: ReactNode; note?: string; side?: 'l' | 'r'; pad?: boolean; foot?: ReactNode; children: ReactNode; id?: string;
}) {
  return (
    <section className="sec" id={id}>
      {note && (
        <p className={`note ${side}`} aria-hidden="true">
          {note}
          <svg viewBox="0 0 46 34"><path d="M40 3C42 14 34 26 8 28M8 28l7-6M8 28l7 5" /></svg>
        </p>
      )}
      <div className="sec-hd"><h2>{title}</h2>{aside && <span className="aside">{aside}</span>}</div>
      <div className={`sec-bd${pad ? ' pad' : ''}`}>{children}</div>
      {foot && <div className="sec-ft">{foot}</div>}
    </section>
  );
}

// the projects, filed by kind
const KINDS: [string, string, string[]][] = [
  ['Research', 'folder', ['clause', 'eeg']],
  ['Tools people install', 'folder', ['sprout', 'forme']],
  ['Products', 'folder', ['flow', 'velora']],
];
export function ProjectRows({ detail }: { detail?: boolean }) {
  return (
    <>
      {KINDS.map(([kind, icon, keys]) => (
        <div key={kind}>
          <div className="group"><img src={`/img/own/${icon}.svg`} alt="" /><span>{kind}</span></div>
          {keys.map((k) => {
            const p = PROJECTS.find((q) => q.k === k)!;
            return (
              <a key={k} className="row" href={`/project.html?p=${k}`}>
                <img src={sticker(k)} alt="" />
                <b>{p.name}</b>
                <span className="d">{p.tag}</span>
                <span className="k">{detail ? <><em>{p.stat}</em> {p.statLabel}</> : <em>{p.stat}</em>}</span>
                <Arrow />
              </a>
            );
          })}
        </div>
      ))}
    </>
  );
}

export function Socials() {
  const [copied, setCopied] = useState(false);
  return (
    <div className="grid2">
      {SOCIAL.map(([n, s, u, icon]) => n === 'Email'
        ? (
          <button key={n} className="cell" style={{ textAlign: 'left' }} onClick={() => { navigator.clipboard?.writeText('dasarimanas049@gmail.com'); setCopied(true); setTimeout(() => setCopied(false), 1600); }}>
            <span className="ic"><img src={`https://cdn.simpleicons.org/${icon}`} alt="" /></span>
            <span style={{ minWidth: 0 }}><span className="t">{n}{copied && <span className="badge ok">copied</span>}</span><span className="s">{s}</span></span>
          </button>
        )
        : (
          <a key={n} className="cell" href={u} target="_blank" rel="noopener">
            <span className="ic"><img className={icon.startsWith('/img/own') ? '' : 'mono'} src={iconSrc(icon)} alt="" /></span>
            <span style={{ minWidth: 0 }}><span className="t">{n}</span><span className="s">{s}</span></span>
          </a>
        ))}
    </div>
  );
}

const STACK: [string, [string, string, boolean?][]][] = [
  ['01  Models', [['Python', 'python'], ['PyTorch', 'pytorch'], ['Hugging Face', 'huggingface'], ['scikit-learn', 'scikitlearn'], ['NumPy', 'numpy'], ['Jupyter', 'jupyter']]],
  ['02  Tools & apps', [['TypeScript', 'typescript'], ['React', 'react'], ['Go', 'go'], ['Rust', 'rust', true], ['Supabase', 'supabase']]],
  ['03  Workflow', [['Git', 'git'], ['Docker', 'docker'], ['Linux', 'linux', true], ['KDE Plasma', 'kde'], ['Claude', 'claude']]],
];
export function Stack() {
  return (
    <>
      {STACK.map(([k, items]) => (
        <div className="kv" key={k}>
          <span>{k}</span>
          <div className="chips">{items.map(([n, icon, mono]) => <span className="chip" key={n}><img className={mono ? 'mono' : ''} src={`https://cdn.simpleicons.org/${icon}${mono ? '/17171a' : ''}`} alt="" />{n}</span>)}</div>
        </div>
      ))}
    </>
  );
}

const greeting = () => {
  const h = +new Date().toLocaleTimeString('en-GB', { timeZone: 'Asia/Kolkata', hour: '2-digit' });
  return h < 5 ? 'Up late?' : h < 12 ? 'Good morning!' : h < 17 ? 'Good afternoon!' : 'Good evening!';
};
export function Hello() {
  return (
    <section className="sec">
      <div className="hello">
        <div className="hello-top"><h2>{greeting()}</h2><img src="/img/own/sparkle.svg" alt="" /></div>
        <ul>
          <li><b>I train models, then try to break them</b> <img src="/img/own/brain.svg" alt="" /> splits by person or by contract, thresholds from validation only, every score next to chance.</li>
          <li><b>I ship the tools I need</b> <img src="/img/own/sprout.svg" alt="" /> Sprout maps a codebase for coding agents over MCP, and it’s on Homebrew.</li>
          <li><b>I send fixes upstream</b> <img src="/img/own/merge.svg" alt="" /> to editors, compilers and build tools, and the failed experiments get written up too.</li>
        </ul>
      </div>
    </section>
  );
}

// merges, live: a few to start with, the rest on request
export function Merges({ show = 4, all }: { show?: number; all?: boolean }) {
  const { items, failed } = usePRs();
  const [open, setOpen] = useState(false);
  if (failed) return <p className="sec-bd pad" style={{ margin: 0, color: 'var(--mute)' }}>GitHub didn’t answer just now. <a className="more" href="https://github.com/pulls?q=is%3Apr+author%3AManasDasri+-user%3AManasDasri" target="_blank" rel="noopener">See them on GitHub ↗</a></p>;
  if (!items) return <p className="sec-bd pad" style={{ margin: 0, color: 'var(--mute)' }}>Asking GitHub…</p>;
  const rows = all ? [...items.filter((p) => p.open), ...merged(items)] : merged(items);
  const list = open ? rows : rows.slice(0, show);
  return (
    <>
      {list.map((p) => (
        <a key={p.url} className="row" href={safeUrl(p.url)} target="_blank" rel="noopener">
          <img src={`https://github.com/${encodeURIComponent(p.repo.split('/')[0])}.png?size=48`} alt="" style={{ borderRadius: 6 }} />
          <b>{p.repo}</b>
          <span className="d">{p.title}</span>
          <span className="k">{p.merged ? <>merged <em>{ago(p.merged)}</em></> : <span className="badge wait">in review</span>}</span>
          <Arrow />
        </a>
      ))}
      {rows.length > show && (
        <div className="sec-ft"><button className="more" onClick={() => setOpen(!open)} aria-expanded={open}>{open ? 'Show fewer' : `View ${rows.length - show} more`} ↓</button></div>
      )}
    </>
  );
}

export function ProofStats() {
  const { items } = usePRs();
  const m = items ? merged(items) : [];
  const n = (v: number) => (items ? v : '–');
  return (
    <div className="stats">
      <div className="stat"><small>Merged</small><b>{n(m.length)}</b></div>
      <div className="stat"><small>In review</small><b>{n(items?.filter((p) => p.open).length ?? 0)}</b></div>
      <div className="stat"><small>Projects</small><b>{n(new Set(m.map((p) => p.repo)).size)}</b></div>
      <div className="stat"><small>Last merge</small><b style={{ fontSize: 17 }}>{m[0] ? ago(m[0].merged!) : '–'}</b></div>
    </div>
  );
}

export function YearGraph() {
  const days = useContributions();
  const total = days?.reduce((s, d) => s + d.count, 0);
  const fmt = (s: string) => new Date(`${s}T00:00:00`).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
  const pad = days?.length ? new Date(`${days[0].date}T00:00:00`).getDay() : 0;
  return (
    <>
      <div className="graph">
        <div className="graph-grid">
          {Array.from({ length: pad }, (_, i) => <i key={`p${i}`} style={{ visibility: 'hidden' }} />)}
          {(days ?? []).map((d) => <i key={d.date} data-l={d.level} title={`${d.count} contribution${d.count === 1 ? '' : 's'} on ${fmt(d.date)}`} />)}
        </div>
      </div>
      <div className="graph-key"><span>{days ? (days.length ? `${total} contributions in the last year` : 'GitHub didn’t answer just now') : 'Loading…'}</span><span>Less ▫ ▪ ■ More</span></div>
    </>
  );
}
