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

// ---------- the dot grid lights up around the cursor ----------
const root = document.documentElement.style;
const sizeDoc = () => root.setProperty('--doc-h', `${document.documentElement.scrollHeight}px`);
new ResizeObserver(sizeDoc).observe(document.body);
let lastX = -999, lastY = -999;
const paintGlow = () => {
  root.setProperty('--mx', `${lastX + scrollX}px`);
  root.setProperty('--my', `${lastY + scrollY}px`);
};
addEventListener('pointermove', (e) => {
  if (e.pointerType !== 'mouse') return;
  lastX = e.clientX;
  lastY = e.clientY;
  paintGlow();
});
addEventListener('scroll', paintGlow, { passive: true });

// ---------- pixel headings: letters jump out of the cursor's way ----------
const glitchChars = [];
$$('.glitch').forEach((h) => {
  const words = h.textContent.split(' ');
  h.setAttribute('aria-label', h.textContent);
  h.textContent = '';
  words.forEach((w, wi) => {
    const word = document.createElement('span');
    word.style.cssText = 'display:inline-block;white-space:nowrap';
    word.setAttribute('aria-hidden', 'true');
    for (const c of w) {
      const ch = document.createElement('span');
      ch.className = 'ch';
      ch.textContent = c;
      word.append(ch);
      glitchChars.push(ch);
    }
    h.append(word);
    if (wi < words.length - 1) h.append(' ');
  });
});
let glitchRaf = 0;
addEventListener('pointermove', (e) => {
  if (e.pointerType !== 'mouse' || reduce) return;
  cancelAnimationFrame(glitchRaf);
  glitchRaf = requestAnimationFrame(() => {
    for (const ch of glitchChars) {
      const r = ch.getBoundingClientRect();
      if (r.bottom < -50 || r.top > innerHeight + 50) continue;
      const d = Math.hypot(e.clientX - (r.left + r.width / 2), (e.clientY - (r.top + r.height / 2)) * 1.3);
      const p = Math.max(0, 1 - d / 110);
      if (p > 0.02) {
        ch.classList.add('hot');
        ch.style.setProperty('--p', p.toFixed(2));
        ch.style.transform = `translateY(${(-p * 10).toFixed(1)}px) scale(${(1 + p * 0.3).toFixed(2)})`;
      } else if (ch.classList.contains('hot')) {
        ch.classList.remove('hot');
        ch.style.transform = '';
      }
    }
  });
});

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
    if (e.button !== 0 || e.target.closest('a, button, .frame, .chip, .toggle, .box, .px-hide')) return;
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

// ---------- what I do: open on hover, show the work ----------
{
  const rows = $$('.svc li');
  const open = (li) => rows.forEach((r) => r.classList.toggle('open', r === li));
  rows.forEach((li) => {
    li.addEventListener('pointerenter', (e) => e.pointerType === 'mouse' && open(li));
    li.querySelector('a').addEventListener('focus', () => open(li));
    li.querySelector('a').addEventListener('click', (e) => {
      if (!li.classList.contains('open')) {
        e.preventDefault();
        open(li);
      }
    });
  });
  open(rows[0]);
}

// ---------- contact: a calendar that drafts the email ----------
{
  const grid = $('#cal-grid'), title = $('#cal-title'), pickText = $('#cal-pick'), go = $('#cal-go');
  const prev = $('#cal-prev'), next = $('#cal-next');
  const today = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
  today.setHours(0, 0, 0, 0);
  let view = new Date(today.getFullYear(), today.getMonth(), 1);
  let picked = new Date(today);
  picked.setDate(picked.getDate() + 1);
  const fmt = (d) => d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
  function choose(d) {
    picked = d;
    pickText.innerHTML = `<b>${fmt(d)}</b> · I’ll reply to set a time`;
    const subject = `A call on ${fmt(d)}?`;
    const body = `Hi Manas,\n\nCould we talk on ${fmt(d)}? Here's what I have in mind:\n\n`;
    go.href = `mailto:dasarimanas049@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    render();
  }
  function render() {
    title.textContent = view.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
    grid.replaceChildren(...['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map((d) => Object.assign(document.createElement('span'), { className: 'wd', textContent: d })));
    const lead = (view.getDay() + 6) % 7;
    for (let i = 0; i < lead; i++) grid.append(document.createElement('span'));
    const days = new Date(view.getFullYear(), view.getMonth() + 1, 0).getDate();
    for (let d = 1; d <= days; d++) {
      const date = new Date(view.getFullYear(), view.getMonth(), d);
      const b = document.createElement('button');
      b.textContent = d;
      b.disabled = date < today;
      b.classList.toggle('today', +date === +today);
      b.classList.toggle('pick', +date === +picked);
      b.setAttribute('aria-label', fmt(date));
      b.addEventListener('click', () => choose(date));
      grid.append(b);
    }
    prev.disabled = view <= new Date(today.getFullYear(), today.getMonth(), 1);
    next.disabled = view >= new Date(today.getFullYear(), today.getMonth() + 2, 1);
  }
  prev.addEventListener('click', () => { view = new Date(view.getFullYear(), view.getMonth() - 1, 1); render(); });
  next.addEventListener('click', () => { view = new Date(view.getFullYear(), view.getMonth() + 1, 1); render(); });
  choose(picked);
  if (picked.getMonth() !== view.getMonth()) { view = new Date(picked.getFullYear(), picked.getMonth(), 1); render(); }
}

// ---------- contact: ASCII on graph paper, and paper planes ----------
{
  const contact = $('#contact'), layer = $('#ascii');
  const CH = 'o.;:t+x%$&@#S8X=*'.split(''), TONES = ['c-purple', 'c-blue', 'c-green', 'c-yellow'];
  const cell = (x, y, still, tone) => {
    const s = document.createElement('span');
    s.textContent = CH[Math.floor(Math.random() * CH.length)];
    s.style.left = `${Math.floor(x / 14) * 14}px`;
    s.style.top = `${Math.floor(y / 14) * 14}px`;
    if (tone) s.classList.add('k', tone);
    if (still) s.classList.add('still');
    else s.addEventListener('animationend', () => s.remove());
    layer.append(s);
  };
  // a few clusters already on the paper
  const cluster = (fx, fy, tone, n) => {
    const w = contact.clientWidth, h = contact.clientHeight;
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2, r = Math.sqrt(Math.random()) * 90;
      cell(w * fx + Math.cos(a) * r * 1.4, h * fy + Math.sin(a) * r * 0.8, true, Math.random() < 0.45 ? tone : null);
    }
  };
  cluster(0.42, 0.1, 'c-purple', 70);
  cluster(0.95, 0.42, 'c-blue', 40);
  cluster(0.04, 0.78, 'c-purple', 55);
  let last = 0;
  contact.addEventListener('pointermove', (e) => {
    if (reduce || e.pointerType !== 'mouse' || e.target.closest('.cbox, .tiles') || layer.childElementCount > 400) return;
    const now = performance.now();
    if (now - last < 24) return;
    last = now;
    const r = contact.getBoundingClientRect();
    const tone = TONES[Math.floor((now / 900) % TONES.length)];
    for (let k = 0; k < 3; k++) cell(e.clientX - r.left + (Math.random() - 0.5) * 42, e.clientY - r.top + (Math.random() - 0.5) * 42, false, Math.random() < 0.5 ? tone : null);
  });
  contact.addEventListener('click', (e) => {
    if (e.target.closest('a, button, .cbox, .tiles')) return;
    const r = contact.getBoundingClientRect();
    const x = e.clientX - r.left, y = e.clientY - r.top;
    const tag = Object.assign(document.createElement('span'), { className: 'launch', textContent: 'LAUNCH' });
    Object.assign(tag.style, { left: `${x + 14}px`, top: `${y - 30}px` });
    const plane = document.createElement('span');
    plane.className = 'plane';
    plane.innerHTML = '<svg viewBox="0 0 24 24"><path d="M2 11 22 3l-6 18-4-7z" /><path d="m12 14 10-11" /></svg>';
    const ex = x + (x < r.width / 2 ? 1 : -1) * (300 + Math.random() * 300), ey = -80;
    plane.style.offsetPath = `path('M ${x} ${y} C ${x + 120} ${y - 40}, ${(x + ex) / 2} ${y + 120}, ${ex} ${ey}')`;
    plane.addEventListener('animationend', () => plane.remove());
    tag.addEventListener('animationend', () => tag.remove());
    contact.append(plane, tag);
  });
}
