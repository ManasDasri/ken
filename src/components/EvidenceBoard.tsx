import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { PROJECTS } from '@/legacy/cards.js';
import './evidence.css';

type Project = (typeof PROJECTS)[number];

// Where each photo is pinned (left %, top %, tilt), on a wide board and on a phone.
const WIDE = [[3, 7, -4], [37, 3, 3], [72, 8, -3], [6, 56, 3], [39, 62, -2], [73, 57, 4]];
const NARROW = [[2, 2, -3], [50, 6, 3], [3, 24, 2], [50, 28, -3], [3, 66, -2], [50, 70, 3]];
const HUB = 6; // the suspect card in the middle
// red string: every photo to the suspect, plus the two research projects and the two dev tools
const STRINGS = [[0, HUB], [1, HUB], [2, HUB], [3, HUB], [4, HUB], [5, HUB], [0, 1], [2, 3]];
const PIN = ['#e63946', '#f4a261', '#2a9d8f', '#e9c46a', '#457b9d', '#e76f51', '#e63946'];
const SEG = 14;

const useNarrow = () => {
  const q = '(max-width: 760px)';
  const [narrow, set] = useState(() => matchMedia(q).matches);
  useEffect(() => {
    const m = matchMedia(q), on = () => set(m.matches);
    m.addEventListener('change', on);
    return () => m.removeEventListener('change', on);
  }, []);
  return narrow;
};

export default function EvidenceBoard() {
  const board = useRef<HTMLDivElement>(null);
  const paths = useRef<(SVGPathElement | null)[]>([]);
  const [open, setOpen] = useState<number | null>(null);
  const narrow = useNarrow();
  const spots = narrow ? NARROW : WIDE;

  // the strings: each is a chain of points with gravity, tied to two pins that can be dragged around
  useEffect(() => {
    const el = board.current!;
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const pins: SVGElement[] = [];
    el.querySelectorAll<SVGElement>('[data-pin]').forEach((p) => (pins[+p.dataset.pin!] = p));
    // a pin's place on the board from layout alone (ignores the drop-in and any drag): the top
    // middle of the card it's stuck in, which sits straight on the board
    const home = (p: SVGElement) => {
      const card = p.parentElement!;
      return { x: card.offsetLeft + card.offsetWidth / 2, y: card.offsetTop + 2 };
    };
    // where it is right now, drag included
    const now = (p: SVGElement) => {
      const r = p.getBoundingClientRect(), b = el.getBoundingClientRect();
      return { x: r.left + r.width / 2 - b.left, y: r.top + r.height / 2 - b.top };
    };
    const ropes = STRINGS.map(([a, b]) => {
      const A = home(pins[a]), B = home(pins[b]);
      const len = Math.hypot(B.x - A.x, B.y - A.y) * 1.12; // a little slack, so it sags
      const pts = Array.from({ length: SEG }, (_, i) => {
        const t = i / (SEG - 1), x = A.x + (B.x - A.x) * t, y = A.y + (B.y - A.y) * t;
        return { x, y, px: x, py: y };
      });
      return { a, b, pts, rest: len / (SEG - 1) };
    });
    const step = () => {
      const at = pins.map(now);
      for (const r of ropes) {
        const p = r.pts, A = at[r.a], B = at[r.b];
        for (let i = 1; i < SEG - 1; i++) {
          const q = p[i], vx = (q.x - q.px) * 0.94, vy = (q.y - q.py) * 0.94;
          q.px = q.x; q.py = q.y;
          q.x += vx; q.y += vy + 0.45;
        }
        Object.assign(p[0], A); Object.assign(p[SEG - 1], B);
        for (let k = 0; k < 14; k++) for (let i = 0; i < SEG - 1; i++) {
          const m = p[i], n = p[i + 1], dx = n.x - m.x, dy = n.y - m.y, d = Math.hypot(dx, dy) || 1;
          const f = (d - r.rest) / d / 2;
          if (i > 0) { m.x += dx * f; m.y += dy * f; }
          if (i + 1 < SEG - 1) { n.x -= dx * f; n.y -= dy * f; }
        }
      }
    };
    const draw = () => ropes.forEach((r, i) => {
      const p = r.pts;
      let d = `M${p[0].x.toFixed(1)} ${p[0].y.toFixed(1)}`;
      for (let j = 1; j < SEG - 1; j++) d += ` Q${p[j].x.toFixed(1)} ${p[j].y.toFixed(1)} ${((p[j].x + p[j + 1].x) / 2).toFixed(1)} ${((p[j].y + p[j + 1].y) / 2).toFixed(1)}`;
      d += ` L${p[SEG - 1].x.toFixed(1)} ${p[SEG - 1].y.toFixed(1)}`;
      paths.current[i * 2]?.setAttribute('d', d);
      paths.current[i * 2 + 1]?.setAttribute('d', d);
    });
    if (reduce) { for (let k = 0; k < 200; k++) step(); draw(); return; }
    let raf = 0, seen = false;
    const loop = () => { raf = 0; if (!seen || document.hidden) return; step(); draw(); raf = requestAnimationFrame(loop); };
    const io = new IntersectionObserver(([e]) => { seen = e.isIntersecting; if (seen && !raf) raf = requestAnimationFrame(loop); });
    io.observe(el);
    return () => { io.disconnect(); cancelAnimationFrame(raf); };
  }, [narrow]);

  return (
    <div className="eb-wrap">
      <div className="eb" ref={board}>
        <svg className="eb-strings" aria-hidden="true">
          {STRINGS.map((_, i) => (
            <g key={i}>
              <path ref={(p) => { paths.current[i * 2] = p; }} className="eb-str-shade" />
              <path ref={(p) => { paths.current[i * 2 + 1] = p; }} className="eb-str" />
            </g>
          ))}
        </svg>

        <span className="eb-scrawl s1" aria-hidden="true">research</span>
        <span className="eb-scrawl s2" aria-hidden="true">tools people install</span>
        <span className="eb-scrawl s3" aria-hidden="true">shipped!!</span>

        <motion.div className="eb-suspect" drag={!narrow} dragConstraints={board} dragElastic={0.15} whileDrag={{ scale: 1.04 }}
          initial={{ opacity: 0, scale: 1.25 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true, amount: 0.3 }}
          transition={{ type: 'spring', stiffness: 260, damping: 18 }}>
          <Pin n={HUB} />
          <span className="eb-stamp">Case open</span>
          <img src="/img/brand/logo.png" alt="" draggable={false} />
          <p className="eb-k">Suspect</p>
          <p className="eb-v">Manas Dasari</p>
          <p className="eb-k">Charged with</p>
          <p className="eb-v">shipping models, then trying to break them</p>
          <p className="eb-k">Evidence</p>
          <p className="eb-v">six exhibits, all on this board</p>
        </motion.div>

        {PROJECTS.map((p, i) => (
          <Polaroid key={p.k} p={p} i={i} spot={spots[i]} board={board} narrow={narrow} onOpen={() => setOpen(i)} />
        ))}

        <span className="eb-hint" aria-hidden="true">{narrow ? 'tap a photo to open the file' : 'drag the photos around · click one to open its file'}</span>
      </div>

      <AnimatePresence>{open !== null && <CaseFile p={PROJECTS[open]} i={open} onClose={() => setOpen(null)} />}</AnimatePresence>
    </div>
  );
}

function Pin({ n }: { n: number }) {
  const colour = PIN[n];
  return (
    <svg className="eb-pin" data-pin={n} viewBox="0 0 24 30" aria-hidden="true">
      <path d="M12 16v13" stroke="#8d8d96" strokeWidth="1.6" strokeLinecap="round" />
      <ellipse cx="12" cy="17" rx="6" ry="2.2" fill={colour} />
      <path d="M8 6h8l-1 9H9z" fill={colour} />
      <ellipse cx="12" cy="6" rx="7" ry="4.5" fill={colour} />
      <ellipse cx="10" cy="4.6" rx="2.6" ry="1.4" fill="#fff" opacity="0.55" />
    </svg>
  );
}

function Polaroid({ p, i, spot, board, narrow, onOpen }: {
  p: Project; i: number; spot: number[]; board: React.RefObject<HTMLDivElement | null>; narrow: boolean; onOpen: () => void;
}) {
  const dragged = useRef(false);
  const [left, top, tilt] = spot;
  return (
    <motion.button
      type="button"
      className="eb-photo"
      data-tone={p.tone}
      style={{ left: `${left}%`, top: `${top}%` }}
      aria-label={`${p.name}: open the case file`}
      drag={!narrow}
      dragConstraints={board}
      dragElastic={0.12}
      dragTransition={{ power: 0.25, timeConstant: 180 }}
      onDragStart={() => (dragged.current = true)}
      onClick={() => { if (!dragged.current) onOpen(); dragged.current = false; }}
      initial={{ opacity: 0, y: -70, rotate: tilt * 3, scale: 1.15 }}
      whileInView={{ opacity: 1, y: 0, rotate: tilt, scale: 1 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ type: 'spring', stiffness: 230, damping: 16, delay: 0.15 + i * 0.09 }}
      whileHover={{ scale: 1.03, rotate: tilt * 0.4 }}
      whileDrag={{ scale: 1.07, rotate: 0, zIndex: 20, boxShadow: '0 40px 50px -20px rgb(0 0 0 / 0.55)' }}
    >
      <Pin n={i} />
      <span className="eb-shot"><img src={p.img} alt="" draggable={false} loading="lazy" /></span>
      <span className="eb-cap">{p.name}</span>
      <span className="eb-note">
        <b>{p.stat}</b>
        <small>{p.statLabel}</small>
      </span>
    </motion.button>
  );
}

function CaseFile({ p, i, onClose }: { p: Project; i: number; onClose: () => void }) {
  const close = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const back = document.activeElement as HTMLElement | null;
    close.current?.focus();
    const key = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    addEventListener('keydown', key);
    return () => { removeEventListener('keydown', key); back?.focus(); };
  }, [onClose]);
  const no = String(i + 1).padStart(2, '0');
  return (
    <motion.div className="cf-back" onClick={onClose} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <motion.article
        className="cf" data-tone={p.tone} role="dialog" aria-modal="true" aria-label={`${p.name}, case file`}
        onClick={(e) => e.stopPropagation()}
        initial={{ y: 120, rotate: -6, scale: 0.85, opacity: 0 }}
        animate={{ y: 0, rotate: -1, scale: 1, opacity: 1 }}
        exit={{ y: 160, rotate: 5, scale: 0.9, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 220, damping: 22 }}
      >
        <span className="cf-tab">Exhibit {no} · {p.kind}</span>
        <button ref={close} className="cf-x" onClick={onClose} aria-label="Close the file">×</button>
        <div className="cf-shot"><img src={p.img} alt={`${p.name}, the site`} /><span className="cf-clip" aria-hidden="true" /></div>
        <div className="cf-body">
          <p className="cf-host">{p.host}</p>
          <h3>{p.name}</h3>
          <p className="cf-q">{p.tag}</p>
          <p>{p.about}</p>
          <dl>{p.xray.map(([k, v]: string[]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}</dl>
          <p className="cf-verdict"><span>Verdict</span>{p.result}</p>
          <div className="cf-foot">
            <span className="cf-stat"><b>{p.stat}</b>{p.statLabel}</span>
            <a href={p.site} target="_blank" rel="noopener">{p.siteLabel === 'Site' ? 'Open the site' : p.siteLabel} ↗</a>
            <a href={`/work.html#${p.k}`}>Full case study →</a>
          </div>
        </div>
        <motion.span className="cf-stamp" aria-hidden="true" initial={{ scale: 2.4, opacity: 0, rotate: -24 }} animate={{ scale: 1, opacity: 0.85, rotate: -12 }} transition={{ delay: 0.35, type: 'spring', stiffness: 500, damping: 18 }}>
          Filed
        </motion.span>
      </motion.article>
    </motion.div>
  );
}
