import { useEffect, useRef, useState, type ReactNode } from 'react';
import { usePeek } from './Peek';
import { PROJECTS } from '@/data/projects.js';
import { ago } from '@/data/github.js';
import { usePRs, useContributions, merged, safeUrl } from './live';
import { Arrow, SOCIAL, iconSrc } from './Shell';

// each project's own sticker (public/img/own, drawn in tools/stickers.py)
export const STICKER: Record<string, string> = { clause: 'contract', eeg: 'brain', sprout: 'sprout', forme: 'sparkle', flow: 'sunset', velora: 'forecast' };
export const sticker = (k: string) => `/img/own/${STICKER[k] ?? k}.svg`;

export function Section({ title, aside, note, side = 'r', pad, foot, children, id, rail }: {
  title: ReactNode; aside?: ReactNode; note?: string; side?: 'l' | 'r'; pad?: boolean; foot?: ReactNode; children: ReactNode; id?: string; rail?: string;
}) {
  return (
    <section className="sec" id={id} data-rail={rail ?? (typeof title === 'string' ? title : undefined)}>
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

// the projects, filed by kind. A click opens the live site; the small button beside it opens the code.
const KINDS: [string, string[]][] = [
  ['Research', ['clause', 'eeg']],
  ['Tools people install', ['sprout', 'forme']],
  ['Products', ['flow', 'velora']],
];
const BENCH = [
  ['Gradient Works', 'My applied AI studio: models for teams, with a baseline to beat and a written result.', 'https://gradientworksai.in/', 'studio'],
  ['Analogue Risk', 'Forecasting market risk from historical analogues, re-tested on 15 new assets.', 'https://github.com/ManasDasri/analogue-risk', 'in research'],
  ['Atmos', 'Placing a cheaper, denser air-quality sensor network for Bengaluru.', 'https://github.com/ManasDasri/Atmos', 'code'],
];
const Code = () => <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M5.5 4 2 8l3.5 4M10.5 4 14 8l-3.5 4" /></svg>;
export function ProjectRows() {
  const { bind, card } = usePeek();
  return (
    <>
      {card}
      {KINDS.map(([kind, keys]) => (
        <div key={kind}>
          <div className="group"><img src="/img/own/folder.svg" alt="" /><span>{kind}</span></div>
          <div className="tree">
            {keys.map((k) => {
              const p = PROJECTS.find((q) => q.k === k)!;
              return (
                <div key={k} className="row" {...bind({ img: p.img, title: p.name, meta: `${p.stat} · ${p.statLabel}` })}>
                  <a className="row-main" href={p.site} target="_blank" rel="noopener"><b>{p.name}</b></a>
                  <span className="d">{p.tag}</span>
                  <span className="k"><em>{p.stat}</em></span>
                  <a className="row-code" href={`https://github.com/${p.repo}`} target="_blank" rel="noopener" aria-label={`${p.name} source code`} title="Code"><Code /></a>
                </div>
              );
            })}
          </div>
        </div>
      ))}
      <div className="group"><img src="/img/own/folder.svg" alt="" /><span>Also on the bench</span></div>
      <div className="tree">
        {BENCH.map(([n, d, u, k]) => (
          <div key={n} className="row">
            <a className="row-main" href={u} target="_blank" rel="noopener"><b>{n}</b></a>
            <span className="d">{d}</span><span className="k">{k}</span><Arrow />
          </div>
        ))}
      </div>
    </>
  );
}

export function Socials() {
  const [copied, setCopied] = useState(false);
  return (
    <div className="grid2">
      {SOCIAL.map(([n, sub, u, icon, colour]) => {
        const inner = (
          <>
            <span className="ic"><img className={colour === 'mono' ? 'mono' : ''} src={iconSrc(icon, colour)} alt="" /></span>
            <span style={{ minWidth: 0, flex: 1 }}><span className="t">{n}{n === 'Email' && copied && <span className="badge ok">copied</span>}</span><span className="s">{sub}</span></span>
            <span className="go" aria-hidden="true">{n === 'Email' ? '⧉' : '↗'}</span>
          </>
        );
        const style = { '--bc': colour === 'mono' ? 'var(--ink)' : colour } as React.CSSProperties;
        return n === 'Email'
          ? <button key={n} className="cell soc" style={{ ...style, textAlign: 'left' }} onClick={() => { navigator.clipboard?.writeText('dasarimanas049@gmail.com'); setCopied(true); setTimeout(() => setCopied(false), 1600); }}>{inner}</button>
          : <a key={n} className="cell soc" style={style} href={u} target="_blank" rel="noopener">{inner}</a>;
      })}
    </div>
  );
}

const STACK: [string, [string, string, boolean?][]][] = [
  ['01  Models', [['Python', 'python'], ['PyTorch', 'pytorch'], ['Hugging Face', 'huggingface'], ['scikit-learn', 'scikitlearn'], ['NumPy', 'numpy', true], ['Jupyter', 'jupyter']]],
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
    <section className="sec" data-rail="Hello">
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

// a number that counts up to itself the first time it's on screen
function Count({ to }: { to: number }) {
  const el = useRef<HTMLSpanElement>(null);
  const [v, setV] = useState(0);
  useEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) { setV(to); return; }
    let raf = 0;
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      const t0 = performance.now();
      const step = (t: number) => { const k = Math.min(1, (t - t0) / 1200); setV(Math.round(to * (1 - (1 - k) ** 3))); if (k < 1) raf = requestAnimationFrame(step); };
      raf = requestAnimationFrame(step);
    });
    io.observe(el.current!);
    return () => { io.disconnect(); cancelAnimationFrame(raf); };
  }, [to]);
  return <span ref={el}>{v}</span>;
}

export function ProofStats() {
  const { items } = usePRs();
  const m = items ? merged(items) : [];
  const n = (v: number) => (items ? <Count to={v} /> : '–');
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
