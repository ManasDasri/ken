const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

// ---------- toast ----------
const toastEl = $('#toast');
let toastTimer;
function toast(msg) {
  toastEl.textContent = msg;
  toastEl.classList.add('on');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastEl.classList.remove('on'), 2200);
}

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

// ---------- light / dark ----------
const themeBtn = $('#theme');
const label = () => themeBtn.setAttribute('aria-label', `Switch to ${document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark'} mode`);
label();
themeBtn.addEventListener('click', () => {
  const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
  document.documentElement.dataset.theme = next;
  try { localStorage.setItem('theme', next); } catch {}
  label();
});

// ---------- tabs follow the section you're in ----------
const tabs = $$('.tab');
const sections = tabs.map((t) => $(t.getAttribute('href')));
const tabIO = new IntersectionObserver(
  (entries) => {
    for (const e of entries) if (e.isIntersecting) tabs.forEach((t) => t.classList.toggle('on', t.getAttribute('href') === `#${e.target.id}`));
  },
  { rootMargin: '-45% 0px -50% 0px' }
);
sections.forEach((s) => tabIO.observe(s));
tabs[0].classList.add('on');
$('#newtab').addEventListener('click', () => toast('No new tabs. Everything’s already here.'));

// ---------- you, and where you are ----------
const you = $('#you'), cx = $('#cx'), cy = $('#cy');
addEventListener('pointermove', (e) => {
  if (e.pointerType !== 'mouse') return;
  you.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
  you.classList.add('on');
  cx.textContent = Math.round(e.clientX);
  cy.textContent = Math.round(e.clientY);
});
document.addEventListener('pointerleave', () => you.classList.remove('on'));

// ---------- a second cursor that shows you around the hero ----------
const hero = $('#home'), bot = $('#bot');
const stops = ['.chip-loss', '.chip-term', '.toggle', '.chip-org', '.btn', '#namebox'].map((s) => $(s));
let stop = 0, heroOn = true;
new IntersectionObserver(([e]) => (heroOn = e.isIntersecting)).observe(hero);
function tour() {
  if (heroOn && !document.hidden && innerWidth > 900) {
    const t = stops[stop++ % stops.length].getBoundingClientRect(), h = hero.getBoundingClientRect();
    bot.style.transform = `translate(${t.left - h.left + t.width * 0.7}px, ${t.top - h.top + t.height * 0.6}px)`;
  }
}
if (!reduce) {
  setTimeout(tour, 1800);
  setInterval(tour, 2600);
} else bot.style.display = 'none';

// ---------- research / code ----------
const boxLabel = $('#boxlabel');
$$('.toggle button').forEach((b) =>
  b.addEventListener('click', () => {
    $$('.toggle button').forEach((o) => {
      o.classList.toggle('on', o === b);
      o.setAttribute('aria-pressed', o === b);
    });
    boxLabel.innerHTML = b.dataset.mode === 'code' ? 'engineer <b>0.99</b>' : 'researcher <b>0.97</b>';
  })
);

// ---------- pixels drifting under the name ----------
{
  const box = $('#pixels'), colours = ['#f5b800', '#a855f7', '#22c55e', '#3b82f6', '#ec4899', '#cfcfd6'];
  let seed = 11;
  const r = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
  const w = box.clientWidth;
  for (let row = 0; row < 6; row++) {
    const span = 0.32 + row * 0.13; // widens as it falls
    for (let k = 0; k < 7 + row * 3; k++) {
      if (r() < 0.35) continue;
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

// ---------- what I do ----------
$$('.acc li').forEach((li, i) => {
  const b = $('button', li);
  const set = (open) => {
    li.classList.toggle('open', open);
    b.setAttribute('aria-expanded', open);
  };
  b.addEventListener('click', () => set(!li.classList.contains('open')));
  if (i === 0) set(true);
});

// ---------- copy the address ----------
$('#copy').addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText('dasarimanas049@gmail.com');
    toast('Email copied');
  } catch {
    toast('Couldn’t copy. It’s dasarimanas049@gmail.com');
  }
});

// ---------- six pixels hidden around the page ----------
{
  const spots = [['#home', '8%', '70%', '#f5b800'], ['#work', '90%', '12%', '#a855f7'], ['#work', '6%', '58%', '#22c55e'], ['#do', '86%', '30%', '#3b82f6'], ['#upstream', '12%', '14%', '#ec4899'], ['#contact', '92%', '86%', '#f97316']];
  const found = $('#found');
  let n = 0;
  for (const [sec, x, y, c] of spots) {
    const b = document.createElement('button');
    b.className = 'px-hide';
    b.setAttribute('aria-label', 'A hidden pixel');
    b.style.cssText = `left:${x};top:${y};background:${c};animation-delay:-${Math.random() * 3}s`;
    b.addEventListener('click', () => {
      b.classList.add('got');
      n++;
      found.textContent = `${n}/6`;
      toast(n === 6 ? 'All six found. You’d be a great code reviewer.' : `${n} of 6 found`);
    });
    $(sec).append(b);
  }
}

// ---------- things arrive as you reach them ----------
const io = new IntersectionObserver((es) => es.forEach((e) => e.isIntersecting && (e.target.classList.add('seen'), io.unobserve(e.target))), { rootMargin: '0px 0px -8% 0px' });
$$('.sec-head, .item, .acc li, .pr, .cbox, .tiles a').forEach((el, i) => {
  el.classList.add('rise');
  el.style.transitionDelay = `${(i % 3) * 70}ms`;
  io.observe(el);
});
