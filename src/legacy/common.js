// Shared by every page: the browser-style tab bar and footer, the theme, and the
// interactions more than one page uses. Page-specific code lives in main.js / about.js / work.js.
export const $ = (s, el = document) => el.querySelector(s);
export const $$ = (s, el = document) => [...el.querySelectorAll(s)];
export const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

// ---------- my pull requests to other people's projects, live from GitHub ----------
// GitHub's search allows only a few unauthenticated calls a minute, so one answer is kept for a few
// minutes and shared by every page. My own repos, Sprout's org and a close collaborator's repos don't count.
const PR_QUERY = 'author:ManasDasri is:pr -user:ManasDasri -org:Sprout-DevLabs -user:AnushreeKasturi';
let prs = null;
export const githubPRs = () => (prs ??= (async () => {
  try {
    const hit = JSON.parse(localStorage.getItem('gh-prs') || 'null');
    if (hit && Date.now() - hit.t < 5 * 60e3) return hit.items;
  } catch {}
  const r = await fetch(`https://api.github.com/search/issues?q=${encodeURIComponent(PR_QUERY)}&sort=updated&order=desc&per_page=100`);
  if (!r.ok) throw new Error(r.status);
  const items = (await r.json()).items
    .filter((it) => it.state === 'open' || it.pull_request?.merged_at)
    .map((it) => ({
      repo: it.repository_url.split('/repos/')[1], title: it.title, url: it.html_url, n: it.number,
      merged: it.pull_request.merged_at, open: it.state === 'open', updated: it.updated_at,
    }));
  try { localStorage.setItem('gh-prs', JSON.stringify({ t: Date.now(), items })); } catch {}
  return items;
})());
export const ago = (iso) => {
  const s = (Date.parse(iso) - Date.now()) / 1000, rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
  for (const [u, n] of [['year', 31536000], ['month', 2592000], ['week', 604800], ['day', 86400], ['hour', 3600], ['minute', 60]]) if (Math.abs(s) >= n) return rtf.format(Math.round(s / n), u);
  return 'just now';
};

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
const foot = $('footer.foot');
if (foot && !foot.children.length) {
  const out = (href, name) => `<a href="${href}" target="_blank" rel="noopener">${name} <span aria-hidden="true">↗</span></a>`;
  foot.innerHTML = `
    <div class="ft-top">
      <div class="ft-brand">
        <a class="ft-name" href="/index.html"><img src="/img/brand/logo.png" alt="" />Manas Dasari</a>
        <p>Show your work. Ship the tool. Report the nulls.</p>
        <p class="ft-now"><i></i>Open to internships · <span class="clock">my time <b></b> IST</span></p>
        <p class="ft-live" hidden><span>Latest merge</span><a target="_blank" rel="noopener"></a><em></em></p>
      </div>
      <nav class="ft-col" aria-label="Pages"><h4>Pages</h4>${PAGES.map(([f, n]) => `<a href="${f}.html"${f === here ? ' aria-current="page"' : ''}>${n}</a>`).join('')}</nav>
      <nav class="ft-col" aria-label="Elsewhere"><h4>Elsewhere</h4>${out('https://github.com/ManasDasri', 'GitHub')}${out('https://www.linkedin.com/in/manas-dasari-2a52163a5/', 'LinkedIn')}${out('https://x.com/ManasDmg9', 'X')}${out('https://leetcode.com/u/ManasDasari/', 'LeetCode')}</nav>
      <div class="ft-col"><h4>Say hi</h4><a href="mailto:dasarimanas049@gmail.com">dasarimanas049@gmail.com</a>${out('resume.pdf', 'Résumé, PDF')}<a href="contact.html">Book a call</a></div>
    </div>
    <div class="ft-bar"><span>© 2026 Manas Dasari</span><span>Hand-built in plain HTML, CSS and JavaScript</span><button class="ft-up" type="button">Back to top <span aria-hidden="true">↑</span></button></div>
    <div class="ft-sign" aria-hidden="true">
      <img class="ft-doodle" src="/img/doodles/chilling.svg" alt="" />
      <canvas class="ft-led"></canvas>
    </div>`;
  $('.ft-up', foot).addEventListener('click', () => scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' }));
  // the last thing of mine that got merged somewhere, live (text only, so nothing from GitHub is read as HTML)
  githubPRs().then((items) => {
    const last = items.filter((p) => p.merged).sort((a, b) => Date.parse(b.merged) - Date.parse(a.merged))[0];
    if (!last || !/^https:\/\/github\.com\//.test(last.url)) return;
    const live = $('.ft-live', foot), a = $('a', live);
    a.href = last.url;
    a.textContent = `${last.repo} #${last.n}`;
    a.title = last.title;
    $('em', live).textContent = ago(last.merged);
    live.hidden = false;
  }).catch(() => {});
  ledName($('.ft-led', foot));
  // my local time, with a ticking colon
  const clk = $('.clock b', foot);
  const tick = () => {
    const [h, m] = new Date().toLocaleTimeString('en-GB', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit' }).split(':');
    clk.innerHTML = `${h}<i>:</i>${m}`;
  };
  tick();
  setInterval(tick, 15000);
}

// ---------- the footer sign-off: my name on an LED board ----------
// The name is sampled into a grid; lit cells become square pixels that a slow rainbow flows across,
// unlit cells are faint dots, and pixels near the cursor scatter and spring back home.
function ledName(cv) {
  const g = cv.getContext('2d');
  const HUES = ['#ec4899', '#a855f7', '#3b82f6', '#22c55e', '#f5b800'];
  let W = 0, H = 0, cell = 0, px = [], off = null, on = false, mouse = { x: -1e4, y: -1e4 };
  const build = () => {
    W = cv.parentElement.clientWidth;
    cell = Math.max(5, Math.round(W / 190));
    const cols = Math.floor(W / cell);
    // the name spans the width; the board is only as tall as the letters, minus their feet,
    // which run off the bottom of the page
    const s = document.createElement('canvas'), sg = s.getContext('2d', { willReadFrequently: true });
    sg.font = '100px "Geist Pixel", monospace';
    const fs = (100 * cols * 0.96) / sg.measureText('Manas Dasari').width;
    const rows = Math.round(fs * 0.66);
    H = rows * cell;
    const dpr = Math.min(devicePixelRatio || 1, 2);
    cv.width = W * dpr; cv.height = H * dpr;
    cv.style.height = `${H}px`;
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    // draw the name small, one canvas pixel per cell, and read back which cells are lit
    s.width = cols; s.height = rows;
    sg.font = `${fs}px "Geist Pixel", monospace`;
    sg.textAlign = 'center'; sg.textBaseline = 'alphabetic';
    sg.fillText('Manas Dasari', cols / 2, rows + fs * 0.1);
    const a = sg.getImageData(0, 0, cols, rows).data;
    px = [];
    // the unlit board is drawn once, behind everything
    off = document.createElement('canvas');
    off.width = cv.width; off.height = cv.height;
    const og = off.getContext('2d');
    og.setTransform(dpr, 0, 0, dpr, 0, 0);
    og.fillStyle = document.documentElement.dataset.theme === 'dark' ? 'rgb(255 255 255 / 0.06)' : 'rgb(19 19 22 / 0.07)';
    for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) {
      if (a[(y * cols + x) * 4 + 3] > 110) px.push({ hx: x * cell, hy: y * cell, x: x * cell, y: y * cell, vx: 0, vy: 0 });
      else og.fillRect(x * cell + cell * 0.35, y * cell + cell * 0.35, cell * 0.3, cell * 0.3);
    }
  };
  const draw = (t) => {
    g.clearRect(0, 0, W, H);
    g.drawImage(off, 0, 0, W, H);
    const s = cell * 0.82;
    for (const p of px) {
      // pushed away by the cursor, pulled home by a spring
      const dx = p.x - mouse.x, dy = p.y - mouse.y, d2 = dx * dx + dy * dy;
      if (d2 < 70 * 70 && d2 > 0) { const f = (1 - Math.sqrt(d2) / 70) * 2.4; p.vx += (dx / Math.sqrt(d2)) * f; p.vy += (dy / Math.sqrt(d2)) * f; }
      p.vx = (p.vx + (p.hx - p.x) * 0.08) * 0.8;
      p.vy = (p.vy + (p.hy - p.y) * 0.08) * 0.8;
      p.x += p.vx; p.y += p.vy;
      const u = ((p.hx + p.hy * 0.6) / W - t * 0.00008) * HUES.length;
      g.fillStyle = HUES[((Math.floor(u) % HUES.length) + HUES.length) % HUES.length];
      g.fillRect(p.x, p.y, s, s);
    }
  };
  const loop = (t) => { if (!on) return; requestAnimationFrame(loop); draw(t); };
  document.fonts.load('40px "Geist Pixel"').finally(() => {
    build();
    draw(0);
    new ResizeObserver(() => { build(); draw(performance.now()); }).observe(cv.parentElement);
    new MutationObserver(() => { build(); draw(performance.now()); }).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    if (reduce) return;
    new IntersectionObserver(([e]) => { on = e.isIntersecting; if (on) requestAnimationFrame(loop); }).observe(cv);
    cv.addEventListener('pointermove', (e) => { const r = cv.getBoundingClientRect(); mouse = { x: e.clientX - r.left, y: e.clientY - r.top }; });
    cv.addEventListener('pointerleave', () => { mouse = { x: -1e4, y: -1e4 }; });
  });
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

// ---------- contact: a dusk sky drawn in ASCII: every character takes its colour from the scene behind it ----------
if ($('#ascii')) {
  const host = $('#ascii').parentElement, cv = document.createElement('canvas');
  $('#ascii').append(cv);
  const g = cv.getContext('2d');
  const CW = 6, CH = 10; // one character cell, in CSS px
  // cloud texture, made once: fractal value noise that wraps left to right, so the clouds can drift forever
  const TW = 512, TH = 128, tex = new Float32Array(TW * TH);
  {
    const hash = (i, j) => { const h = Math.sin(i * 127.1 + j * 311.7) * 43758.5453; return h - Math.floor(h); };
    const sm = (x) => x * x * (3 - 2 * x);
    for (let o = 0, amp = 0.55, cell = 48; o < 5; o++, amp *= 0.5, cell /= 2) {
      const P = Math.round(TW / cell);
      for (let y = 0; y < TH; y++) for (let x = 0; x < TW; x++) {
        const fx = x / cell, fy = y / cell, i = Math.floor(fx), j = Math.floor(fy), u = sm(fx - i), v = sm(fy - j);
        const a = hash(i % P, j), b = hash((i + 1) % P, j), c = hash(i % P, j + 1), d = hash((i + 1) % P, j + 1);
        tex[y * TW + x] += amp * (a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v);
      }
    }
  }
  const at = (x, y) => tex[(Math.max(0, Math.min(TH - 1, y | 0))) * TW + ((((x | 0) % TW) + TW) % TW)];
  const mix = (p, q, k) => [p[0] + (q[0] - p[0]) * k, p[1] + (q[1] - p[1]) * k, p[2] + (q[2] - p[2]) * k];
  const ss = (e0, e1, x) => { const k = Math.min(1, Math.max(0, (x - e0) / (e1 - e0))); return k * k * (3 - 2 * k); };
  const lum = (p) => (0.3 * p[0] + 0.59 * p[1] + 0.11 * p[2]) / 255;
  // sky, top to bottom: night blue, deep blue, evening blue, then the warm band where the sun has set
  const SKY = [[0, [8, 11, 30]], [0.35, [22, 40, 88]], [0.62, [50, 86, 152]], [0.86, [214, 140, 128]], [1, [255, 194, 138]]];
  const skyAt = (v, warm) => {
    let i = 0;
    while (i < SKY.length - 2 && v > SKY[i + 1][0]) i++;
    const [v0, a] = SKY[i], [v1, b] = SKY[i + 1], c = mix(a, b, ss(v0, v1, v));
    // away from the sunset, the low sky stays blue
    return v > 0.6 ? mix(c, [64, 96, 160], (1 - warm) * ss(0.6, 1, v) * 0.8) : c;
  };
  const DEEP = [46, 58, 92], LIT = [255, 241, 216], RIM = [255, 162, 104];
  const RAMP = ' .:-=+*x#%8S0@';
  let W = 0, H = 0, cols = 0, rows = 0, dens = new Float32Array(0), hole = null;
  const size = () => {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    W = host.clientWidth; H = host.clientHeight;
    cv.width = W * dpr; cv.height = H * dpr;
    cv.style.width = `${W}px`; cv.style.height = `${H}px`;
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    g.font = '700 9px "Geist Mono", ui-monospace, monospace';
    g.textBaseline = 'top';
    cols = Math.ceil(W / CW); rows = Math.ceil(H / CH);
    dens = new Float32Array(cols * rows);
    // nobody sees the sky behind the card, so it isn't drawn there
    const hr = host.getBoundingClientRect(), cr = $('.cbox', host).getBoundingClientRect();
    hole = { l: cr.left - hr.left + 14, t: cr.top - hr.top + 14, r: cr.right - hr.left - 14, b: cr.bottom - hr.top - 14 };
  };
  const draw = (t) => {
    g.clearRect(0, 0, W, H);
    const k = TH / Math.max(H, 1), drift = t * 0.012;
    // 1. how much cloud is in each cell: swirled fractal noise, piled up toward the bottom and the sides
    for (let r = 0; r < rows; r++) {
      const v = r / rows, ty = r * CH * k;
      for (let c = 0; c < cols; c++) {
        const u = c / cols, tx = c * CW * k;
        const warp = (at(tx * 0.5 + 300, ty * 0.5) - 0.5) * 34;
        const n = at(tx + warp - drift, ty) * 0.72 + at(tx * 1.7 - drift * 1.6 + 150, ty * 1.7 + warp * 0.3) * 0.28;
        const side = (Math.abs(u - 0.5) * 2) ** 2.2;
        dens[r * cols + c] = ss(0.52, 0.64, n + ss(0.15, 1, v) * 0.4 + side * 0.3 - 0.1);
      }
    }
    // 2. light it, colour it, and pick each character by how bright that spot is
    for (let r = 0; r < rows; r++) {
      const v = r / rows, py = r * CH;
      for (let c = 0; c < cols; c++) {
        const px = c * CW;
        if (px > hole.l && px < hole.r && py > hole.t && py < hole.b) continue;
        const u = c / cols, warm = Math.exp(-((u - 0.5) ** 2) / 0.16), d = dens[r * cols + c];
        const sky = skyAt(v, warm);
        let col, ch, a;
        if (d > 0.04) {
          const up = (r > 0 ? dens[(r - 1) * cols + c] : 0) + (r > 1 ? dens[(r - 2) * cols + c] : 0) + (r > 2 ? dens[(r - 3) * cols + c] : 0);
          const down = r < rows - 2 ? dens[(r + 2) * cols + c] : 1;
          // tops catch the light, the insides sit in shade, the undersides glow where the sun is behind them
          const lit = Math.min(1, Math.max(0, 1.15 - up / 3));
          const rim = Math.max(0, d - down) * warm * ss(0.35, 1, v);
          col = mix(DEEP, LIT, lit * lit);
          col = mix(col, RIM, Math.min(1, rim * 1.6 + warm * ss(0.55, 1, v) * 0.3 * lit));
          col = mix(sky, col, Math.min(1, d * 1.15));
          ch = RAMP[Math.min(RAMP.length - 1, Math.max(2, Math.round(lum(col) * (RAMP.length - 1) * 1.08)))];
          a = 0.92;
        } else {
          const trail = Math.abs((v - 0.7) + (u - 0.3) * 0.85) < 0.008 && u > 0.3 && u < 0.97;
          const star = v < 0.42 && ((Math.sin(c * 12.9898 + r * 78.233) * 43758.5453) % 1 + 1) % 1 > 0.996;
          if (trail) { col = [175, 212, 255]; ch = (c % 3) ? 'x' : '+'; a = 0.3 + 0.55 * u; }
          else if (star) { col = [240, 244, 255]; ch = '*'; a = 0.45 + 0.4 * Math.sin(t * 0.002 + c * 3); }
          else if (c % 2) continue; // open sky is a sparse dot screen
          else { col = mix(sky, [255, 255, 255], 0.22); ch = lum(sky) > 0.45 ? ':' : '.'; a = 0.35 + lum(sky) * 0.5; }
        }
        g.fillStyle = `rgb(${col[0] | 0} ${col[1] | 0} ${col[2] | 0} / ${a.toFixed(2)})`;
        g.fillText(ch, px, py);
      }
    }
  };
  size();
  new ResizeObserver(size).observe(host);
  draw(0);
  if (!reduce) {
    // only while the section is on screen, about 12 frames a second: clouds are slow
    let on = false, last = 0;
    new IntersectionObserver(([e]) => { on = e.isIntersecting; if (on) requestAnimationFrame(loop); }).observe(host);
    const loop = (t) => {
      if (!on || document.hidden) return;
      requestAnimationFrame(loop);
      if (t - last < 80) return;
      last = t;
      draw(t);
    };
  }
  // a cat sits on the card, and blinks now and then
  const CAT = [['  /\\_/\\', ' ( o.o )', '  > ^ <'], ['  /\\_/\\', ' ( -.- )', '  > ^ <']];
  const cat = Object.assign(document.createElement('pre'), { className: 'cat', textContent: CAT[0].join('\n') });
  cat.setAttribute('aria-hidden', 'true');
  $('.cbox', host).append(cat);
  if (!reduce) {
    const blink = () => { cat.textContent = CAT[1].join('\n'); setTimeout(() => { cat.textContent = CAT[0].join('\n'); setTimeout(blink, 2500 + Math.random() * 4000); }, 160); };
    setTimeout(blink, 3000);
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
