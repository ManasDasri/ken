// Koi made of characters, swimming on the contact section's graph paper. Each fish is a spine of
// points that follows its head; its body is filled in as grid cells. Only the boxes around the
// fish are cleared and redrawn each frame, never the whole section.
const host = document.getElementById('ascii')?.parentElement;
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

if (host) {
  const CELL = 14, SEG = 17, GAP = 10;
  const cv = Object.assign(document.createElement('canvas'), { className: 'koi' });
  cv.setAttribute('aria-hidden', 'true');
  host.prepend(cv);
  const ctx = cv.getContext('2d');
  let W = 0, H = 0, dpr = 1;
  const size = () => {
    dpr = Math.min(devicePixelRatio || 1, 2);
    W = host.clientWidth;
    H = host.clientHeight;
    cv.width = W * dpr;
    cv.height = H * dpr;
    cv.style.width = `${W}px`;
    cv.style.height = `${H}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = '500 10px "Geist Mono", ui-monospace, monospace';
  };
  size();
  new ResizeObserver(size).observe(host);

  // kohaku (white with red), showa-ish (orange with black), ogon (gold), tancho (white, red crown)
  const SKINS = [
    { base: '#f4f1ea', spot: '#e4572e', dots: 0.45 },
    { base: '#f28a2e', spot: '#1f1f24', dots: 0.3 },
    { base: '#f5c542', spot: '#e8a317', dots: 0.25 },
    { base: '#f4f1ea', spot: '#d62f2f', dots: 0.08, crown: true },
  ];
  const CH = '@#%&8$S*o';
  const fish = SKINS.map((skin, n) => {
    const x = n % 2 ? W * 0.07 : W * 0.93, y = H * (0.2 + 0.2 * n), a = n % 2 ? Math.PI / 2 : -Math.PI / 2;
    return { skin, a, v: 0.9 + n * 0.12, turn: 0, spine: Array.from({ length: SEG }, (_, i) => ({ x: x - Math.cos(a) * i * GAP, y: y - Math.sin(a) * i * GAP })), box: null, seed: n * 97 };
  });
  const food = [];
  let drawnFood = [];
  let mx = -1e4, my = -1e4;
  host.addEventListener('pointermove', (e) => {
    const r = host.getBoundingClientRect();
    mx = e.clientX - r.left;
    my = e.clientY - r.top;
  });
  host.addEventListener('pointerleave', () => (mx = my = -1e4));
  host.addEventListener('click', (e) => {
    if (e.target.closest('a, button, .cbox, .tiles')) return;
    const r = host.getBoundingClientRect();
    food.push({ x: e.clientX - r.left, y: e.clientY - r.top, t: performance.now() });
    if (food.length > 6) food.shift();
  });

  const wrapAngle = (a) => Math.atan2(Math.sin(a), Math.cos(a));
  function steer(f, t) {
    const h = f.spine[0];
    let want = f.a + Math.sin(t / 1400 + f.seed) * 0.6; // a lazy wander
    // food pulls, the cursor pushes, the edges turn them back
    const near = food.reduce((best, p) => {
      const d = Math.hypot(p.x - h.x, p.y - h.y);
      return d < (best?.d ?? 420) ? { p, d } : best;
    }, null);
    let speed = f.v;
    if (near) {
      want = Math.atan2(near.p.y - h.y, near.p.x - h.x);
      speed = f.v * 1.9;
      if (near.d < 12) food.splice(food.indexOf(near.p), 1);
    }
    const dm = Math.hypot(mx - h.x, my - h.y);
    if (dm < 110) {
      want = Math.atan2(h.y - my, h.x - mx);
      speed = f.v * 2.6;
    }
    // keep to the open paper around the card, mostly
    const card = host.querySelector('.cbox');
    if (card && !near) {
      const hr = host.getBoundingClientRect(), cr = card.getBoundingClientRect();
      const l = cr.left - hr.left - 30, r = cr.right - hr.left + 30, tp = cr.top - hr.top - 30, b = cr.bottom - hr.top + 30;
      if (h.x > l && h.x < r && h.y > tp && h.y < b) {
        const out = [[h.x - l, Math.PI], [r - h.x, 0], [h.y - tp, -Math.PI / 2], [b - h.y, Math.PI / 2]].sort((p, q) => p[0] - q[0])[0];
        want = out[1];
      }
    }
    const m = 60;
    if (h.x < m) want = 0; else if (h.x > W - m) want = Math.PI;
    if (h.y < m) want = Math.PI / 2; else if (h.y > H - m) want = -Math.PI / 2;
    f.turn += (wrapAngle(want - f.a) * 0.04 - f.turn) * 0.2;
    f.a += f.turn;
    h.x += Math.cos(f.a) * speed;
    h.y += Math.sin(f.a) * speed;
    // the body follows the head, one fixed link at a time
    for (let i = 1; i < SEG; i++) {
      const p = f.spine[i], q = f.spine[i - 1];
      const d = Math.hypot(p.x - q.x, p.y - q.y) || 1;
      p.x = q.x + ((p.x - q.x) / d) * GAP;
      p.y = q.y + ((p.y - q.y) / d) * GAP;
    }
  }
  // which grid cells the fish covers this frame, and what each shows
  function cells(f, t) {
    const out = new Map();
    const put = (x, y, colour, i) => {
      const cx = Math.floor(x / CELL), cy = Math.floor(y / CELL), k = `${cx},${cy}`;
      if (!out.has(k)) out.set(k, { cx, cy, colour, ch: CH[(cx * 7 + cy * 13 + i) % CH.length] });
    };
    const s = f.spine;
    for (let i = 0; i < SEG; i++) {
      const p = s[i], q = s[Math.min(i + 1, SEG - 1)], o = s[Math.max(i - 1, 0)];
      const ang = Math.atan2(o.y - q.y, o.x - q.x), nx = -Math.sin(ang), ny = Math.cos(ang);
      // thick behind the head, thin at the tail, then the tail fin flares and flicks
      let w = i < SEG - 3 ? Math.sin(((i + 2.5) / (SEG + 1)) * Math.PI) * 21 : 6 + (i - (SEG - 3)) * 7;
      const flick = i >= SEG - 3 ? Math.sin(t / 160 + f.seed) * 4 : 0;
      for (let k = -w; k <= w; k += 5) {
        const spotty = ((i * 31 + Math.round(k) * 7 + f.seed) % 100) / 100 < f.skin.dots;
        const crown = f.skin.crown && i === 1 && Math.abs(k) < 6;
        const tail = i >= SEG - 3;
        put(p.x + nx * (k + flick), p.y + ny * (k + flick), crown || (spotty && !tail) ? f.skin.spot : tail ? `${f.skin.base}aa` : f.skin.base, i);
      }
      // fill the gap to the next link too, so the body has no holes
      if (i < SEG - 3) for (let k = -w; k <= w; k += 5) put((p.x + q.x) / 2 + nx * k, (p.y + q.y) / 2 + ny * k, ((i * 17 + Math.round(k) * 5 + f.seed) % 100) / 100 < f.skin.dots ? f.skin.spot : f.skin.base, i);
      // pectoral fins, just behind the head, paddling
      if (i === 4) {
        const fin = 30 + Math.sin(t / 300 + f.seed) * 4;
        for (const side of [1, -1]) for (const back of [0, 8]) put(p.x + nx * fin * side - Math.cos(ang) * back, p.y + ny * fin * side - Math.sin(ang) * back, `${f.skin.base}aa`, i);
      }
    }
    return out;
  }

  let visible = false, raf = 0, last = 0;
  new IntersectionObserver(([e]) => {
    visible = e.isIntersecting;
    if (visible && !raf) raf = requestAnimationFrame(frame);
  }).observe(host);
  const dark = () => document.documentElement.dataset.theme === 'dark';
  function frame(t) {
    raf = 0;
    if (!visible || document.hidden) return;
    raf = requestAnimationFrame(frame);
    if (t - last < 33) return; // about 30 frames a second is plenty for fish
    last = t;
    for (const f of fish) if (f.box) ctx.clearRect(...f.box);
    for (const r of drawnFood) ctx.clearRect(...r);
    drawnFood = food.map((p) => [Math.floor(p.x / CELL) * CELL + 3, Math.floor(p.y / CELL) * CELL + 3, 8, 8]);
    ctx.fillStyle = dark() ? '#e8e6df' : '#6b5a3a';
    for (const r of drawnFood) ctx.fillRect(r[0] + 1, r[1] + 1, 6, 6);
    const alpha = dark() ? 0.85 : 0.95;
    for (const f of fish) {
      if (!reduce) steer(f, t);
      let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
      ctx.globalAlpha = alpha;
      for (const { cx, cy, colour, ch } of cells(f, t).values()) {
        const x = cx * CELL, y = cy * CELL;
        ctx.fillStyle = colour;
        ctx.fillRect(x + 1, y + 1, CELL - 1, CELL - 1);
        ctx.fillStyle = 'rgba(20,20,24,0.55)';
        ctx.fillText(ch, x + CELL / 2 + 0.5, y + CELL / 2 + 1);
        x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x + CELL); y1 = Math.max(y1, y + CELL);
      }
      ctx.globalAlpha = 1;
      f.box = [x0 - 2, y0 - 2, x1 - x0 + 4, y1 - y0 + 4];
    }
  }
}
