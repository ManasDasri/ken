import { useEffect, useRef } from 'react';
import './glitch.css';

// Text that glitches every few seconds, Spider-Verse style: it tears into offset slices, splits into
// magenta and cyan, and flickers through other "dimensions" (type styles) for a frame or two.
export default function Glitch({ text, as: Tag = 'h1', className = '' }: { text: string; as?: 'h1' | 'h2' | 'span'; className?: string }) {
  const el = useRef<HTMLElement>(null);
  useEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let t = 0, off = 0;
    const fire = () => {
      el.current?.classList.add('go');
      off = window.setTimeout(() => el.current?.classList.remove('go'), 650);
      t = window.setTimeout(fire, 4000 + Math.random() * 1200);
    };
    t = window.setTimeout(fire, 1600);
    const hover = () => { if (!el.current?.classList.contains('go')) { el.current?.classList.add('go'); off = window.setTimeout(() => el.current?.classList.remove('go'), 650); } };
    const node = el.current;
    node?.addEventListener('pointerenter', hover);
    return () => { clearTimeout(t); clearTimeout(off); node?.removeEventListener('pointerenter', hover); };
  }, []);
  return (
    <Tag ref={el as never} className={`gl ${className}`} data-text={text} aria-label={text}>
      <span aria-hidden="true">{text}</span>
    </Tag>
  );
}
