// Shared by every page: the browser-style tab bar, the theme, and the
// interactions more than one page uses. Page-specific code lives in main.js / about.js / work.js.
export const $ = (s, el = document) => el.querySelector(s);
export const $$ = (s, el = document) => [...el.querySelectorAll(s)];
export const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

export { githubPRs, ago } from './github.js';

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
const here = (location.pathname.split('/').pop().replace(/\.html$/, '') || 'index').replace(/^project$/, 'work');
const svg = (d) => `<svg viewBox="0 0 16 16">${d}</svg>`;

const chrome = $('header.chrome');
if (chrome && !chrome.children.length) {
  chrome.innerHTML = `
    <span class="lights" aria-hidden="true"><i></i><i></i><i></i></span>
    <a href="/index.html" class="mark" aria-label="Home"><img src="/img/brand/logo.png" alt="" /></a>
    <nav class="tabs" aria-label="Pages">
      ${PAGES.map(([file, name, c, icon]) => `<a href="/${file}.html" class="tab${file === here ? ' on' : ''}" data-c="${c}"${file === here ? ' aria-current="page"' : ''}>${svg(ICON[icon])}<span>${name}</span>${file === 'work' ? '<b class="tab-peek" aria-hidden="true"><i></i><i></i><i></i></b>' : ''}</a>`).join('')}
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
// ---------- the background: grainy off-white paper, with soft window-light shadows drifting across it (all CSS) ----------
{
  const bg = document.createElement('div');
  bg.className = 'bgfx';
  bg.setAttribute('aria-hidden', 'true');
  bg.innerHTML = '<i></i><i></i><b></b>';
  document.body.prepend(bg);
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

// ---------- things near the bottom of the screen are out of focus, and sharpen as they rise ----------
// Each block gets its own blur from where it sits, so nothing is laid over the page: hover or focus
// anything and it's sharp at once (style.css). No blur near the very end of the page, where the footer is.
if (!reduce) {
  const ZONE = 170, MAX = 5;
  let els = null, raf = 0;
  const tick = () => {
    raf = 0;
    els ??= $$('.sec-head, .folder, .svc li, .cbox, .tiles a, .tiles button, .item, .pr, .rule-grid article, .also-grid a, .more-bar, .case-head, .print, .note, .receipt-wrap');
    const end = Math.min(1, (document.documentElement.scrollHeight - innerHeight - scrollY) / 300);
    for (const el of els) {
      const top = el.getBoundingClientRect().top, d = innerHeight - top;
      const b = Math.round((d > 0 && d < ZONE ? (1 - d / ZONE) * MAX * end : 0) * 4) / 4;
      if (b === el.fz) continue;
      el.fz = b;
      el.style.setProperty('--fz', `${b}px`);
      el.classList.toggle('fz', b > 0);
    }
  };
  const go = () => { if (!raf) raf = requestAnimationFrame(tick); };
  addEventListener('scroll', go, { passive: true });
  addEventListener('resize', go);
  setTimeout(go, 300);
}

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

// ---------- contact: a dusk sky drawn in ASCII ----------
// Real cumulus are painted first (soft puffs piled into domes with flat bases, lit from above, shaded
// underneath, warm where the sunset is behind them), then every character cell takes its colour and its
// character from that painting. The clouds drift; open sky is a fine screen of faint characters.
if ($('#ascii')) {
  const host = $('#ascii').parentElement, cv = document.createElement('canvas');
  $('#ascii').append(cv);
  const g = cv.getContext('2d');
  const CW = 5, CH = 8; // one character cell, in CSS px
  const RAMP = " .'`,:;-~=+<>il!iITt7jJ1fxyzvcsoeaw*#%&8BWM@";
  const mix = (p, q, k) => [p[0] + (q[0] - p[0]) * k, p[1] + (q[1] - p[1]) * k, p[2] + (q[2] - p[2]) * k];
  const ss = (e0, e1, x) => { const k = Math.min(1, Math.max(0, (x - e0) / (e1 - e0))); return k * k * (3 - 2 * k); };
  const lum = (p) => (0.3 * p[0] + 0.59 * p[1] + 0.11 * p[2]) / 255;
  // sky, top to bottom: night blue, deep blue, evening blue, then the warm band where the sun has set
  const SKY = [[0, [8, 11, 30]], [0.35, [22, 40, 88]], [0.62, [50, 86, 152]], [0.86, [214, 140, 128]], [1, [255, 194, 138]]];
  const skyAt = (v, warm) => {
    let i = 0;
    while (i < SKY.length - 2 && v > SKY[i + 1][0]) i++;
    const [v0, a] = SKY[i], [v1, b] = SKY[i + 1], c = mix(a, b, ss(v0, v1, v));
    return v > 0.6 ? mix(c, [64, 96, 160], (1 - warm) * ss(0.6, 1, v) * 0.8) : c;
  };
  // the clouds, made once from a fixed seed so they're the same every visit
  let seed = 9;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
  const cloud = (x, y, s, flat = 1) => {
    const puffs = [], n = 10 + Math.floor(rnd() * 8);
    for (let i = 0; i < n; i++) {
      const t = (i / (n - 1)) * 2 - 1, r = (0.3 + 0.42 * (1 - t * t)) * (0.75 + rnd() * 0.5);
      puffs.push([t * 1.05 + (rnd() - 0.5) * 0.18, (-r * 0.5 - rnd() * 0.2 * (1 - t * t)) * flat, r]);
    }
    for (let k = 0, m = 2 + Math.floor(rnd() * 4); k < m; k++) {
      const r = 0.22 + rnd() * 0.3;
      puffs.push([(rnd() * 2 - 1) * 0.55, (-0.55 - rnd() * 0.4) * flat, r]);
    }
    return { x, y, s, puffs, sp: 0.004 + rnd() * 0.006 };
  };
  // where they sit, as fractions of the section: a towering bank along the bottom, a few at the sides,
  // thin flat ones high up
  const LAYOUT = [
    [0.05, 1.05, 0.2], [0.27, 1.08, 0.24], [0.52, 1.1, 0.2], [0.75, 1.06, 0.25], [0.97, 1.04, 0.2],
    [0.07, 0.62, 0.13], [0.94, 0.68, 0.14], [0.02, 0.3, 0.09, 0.45], [0.9, 0.24, 0.1, 0.45], [0.45, 0.13, 0.08, 0.4],
  ];
  let W = 0, H = 0, cols = 0, rows = 0, hole = null, clouds = [];
  const paint = document.createElement('canvas'), pg = paint.getContext('2d', { willReadFrequently: true });
    seed = 9;
  const shapes = LAYOUT.map(([x, y, s, f]) => ({ ...cloud(0, 0, 0, f ?? 1), fx: x, fy: y, fs: s }));
  const size = () => {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    W = host.clientWidth; H = host.clientHeight;
    cv.width = W * dpr; cv.height = H * dpr;
    cv.style.width = `${W}px`; cv.style.height = `${H}px`;
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    g.font = '600 8px "Geist Mono", ui-monospace, monospace';
    g.textBaseline = 'top';
    cols = Math.ceil(W / CW); rows = Math.ceil(H / CH);
    // the painting is one pixel per character cell; we draw on it in CSS px
    paint.width = cols; paint.height = rows;
    pg.setTransform(1 / CW, 0, 0, 1 / CH, 0, 0);
    clouds = shapes.map((c) => ({ ...c, x: c.fx * W, y: c.fy * H, s: c.fs * W }));
    // nobody sees the sky behind the card, so it isn't drawn there
    const hr = host.getBoundingClientRect(), cr = $('.cbox', host).getBoundingClientRect();
    hole = { l: cr.left - hr.left + 14, t: cr.top - hr.top + 14, r: cr.right - hr.left - 14, b: cr.bottom - hr.top - 14 };
  };
  const paintCloud = (c) => {
    // puffs high in the cloud first, lower ones over them, each lit from the upper left with a shaded rim,
    // so overlapping puffs read as the billows of a cumulus
    const warm = Math.exp(-((c.x / W - 0.5) ** 2) / 0.16) * ss(0.5, 1.05, c.y / H);
    const SHADE = mix([104, 114, 156], [214, 128, 112], warm), LIT = [255, 248, 236];
    pg.save();
    pg.beginPath(); pg.rect(c.x - c.s * 2, c.y - c.s * 2, c.s * 4, c.s * 2 + c.s * 0.04); pg.clip(); // the flat base
    for (const [dx, dy, r] of [...c.puffs].sort((p, q) => p[1] - q[1])) {
      const x = c.x + dx * c.s, y = c.y + dy * c.s, R = r * c.s;
      const k = Math.min(1, Math.max(0, -dy / 1.1)); // 0 at the base, 1 at the top
      const hi = mix(SHADE, LIT, 0.72 + 0.28 * k), mid = mix(SHADE, LIT, 0.42 + 0.45 * k);
      const grd = pg.createRadialGradient(x - R * 0.3, y - R * 0.38, R * 0.05, x, y, R);
      grd.addColorStop(0, `rgb(${hi.map((q) => q | 0).join(' ')})`);
      grd.addColorStop(0.55, `rgb(${mid.map((q) => q | 0).join(' ')})`);
      grd.addColorStop(0.88, `rgb(${SHADE.map((q) => q | 0).join(' ')} / 0.9)`);
      grd.addColorStop(1, `rgb(${SHADE.map((q) => q | 0).join(' ')} / 0)`);
      pg.fillStyle = grd;
      pg.beginPath(); pg.arc(x, y, R, 0, Math.PI * 2); pg.fill();
    }
    pg.restore();
  };
  const draw = (t, dt = 0) => {
    pg.clearRect(0, 0, W, H);
    for (const c of clouds) {
      c.x += c.sp * dt;
      if (c.x - c.s * 1.4 > W) c.x = -c.s * 1.4;
      paintCloud(c);
    }
    const px = pg.getImageData(0, 0, cols, rows).data;
    g.clearRect(0, 0, W, H);
    for (let r = 0; r < rows; r++) {
      const v = r / rows, py = r * CH;
      for (let c = 0; c < cols; c++) {
        const x = c * CW;
        if (x > hole.l && x < hole.r && py > hole.t && py < hole.b) continue;
        const u = c / cols, warm = Math.exp(-((u - 0.5) ** 2) / 0.16), sky = skyAt(v, warm);
        const i = (r * cols + c) * 4, a = px[i + 3] / 255;
        let col, ch, al;
        if (a > 0.04) {
          col = mix(sky, [px[i], px[i + 1], px[i + 2]], Math.min(1, a * 1.1));
          const jit = (((Math.sin(c * 91.7 + r * 47.3) * 9301.17) % 1) + 1) % 1 - 0.5; // so rows don't repeat one character
          ch = RAMP[Math.min(RAMP.length - 1, Math.max(2, Math.round(((0.25 + 0.75 * a) * lum(col) * 1.15 + jit * 0.12) * (RAMP.length - 1))))];
          al = 0.55 + 0.4 * a;
        } else {
          const trail = Math.abs((v - 0.7) + (u - 0.3) * 0.85) < 0.008 && u > 0.3 && u < 0.97;
          const star = v < 0.42 && ((Math.sin(c * 12.9898 + r * 78.233) * 43758.5453) % 1 + 1) % 1 > 0.997;
          if (trail) { col = [175, 212, 255]; ch = (c % 3) ? 'x' : '+'; al = 0.3 + 0.55 * u; }
          else if (star) { col = [240, 244, 255]; ch = '*'; al = 0.45 + 0.4 * Math.sin(t * 0.002 + c * 3); }
          // open sky: the faintest characters, so the whole frame reads as text
          else { col = mix(sky, [255, 255, 255], 0.16); ch = RAMP[1 + ((c * 7 + r * 3) % 3)]; al = 0.22 + lum(sky) * 0.4; }
        }
        g.fillStyle = `rgb(${col[0] | 0} ${col[1] | 0} ${col[2] | 0} / ${al.toFixed(2)})`;
        g.fillText(ch, x, py);
      }
    }
  };
  size();
  new ResizeObserver(() => { size(); draw(performance.now()); }).observe(host);
  draw(0);
  if (!reduce) {
    // only while the section is on screen, about 12 frames a second: clouds are slow
    let on = false, last = 0;
    new IntersectionObserver(([e]) => { on = e.isIntersecting; if (on) { last = performance.now(); requestAnimationFrame(loop); } }).observe(host);
    const loop = (t) => {
      if (!on || document.hidden) return;
      requestAnimationFrame(loop);
      if (t - last < 80) return;
      draw(t, t - last);
      last = t;
    };
  }
}

// ---------- between pages: pixel out, pixel in ----------
{
  const BLOCK = 18; // small pixels, lots of them
  const cover = (fill) => {
    const cv = Object.assign(document.createElement('canvas'), { className: 'pxfx' });
    cv.width = innerWidth;
    cv.height = innerHeight;
    document.body.append(cv);
    const g = cv.getContext('2d');
    const cols = Math.ceil(innerWidth / BLOCK), rows = Math.ceil(innerHeight / BLOCK);
    // a diagonal sweep with a ragged edge: each block's turn comes from where it sits, plus a bit of noise
    const key = new Float32Array(cols * rows);
    for (let n = 0; n < key.length; n++) key[n] = ((n % cols) / cols + Math.floor(n / cols) / rows) / 2 + Math.random() * 0.28;
    const order = [...key.keys()].sort((a, b) => key[a] - key[b]);
    const ink = getComputedStyle(document.documentElement).getPropertyValue('--ink').trim();
    const tints = ['#86efac', '#fcd34d', '#d8b4fe', '#93c5fd', '#f9a8d4'];
    if (fill) {
      g.fillStyle = ink; g.fillRect(0, 0, cv.width, cv.height);
      // the same scattering of colour on the way in
      for (let n = 0; n < cols * rows; n++) if (Math.random() < 0.14) { g.fillStyle = tints[n % 5]; g.fillRect((n % cols) * BLOCK, Math.floor(n / cols) * BLOCK, BLOCK, BLOCK); }
    }
    return { cv, g, cols, order, ink, tints };
  };
  // out: blocks fill the screen, a few in colour, then the next page loads
  const go = (href) => {
    try { sessionStorage.setItem('px', '1'); } catch {}
    const { cv, g, cols, order, ink, tints } = cover(false);
    const start = performance.now(), dur = 420;
    let done = 0;
    const step = (t) => {
      const upto = Math.min(order.length, Math.ceil(((t - start) / dur) * order.length));
      for (; done < upto; done++) {
        const n = order[done];
        g.fillStyle = Math.random() < 0.14 ? tints[n % 5] : ink;
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
    const start = performance.now(), dur = 520;
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
