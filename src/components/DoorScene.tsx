import { useEffect, useRef } from 'react';
import './door.css';

// Behind the door: a misty sky, soft painted cumulus melting into haze, and rust-red hills of grass
// with the light on them. All SVG, so it's sharp at any size; it drifts, and leans a little with the mouse.
export default function DoorScene() {
  const el = useRef<SVGSVGElement>(null);
  useEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const svg = el.current!;
    const move = (e: PointerEvent) => {
      svg.style.setProperty('--mx', ((e.clientX / innerWidth) - 0.5).toFixed(3));
      svg.style.setProperty('--my', ((e.clientY / innerHeight) - 0.5).toFixed(3));
    };
    addEventListener('pointermove', move);
    return () => removeEventListener('pointermove', move);
  }, []);
  return (
    <svg ref={el} className="door-scene" viewBox="0 0 1600 1000" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <linearGradient id="ds-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#bfc5cb" />
          <stop offset="0.45" stopColor="#d9dadb" />
          <stop offset="0.7" stopColor="#ebe4e0" />
          <stop offset="1" stopColor="#f1e5df" />
        </linearGradient>
        <radialGradient id="ds-glow" cx="0.22" cy="0.32" r="0.55">
          <stop offset="0" stopColor="#fff4ee" stopOpacity="0.75" />
          <stop offset="1" stopColor="#fff4ee" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="ds-cloud" gradientUnits="userSpaceOnUse" x1="0" y1="300" x2="0" y2="640">
          <stop offset="0" stopColor="#fffdfb" />
          <stop offset="0.55" stopColor="#f7efee" />
          <stop offset="1" stopColor="#d9dde5" />
        </linearGradient>
        {/* soft, brushed edges: the outline is pushed around by noise, blurred, then roughened again */}
        <filter id="ds-puff" x="-15%" y="-40%" width="130%" height="180%">
          <feTurbulence type="fractalNoise" baseFrequency="0.011" numOctaves="4" seed="8" result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale="70" xChannelSelector="R" yChannelSelector="G" result="d" />
          <feGaussianBlur in="d" stdDeviation="5" result="soft" />
          <feTurbulence type="fractalNoise" baseFrequency="0.09" numOctaves="2" seed="3" result="fine" />
          <feDisplacementMap in="soft" in2="fine" scale="14" xChannelSelector="R" yChannelSelector="B" />
        </filter>
        <linearGradient id="ds-haze" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ece7e4" stopOpacity="0" />
          <stop offset="0.55" stopColor="#ece7e4" stopOpacity="0.9" />
          <stop offset="1" stopColor="#ece7e4" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="ds-hill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#d49a78" />
          <stop offset="0.25" stopColor="#b8644f" />
          <stop offset="1" stopColor="#7f322c" />
        </linearGradient>
        <radialGradient id="ds-sun" cx="0.42" cy="0.12" r="0.42">
          <stop offset="0" stopColor="#f6c79a" stopOpacity="0.75" />
          <stop offset="1" stopColor="#f6c79a" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="ds-front" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#843530" />
          <stop offset="1" stopColor="#4a1a18" />
        </linearGradient>
        {/* grass: noise stretched sideways into short upright strokes, laid over the hill as shade */}
        <filter id="ds-grass" x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.85 0.07" numOctaves="3" seed="5" result="g" />
          <feColorMatrix in="g" type="matrix" values="0 0 0 0 0.18  0 0 0 0 0.05  0 0 0 0 0.04  0 0 0 -2.2 1.35" result="dark" />
          <feComposite in="dark" in2="SourceGraphic" operator="in" result="tex" />
          <feMerge><feMergeNode in="SourceGraphic" /><feMergeNode in="tex" /></feMerge>
        </filter>
      </defs>

      <rect width="1600" height="1000" fill="url(#ds-sky)" />
      <rect width="1600" height="1000" fill="url(#ds-glow)" />

      <g className="ds-far">
        <g filter="url(#ds-puff)" fill="url(#ds-cloud)" opacity="0.85">
          <circle cx="1190" cy="560" r="70" /><circle cx="1300" cy="530" r="98" /><circle cx="1420" cy="560" r="72" />
          <circle cx="1530" cy="585" r="52" /><rect x="1110" y="555" width="480" height="60" />
        </g>
      </g>
      <g className="ds-near">
        <g filter="url(#ds-puff)" fill="url(#ds-cloud)">
          <circle cx="200" cy="560" r="110" /><circle cx="330" cy="505" r="150" /><circle cx="520" cy="430" r="190" />
          <circle cx="690" cy="470" r="150" /><circle cx="840" cy="520" r="118" /><circle cx="985" cy="560" r="88" />
          <circle cx="430" cy="380" r="110" /><circle cx="610" cy="350" r="95" />
          <rect x="90" y="520" width="990" height="100" />
        </g>
      </g>
      <rect y="540" width="1600" height="170" fill="url(#ds-haze)" />

      <g className="ds-hills">
        <path filter="url(#ds-grass)" fill="url(#ds-hill)" d="M-60 712 C 180 662 420 604 650 612 C 870 620 1010 662 1250 680 C 1410 692 1540 700 1660 690 L 1660 1010 L -60 1010 Z" />
        <path fill="url(#ds-sun)" d="M-60 712 C 180 662 420 604 650 612 C 870 620 1010 662 1250 680 C 1410 692 1540 700 1660 690 L 1660 1010 L -60 1010 Z" style={{ mixBlendMode: 'screen' }} />
        <path filter="url(#ds-grass)" fill="url(#ds-front)" d="M-60 812 C 260 770 560 784 880 806 C 1180 826 1400 796 1660 772 L 1660 1010 L -60 1010 Z" />
      </g>
    </svg>
  );
}
