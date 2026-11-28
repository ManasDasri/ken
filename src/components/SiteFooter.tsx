import { useEffect, useRef, useState } from 'react';
import { animate, stagger } from 'animejs';
import { githubPRs, ago } from '@/legacy/github.js';
import './footer.css';

const PAGES = [['index', 'Home'], ['work', 'Work'], ['services', 'What I do'], ['about', 'About'], ['opensource', 'Open source'], ['contact', 'Contact']];
const ELSEWHERE = [['GitHub', 'https://github.com/ManasDasri'], ['LinkedIn', 'https://www.linkedin.com/in/manas-dasari-2a52163a5/'], ['X', 'https://x.com/ManasDmg9'], ['LeetCode', 'https://leetcode.com/u/ManasDasari/']];
const NAME = 'MANAS DASARI';
const ist = () => new Date().toLocaleTimeString('en-GB', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit' });
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

export default function SiteFooter() {
  const mark = useRef<HTMLDivElement>(null);
  const [time, setTime] = useState(ist);
  const [merge, setMerge] = useState<{ url: string; label: string; title: string; when: string } | null>(null);
  const here = location.pathname.split('/').pop()?.replace(/\.html$/, '') || 'index';

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
  // the name rises out of the floor, letter by letter
  useEffect(() => {
    const chars = mark.current!.querySelectorAll('span');
    if (reduce) return;
    chars.forEach((c) => (c.style.transform = 'translateY(100%)'));
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      animate(chars, { y: ['100%', '0%'], duration: 1400, ease: 'outExpo', delay: stagger(55) });
    }, { threshold: 0.3 });
    io.observe(mark.current!);
    return () => io.disconnect();
  }, []);

  return (
    <footer className="ft">
      <div className="ft-call">
        <p className="ft-k">What’s next</p>
        <a className="ft-big" href="mailto:dasarimanas049@gmail.com">Let’s build something<br />that holds up.<span aria-hidden="true">↗</span></a>
      </div>

      <div className="ft-grid">
        <nav aria-label="Pages"><p className="ft-k">Pages</p>{PAGES.map(([f, n]) => <a key={f} href={`/${f}.html`} {...(f === here ? { 'aria-current': 'page' as const } : {})}>{n}</a>)}</nav>
        <nav aria-label="Elsewhere"><p className="ft-k">Elsewhere</p>{ELSEWHERE.map(([n, u]) => <a key={n} href={u} target="_blank" rel="noopener">{n} <i>↗</i></a>)}</nav>
        <div><p className="ft-k">Write</p><a href="mailto:dasarimanas049@gmail.com">dasarimanas049@gmail.com</a><a href="/resume.pdf" target="_blank" rel="noopener">Résumé, PDF <i>↗</i></a><a href="/contact.html">Book a call</a></div>
        <div>
          <p className="ft-k">Now</p>
          <p className="ft-now"><b className="ft-dot" />Open to internships</p>
          <p>{time} in Bengaluru</p>
          {merge && <p>Last merge <a href={merge.url} target="_blank" rel="noopener" title={merge.title}>{merge.label}</a>, {merge.when}</p>}
        </div>
      </div>

      <div className="ft-mark" ref={mark} aria-hidden="true">
        {[...NAME].map((c, i) => <span key={i}>{c === ' ' ? ' ' : c}</span>)}
      </div>

      <div className="ft-base">
        <span>© 2026 Manas Dasari</span>
        <span>ML research &amp; developer tools</span>
        <button type="button" onClick={() => scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' })}>Back to top ↑</button>
      </div>
    </footer>
  );
}
