import { $, $$ } from './common.js';
import { PROJECTS, cardHTML, wire, flip } from './cards.js';

// the cards, spread on the table: click one to flip it, drag it anywhere
const table = $('#table'), tidy = $('#tidy');
table.innerHTML = PROJECTS.map(cardHTML).join('');
const cards = $$('.pcard', table);
let top = 10;

cards.forEach((c, i) => {
  c.style.setProperty('--i', i);
  wire(c);
  let d = null;
  c.pos = [0, 0];
  c.addEventListener('pointerdown', (e) => {
    if (e.button || e.target.closest('a, button')) return;
    d = { x: e.clientX, y: e.clientY, moved: false };
    c.style.zIndex = ++top;
    if (e.pointerType === 'mouse') c.setPointerCapture(e.pointerId);
  });
  c.addEventListener('pointermove', (e) => {
    // touch scrolls the page; only a mouse moves cards
    if (!d || e.pointerType !== 'mouse') return;
    const dx = e.clientX - d.x, dy = e.clientY - d.y;
    if (!d.moved && Math.hypot(dx, dy) < 6) return;
    d.moved = true;
    c.classList.add('drag');
    c.style.setProperty('--tx', `${c.pos[0] + dx}px`);
    c.style.setProperty('--ty', `${c.pos[1] + dy}px`);
  });
  const up = (e) => {
    if (!d) return;
    if (d.moved) {
      c.pos = [c.pos[0] + e.clientX - d.x, c.pos[1] + e.clientY - d.y];
      tidy.disabled = false;
    } else if (e.type === 'pointerup') flip(c);
    c.classList.remove('drag');
    d = null;
  };
  c.addEventListener('pointerup', up);
  c.addEventListener('pointercancel', up);
});

tidy.addEventListener('click', () => {
  cards.forEach((c, i) => {
    c.pos = [0, 0];
    setTimeout(() => {
      c.style.setProperty('--tx', '0px');
      c.style.setProperty('--ty', '0px');
    }, i * 60);
  });
  tidy.disabled = true;
});
// they turn over one after another, like a wave
$('#flipall').addEventListener('click', (e) => {
  const on = !cards.every((c) => c.on);
  cards.forEach((c, i) => setTimeout(() => flip(c, on), i * 90));
  e.currentTarget.textContent = on ? 'Turn them back' : 'Flip them all';
});
