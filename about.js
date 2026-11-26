import { $, $$, reduce, toast } from './common.js';

// ---------- plain or paper: the same story, two registers ----------
const tone = $('#tone'), note = $('#tone-note');
const swap = () => {
  const key = tone.value === '1' ? 'paper' : 'plain';
  note.textContent = key === 'paper' ? 'this is how I write papers' : 'this is how I talk';
  $$('#story [data-plain]').forEach((el, i) => {
    el.classList.add('swap');
    setTimeout(() => {
      el.textContent = el.dataset[key];
      el.classList.remove('swap');
    }, reduce ? 0 : 160 + i * 25);
  });
};
tone.addEventListener('input', swap);
// clicking a label sets the slider too
$$('.tone > span').forEach((s, i) => s.addEventListener('click', () => { tone.value = String(i); swap(); }));

// ---------- scrub the black bits ----------
$$('.redact').forEach((r) => {
  const clear = () => r.classList.add('clear');
  r.addEventListener('pointermove', clear);
  r.addEventListener('focus', clear);
  r.addEventListener('click', clear);
});

// ---------- the dock magnifies under the cursor ----------
const dock = $('#dock');
const icons = $$('span', dock);
dock.addEventListener('pointermove', (e) => {
  if (reduce) return;
  for (const ic of icons) {
    const r = ic.getBoundingClientRect();
    const d = Math.abs(e.clientX - (r.left + r.width / 2));
    const s = 1 + Math.max(0, 1 - d / 150) * 0.75;
    ic.style.setProperty('--s', s.toFixed(3));
  }
});
dock.addEventListener('pointerleave', () => icons.forEach((ic) => ic.style.setProperty('--s', 1)));
icons.forEach((ic) => ic.addEventListener('click', () => {
  ic.classList.remove('bounce');
  void ic.offsetWidth;
  ic.classList.add('bounce');
  toast(`${ic.dataset.n}: open`);
}));
