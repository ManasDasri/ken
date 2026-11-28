import { useEffect, useRef, useState } from 'react';

// A ruler down the left margin: one long tick per section, short ticks between. The section you're in
// stretches out with its name; ticks swell under the cursor like a dock; click one to go there.
export default function Rail() {
  const [secs, setSecs] = useState<{ el: HTMLElement; label: string }[]>([]);
  const [on, setOn] = useState(0);
  const [hoverY, setHoverY] = useState<number | null>(null);
  const rail = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const found = [...document.querySelectorAll<HTMLElement>('[data-rail]')].map((el) => ({ el, label: el.dataset.rail! }));
    setSecs(found);
    const pick = () => {
      const line = innerHeight * 0.4;
      let i = 0;
      found.forEach((s, k) => { if (s.el.getBoundingClientRect().top < line) i = k; });
      setOn(i);
    };
    pick();
    addEventListener('scroll', pick, { passive: true });
    return () => removeEventListener('scroll', pick);
  }, []);
  if (secs.length < 2) return null;

  const MINOR = 2; // short ticks between sections
  const ticks: { major: number | null }[] = [];
  secs.forEach((_, i) => { ticks.push({ major: i }); if (i < secs.length - 1) for (let m = 0; m < MINOR; m++) ticks.push({ major: null }); });
  const GAP = 12;

  return (
    <nav className="rail" ref={rail} aria-label="Sections"
      onPointerMove={(e) => setHoverY(e.clientY - rail.current!.getBoundingClientRect().top)}
      onPointerLeave={() => setHoverY(null)}>
      {ticks.map((t, i) => {
        const y = i * GAP + GAP / 2;
        const near = hoverY === null ? 0 : Math.max(0, 1 - Math.abs(hoverY - y) / 46); // dock swell
        const active = t.major === on;
        const base = t.major === null ? 10 : active ? 54 : 26;
        const w = base + near * (t.major === null ? 10 : 22);
        return t.major === null
          ? <i key={i} className="rail-t minor" style={{ width: w }} aria-hidden="true" />
          : (
            <button key={i} className={`rail-t${active ? ' on' : ''}`} style={{ width: w }}
              onClick={() => secs[t.major!].el.scrollIntoView({ behavior: 'smooth', block: 'start' })}
              aria-label={secs[t.major].label} aria-current={active ? 'true' : undefined}>
              <span>{secs[t.major].label}</span>
            </button>
          );
      })}
    </nav>
  );
}
