import { useEffect, useState } from 'react';
import { githubPRs, ago } from '@/legacy/github.js';
import './footer.css';

const PAGES = [['index', 'Home'], ['work', 'Work'], ['services', 'What I do'], ['about', 'About'], ['opensource', 'Open source'], ['contact', 'Contact']];
const SOCIAL: [string, string, string][] = [
  ['GitHub', 'https://github.com/ManasDasri', 'M8 1.5a6.5 6.5 0 0 0-2.06 12.67c.33.06.44-.14.44-.31v-1.1c-1.8.39-2.18-.87-2.18-.87-.3-.75-.72-.95-.72-.95-.59-.4.04-.4.04-.4.65.05 1 .67 1 .67.58 1 1.52.71 1.9.54.05-.42.22-.71.41-.87-1.44-.16-2.95-.72-2.95-3.2 0-.7.25-1.28.67-1.73-.07-.17-.29-.83.06-1.72 0 0 .55-.18 1.79.66a6.2 6.2 0 0 1 3.26 0c1.24-.84 1.78-.66 1.78-.66.36.9.13 1.55.07 1.72.42.45.66 1.02.66 1.73 0 2.49-1.51 3.04-2.95 3.2.23.2.44.6.44 1.2v1.78c0 .17.11.38.45.31A6.5 6.5 0 0 0 8 1.5Z'],
  ['LinkedIn', 'https://www.linkedin.com/in/manas-dasari-2a52163a5/', 'M3 6h2v7H3zM4 2.8a1.2 1.2 0 1 1 0 2.4 1.2 1.2 0 0 1 0-2.4ZM7 6h2v1c.4-.7 1.2-1.2 2.3-1.2 2 0 2.7 1.2 2.7 3.2v4h-2V9.4c0-1-.3-1.6-1.2-1.6S9 8.5 9 9.5V13H7z'],
  ['X', 'https://x.com/ManasDmg9', 'M2.5 2.5h3l2.7 3.8 3.2-3.8h1.3L8.8 7l4.7 6.5h-3L7.6 9.6 4.3 13.5H3l4-4.7z'],
  ['LeetCode', 'https://leetcode.com/u/ManasDasari/', 'M10.5 12.3 8 14.6a1.9 1.9 0 0 1-2.6 0L2.8 12a1.9 1.9 0 0 1 0-2.6l4.6-4.8a1.9 1.9 0 0 1 2.6 0l1.6 1.6M5.5 9.5h7'],
];
const ist = () => new Date().toLocaleTimeString('en-GB', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit' });
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

// The footer: who I am and where to find me, over a soft, grainy landscape.
export default function SiteFooter() {
  const [time, setTime] = useState(ist);
  const [merge, setMerge] = useState<{ url: string; label: string; title: string; when: string } | null>(null);
  const here = (location.pathname.split('/').pop()?.replace(/\.html$/, '') || 'index').replace(/^project$/, 'work');

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

  return (
    <footer className="ft">
      <div className="ft-top">
        <div className="ft-brand">
          <a className="ft-name" href="/index.html"><img src="/img/brand/logo.png" alt="" />Manas Dasari</a>
          <p>ML research and developer tools. Models checked against chance, tools people install, fixes sent upstream.</p>
          <div className="ft-social">
            {SOCIAL.map(([n, u, d]) => (
              <a key={n} href={u} target="_blank" rel="noopener" aria-label={n} title={n}>
                <svg viewBox="0 0 16 16" aria-hidden="true"><path d={d} /></svg>
              </a>
            ))}
          </div>
        </div>
        <nav aria-label="Pages"><p className="ft-k">Pages</p>{PAGES.map(([f, n]) => <a key={f} href={`/${f}.html`} {...(f === here ? { 'aria-current': 'page' as const } : {})}>{n}</a>)}</nav>
        <div><p className="ft-k">Write</p><a href="mailto:dasarimanas049@gmail.com">Email me</a><a href="/resume.pdf" target="_blank" rel="noopener">Résumé</a><a href="/contact.html">Book a call</a></div>
        <div>
          <p className="ft-k">Now</p>
          <p className="ft-now"><b className="ft-dot" />Open to internships</p>
          <p>{time} in Bengaluru</p>
          {merge && <p>Last merge <a href={merge.url} target="_blank" rel="noopener" title={merge.title}>{merge.label}</a>, {merge.when}</p>}
        </div>
      </div>
      <div className="ft-base">
        <span>© 2026 Manas Dasari</span>
        <button type="button" onClick={() => scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' })}>Back to top ↑</button>
      </div>

      {/* soft hills of colour, blurred, under heavy grain */}
      <svg className="ft-land" viewBox="0 0 1600 420" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
        <defs>
          <filter id="ft-soft" x="-10%" y="-30%" width="120%" height="160%"><feGaussianBlur stdDeviation="14" /></filter>
          <linearGradient id="ft-a" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#f3a6c8" /><stop offset="1" stopColor="#8a7be0" /></linearGradient>
          <linearGradient id="ft-b" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#6f6cd6" /><stop offset="1" stopColor="#b9a8ec" /></linearGradient>
          <linearGradient id="ft-c" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#8f9a52" /><stop offset="0.5" stopColor="#d6cf72" /><stop offset="1" stopColor="#7d8a4c" /></linearGradient>
          <linearGradient id="ft-d" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#ef6a3c" /><stop offset="1" stopColor="#c7362a" /></linearGradient>
          <linearGradient id="ft-e" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#9c4527" /><stop offset="1" stopColor="#5e2516" /></linearGradient>
        </defs>
        <g filter="url(#ft-soft)">
          <path className="ft-h1" fill="url(#ft-a)" d="M-100 260 C 150 200 330 110 560 120 C 760 130 900 210 1100 190 C 1300 170 1450 120 1700 150 L 1700 420 L -100 420 Z" />
          <path className="ft-h2" fill="url(#ft-b)" d="M500 260 C 750 190 980 150 1200 160 C 1420 170 1560 210 1700 220 L 1700 420 L 500 420 Z" />
          <path className="ft-h3" fill="url(#ft-c)" d="M-100 330 C 250 270 520 250 800 270 C 1050 290 1250 330 1700 300 L 1700 420 L -100 420 Z" />
          <path className="ft-h4" fill="url(#ft-d)" d="M-100 330 C 120 300 300 320 520 360 C 760 400 1000 360 1250 350 C 1450 342 1580 360 1700 370 L 1700 420 L -100 420 Z" />
          <path className="ft-h5" fill="url(#ft-e)" d="M-100 395 C 300 370 700 400 1000 405 C 1300 410 1500 390 1700 395 L 1700 440 L -100 440 Z" />
        </g>
      </svg>
    </footer>
  );
}
