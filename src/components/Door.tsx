import { useCallback, useEffect, useState } from 'react';
import DoorScene from './DoorScene';

// The door: once per visit. A click, the scroll wheel, a swipe or Enter lifts it away.
export default function Door() {
  const seen = (() => { try { return sessionStorage.getItem('in') === '1'; } catch { return false; } })();
  const [state, setState] = useState<'shut' | 'up' | 'gone'>(seen || matchMedia('(prefers-reduced-motion: reduce)').matches ? 'gone' : 'shut');
  const open = useCallback(() => {
    setState((s) => (s === 'shut' ? 'up' : s));
    try { sessionStorage.setItem('in', '1'); } catch {}
    setTimeout(() => setState('gone'), 1100);
  }, []);
  useEffect(() => {
    if (state !== 'shut') return;
    const key = (e: KeyboardEvent) => ['Enter', ' ', 'ArrowDown', 'PageDown'].includes(e.key) && open();
    addEventListener('wheel', open, { passive: true });
    addEventListener('touchmove', open, { passive: true });
    addEventListener('keydown', key);
    return () => { removeEventListener('wheel', open); removeEventListener('touchmove', open); removeEventListener('keydown', key); };
  }, [state, open]);
  if (state === 'gone') return null;
  return (
    <div className={`door${state === 'up' ? ' up' : ''}`}>
      <DoorScene />
      <img className="door-logo" src="/img/brand/logo.png" alt="" />
      <p className="door-kicker">MANAS DASARI · ML RESEARCH &amp; DEV TOOLS</p>
      <h2 className="door-line">I show<br />my work.</h2>
      <button className="door-btn" autoFocus onClick={open}>Step inside <svg viewBox="0 0 16 16"><path d="M3 8h10M9 4l4 4-4 4" /></svg></button>
    </div>
  );
}
