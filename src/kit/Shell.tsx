import { useEffect, useRef, useState, type ReactNode } from 'react';
import { contributions, usePRs, merged, safeUrl, type Day } from './live';
import { ago } from '@/data/github.js';
import './kit.css';
import './footer.css';
import Rail from './Rail';

export const PAGES = [['index', 'Home'], ['work', 'Work'], ['services', 'What I do'], ['about', 'About'], ['opensource', 'Open source'], ['contact', 'Contact']] as const;
export const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
export const Arrow = () => <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M5 11 11 5M6 5h5v5" /></svg>;
const GH = 'M8 1.5a6.5 6.5 0 0 0-2.06 12.67c.33.06.44-.14.44-.31v-1.1c-1.8.39-2.18-.87-2.18-.87-.3-.75-.72-.95-.72-.95-.59-.4.04-.4.04-.4.65.05 1 .67 1 .67.58 1 1.52.71 1.9.54.05-.42.22-.71.41-.87-1.44-.16-2.95-.72-2.95-3.2 0-.7.25-1.28.67-1.73-.07-.17-.29-.83.06-1.72 0 0 .55-.18 1.79.66a6.2 6.2 0 0 1 3.26 0c1.24-.84 1.78-.66 1.78-.66.36.9.13 1.55.07 1.72.42.45.66 1.02.66 1.73 0 2.49-1.51 3.04-2.95 3.2.23.2.44.6.44 1.2v1.78c0 .17.11.38.45.31A6.5 6.5 0 0 0 8 1.5Z';

// Every page: the live banner and the pills, a narrow ruled column, and the footer.
export default function Shell({ page, children }: { page: string; children: ReactNode }) {
  return (
    <div className="col">
      <Rail />
      <Bursts />
      <Header page={page} />
      <main>{children}</main>
      <Footer page={page} />
    </div>
  );
}

// click any of my stickers and a few more burst out of it
function Bursts() {
  useEffect(() => {
    if (reduce) return;
    const click = (e: MouseEvent) => {
      const img = (e.target as HTMLElement).closest?.('img');
      if (!img || !img.src.includes('/img/own/') || img.closest('a, button')) return;
      const r = img.getBoundingClientRect();
      for (let i = 0; i < 8; i++) {
        const b = document.createElement('img');
        b.src = img.src; b.className = 'burst'; b.alt = '';
        const a = (i / 8) * Math.PI * 2 + Math.random() * 0.6, d = 60 + Math.random() * 70;
        b.style.cssText = `left:${r.left + r.width / 2}px;top:${r.top + r.height / 2}px;--dx:${Math.cos(a) * d}px;--dy:${Math.sin(a) * d - 30}px;--r:${(Math.random() - 0.5) * 120}deg;--s:${0.35 + Math.random() * 0.35}`;
        document.body.append(b);
        setTimeout(() => b.remove(), 900);
      }
    };
    addEventListener('click', click);
    return () => removeEventListener('click', click);
  }, []);
  return null;
}

function Header({ page }: { page: string }) {
  const { items } = usePRs();
  const [dark, setDark] = useState(() => document.documentElement.dataset.theme === 'dark');
  const flip = () => {
    const next = dark ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    try { localStorage.setItem('theme', next); } catch {}
    setDark(!dark);
  };
  return (
    <header className="hd">
      <Banner />
      <nav className="nav" aria-label="Pages">
        <a className="nav-logo" href="/index.html" aria-label="Home"><img className="logo" src="/img/brand/logo.png" alt="" /></a>
        {PAGES.slice(1).map(([f, n]) => <a key={f} className="pill" href={`/${f}.html`} {...(f === page ? { 'aria-current': 'page' as const } : {})}>{n}</a>)}
        <span className="nav-end">
          <a className="pill" href="/opensource.html" title="Pull requests merged into other people's projects">
            <svg viewBox="0 0 16 16" aria-hidden="true"><path className="gh" d={GH} /></svg>{items ? merged(items).length : '·'}
          </a>
          <button className="pill icon" onClick={flip} aria-label={`Switch to ${dark ? 'light' : 'dark'} mode`}>
            {dark
              ? <svg viewBox="0 0 16 16"><circle cx="8" cy="8" r="3" /><path d="M8 1v1.5M8 13.5V15M1 8h1.5M13.5 8H15M3 3l1 1M12 12l1 1M3 13l1-1M12 4l1-1" /></svg>
              : <svg viewBox="0 0 16 16"><path d="M13.5 9.5A5.5 5.5 0 0 1 6.5 2.5a5.5 5.5 0 1 0 7 7z" /></svg>}
          </button>
        </span>
      </nav>
    </header>
  );
}

// The banner is my last year on GitHub: each day drips down from the top, further the busier it was,
// in dithered dots. The busiest tips glow orange. Hover for the day.
function Banner() {
  const cv = useRef<HTMLCanvasElement>(null), tip = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const c = cv.current!, g = c.getContext('2d')!;
    const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5].map((v) => (v + 0.5) / 16);
    let data: Day[] = [], cols: { v: number; from: string; to: string; sum: number }[] = [];
    const CELL = 5;
    const draw = () => {
      const W = c.clientWidth, H = c.clientHeight, dpr = Math.min(devicePixelRatio || 1, 2);
      c.width = W * dpr; c.height = H * dpr; g.setTransform(dpr, 0, 0, dpr, 0, 0); g.clearRect(0, 0, W, H);
      const dark = document.documentElement.dataset.theme === 'dark';
      const n = Math.floor(W / CELL);
      // before GitHub answers, a quiet placeholder skyline so the banner is never empty
      const days = data.length ? data : Array.from({ length: 365 }, (_, i) => ({ date: '', count: Math.max(0, Math.round(3 + 3 * Math.sin(i / 9) + 2 * Math.sin(i / 3.7))), level: 0 }));
      cols = Array.from({ length: n }, (_, x) => {
        const a = Math.floor((x / n) * days.length), b = Math.max(a + 1, Math.floor(((x + 1) / n) * days.length));
        const seg = days.slice(a, b), sum = seg.reduce((s, d) => s + d.count, 0);
        return { v: Math.max(...seg.map((d) => d.count)), from: seg[0].date, to: seg[seg.length - 1].date, sum };
      });
      const top = [...cols].map((q) => q.v).sort((p, q) => q - p)[Math.floor(n * 0.06)] || 1;
      for (let x = 0; x < n; x++) {
        // a little of each neighbour, so the edge drips rather than steps
        const v = (cols[x].v * 2 + (cols[x - 1]?.v ?? 0) + (cols[x + 1]?.v ?? 0)) / 4;
        const jag = ((Math.sin(x * 12.9898) * 43758.5453) % 1 + 1) % 1;
        const L = Math.min(H * 0.98, 18 + Math.sqrt(v) * 26 + jag * 14);
        const hot = cols[x].v >= top && data.length;
        for (let y = 0; y < L; y += CELL) {
          const k = y / L; // 0 at the top, 1 at the tip
          if (1 - k * k < BAYER[(x % 4) + ((y / CELL) % 4) * 4]) continue;
          g.fillStyle = hot && k > 0.62 ? (dark ? '#fb923c' : '#f05a28') : k < 0.35 ? (dark ? '#3b6fd8' : '#1e3a8a') : (dark ? '#60a5fa' : '#2563eb');
          g.fillRect(x * CELL + 1, y + 1, CELL - 2, CELL - 2);
        }
      }
    };
    contributions().then((d) => { data = d; draw(); }).catch(() => {});
    draw();
    const ro = new ResizeObserver(draw); ro.observe(c);
    const mo = new MutationObserver(draw); mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    const fmt = (s: string) => new Date(`${s}T00:00:00`).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
    const move = (e: PointerEvent) => {
      const r = c.getBoundingClientRect(), x = Math.floor((e.clientX - r.left) / CELL), q = cols[x], t = tip.current!;
      if (!q || !data.length || (e.target as HTMLElement).closest('.nav')) { t.style.opacity = '0'; return; }
      t.textContent = `${fmt(q.from)}${q.to !== q.from ? `–${fmt(q.to)}` : ''} · ${q.sum} contribution${q.sum === 1 ? '' : 's'}`;
      t.style.left = `${e.clientX - r.left}px`; t.style.top = `${e.clientY - r.top}px`; t.style.opacity = '1';
    };
    const hd = c.parentElement!;
    hd.addEventListener('pointermove', move);
    hd.addEventListener('pointerleave', () => (tip.current!.style.opacity = '0'));
    return () => { ro.disconnect(); mo.disconnect(); hd.removeEventListener('pointermove', move); };
  }, []);
  return <><canvas ref={cv} aria-hidden="true" /><span className="hd-tip" ref={tip} aria-hidden="true" /></>;
}

export const SOCIAL: [string, string, string, string, string][] = [
  // name, handle, link, icon (Simple Icons slug or a local file), brand colour ('mono' follows the theme)
  ['GitHub', '@ManasDasri', 'https://github.com/ManasDasri', 'github', 'mono'],
  ['X (Twitter)', '@ManasDmg9', 'https://x.com/ManasDmg9', 'x', 'mono'],
  ['LinkedIn', 'in/manas-dasari', 'https://www.linkedin.com/in/manas-dasari-2a52163a5/', '/img/icons/linkedin.svg', '#0a66c2'],
  ['LeetCode', 'ManasDasari', 'https://leetcode.com/u/ManasDasari/', 'leetcode', '#ffa116'],
  ['Email', 'dasarimanas049@gmail.com', 'mailto:dasarimanas049@gmail.com', 'gmail', '#ea4335'],
  ['Résumé', 'one page, PDF', '/resume.pdf', '/img/own/contract.svg', '#e2574c'],
];
export const iconSrc = (icon: string, colour = 'mono') => (icon.startsWith('/') ? icon : `https://cdn.simpleicons.org/${icon}${colour === 'mono' ? '/17171a' : `/${colour.slice(1)}`}`);
const ist = () => new Date().toLocaleTimeString('en-GB', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit' });

function Footer({ page }: { page: string }) {
  const { items } = usePRs();
  const [time, setTime] = useState(ist);
  useEffect(() => { const t = setInterval(() => setTime(ist()), 15000); return () => clearInterval(t); }, []);
  const last = items ? merged(items)[0] : null;
  return (
    <footer className="ft">
      <div className="quote">
        <p>Show your work.<br />Ship the tool. Report the nulls.</p>
        <small>a rule I keep</small>
      </div>
      <div className="ft-top">
        <div className="ft-brand">
          <a className="ft-name" href="/index.html"><img className="logo" src="/img/brand/logo.png" alt="" />Manas Dasari</a>
          <p>ML research and developer tools, from Bengaluru.</p>
          <div className="ft-social">
            {SOCIAL.slice(0, 4).map(([n, , u, icon, colour]) => (
              <a key={n} href={u} target="_blank" rel="noopener" aria-label={n} title={n} style={{ '--bc': colour === 'mono' ? 'var(--ink)' : colour } as React.CSSProperties}><img className={colour === 'mono' ? 'mono' : ''} src={iconSrc(icon, colour)} alt="" /></a>
            ))}
          </div>
        </div>
        <nav aria-label="Pages"><p className="ft-k">Pages</p>{PAGES.map(([f, n]) => <a key={f} href={`/${f}.html`} {...(f === page ? { 'aria-current': 'page' as const } : {})}>{n}</a>)}</nav>
        <div>
          <p className="ft-k">Now</p>
          <p className="ft-now"><b className="ft-dot" />Open to internships</p>
          <p>{time} in Bengaluru</p>
          {last && <p>Last merge <a href={safeUrl(last.url)} target="_blank" rel="noopener" title={last.title}>{last.repo.split('/')[1]} #{last.n}</a>, {ago(last.merged)}</p>}
        </div>
      </div>
      <div className="ft-base">
        <span>© 2026 Manas Dasari</span>
        <button type="button" onClick={() => scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' })}>Back to top ↑</button>
      </div>
      <Hills />
    </footer>
  );
}

// soft hills of colour, blurred, under heavy grain
function Hills() {
  return (
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
  );
}
