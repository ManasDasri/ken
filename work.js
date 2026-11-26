import { $$, reduce } from './common.js';

// a glare that follows the cursor, and hold-to-X-ray
for (const shot of $$('.wshot')) {
  shot.addEventListener('pointermove', (e) => {
    const r = shot.getBoundingClientRect();
    shot.style.setProperty('--gx', `${e.clientX - r.left}px`);
    shot.style.setProperty('--gy', `${e.clientY - r.top}px`);
    if (!reduce) shot.style.transform = `perspective(900px) rotateX(${((e.clientY - r.top) / r.height - 0.5) * -6}deg) rotateY(${((e.clientX - r.left) / r.width - 0.5) * 8}deg)`;
  });
  shot.addEventListener('pointerleave', () => {
    shot.style.transform = '';
    shot.classList.remove('x');
  });
  let t;
  const on = (e) => {
    e.preventDefault();
    t = setTimeout(() => shot.classList.add('x'), 180);
  };
  const off = () => {
    clearTimeout(t);
    shot.classList.remove('x');
  };
  shot.addEventListener('pointerdown', on);
  shot.addEventListener('pointerup', off);
  shot.addEventListener('pointercancel', off);
  shot.addEventListener('contextmenu', (e) => e.preventDefault());
}
