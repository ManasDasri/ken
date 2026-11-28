import { useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { animate } from 'animejs';
import { PROJECTS } from '@/legacy/cards.js';
import './work.css';

type Project = (typeof PROJECTS)[number];
const pad = (n: number) => String(n + 1).padStart(2, '0');
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const ease = [0.22, 1, 0.36, 1] as const;

// The work page: one chapter per project. They share the type, the hairlines and the brass numbers,
// but each is laid out its own way (work.css, .v0 to .v5).
export default function WorkCases() {
  return <div className="wk-list">{PROJECTS.map((p, i) => <Case key={p.k} p={p} i={i} />)}</div>;
}

export function Case({ p, i }: { p: Project; i: number }) {
  return (
    <article id={p.k} className={`wk v${i}`} data-tone={p.tone}>
      <header className="wk-meta"><span>{pad(i)} — {p.kind}</span><span>{p.host}</span></header>
      <Rise className="wk-name" as="h2">{p.name}</Rise>
      <Rise className="wk-q" delay={0.08}>{p.tag}</Rise>
      {i === 3 ? <Triptych p={p} /> : <Shot p={p} />}
      <div className="wk-stat"><Count value={p.stat} /><small>{p.statLabel}</small></div>
      <div className="wk-body">
        <p>{p.about}</p>
        <dl>{p.xray.map(([k, v]: string[]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}</dl>
        <p className="wk-verdict"><span>Result</span>{p.result}</p>
      </div>
      <footer className="wk-links">
        <a href={p.site} target="_blank" rel="noopener">{p.siteLabel === 'Site' ? 'Open the site' : `Open ${p.siteLabel}`} ↗</a>
        <a href={`https://github.com/${p.repo}`} target="_blank" rel="noopener">Read the code ↗</a>
        <span>{p.stack.join(' · ')}</span>
      </footer>
    </article>
  );
}

// text that slides up out of a mask the first time it's seen (the mask is what's watched: the text
// starts hidden inside it, so it can't be seen to trigger anything itself)
function Rise({ children, className, as = 'p', delay = 0 }: { children: React.ReactNode; className: string; as?: 'p' | 'h2'; delay?: number }) {
  const Tag = as === 'h2' ? motion.h2 : motion.p;
  return (
    <motion.div className={`${className} wk-mask`} initial="hide" whileInView="show" viewport={{ once: true, amount: 0.5 }}>
      <Tag variants={{ hide: { y: '105%' }, show: { y: 0 } }} transition={{ duration: 1.1, ease, delay }}>
        {children}
      </Tag>
    </motion.div>
  );
}

// the screenshot, uncovered from the bottom up (the frame is watched; the clipped picture can't be)
const uncover = { hide: { clipPath: 'inset(100% 0 0 0)' }, show: { clipPath: 'inset(0% 0 0 0)' } };
function Shot({ p }: { p: Project }) {
  return (
    <motion.div className="wk-shot" initial="hide" whileInView="show" viewport={{ once: true, amount: 0.2 }}>
      <motion.a href={p.site} target="_blank" rel="noopener" tabIndex={-1} variants={uncover} transition={{ duration: 1.4, ease }}>
        <motion.img src={p.img} alt={`${p.name}, the live site`} loading="lazy" variants={{ hide: { scale: 1.18 }, show: { scale: 1 } }} transition={{ duration: 1.8, ease }} />
      </motion.a>
    </motion.div>
  );
}

// three crops of the same page, hung at different heights
function Triptych({ p }: { p: Project }) {
  return (
    <motion.div className="wk-shot wk-trip" initial="hide" whileInView="show" viewport={{ once: true, amount: 0.2 }}>
      {[['0% 0%', 0], ['55% 35%', 1], ['100% 75%', 2]].map(([pos, n]) => (
        <motion.a key={n} href={p.site} target="_blank" rel="noopener" tabIndex={-1} aria-label={n === 0 ? `${p.name}, the live site` : undefined}
          style={{ backgroundImage: `url(${p.img})`, backgroundPosition: pos as string }}
          variants={uncover} transition={{ duration: 1.3, ease, delay: (n as number) * 0.14 }} />
      ))}
    </motion.div>
  );
}

// numbers count up to themselves; versions and other labels just appear
function Count({ value }: { value: string }) {
  const el = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const m = /^(\d+(?:\.(\d+))?)(%?)$/.exec(value);
    const node = el.current!;
    if (!m || reduce) return;
    const target = +m[1], dp = m[2]?.length ?? 0, unit = m[3];
    node.textContent = (0).toFixed(dp) + unit;
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      const o = { v: 0 };
      animate(o, { v: target, duration: 1800, ease: 'outExpo', onUpdate: () => (node.textContent = o.v.toFixed(dp) + unit) });
    }, { threshold: 0.6 });
    io.observe(node);
    return () => io.disconnect();
  }, [value]);
  return <b ref={el}>{value}</b>;
}
