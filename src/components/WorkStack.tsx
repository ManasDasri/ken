import { useEffect, useRef, useState } from 'react';
import { PROJECTS } from '@/legacy/cards.js';
import './stack.css';

const N = PROJECTS.length;
const STEP = 0.62; // screen heights of scrolling per project
const pad = (n: number) => String(n + 1).padStart(2, '0');

// The work page: every project's site, stacked in depth. Scrolling brings each one forward and flat;
// the one in front opens its project page, the others scroll themselves into place when clicked.
export default function WorkStack() {
  const wrap = useRef<HTMLDivElement>(null);
  const cards = useRef<(HTMLAnchorElement | null)[]>([]);
  const cursor = useRef<HTMLDivElement>(null);
  const [focus, setFocus] = useState(0);

  useEffect(() => {
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    let shown = 0, raf = 0, last = -1;
    const target = () => {
      const r = wrap.current!.getBoundingClientRect();
      return Math.min(N - 1, Math.max(0, -r.top / (innerHeight * STEP)));
    };
    const place = () => {
      // scrolling flips whole pages: the stack eases to the nearest project, so the front card always lands flat
      const t = Math.round(target());
      shown = reduce ? t : shown + (t - shown) * 0.14;
      cards.current.forEach((el, i) => {
        if (!el) return;
        const o = i - shown, a = Math.abs(o), s = Math.sign(o);
        const near = Math.min(a, 1), far = Math.max(a - 1, 0);
        // the front card lies flat; the rest tip over into thin slats, stacked edge to edge above and below
        const y = s * (near * 69 + Math.min(far, 5) * 27); // % of the card's height
        const rx = -s * near * 72;
        const sc = 1 - near * 0.05 - Math.min(far, 5) * 0.03;
        el.style.transform = `translate(-50%, calc(-50% + ${y.toFixed(2)}%)) perspective(1400px) rotateX(${rx.toFixed(2)}deg) scale(${sc.toFixed(3)})`;
        el.style.zIndex = String(100 - Math.round(a * 10));
        el.style.opacity = String(Math.max(0, 1 - Math.max(0, a - 3.2)));
        el.style.filter = `brightness(${(1 - near * 0.12).toFixed(3)}) saturate(${(1 - near * 0.35).toFixed(3)})`;
      });
      const f = Math.round(shown);
      if (f !== last) { last = f; setFocus(f); }
      raf = Math.abs(t - shown) > 0.001 ? requestAnimationFrame(place) : 0;
    };
    const kick = () => { if (!raf) raf = requestAnimationFrame(place); };
    place();
    addEventListener('scroll', kick, { passive: true });
    addEventListener('resize', kick);
    return () => { removeEventListener('scroll', kick); removeEventListener('resize', kick); cancelAnimationFrame(raf); };
  }, []);

  // the round "view project" cursor, over the card in front
  const move = (e: React.PointerEvent) => {
    const c = cursor.current!;
    c.style.translate = `${e.clientX}px ${e.clientY}px`;
    c.classList.toggle('show', !!(e.target as HTMLElement).closest('.stk-card.on'));
  };
  const go = (i: number, e: React.MouseEvent) => {
    if (i === focus) return; // the front card opens its page
    e.preventDefault();
    const top = wrap.current!.getBoundingClientRect().top + scrollY + i * innerHeight * STEP + 2;
    scrollTo({ top, behavior: 'smooth' });
  };
  const p = PROJECTS[focus];

  return (
    <section className="stk-wrap" ref={wrap} style={{ height: `calc(${(N - 1) * STEP * 100}vh + 100vh)` }}>
      <div className="stk-stage" onPointerMove={move} onPointerLeave={() => cursor.current!.classList.remove('show')}>
        <div className="stk-side stk-l">
          <p className="stk-count">{pad(focus)}<span>/{pad(N - 1)}</span></p>
          <p className="stk-kind">{p.kind}</p>
          <p className="stk-name" key={p.k}>{p.name}</p>
        </div>
        <div className="stk-side stk-r"><p>{N} projects</p></div>
        <p className="stk-foot stk-fl">Sorted by proof.<br />Scroll to flip through.</p>
        <p className="stk-foot stk-fr">Click the front one to open it</p>

        <div className="stk-pile">
          {PROJECTS.map((q, i) => (
            <a key={q.k} ref={(el) => { cards.current[i] = el; }} className={`stk-card${i === focus ? ' on' : ''}`}
              href={`/project.html?p=${q.k}`} onClick={(e) => go(i, e)} aria-label={`${q.name}: open the project`}
>
              <img src={q.img} alt="" draggable={false} />
            </a>
          ))}
        </div>
        <div className="stk-cursor" ref={cursor} aria-hidden="true"><span>View<br />project</span></div>
      </div>
    </section>
  );
}
