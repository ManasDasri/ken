import { $$, reduce, toast } from './common.js';

// ---------- scrub the black bits ----------
$$('.redact').forEach((r) => {
  const clear = () => r.classList.add('clear');
  r.addEventListener('pointermove', clear);
  r.addEventListener('focus', clear);
  r.addEventListener('click', clear);
});

// ---------- the dock magnifies under the cursor ----------
const icons = $$('#dock span');
const dock = icons[0]?.parentElement;
dock?.addEventListener('pointermove', (e) => {
  if (reduce) return;
  for (const ic of icons) {
    const r = ic.getBoundingClientRect();
    const s = 1 + Math.max(0, 1 - Math.abs(e.clientX - (r.left + r.width / 2)) / 150) * 0.75;
    ic.style.setProperty('--s', s.toFixed(3));
  }
});
dock?.addEventListener('pointerleave', () => icons.forEach((ic) => ic.style.setProperty('--s', 1)));
icons.forEach((ic) => ic.addEventListener('click', () => {
  ic.classList.remove('bounce');
  void ic.offsetWidth;
  ic.classList.add('bounce');
  toast(`${ic.dataset.n}: in the toolbox`);
}));
