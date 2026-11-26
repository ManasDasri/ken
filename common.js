export const $ = (s, el = document) => el.querySelector(s);
export const $$ = (s, el = document) => [...el.querySelectorAll(s)];
export const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

// ---------- toast ----------
const toastEl = $('#toast');
let toastTimer;
export function toast(msg) {
  toastEl.textContent = msg;
  toastEl.classList.add('on');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastEl.classList.remove('on'), 2200);
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
const sections = tabs.map((t) => t.getAttribute('href').startsWith('#') && $(t.getAttribute('href'))).filter(Boolean);
const tabIO = new IntersectionObserver(
  (entries) => {
    for (const e of entries) if (e.isIntersecting) tabs.forEach((t) => t.classList.toggle('on', t.getAttribute('href') === `#${e.target.id}`));
  },
  { rootMargin: '-45% 0px -50% 0px' }
);
sections.forEach((s) => tabIO.observe(s));
(tabs.find((t) => t.dataset.here) ?? tabs[0]).classList.add('on');
$('#newtab')?.addEventListener('click', () => toast('No new tabs. Everything’s already here.'));

// ---------- you, and where you are ----------
const you = $('#you'), cx = $('#cx') ?? {}, cy = $('#cy') ?? {};
addEventListener('pointermove', (e) => {
  if (e.pointerType !== 'mouse') return;
  you.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
  you.classList.add('on');
  cx.textContent = Math.round(e.clientX);
  cy.textContent = Math.round(e.clientY);
});
document.addEventListener('pointerleave', () => you.classList.remove('on'));

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

