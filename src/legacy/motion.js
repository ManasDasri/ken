// Motion, by anime.js: the name drops in, headings and blocks spring up as they scroll into view,
// and the hero doodles can be dragged around and spring back home. Loaded last on every page, so the
// pixel headings (common.js) and the folders (main.js) already exist. Nothing is hidden until this
// file has loaded, so if the CDN is down the page is simply static.
import { animate, stagger, splitText, createDraggable, spring } from 'animejs';

const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const hide = (els) => els.forEach((e) => (e.style.opacity = '0'));
// once in place, drop the inline styles so CSS (hover, the cursor push) owns them again
const settle = (els) => () => els.forEach((e) => (e.style.opacity = e.style.transform = ''));
const bouncy = spring({ stiffness: 170, damping: 13 });
const soft = spring({ stiffness: 120, damping: 16 });

if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
  // run once, the first time an element is a little way into the screen
  const io = new IntersectionObserver((entries) => entries.forEach((e) => {
    if (!e.isIntersecting) return;
    io.unobserve(e.target);
    e.target.reveal();
  }), { rootMargin: '0px 0px -12% 0px' });
  const onView = (el, fn) => { el.reveal = fn; io.observe(el); };

  // ---------- the name: letters fall into the selection box, then wave when you hover ----------
  const name = document.querySelector('.name');
  if (name) {
    const { chars } = splitText(name, { chars: true });
    hide(chars);
    const drop = () => animate(chars, { opacity: [0, 1], y: [-140, 0], ease: bouncy, delay: stagger(70, { start: 1250 }) });
    // the home page waits for the door to open
    if (document.body.classList.contains('in') || !document.querySelector('#door')) drop();
    else new MutationObserver((_, mo) => document.body.classList.contains('in') && (mo.disconnect(), drop()))
      .observe(document.body, { attributes: true, attributeFilter: ['class'] });
    name.addEventListener('pointerenter', () => animate(chars, {
      y: [0, -18, 0], duration: 520, ease: 'inOutSine', delay: stagger(45),
    }));
  }

  // ---------- pixel headings: the letters (common.js split them) spring up one by one ----------
  for (const h of $$('.glitch')) {
    const chars = $$('.ch', h);
    hide(chars);
    onView(h, () => animate(chars, { opacity: [0, 1], y: [26, 0], scale: [0.6, 1], ease: bouncy, delay: stagger(28),
      onComplete: settle(chars),
    }));
  }

  // ---------- the folders are dropped onto the desk, one after another ----------
  const folders = $$('.folder');
  if (folders.length) {
    hide(folders);
    onView(folders[0].parentElement, () => animate(folders, {
      opacity: [0, 1], y: [-90, 0], scale: [0.94, 1], ease: bouncy, delay: stagger(110, { grid: [3, Math.ceil(folders.length / 3)], from: 'first' }),
      onComplete: settle(folders),
    }));
  }

  // ---------- everything else: each group rises in, a beat apart ----------
  const groups = [
    ['.svc', 'li', { x: [-40, 0] }],
    ['.tiles', 'a, button', { y: [30, 0] }],
    ['.prs', '.pr', { y: [30, 0] }],
    ['.rule-grid', 'article', { y: [30, 0] }],
    ['.also-grid', 'a', { y: [30, 0] }],
    ['.stats-row', ':scope > *', { y: [24, 0] }],
  ];
  for (const [box, item, from] of groups) for (const g of $$(box)) {
    const items = $$(item, g);
    if (!items.length) continue;
    hide(items);
    onView(g, () => animate(items, {
      opacity: [0, 1], ...from, ease: soft, delay: stagger(70),
      onComplete: settle(items),
    }));
  }

  // ---------- hero doodles: grab one, throw it, it springs back to its corner ----------
  for (const dd of $$('.dd')) {
    dd.draggable = false; // no browser image ghost
    dd.style.cssText += 'pointer-events:auto;cursor:grab;touch-action:none';
    createDraggable(dd, { snap: [0], releaseEase: bouncy, releaseStiffness: 160, releaseDamping: 11 });
  }
}
