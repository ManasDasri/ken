// Shared by every page: the browser-style tab bar and footer, the theme, and the
// interactions more than one page uses. Page-specific code lives in main.js / about.js / work.js.
import './koi.js';
export const $ = (s, el = document) => el.querySelector(s);
export const $$ = (s, el = document) => [...el.querySelectorAll(s)];
export const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

// ---------- the tab bar and footer ----------
const ICON = {
  home: '<path d="M2.5 7 8 2.5 13.5 7v6.5h-11z" /><path d="M6.5 13.5V10h3v3.5" />',
  work: '<rect x="2" y="4.5" width="12" height="9" rx="1.5" /><path d="M5.5 4.5v-2h5v2" />',
  do: '<path d="M8 1.5 9.6 6.4 14.5 8l-4.9 1.6L8 14.5 6.4 9.6 1.5 8l4.9-1.6z" />',
  about: '<circle cx="8" cy="5.5" r="2.5" /><path d="M3 14c0-3 2.2-5 5-5s5 2 5 5" />',
  oss: '<circle cx="4.5" cy="3.5" r="1.5" /><circle cx="4.5" cy="12.5" r="1.5" /><circle cx="11.5" cy="5.5" r="1.5" /><path d="M4.5 5v6M11.5 7c0 3-7 2-7 4" />',
  contact: '<rect x="2" y="3.5" width="12" height="9" rx="1.5" /><path d="m2.5 4.5 5.5 4 5.5-4" />',
};
const PAGES = [
  ['index', 'Home', 'green', 'home'],
  ['work', 'Work', 'yellow', 'work'],
  ['services', 'What I do', 'purple', 'do'],
  ['about', 'About', 'orange', 'about'],
  ['opensource', 'Open source', 'blue', 'oss'],
  ['contact', 'Contact', 'pink', 'contact'],
];
const here = location.pathname.split('/').pop().replace(/\.html$/, '') || 'index';
const svg = (d) => `<svg viewBox="0 0 16 16">${d}</svg>`;

const chrome = $('header.chrome');
if (chrome && !chrome.children.length) {
  chrome.innerHTML = `
    <span class="lights" aria-hidden="true"><i></i><i></i><i></i></span>
    <a href="index.html" class="mark" aria-label="Home"><svg viewBox="0 0 8 8" shape-rendering="crispEdges"><path class="leaf" d="M1 1h2v1h1v1H3V2H1zM5 1h2v1H6v1H5z" /><path class="stem" d="M4 3h1v4H4z" /></svg></a>
    <nav class="tabs" aria-label="Pages">
      ${PAGES.map(([file, name, c, icon]) => `<a href="${file}.html" class="tab${file === here ? ' on' : ''}" data-c="${c}"${file === here ? ' aria-current="page"' : ''}>${svg(ICON[icon])}<span>${name}</span>${file === 'work' ? '<b class="tab-peek" aria-hidden="true"><i></i><i></i><i></i></b>' : ''}</a>`).join('')}
      <button class="tab-new" id="newtab" aria-label="New tab">${svg('<path d="M8 3v10M3 8h10" />')}</button>
    </nav>
    <div class="chrome-end">
      <button class="theme" id="theme" aria-label="Switch theme">
        <svg class="sun" viewBox="0 0 16 16"><circle cx="8" cy="8" r="3" /><path d="M8 1v1.5M8 13.5V15M1 8h1.5M13.5 8H15M3 3l1 1M12 12l1 1M3 13l1-1M12 4l1-1" /></svg>
        <svg class="moon" viewBox="0 0 16 16"><path d="M13.5 9.5A5.5 5.5 0 0 1 6.5 2.5a5.5 5.5 0 1 0 7 7z" /></svg>
      </button>
      <span class="avail"><i></i>Open to internships</span>
    </div>`;
}
const foot = $('footer.foot');
if (foot && !foot.children.length) {
  foot.innerHTML = `<span>© 2026 Manas Dasari</span><nav aria-label="Footer">${PAGES.slice(1).map(([f, n]) => `<a href="${f}.html">${n}</a>`).join('')}</nav>`;
}

// ---------- toast ----------
const toastEl = $('#toast') ?? document.body.appendChild(Object.assign(document.createElement('div'), { className: 'toast', id: 'toast', role: 'status' }));
let toastTimer;
export function toast(msg) {
  toastEl.textContent = msg;
  toastEl.classList.add('on');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastEl.classList.remove('on'), 2200);
}
$('#newtab')?.addEventListener('click', () => toast('No new tabs. Everything’s already here.'));

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

// ---------- where the cursor is (the hero shows it) ----------
const cx = $('#cx'), cy = $('#cy');
if (cx) addEventListener('pointermove', (e) => {
  cx.textContent = Math.round(e.clientX);
  cy.textContent = Math.round(e.clientY);
});

// ---------- things arrive as you reach them ----------
const io = new IntersectionObserver((es) => es.forEach((e) => e.isIntersecting && (e.target.classList.add('seen'), io.unobserve(e.target))), { rootMargin: '0px 0px -8% 0px' });
$$('.sec-head, .item, .pr, .cbox, .tiles a, .tiles button, .rule-grid article, .also-grid a').forEach((el, i) => {
  el.classList.add('rise');
  el.style.transitionDelay = `${(i % 3) * 70}ms`;
  io.observe(el);
});

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

// ---------- what I do: rows open while you hover them ----------
{
  const rows = $$('.svc li');
  const open = (li) => rows.forEach((r) => r.classList.toggle('open', r === li));
  rows.forEach((li) => {
    const a = li.querySelector('a');
    li.addEventListener('pointerenter', (e) => e.pointerType === 'mouse' && open(li));
    a.addEventListener('focus', () => open(li));
    a.addEventListener('blur', () => open(null));
    // on touch, the first tap opens the row and the second follows the link
    a.addEventListener('click', (e) => {
      if (!li.classList.contains('open')) {
        e.preventDefault();
        open(li);
      }
    });
  });
  rows[0]?.parentElement.addEventListener('pointerleave', () => open(null));
}

// ---------- copy the address ----------
$('#copy')?.addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText('dasarimanas049@gmail.com');
    toast('Email copied');
  } catch {
    toast('Couldn’t copy. It’s dasarimanas049@gmail.com');
  }
});

// ---------- contact: a calendar that drafts the email ----------
if ($('#cal-grid')) {
  const grid = $('#cal-grid'), title = $('#cal-title'), pickText = $('#cal-pick'), go = $('#cal-go');
  const prev = $('#cal-prev'), next = $('#cal-next');
  const today = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
  today.setHours(0, 0, 0, 0);
  let view = new Date(today.getFullYear(), today.getMonth(), 1);
  let picked = new Date(today);
  picked.setDate(picked.getDate() + 1);
  const fmt = (d) => d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
  const render = () => {
    title.textContent = view.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
    grid.replaceChildren(...['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map((d) => Object.assign(document.createElement('span'), { className: 'wd', textContent: d })));
    for (let i = 0; i < (view.getDay() + 6) % 7; i++) grid.append(document.createElement('span'));
    const days = new Date(view.getFullYear(), view.getMonth() + 1, 0).getDate();
    for (let d = 1; d <= days; d++) {
      const date = new Date(view.getFullYear(), view.getMonth(), d);
      const b = Object.assign(document.createElement('button'), { textContent: d, disabled: date < today });
      b.classList.toggle('today', +date === +today);
      b.classList.toggle('pick', +date === +picked);
      b.setAttribute('aria-label', fmt(date));
      b.addEventListener('click', () => choose(date));
      grid.append(b);
    }
    prev.disabled = view <= new Date(today.getFullYear(), today.getMonth(), 1);
    next.disabled = view >= new Date(today.getFullYear(), today.getMonth() + 2, 1);
  };
  const choose = (d) => {
    picked = d;
    pickText.replaceChildren(Object.assign(document.createElement('b'), { textContent: fmt(d) }), ' · I’ll reply to set a time');
    const body = `Hi Manas,\n\nCould we talk on ${fmt(d)}? Here's what I have in mind:\n\n`;
    go.href = `mailto:dasarimanas049@gmail.com?subject=${encodeURIComponent(`A call on ${fmt(d)}?`)}&body=${encodeURIComponent(body)}`;
    if (d.getMonth() !== view.getMonth()) view = new Date(d.getFullYear(), d.getMonth(), 1);
    render();
  };
  prev.addEventListener('click', () => { view = new Date(view.getFullYear(), view.getMonth() - 1, 1); render(); });
  next.addEventListener('click', () => { view = new Date(view.getFullYear(), view.getMonth() + 1, 1); render(); });
  choose(picked);
}

// ---------- contact: ASCII on graph paper, under the cursor ----------
if ($('#ascii')) {
  const contact = $('#ascii').parentElement, layer = $('#ascii');
  const CH = 'o.;:t+x%$&@#S8X=*{}<>/'.split(''), TONES = ['c-purple', 'c-blue', 'c-green', 'c-yellow'];
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
  const cluster = (fx, fy, tone, n) => {
    const w = contact.clientWidth, h = contact.clientHeight;
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2, r = Math.sqrt(Math.random()) * 90;
      cell(w * fx + Math.cos(a) * r * 1.4, h * fy + Math.sin(a) * r * 0.8, true, Math.random() < 0.45 ? tone : null);
    }
  };
  cluster(0.42, 0.1, 'c-purple', 60);
  cluster(0.95, 0.42, 'c-blue', 36);
  cluster(0.04, 0.78, 'c-green', 48);
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
}

// ---------- between pages: pixel out, pixel in ----------
{
  const BLOCK = 44;
  const cover = (fill) => {
    const cv = Object.assign(document.createElement('canvas'), { className: 'pxfx' });
    cv.width = innerWidth;
    cv.height = innerHeight;
    document.body.append(cv);
    const g = cv.getContext('2d');
    const cols = Math.ceil(innerWidth / BLOCK), rows = Math.ceil(innerHeight / BLOCK);
    const order = [...Array(cols * rows).keys()].sort(() => Math.random() - 0.5);
    const ink = getComputedStyle(document.documentElement).getPropertyValue('--ink').trim();
    const tints = ['#86efac', '#fcd34d', '#d8b4fe', '#93c5fd'];
    if (fill) { g.fillStyle = ink; g.fillRect(0, 0, cv.width, cv.height); }
    return { cv, g, cols, order, ink, tints };
  };
  // out: blocks fill the screen, a few in colour, then the next page loads
  const go = (href) => {
    try { sessionStorage.setItem('px', '1'); } catch {}
    const { cv, g, cols, order, ink, tints } = cover(false);
    const start = performance.now(), dur = 360;
    let done = 0;
    const step = (t) => {
      const upto = Math.min(order.length, Math.ceil(((t - start) / dur) * order.length));
      for (; done < upto; done++) {
        const n = order[done];
        g.fillStyle = Math.random() < 0.08 ? tints[n % 4] : ink;
        g.fillRect((n % cols) * BLOCK, Math.floor(n / cols) * BLOCK, BLOCK, BLOCK);
      }
      if (done < order.length) requestAnimationFrame(step);
      else location.href = href;
    };
    requestAnimationFrame(step);
  };
  if (!reduce) {
    document.addEventListener('click', (e) => {
      const a = e.target.closest('a[href]');
      if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || a.target === '_blank') return;
      const url = new URL(a.href, location.href);
      if (url.origin !== location.origin || !/\.html$|\/$/.test(url.pathname) || (url.pathname === location.pathname && url.hash)) return;
      e.preventDefault();
      go(url.href);
    });
  }
  // in: the page starts covered (see the head script) and the blocks clear away
  if (document.documentElement.classList.contains('px-in')) {
    try { sessionStorage.removeItem('px'); } catch {}
    const { cv, g, cols, order } = cover(true);
    document.documentElement.classList.remove('px-in');
    const start = performance.now(), dur = 420;
    let done = 0;
    const step = (t) => {
      const upto = Math.min(order.length, Math.ceil(((t - start) / dur) * order.length));
      for (; done < upto; done++) {
        const n = order[done];
        g.clearRect((n % cols) * BLOCK, Math.floor(n / cols) * BLOCK, BLOCK, BLOCK);
      }
      if (done < order.length) requestAnimationFrame(step);
      else cv.remove();
    };
    requestAnimationFrame(step);
  }
  // coming back with the back button shows the page as it was left, so clear any cover
  addEventListener('pageshow', (e) => e.persisted && $$('.pxfx').forEach((c) => c.remove()));
}
