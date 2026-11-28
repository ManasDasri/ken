import { useEffect, useRef, useState } from 'react';
import { swimKoi } from './koi.js';
import { githubPRs, ago } from '@/legacy/github.js';
import './pond.css';

// The footer is a koi pond: the fish swim under lily pads, and every pad is a link.
const PADS: [string, string, string, number, number, number][] = [
  // label, small print, href, left %, top %, size px
  ['GitHub', 'ManasDasri', 'https://github.com/ManasDasri', 10, 62, 132],
  ['LinkedIn', 'in/manas-dasari', 'https://www.linkedin.com/in/manas-dasari-2a52163a5/', 27, 80, 118],
  ['Résumé', 'one page, PDF', '/resume.pdf', 46, 58, 140],
  ['X', '@ManasDmg9', 'https://x.com/ManasDmg9', 62, 80, 104],
  ['LeetCode', 'ManasDasari', 'https://leetcode.com/u/ManasDasari/', 76, 50, 120],
  ['Email', 'dasarimanas049', 'mailto:dasarimanas049@gmail.com', 90, 76, 112],
];
const PAGES = [['index', 'Home'], ['work', 'Work'], ['services', 'What I do'], ['about', 'About'], ['opensource', 'Open source'], ['contact', 'Contact']];

const ist = () => new Date().toLocaleTimeString('en-GB', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit' });

export default function KoiPond() {
  const water = useRef<HTMLDivElement>(null);
  const [time, setTime] = useState(ist);
  const [merge, setMerge] = useState<{ url: string; label: string; title: string; when: string } | null>(null);
  const [rings, setRings] = useState<{ id: number; x: number; y: number }[]>([]);

  useEffect(() => swimKoi(water.current!), []);
  useEffect(() => {
    const t = setInterval(() => setTime(ist()), 15000);
    return () => clearInterval(t);
  }, []);
  // the last thing of mine that got merged somewhere, live from GitHub
  useEffect(() => {
    githubPRs().then((items: { merged: string; url: string; repo: string; n: number; title: string }[]) => {
      const last = items.filter((p) => p.merged).sort((a, b) => Date.parse(b.merged) - Date.parse(a.merged))[0];
      if (last && /^https:\/\/github\.com\//.test(last.url)) setMerge({ url: last.url, label: `${last.repo} #${last.n}`, title: last.title, when: ago(last.merged) });
    }).catch(() => {});
  }, []);

  // a ripple wherever the water is touched (the fish come for the food)
  const ripple = (x: number, y: number) => {
    const id = performance.now() + Math.random();
    setRings((r) => [...r.slice(-8), { id, x, y }]);
    setTimeout(() => setRings((r) => r.filter((q) => q.id !== id)), 1600);
  };
  const here = location.pathname.split('/').pop()?.replace(/\.html$/, '') || 'index';

  return (
    <footer className="pond">
      <div
        className="pond-water"
        ref={water}
        onClick={(e) => {
          if ((e.target as HTMLElement).closest('a, button')) return;
          const r = e.currentTarget.getBoundingClientRect();
          ripple(e.clientX - r.left, e.clientY - r.top);
        }}
      >
        <div className="pond-light" aria-hidden="true" />
        <div className="pond-head">
          <p className="pond-name">Manas Dasari</p>
          <p className="pond-line">You made it to the pond. The koi are hungry: click the water.</p>
        </div>

        {PADS.map(([label, small, href, left, top, size], i) => (
          <a
            key={label}
            className="pad"
            href={href}
            {...(href.startsWith('http') || href.endsWith('.pdf') ? { target: '_blank', rel: 'noopener' } : {})}
            style={{ '--x': `${left}%`, '--y': `${top}%`, '--mx': `${i % 2 ? 72 : 28}%`, '--my': `${46 + Math.floor(i / 2) * 18}%`, width: size, height: size, '--spin': `${i * 57}deg`, '--bob': `${5 + (i % 3)}s` } as React.CSSProperties}
            onPointerEnter={(e) => {
              const r = water.current!.getBoundingClientRect(), p = e.currentTarget.getBoundingClientRect();
              ripple(p.left + p.width / 2 - r.left, p.top + p.height / 2 - r.top);
            }}
          >
            <span className="pad-leaf" aria-hidden="true" />
            <span className="pad-text"><b>{label}</b><small>{small}</small></span>
          </a>
        ))}

        {rings.map((r) => <i key={r.id} className="ring" style={{ left: r.x, top: r.y }} aria-hidden="true" />)}
      </div>

      <div className="pond-bank">
        <nav aria-label="Pages">
          {PAGES.map(([f, n]) => <a key={f} href={`/${f}.html`} {...(f === here ? { 'aria-current': 'page' as const } : {})}>{n}</a>)}
        </nav>
        <p>
          <span>© 2026 Manas Dasari</span>
          <span>my time <b>{time}</b> IST</span>
          {merge && <span>latest merge <a href={merge.url} target="_blank" rel="noopener" title={merge.title}>{merge.label}</a> {merge.when}</span>}        </p>
        <button type="button" onClick={() => scrollTo({ top: 0, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' })}>Back to top ↑</button>
      </div>
    </footer>
  );
}
