import { $, $$, reduce, toast } from './common.js';

// ---------- the door: once per visit ----------
const door = $('#door');
function enter() {
  if (document.body.classList.contains('in')) return;
  document.body.classList.add('in');
  try { sessionStorage.setItem('in', '1'); } catch {}
  setTimeout(() => (door.style.display = 'none'), 1100);
}
let seen = false;
try { seen = sessionStorage.getItem('in') === '1'; } catch {}
if (seen || reduce) {
  document.body.classList.add('in');
  door.style.display = 'none';
} else {
  $('#enter').addEventListener('click', enter);
  addEventListener('wheel', enter, { once: true, passive: true });
  addEventListener('touchmove', enter, { once: true, passive: true });
  addEventListener('keydown', (e) => ['Enter', ' ', 'ArrowDown', 'PageDown'].includes(e.key) && enter());
  $('#enter').focus();
}

const hero = $('#home');

// ---------- research / code: the selection slides between them ----------
const boxLabel = $('#boxlabel');
const slider = $('.toggle .slider');
const moveSlider = (b) => {
  slider.style.left = `${b.offsetLeft}px`;
  slider.style.width = `${b.offsetWidth}px`;
};
$$('.toggle button').forEach((b) =>
  b.addEventListener('click', () => {
    $$('.toggle button').forEach((o) => {
      o.classList.toggle('on', o === b);
      o.setAttribute('aria-pressed', o === b);
    });
    moveSlider(b);
    boxLabel.innerHTML = b.dataset.mode === 'code' ? 'engineer <b>0.99</b>' : 'researcher <b>0.97</b>';
  })
);
document.fonts.ready.then(() => moveSlider($('.toggle button.on')));

// ---------- the hero sentence arrives one piece at a time ----------
$$('.pitch .line > *').forEach((el, i) => (el.style.animationDelay = `${1.3 + i * 0.12}s`));
{
  // the install command types itself out, then waits for a hover to run again
  const term = $('#term'), full = term.textContent;
  const type = () => {
    let i = 2;
    term.textContent = '$ ';
    const t = setInterval(() => {
      term.textContent = full.slice(0, ++i);
      if (i >= full.length) clearInterval(t);
    }, 55);
  };
  if (!reduce) {
    term.textContent = '$ ';
    setTimeout(type, 2200);
    term.closest('.chip').addEventListener('pointerenter', type);
  }
  // the loss curve trains again when you hover it
  const loss = $('.chip-loss svg path');
  $('.chip-loss').addEventListener('pointerenter', () => {
    loss.style.animation = 'none';
    loss.getBoundingClientRect();
    loss.style.animation = 'draw 1.6s var(--ease) forwards';
  });
}

// ---------- pixels drifting under the name ----------
{
  const box = $('#pixels'), colours = ['#f5b800', '#a855f7', '#22c55e', '#3b82f6', '#ec4899', '#cfcfd6'];
  let seed = 11;
  const r = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
  const w = box.clientWidth;
  for (let row = 0; row < 5; row++) {
    const span = 0.3 + row * 0.12; // widens as it falls
    for (let k = 0; k < 5 + row * 2; k++) {
      if (r() < 0.45) continue;
      const i = document.createElement('i');
      const x = w / 2 + (r() - 0.5) * w * span;
      i.style.cssText = `left:${Math.round(x / 13) * 13}px;top:${row * 13}px;background:${colours[Math.floor(r() * colours.length)]};opacity:${(0.85 - row * 0.12).toFixed(2)};--d:${(2 + r() * 3).toFixed(1)}s;--dl:${(r() * 3).toFixed(1)}s`;
      box.append(i);
    }
  }
}

// ---------- the hand of cards deals out when you reach it ----------
const fan = $('#fan');
const cards = $$('.card', fan);
cards.forEach((c, i) => {
  const k = i - (cards.length - 1) / 2;
  c.style.setProperty('--k', k);
  c.style.setProperty('--a', (k * k * 0.9).toFixed(2));
  c.style.setProperty('--i', i);
  c.style.zIndex = 10 - Math.abs(Math.round(k));
});
new IntersectionObserver(([e], o) => {
  if (!e.isIntersecting) return;
  fan.classList.add('dealt');
  o.disconnect();
}, { threshold: 0.35 }).observe(fan);

// ---------- hero canvas: drag the frames, or drag out a selection ----------
const frames = $$('.frame');
frames.forEach((f, i) => f.style.setProperty('--i', i));
for (const f of frames) {
  let start = null, dx = 0, dy = 0;
  f.addEventListener('pointerdown', (e) => {
    if (e.button !== 0) return;
    start = { x: e.clientX, y: e.clientY, dx, dy, moved: false };
    f.setPointerCapture(e.pointerId);
    e.preventDefault();
  });
  f.addEventListener('pointermove', (e) => {
    if (!start) return;
    const mx = e.clientX - start.x, my = e.clientY - start.y;
    if (!start.moved && Math.hypot(mx, my) < 4) return;
    start.moved = true;
    f.classList.add('held');
    dx = start.dx + mx;
    dy = start.dy + my;
    f.style.setProperty('--dx', `${dx}px`);
    f.style.setProperty('--dy', `${dy}px`);
  });
  const drop = () => {
    if (!start) return;
    f.classList.remove('held');
    f.dataset.dragged = start.moved ? '1' : '';
    start = null;
  };
  f.addEventListener('pointerup', drop);
  f.addEventListener('pointercancel', drop);
  f.addEventListener('click', (e) => {
    if (f.dataset.dragged) {
      e.preventDefault();
      f.dataset.dragged = '';
    }
  });
}
{
  const box = $('#marquee');
  let o = null;
  hero.addEventListener('pointerdown', (e) => {
    if (e.button !== 0 || e.target.closest('a, button, .frame, .chip, .toggle, .box')) return;
    const h = hero.getBoundingClientRect();
    o = { x: e.clientX - h.left, y: e.clientY - h.top };
    frames.forEach((f) => f.classList.remove('sel'));
  });
  addEventListener('pointermove', (e) => {
    if (!o) return;
    const h = hero.getBoundingClientRect();
    const x = e.clientX - h.left, y = e.clientY - h.top;
    const l = Math.min(x, o.x), t = Math.min(y, o.y), w = Math.abs(x - o.x), ht = Math.abs(y - o.y);
    Object.assign(box.style, { left: `${l}px`, top: `${t}px`, width: `${w}px`, height: `${ht}px` });
    box.classList.toggle('on', w + ht > 6);
    const sel = { left: l + h.left, top: t + h.top, right: l + w + h.left, bottom: t + ht + h.top };
    for (const f of frames) {
      const r = f.getBoundingClientRect();
      f.classList.toggle('sel', w + ht > 6 && r.left < sel.right && r.right > sel.left && r.top < sel.bottom && r.bottom > sel.top);
    }
  });
  addEventListener('pointerup', () => {
    if (!o) return;
    o = null;
    box.classList.remove('on');
    const n = frames.filter((f) => f.classList.contains('sel')).length;
    if (n) toast(`${n} frame${n > 1 ? 's' : ''} selected. Drag them anywhere.`);
  });
}

// ---------- work: hover a card to inspect it ----------
{
  const META = {
    clause: { path: 'clause-risk-review/', state: 'results published', rows: [['lang', 'Python'], ['stack', 'PyTorch · Transformers'], ['data', 'CUAD v1 · 510 contracts'], ['result', 'BERT 0.879 doc F1, held out'], ['repo', 'ManasDasri/NNDL']] },
    eeg: { path: 'med-eeg/', state: 'results published', rows: [['lang', 'Python'], ['stack', 'MNE · scikit-learn · statsmodels'], ['data', 'OpenNeuro ds001787 + ds008836'], ['result', 'depth AUC 0.609, nulls reported'], ['repo', 'ManasDasri/Med-EEG']] },
    sprout: { path: 'sprout/', state: 'v0.7.0 shipped', rows: [['lang', 'Go'], ['stack', 'MCP server · single binary'], ['ships', 'Homebrew · Scoop · Linux'], ['does', 'maps a repo for you + agents'], ['repo', 'Sprout-DevLabs/sprout']] },
    forme: { path: 'forme/', state: 'live', rows: [['lang', 'TypeScript'], ['stack', 'React · WebGL · shadcn registry'], ['size', '53 components, free'], ['ci', 'a11y badges are tests'], ['repo', 'ManasDasri/forme']] },
    flow: { path: 'flow/', state: 'v1.0 live', rows: [['lang', 'JavaScript'], ['stack', 'Express · Supabase · WebRTC'], ['infra', 'Cloudflare TURN · Postgres RLS'], ['does', 'shared study rooms'], ['repo', 'ManasDasri/Flow-study']] },
    velora: { path: 'velora/', state: 'live', rows: [['lang', 'JavaScript'], ['stack', 'React · Vite · canvas'], ['model', 'Monte Carlo · Markov regimes'], ['out', 'fan charts · VaR · CVaR'], ['repo', 'ManasDasri/Velora']] },
  };
  const fan = $('#fan'), panel = $('#inspect');
  let hideT;
  const show = (card) => {
    clearTimeout(hideT);
    const m = META[card.dataset.p];
    panel.replaceChildren();
    const head = document.createElement('div');
    head.className = 'ins-head';
    head.append(Object.assign(document.createElement('b'), { textContent: m.path }), Object.assign(document.createElement('span'), { textContent: `● ${m.state}` }));
    panel.append(head);
    for (const [k, v] of m.rows) {
      const row = document.createElement('div');
      row.append(Object.assign(document.createElement('i'), { textContent: k }), Object.assign(document.createElement('span'), { textContent: v }));
      panel.append(row);
    }
    const f = fan.getBoundingClientRect(), c = card.getBoundingClientRect();
    const x = Math.min(Math.max(c.left + c.width / 2 - f.left, 160), f.width - 160);
    panel.style.left = `${x}px`;
    panel.classList.add('on');
  };
  $$('.card', fan).forEach((c) => {
    c.addEventListener('pointerenter', (e) => e.pointerType === 'mouse' && show(c));
    c.addEventListener('focus', () => show(c));
    c.addEventListener('pointerleave', () => (hideT = setTimeout(() => panel.classList.remove('on'), 100)));
    c.addEventListener('blur', () => panel.classList.remove('on'));
  });
}
