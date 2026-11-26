import { createScene } from './scene.js';

const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));

// ---------- the hero landscape, at the time it is in India ----------
const heroCanvas = document.getElementById('scene');
const planted = document.getElementById('planted');
let count = 0;
const scene = createScene(heroCanvas, {
  seed: 7,
  onPlant: (n) => {
    count++;
    if (count > 1) planted.textContent = `${count - 1} planted by you`;
  },
});
const [W, H] = scene.size;

const indiaHour = () => {
  const [h, m] = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).format(new Date()).split(':').map(Number);
  return h + m / 60;
};
const fmt = (h) => {
  const hh = Math.floor(h), mm = Math.floor((h - hh) * 60);
  return `${((hh + 11) % 12) + 1}:${String(mm).padStart(2, '0')} ${hh < 12 ? 'AM' : 'PM'}`;
};
const slider = document.getElementById('hour');
const clockText = document.getElementById('clock-text');
let following = true; // follow the real clock until someone moves the slider
const setHour = (h) => {
  scene.setHour(h);
  slider.value = h.toFixed(2);
  clockText.textContent = fmt(h);
};
setHour(indiaHour());
setInterval(() => following && setHour(indiaHour()), 30000);
slider.addEventListener('input', () => {
  following = false;
  setHour(+slider.value);
});
document.getElementById('now').addEventListener('click', () => {
  following = true;
  setHour(indiaHour());
});

// canvas pixels <-> screen, allowing for object-fit: cover on small screens
function toScene(e) {
  const r = heroCanvas.getBoundingClientRect();
  const s = Math.max(r.width / W, r.height / H);
  const ox = (r.width - W * s) / 2, oy = (r.height - H * s) / 2;
  return [(e.clientX - r.left - ox) / s, (e.clientY - r.top - oy) / s];
}
function toScreen(x, y) {
  const r = heroCanvas.getBoundingClientRect();
  const s = Math.max(r.width / W, r.height / H);
  return [(r.width - W * s) / 2 + x * s, (r.height - H * s) / 2 + y * s];
}
heroCanvas.addEventListener('click', (e) => {
  const [x, y] = toScene(e);
  scene.plant(x, y);
});

// one sprout grows on its own, with a tag pointing at it
const tag = document.getElementById('tag-sprout');
const sx = Math.round(W * 0.7), sy = scene.groundY(sx) + 14;
function placeTag() {
  const [x, y] = toScreen(sx, sy - 12);
  const room = heroCanvas.clientWidth - tag.offsetWidth - 8;
  tag.style.left = `${Math.max(8, Math.min(x - 6, room))}px`;
  tag.style.top = `${y - 34}px`;
}
setTimeout(() => {
  scene.plant(sx, sy);
  placeTag();
  setTimeout(() => tag.classList.add('on'), 1400);
}, reduce ? 0 : 700);
addEventListener('resize', placeTag);

// ---------- the footer: the same kind of land, at night ----------
createScene(document.getElementById('night'), { seed: 21, hour: 22.4 });
// a ragged pixel edge where the page meets the night
{
  const c = document.createElement('canvas');
  c.width = 240;
  c.height = 24;
  const g = c.getContext('2d');
  let seed = 3;
  const r = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
  g.fillStyle = '#000';
  for (let x = 0; x < 240; x += 8) {
    g.fillRect(x, 0, 8, 8 * (1 + Math.floor(r() * 2)));
    if (r() < 0.35) g.fillRect(x, 16, 8, 8);
  }
  document.documentElement.style.setProperty('--edge', `url(${c.toDataURL()})`);
}

// ---------- what I do: a pixel icon for each line ----------
const ICONS = {
  research: ['......####', '......#..#', '......#..#', '......#..#', '.....#....#', '.....#....#', '....#......#', '....#gggggg#', '...#gggggggg#', '...#gg#ggggg#', '..#gggggg#ggg#', '..#gggggggggg#', '..############'],
  tools: ['################', '#..............#', '################', '#..............#', '#.#............#', '#..#...........#', '#...#..........#', '#..#...........#', '#.#....gggg....#', '#..............#', '#..............#', '################'],
  branch: ['..gg......gg', '..gg......gg', '..##.......#', '..##.......#', '..##......#', '..##.....#', '..##....#', '..##..##', '..####', '..##', '..##', '..gg', '..gg'],
  window: ['################', '#g#g#..........#', '################', '#ggggg.........#', '#ggggg.#######.#', '#ggggg.........#', '#ggggg.#####...#', '#ggggg.........#', '#.......######.#', '#..............#', '################'],
  spark: ['.......#', '.......#', '......#g#', '......#g#', '.....#ggg#', '...##ggggg##', '##ggggggggggg##', '...##ggggg##', '.....#ggg#', '......#g#', '......#g#', '.......#', '.......#'],
};
const icon = document.getElementById('icon').getContext('2d');
const iconLabel = document.getElementById('icon-label');
function drawIcon(name) {
  const rows = ICONS[name];
  icon.clearRect(0, 0, 16, 16);
  const top = Math.floor((16 - rows.length) / 2);
  rows.forEach((row, y) =>
    [...row].forEach((ch, x) => {
      if (ch === '.') return;
      icon.fillStyle = ch === 'g' ? '#a6e35b' : '#121212';
      icon.fillRect(x, top + y, 1, 1);
    })
  );
}
const doItems = [...document.querySelectorAll('.do-list li')];
const pick = (li) => {
  doItems.forEach((o) => o.classList.toggle('on', o === li));
  drawIcon(li.dataset.icon);
  iconLabel.textContent = `/ ${li.querySelector('b').textContent.toLowerCase()}`;
};
doItems.forEach((li) => li.addEventListener('pointerenter', () => pick(li)));
pick(doItems[0]);

// ---------- how I work: words darken as they pass the middle of the screen ----------
const words = [...document.querySelectorAll('.words li')];
function lightWords() {
  const vh = innerHeight;
  for (const w of words) {
    const top = w.getBoundingClientRect().top;
    w.style.setProperty('--lit', clamp((vh * 0.72 - top) / (vh * 0.22)).toFixed(3));
  }
}
addEventListener('scroll', lightWords, { passive: true });
lightWords();

// ---------- work: screenshots arrive pixelated and resolve ----------
const STEPS = [48, 32, 22, 15, 10, 7, 5, 3, 2, 1];
document.querySelectorAll('.shot canvas').forEach((cv) => {
  cv.width = 960;
  cv.height = 600;
  const g = cv.getContext('2d');
  const small = document.createElement('canvas').getContext('2d');
  const im = new Image();
  im.src = cv.dataset.src;
  const paint = (b) => {
    const w = Math.ceil(960 / b), h = Math.ceil(600 / b);
    small.canvas.width = w;
    small.canvas.height = h;
    small.drawImage(im, 0, 0, w, h);
    g.imageSmoothingEnabled = b === 1;
    g.drawImage(small.canvas, 0, 0, w, h, 0, 0, 960, 600);
    cv.style.imageRendering = b === 1 ? 'auto' : 'pixelated';
  };
  let timer;
  const resolve = (steps, gap) => {
    clearInterval(timer);
    let i = 0;
    paint(steps[0]);
    timer = setInterval(() => {
      if (++i >= steps.length) return clearInterval(timer);
      paint(steps[i]);
    }, gap);
  };
  im.onload = () => {
    paint(reduce ? 1 : 48);
    if (reduce) return;
    new IntersectionObserver(([e], o) => {
      if (!e.isIntersecting) return;
      o.disconnect();
      resolve(STEPS, 70);
    }, { threshold: 0.4 }).observe(cv);
    cv.closest('.card').addEventListener('pointerenter', () => resolve([8, 5, 3, 2, 1], 55));
  };
});

// ---------- open source: what I sent each project, on hover ----------
const card = document.getElementById('pr-card');
const [cb, cspan, csmall] = card.children;
const showPR = (a, x, y) => {
  cb.textContent = a.dataset.pr;
  cspan.textContent = a.dataset.what;
  csmall.textContent = a.dataset.diff ? `${a.dataset.diff} lines` : 'see them all on GitHub';
  movePR(x, y);
  card.classList.add('on');
};
const movePR = (x, y) => {
  card.style.setProperty('--cx', `${Math.min(x + 18, innerWidth - 306)}px`);
  card.style.setProperty('--cy', `${y + 18}px`);
};
document.querySelectorAll('.repos a').forEach((a) => {
  a.addEventListener('pointerenter', (e) => showPR(a, e.clientX, e.clientY));
  a.addEventListener('pointermove', (e) => movePR(e.clientX, e.clientY));
  a.addEventListener('pointerleave', () => card.classList.remove('on'));
  a.addEventListener('focus', () => {
    const r = a.getBoundingClientRect();
    showPR(a, r.left, r.bottom);
  });
  a.addEventListener('blur', () => card.classList.remove('on'));
});

// ---------- things arrive as you reach them ----------
const io = new IntersectionObserver((es) => es.forEach((e) => e.isIntersecting && (e.target.classList.add('in'), io.unobserve(e.target))), { rootMargin: '0px 0px -10% 0px' });
document.querySelectorAll('.do-list li, .card, .stat, .contact-box, .repos li').forEach((el, i) => {
  el.classList.add('rise');
  el.style.transitionDelay = `${(i % 3) * 80}ms`;
  io.observe(el);
});
