// The desk: place every object, let people pick them up, tidy the table, read a print's story.
const desk = document.getElementById('desk');
const W = 1600;
const small = matchMedia('(max-width: 860px)');
const items = [...desk.querySelectorAll('[data-x]')];

// paper grain for the table and wear for the rubber stamp, drawn once
function noise(size, fn) {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const ctx = c.getContext('2d');
  const img = ctx.createImageData(size, size);
  for (let i = 0; i < img.data.length; i += 4) fn(img.data, i);
  ctx.putImageData(img, 0, 0);
  return `url(${c.toDataURL()})`;
}
const root = document.documentElement.style;
root.setProperty('--grain', noise(220, (d, i) => {
  const v = Math.random() * 255;
  d[i] = d[i + 1] = d[i + 2] = v;
  d[i + 3] = 16;
}));
root.setProperty('--wear', noise(180, (d, i) => {
  d[i + 3] = Math.random() < 0.2 ? Math.random() * 120 : 255;
}));

// fit the 1600-wide table to the window
function fit() {
  const s = Math.min(1, innerWidth / W);
  root.setProperty('--s', s);
  root.setProperty('--off', `${Math.max(0, (innerWidth - W) / 2) / s}px`);
}
fit();
addEventListener('resize', fit);

// where everything starts: the messy layout written in the HTML
const home = new Map(items.map((el) => [el, { x: +el.dataset.x, y: +el.dataset.y, r: +el.dataset.r }]));
const place = (el, { x, y, r }) => {
  el.style.setProperty('--x', `${x}px`);
  el.style.setProperty('--y', `${y}px`);
  el.style.setProperty('--r', `${r}deg`);
};
items.forEach((el, i) => {
  el.style.setProperty('--i', i);
  place(el, home.get(el));
});
setTimeout(() => desk.classList.add('ready'), 1600);

// ---- picking things up ----
let zTop = 100;
const objs = items.filter((el) => el.classList.contains('obj'));
for (const el of objs) {
  let start = null;
  el.addEventListener('pointerdown', (e) => {
    if (small.matches || e.button !== 0) return;
    const p = home.get(el);
    start = { px: e.clientX, py: e.clientY, x: p.x, y: p.y, moved: false };
    el.style.zIndex = ++zTop;
  });
  el.addEventListener('pointermove', (e) => {
    if (!start) return;
    const s = Math.min(1, innerWidth / W);
    const dx = (e.clientX - start.px) / s, dy = (e.clientY - start.py) / s;
    if (!start.moved && Math.hypot(dx, dy) < 5) return;
    if (!start.moved) {
      start.moved = true;
      el.setPointerCapture(e.pointerId);
      el.classList.add('held');
    }
    const p = home.get(el);
    p.x = Math.round(start.x + dx);
    p.y = Math.round(start.y + dy);
    place(el, p);
  });
  const drop = () => {
    if (!start) return;
    if (start.moved) {
      el.classList.remove('held');
      // nudge it a little as it lands, the way paper does
      const p = home.get(el);
      if (!desk.classList.contains('tidy')) p.r = +(p.r + (Math.random() - 0.5) * 4).toFixed(1);
      place(el, p);
      // the click that follows a drag shouldn't open a link or a print
      el.dataset.dragged = '1';
      setTimeout(() => delete el.dataset.dragged, 0);
    }
    start = null;
  };
  el.addEventListener('pointerup', drop);
  el.addEventListener('pointercancel', drop);
  el.addEventListener('click', (e) => {
    if (el.dataset.dragged) {
      e.preventDefault();
      e.stopPropagation();
    }
  }, true);
}

// ---- tidy up: square everything into rows, then back to the mess ----
const tidyBtn = document.getElementById('tidy');
let mess = null;
tidyBtn.addEventListener('click', () => {
  const tidy = !desk.classList.contains('tidy');
  desk.classList.toggle('tidy', tidy);
  tidyBtn.setAttribute('aria-pressed', tidy);
  tidyBtn.firstElementChild.textContent = tidy ? 'MAKE A MESS' : 'TIDY UP';
  if (tidy) {
    mess = new Map(objs.map((el) => [el, { ...home.get(el) }]));
    // knolling: anything wider than a column goes in a row along the top, the rest drop into
    // whichever of four columns is shortest, all at right angles
    const colW = 370, cols = 4, gap = 26;
    const edge = (W - cols * colW - (cols - 1) * gap) / 2;
    const sized = objs.map((el) => ({ el, w: el.offsetWidth, h: el.offsetHeight }));
    let x = edge, y = 60, rowH = 0;
    for (const o of sized.filter((o) => o.w > colW)) {
      home.set(o.el, { x, y, r: 0 });
      x += o.w + gap * 2;
      rowH = Math.max(rowH, o.h);
    }
    const heights = Array(cols).fill(y + rowH + gap * 2);
    for (const o of sized.filter((o) => o.w <= colW)) {
      const c = heights.indexOf(Math.min(...heights));
      home.set(o.el, { x: edge + c * (colW + gap) + (colW - o.w) / 2, y: heights[c], r: 0 });
      heights[c] += o.h + gap + (o.el.classList.contains('print') ? 10 : 0);
    }
    objs.forEach((el) => place(el, home.get(el)));
    root.setProperty('--h', `${Math.max(1320, Math.max(...heights) + 90)}px`);
  } else {
    for (const el of objs) {
      home.set(el, mess.get(el));
      place(el, mess.get(el));
    }
    root.setProperty('--h', '1320px');
  }
});

// ---- business card ----
const card = desk.querySelector('.bizcard');
card.querySelectorAll('.flip').forEach((b) =>
  b.addEventListener('click', () => {
    const on = card.classList.toggle('flipped');
    card.querySelector('.back').inert = !on;
    card.querySelector('.front').inert = on;
    (on ? card.querySelector('.back a') : card.querySelector('.front')).focus({ preventScroll: true });
  })
);
card.querySelector('.back').inert = true;

// ---- a print's story ----
const story = document.getElementById('story');
desk.querySelectorAll('.print-open').forEach((btn) =>
  btn.addEventListener('click', () => {
    const print = btn.closest('.print');
    const img = print.querySelector('img');
    story.querySelector('.story-print img').src = img.src;
    story.querySelector('.story-print img').alt = img.alt;
    story.querySelector('.story-sheet').replaceChildren(...print.querySelector('.more').cloneNode(true).childNodes);
    story.setAttribute('aria-label', print.querySelector('.more h3').textContent);
    story.showModal();
  })
);
story.addEventListener('click', (e) => {
  if (e.target === story) story.close();
});
