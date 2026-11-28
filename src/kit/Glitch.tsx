import { useEffect, useRef } from 'react';
import './glitch.css';

// Spider-Verse glitch: every few seconds one word (then the next, then the whole line, round and round)
// jumps into another dimension for a few frames: comic lettering with a halftone fill and offset print,
// torn slices, magenta and cyan ghosts, and striped glitch bars around it.
export default function Glitch({ text, className = '' }: { text: string; className?: string }) {
  const el = useRef<HTMLHeadingElement>(null);
  const words = text.split(' ');
  useEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const node = el.current!, spans = [...node.querySelectorAll<HTMLElement>('.gw')];
    // each word on its own, then all of them together
    const order = spans.length > 1 ? [...spans.map((s) => [s]), spans] : [spans];
    let k = 0, t = 0;
    const hit = (targets: HTMLElement[]) => {
      for (const s of targets) {
        // hold the word's width, so the narrower comic lettering doesn't shift the line
        s.style.width = `${s.getBoundingClientRect().width}px`;
        s.classList.remove('go'); void s.offsetWidth; s.classList.add('go');
        // striped bars flashing around the word
        for (let i = 0; i < 4; i++) {
          const b = document.createElement('i');
          b.className = 'gbar';
          b.style.cssText = `left:${-10 + Math.random() * 100}%;top:${-20 + Math.random() * 110}%;width:${14 + Math.random() * 46}%;height:${6 + Math.random() * 14}%;animation-delay:${Math.floor(Math.random() * 4) * 80}ms`;
          s.append(b);
          setTimeout(() => b.remove(), 700);
        }
        setTimeout(() => { s.classList.remove('go'); s.style.width = ''; }, 700);
      }
    };
    const loop = () => { hit(order[k++ % order.length]); t = window.setTimeout(loop, 4000 + Math.random() * 1000); };
    t = window.setTimeout(loop, 1500);
    return () => clearTimeout(t);
  }, [text]);
  return (
    <h1 ref={el} className={`gl ${className}`} aria-label={text}>
      {words.map((w, i) => (
        <span key={i} aria-hidden="true">
          <span className="gw" data-text={w}><span>{w}</span></span>{i < words.length - 1 ? ' ' : ''}
        </span>
      ))}
    </h1>
  );
}
