// A pixel-art landscape, drawn in code into a small canvas that CSS scales up with
// crisp pixels. The layout (city, hills, lake, trees, meadow) is built once as a map of
// materials; each frame colours that map for the time of day and draws what moves.

const rng = (seed) => () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5].map((v) => v / 16);
const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const pack = ([r, g, b]) => (255 << 24) | (b << 16) | (g << 8) | r;
const mix = (a, b, t) => a.map((v, i) => Math.round(v + (b[i] - v) * t));

// material ids
const SKY = 0, CITY = 1, WIN = 2, HILL_FAR = 3, HILL = 4, TREE_D = 5, TREE_M = 6, TREE_L = 7, TRUNK = 8,
  WATER = 9, GRASS_D = 10, GRASS_M = 11, GRASS_L = 12, PATH = 13, FLOWER_R = 14, FLOWER_Y = 15, TREE_FAR = 16;
const KEYS = ['skyTop', 'skyBot', 'city', 'win', 'hillFar', 'hill', 'treeD', 'treeM', 'treeL', 'trunk', 'water', 'grassD', 'grassM', 'grassL', 'path', 'flowerR', 'flowerY', 'treeFar', 'cloudL', 'cloudS', 'leaf'];
const MAT_KEY = { [CITY]: 'city', [WIN]: 'city', [HILL_FAR]: 'hillFar', [HILL]: 'hill', [TREE_D]: 'treeD', [TREE_M]: 'treeM', [TREE_L]: 'treeL', [TRUNK]: 'trunk', [GRASS_D]: 'grassD', [GRASS_M]: 'grassM', [GRASS_L]: 'grassL', [PATH]: 'path', [FLOWER_R]: 'flowerR', [FLOWER_Y]: 'flowerY', [TREE_FAR]: 'treeFar' };

// the day's palettes, keyed by hour
const P = {
  night: ['#080c26', '#222a63', '#161c45', '#ffd36b', '#17223f', '#12222f', '#0b1a1c', '#102a23', '#1a3a2e', '#1c130d', '#141f47', '#0c241d', '#123326', '#1d4532', '#2f3042', '#5a2846', '#76683a', '#14273a', '#363f7a', '#232a5a', '#3f7a4a'],
  dawn: ['#6a8bd2', '#ffc49c', '#8781ad', '#ffe0a0', '#8a9ab0', '#5c8a68', '#2c5638', '#43773f', '#68a052', '#583826', '#9ab0dc', '#477a38', '#669a42', '#8fc256', '#c9b398', '#e05a6a', '#f2c94c', '#7d97a0', '#ffe4d4', '#e2a8a2', '#9ad46a'],
  day: ['#3a8bf0', '#c4e6ff', '#9ab8d8', '#c8dcf0', '#93b9cc', '#64a055', '#2b6532', '#3b863c', '#62b448', '#684226', '#5ba9f0', '#4a963a', '#69ba43', '#9ade58', '#e4d1a8', '#ff5a6e', '#ffd23f', '#78a8a0', '#ffffff', '#d4e5f5', '#b4f06a'],
  dusk: ['#3f3584', '#ff985a', '#62548a', '#ffc070', '#76678e', '#4a6650', '#213c2c', '#31553a', '#4c7744', '#3c2820', '#b07a8a', '#385830', '#52783a', '#77a04a', '#a6887a', '#d04a5a', '#e0a040', '#5d5a7e', '#ffb28a', '#b06a8c', '#9ad46a'],
};
const STOPS = [[0, 'night'], [4.8, 'night'], [6.4, 'dawn'], [8.6, 'day'], [16.2, 'day'], [18.1, 'dusk'], [19.6, 'night'], [24, 'night']].map(([h, k]) => [h, P[k].map(hex)]);
function palette(hour) {
  let i = 0;
  while (STOPS[i + 1][0] < hour) i++;
  const [h0, a] = STOPS[i], [h1, b] = STOPS[i + 1];
  const t = (hour - h0) / (h1 - h0 || 1);
  return Object.fromEntries(KEYS.map((k, j) => [k, mix(a[j], b[j], t)]));
}
// 1 at night, 0 by day, easing through dawn and dusk
const nightness = (h) => (h < 5 || h > 19.8 ? 1 : h < 7 ? (7 - h) / 2 : h > 17.8 ? (h - 17.8) / 2 : 0);

export function createScene(canvas, { seed = 7, w = 400, h = 190, hour: fixedHour = null, onPlant } = {}) {
  const W = w, H = h;
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');
  const img = ctx.createImageData(W, H);
  const buf = new Uint32Array(img.data.buffer);
  const rand = rng(seed);
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  const mat = new Uint8Array(W * H);
  const shade = new Uint8Array(W * H).fill(1); // 0 dark, 1 normal, 2 light
  const lit = new Uint8Array(W * H);
  const set = (x, y, m) => {
    if (x >= 0 && x < W && y >= 0 && y < H) mat[y * W + x] = m;
  };
  const noise = (scale, oct = 3) => {
    const pts = Array.from({ length: 512 }, rand);
    const v = (x) => {
      const i = Math.floor(x), f = x - i, u = f * f * (3 - 2 * f);
      return pts[(i & 511)] * (1 - u) + pts[(i + 1) & 511] * u;
    };
    return (x) => {
      let s = 0, a = 1, n = 0;
      for (let o = 0; o < oct; o++, a /= 2) {
        s += v((x / scale) * 2 ** o + o * 31) * a;
        n += a;
      }
      return s / n;
    };
  };

  // ---- build the land ----
  const horizon = Math.round(H * 0.6);
  // a far city, taller toward the middle, with windows that light up at night
  for (let x = -2; x < W; ) {
    const bw = 4 + Math.floor(rand() * 9);
    const mid = 1 - Math.abs(x / W - 0.6) * 1.6;
    const bh = Math.round(6 + rand() * 14 + Math.max(0, mid) * rand() * 26);
    for (let px = x; px < x + bw; px++)
      for (let py = horizon - bh; py < horizon + 4; py++) {
        const win = (px - x) % 3 === 1 && (py - (horizon - bh)) % 3 === 1 && px < x + bw - 1;
        set(px, py, win ? WIN : CITY);
        if (win && px >= 0 && px < W) lit[py * W + px] = rand() < 0.42 ? 1 : 0;
      }
    x += bw + (rand() < 0.3 ? 1 + Math.floor(rand() * 3) : 0);
  }
  // one tall tower with a mast
  const tx = Math.round(W * 0.62);
  for (let py = horizon - 46; py < horizon; py++) for (let px = tx; px < tx + 3; px++) set(px, py, CITY);
  for (let py = horizon - 56; py < horizon - 46; py++) set(tx + 1, py, CITY);

  const farTop = noise(70), nearTop = noise(52), groundTop = noise(34);
  const fy = (x) => Math.round(horizon - 4 - farTop(x) * 18);
  const ny = (x) => Math.round(horizon + 8 - nearTop(x + 300) * 16);
  const gy = (x) => Math.round(H * 0.79 - groundTop(x + 900) * 12);
  for (let x = 0; x < W; x++) {
    for (let y = fy(x); y < H; y++) set(x, y, HILL_FAR);
    for (let y = ny(x); y < H; y++) set(x, y, HILL);
  }
  // a lake in the valley, reflecting the sky
  const lx = W * 0.3, lyc = horizon + 21, lrx = W * 0.2, lry = 7;
  for (let y = lyc - lry; y <= lyc + lry; y++)
    for (let x = Math.floor(lx - lrx); x < lx + lrx; x++) {
      const e = ((x - lx) / lrx) ** 2 + ((y - lyc) / lry) ** 2;
      if (e < 1 && mat[y * W + x] === HILL) set(x, y, WATER);
    }
  // trees: small and flat on the far hills, round and shaded nearer
  const tree = (cx, base, r, far) => {
    if (!far) for (let y = base - 4; y <= base; y++) set(cx, y, TRUNK), set(cx + 1, y, TRUNK);
    const blobs = [[0, -r - 2, r], [-r * 0.6, -r, r * 0.75], [r * 0.6, -r + 1, r * 0.7]];
    for (const [ox, oy, rr] of blobs)
      for (let y = -rr; y <= rr; y++)
        for (let x = -rr; x <= rr; x++) {
          if (x * x + y * y > rr * rr) continue;
          const px = Math.round(cx + ox + x), py = Math.round(base + oy + y);
          if (far) {
            set(px, py, TREE_FAR);
            continue;
          }
          const light = (-(ox + x) - (oy + y + r)) / (r * 2.2) + 0.5;
          const b = BAYER[(py & 3) * 4 + (px & 3)];
          set(px, py, light + (b - 0.5) * 0.45 > 0.62 ? TREE_L : light + (b - 0.5) * 0.45 > 0.25 ? TREE_M : TREE_D);
        }
  };
  for (let i = 0; i < 22; i++) {
    const x = Math.round(rand() * W);
    tree(x, fy(x) + 3, 2 + Math.round(rand() * 2), true);
  }
  for (let i = 0; i < 9; i++) {
    const x = Math.round(rand() * W);
    if (Math.abs(x - lx) < lrx + 6) continue;
    tree(x, ny(x) + 6, 4 + Math.round(rand() * 4), false);
  }
  // the meadow in front
  for (let x = 0; x < W; x++) for (let y = gy(x); y < H; y++) set(x, y, GRASS_M);
  for (let i = 0; i < 4; i++) {
    const x = Math.round(W * (0.05 + rand() * 0.9));
    if (Math.abs(x - W * 0.46) > 30 && Math.abs(x - W * 0.7) > 26) tree(x, gy(x) + 4, 6 + Math.round(rand() * 3), false);
  }
  // the big one, framing the left edge: a short thick trunk under a wide crown
  {
    const bx = Math.round(W * 0.06), base = H - 4, top = Math.round(H * 0.5);
    for (let y = top; y <= base; y++) {
      const half = 3 + Math.max(0, (y - H * 0.82) * 0.5);
      for (let x = bx - half; x <= bx + half; x++) set(Math.round(x), y, TRUNK);
    }
    for (let k = 0; k < 10; k++) set(bx + 3 + k, top + 6 - Math.round(k * 0.6), TRUNK), set(bx + 3 + k, top + 7 - Math.round(k * 0.6), TRUNK);
    tree(bx - 6, Math.round(H * 0.68), 24, false);
    tree(bx + 22, Math.round(H * 0.62), 17, false);
    tree(bx + 6, Math.round(H * 0.47), 15, false);
  }
  // a path winding down toward you
  for (let y = gy(Math.round(W * 0.46)) - 2; y < H; y++) {
    const t = (y - horizon) / (H - horizon);
    const cx = W * 0.46 + Math.sin(t * 5) * 14 + t * 20;
    const half = 1 + t * t * 12;
    for (let x = Math.floor(cx - half); x <= cx + half; x++) if (mat[y * W + x] === GRASS_M) set(x, y, PATH);
  }
  // texture in clumps (smooth 2D noise, thresholded), not salt-and-pepper
  const grid = Array.from({ length: 64 * 64 }, rand);
  const n2 = (x, y) => {
    const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi;
    const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
    const g = (a, b) => grid[((b & 63) << 6) | (a & 63)];
    return (g(xi, yi) * (1 - u) + g(xi + 1, yi) * u) * (1 - v) + (g(xi, yi + 1) * (1 - u) + g(xi + 1, yi + 1) * u) * v;
  };
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++) {
      const i = y * W + x, m = mat[i];
      if (m !== HILL && m !== HILL_FAR && m !== GRASS_M && m !== PATH) continue;
      const depth = m === GRASS_M ? 1 : m === HILL ? 0.6 : 0.35;
      const v = n2(x / (7 * depth), y / (3.2 * depth)) + (BAYER[(y & 3) * 4 + (x & 3)] - 0.5) * 0.18;
      shade[i] = m === HILL_FAR ? (v < 0.25 ? 0 : 1) : v < 0.3 ? 0 : v > 0.72 ? 2 : 1;
    }
  for (let i = 0; i < 70; i++) {
    const x = Math.floor(rand() * W), y = gy(x) + 3 + Math.floor(rand() * (H - gy(x) - 3));
    if (mat[y * W + x] === GRASS_M) set(x, y, rand() < 0.5 ? FLOWER_R : FLOWER_Y);
  }

  // ---- what moves ----
  const clouds = Array.from({ length: 6 }, (_, i) => {
    const cw = 30 + Math.floor(rand() * 36), ch = 13 + Math.floor(rand() * 7), px = [];
    const puffs = Array.from({ length: 5 + Math.floor(rand() * 4) }, (_, k, all) => {
      const fx = (k + 0.5) / 7;
      return [cw * (0.14 + fx * 0.72), ch * (0.62 - Math.sin(fx * Math.PI) * 0.2), ch * (0.28 + Math.sin(fx * Math.PI) * 0.26 + rand() * 0.1)];
    });
    for (let y = 0; y < ch; y++)
      for (let x = 0; x < cw; x++) {
        if (y > ch * 0.86 || !puffs.some(([cx, cy, r]) => ((x - cx) * 0.8) ** 2 + (y - cy) ** 2 < r * r)) continue;
        px.push([x, y, y > ch * 0.7 || (y > ch * 0.55 && BAYER[(y & 3) * 4 + (x & 3)] > 0.45) ? 1 : 0]);
      }
    return { px, x: rand() * W, y: 8 + rand() * (horizon - 50), v: 0.6 + rand() * 1.6 + i * 0.05 };
  });
  const stars = Array.from({ length: 90 }, () => [Math.floor(rand() * W), Math.floor(rand() * (horizon - 12)), rand() * 6, 0.5 + rand() * 2]);
  const blades = Array.from({ length: Math.round(W * 0.9) }, () => {
    const x = Math.floor(rand() * W);
    return [x, gy(x) + 1 + Math.floor(rand() * (H - gy(x))), 2 + Math.floor(rand() * 4)];
  });
  const flies = Array.from({ length: 24 }, () => [rand() * W, horizon + 8 + rand() * (H - horizon - 10), rand() * 9, rand() * 9]);
  const birds = Array.from({ length: 3 }, (_, i) => [rand() * W, 24 + i * 9 + rand() * 10, 6 + rand() * 4]);
  const sprouts = [];

  // seedling, top row first: l light leaf, d dark leaf, s stem
  const SPROUT = [
    ['l.d', '.s.', '.s.'],
    ['ll.dd', 'lllsd', '..s..', '..s..'],
    ['ll...dd', 'lll.ddd', '.llsdd.', '...s...', '...s...', '...s...'],
  ];

  let hour = fixedHour ?? 12;
  let t0 = performance.now(), pal, packed, night;

  function colours() {
    pal = palette(hour);
    night = nightness(hour);
    packed = {};
    for (const [m, k] of Object.entries(MAT_KEY)) {
      const c = pal[k];
      packed[m] = [pack(mix(c, [0, 0, 0], 0.14)), pack(c), pack(mix(c, [255, 255, 255], 0.1))];
    }
    packed.win = pack(mix(pal.city, pal.win, Math.min(1, night * 1.4)));
  }

  function draw(now) {
    const t = (now - t0) / 1000;
    const skyH = horizon + 4;
    // the sun by day, the moon by night, on an arc over the hills
    const up = hour >= 6 && hour <= 19;
    const arc = up ? (hour - 6) / 13 : ((hour + 24 - 19) % 24) / 11;
    const sx = W * (0.08 + 0.84 * arc), sy = horizon - 8 - Math.sin(arc * Math.PI) * (horizon - 30);
    const sunC = up ? mix([255, 246, 210], [255, 170, 100], Math.max(0, 1 - Math.sin(arc * Math.PI) * 2.2)) : [242, 240, 226];
    const glow = up ? 13 : 0;
    // sky, sun, everything static
    for (let y = 0; y < H; y++) {
      const q = Math.min(1, y / skyH);
      for (let x = 0; x < W; x++) {
        const i = y * W + x, m = mat[i];
        if (m === SKY || m === WATER) {
          const yy = m === WATER ? Math.max(0, skyH - 2 - (y - (lyc - lry)) * 4) : y;
          const qq = Math.min(1, yy / skyH);
          const band = Math.floor(qq * 9 + BAYER[(y & 3) * 4 + (x & 3)]) / 9;
          let c = mix(pal.skyTop, pal.skyBot, band);
          const d = Math.hypot(x - sx, (yy - sy) * 1.05);
          if (d < 6) c = up || (x - sx + 2) ** 2 + (yy - sy + 1) ** 2 > 3 ? sunC : mix(sunC, [180, 180, 170], 0.4);
          else if (d < 6 + glow && BAYER[(y & 3) * 4 + (x & 3)] < (1 - (d - 6) / glow) * 0.6) c = mix(c, sunC, 0.45);
          if (m === WATER) {
            c = mix(c, pal.water, 0.45);
            if ((y & 1) === 0 && ((x + Math.floor(t * 3) + y * 11) % 37) < 3) c = mix(c, [255, 255, 255], 0.35);
            if (up && Math.abs(x - sx) < 3 + (y - lyc + lry) * 0.4 && ((x + y + Math.floor(t * 5)) & 3) === 0) c = mix(c, sunC, 0.7);
          }
          buf[i] = pack(c);
        } else if (m === WIN) buf[i] = lit[i] ? packed.win : packed[CITY][1];
        else buf[i] = packed[m][shade[i]];
      }
    }
    const plot = (x, y, c, onlySky) => {
      x = Math.round(x);
      y = Math.round(y);
      if (x < 0 || x >= W || y < 0 || y >= H) return;
      if (onlySky && mat[y * W + x] !== SKY) return;
      buf[y * W + x] = c;
    };
    // stars
    if (night > 0.05)
      for (const [x, y, ph, sp] of stars) {
        const b = night * (0.55 + 0.45 * Math.sin(t * sp + ph));
        if (b > 0.35) plot(x, y, pack(mix(pal.skyTop, [255, 252, 235], b)), true);
      }
    // clouds drift right, the higher ones slower
    const cl = pack(pal.cloudL), cs = pack(pal.cloudS);
    for (const c of clouds) {
      const cx = ((c.x + t * c.v) % (W + 60)) - 50;
      for (const [x, y, s] of c.px) plot(cx + x, c.y + y, s ? cs : cl, true);
    }
    // birds by day
    if (night < 0.4)
      for (const [bx, by, v] of birds) {
        const x = ((bx + t * v) % (W + 20)) - 10, flap = Math.floor(t * 4 + bx) % 2;
        const c = pack(mix(pal.skyTop, [20, 20, 30], 0.75));
        plot(x, by, c, true);
        plot(x - 1, by - flap, c, true);
        plot(x + 1, by - flap, c, true);
        plot(x - 2, by - 1 + flap, c, true);
        plot(x + 2, by - 1 + flap, c, true);
      }
    // grass in the wind
    const gl = pack(pal.grassL), gm = pack(pal.grassM), gd = pack(pal.grassD);
    for (const [x, y, hgt] of blades) {
      const sway = Math.round(Math.sin(t * 1.7 + x * 0.08) * 1.1);
      for (let k = 0; k < hgt; k++) plot(x + (k === hgt - 1 ? sway : 0), y - k, k === hgt - 1 ? gl : k === 0 ? gd : gm);
    }
    // sprouts people planted
    const leafL = pack(pal.leaf), leafD = pack(mix(pal.leaf, pal.grassD, 0.45)), stem = pack(mix(pal.grassD, pal.leaf, 0.3));
    for (const s of sprouts) {
      const g = Math.min(1, (now - s.born) / 2600);
      const art = SPROUT[g < 0.3 ? 0 : g < 0.65 ? 1 : 2];
      const ox = Math.floor(art[0].length / 2);
      art.forEach((row, r) => [...row].forEach((ch, k) => {
        if (ch === '.') return;
        plot(s.x - ox + k, s.y - art.length + 1 + r, ch === 'l' ? leafL : ch === 'd' ? leafD : stem);
      }));
    }
    // fireflies after dark
    if (night > 0.3)
      for (const f of flies) {
        const x = f[0] + Math.sin(t * 0.6 + f[2]) * 9, y = f[1] + Math.cos(t * 0.5 + f[3]) * 5;
        const b = Math.sin(t * 2.2 + f[2] * 3);
        if (b > 0.2) {
          const c = pack(mix([200, 255, 120], [255, 255, 220], b));
          plot(x, y, c);
          if (b > 0.75) for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) plot(x + dx, y + dy, pack(mix(pal.grassD, [230, 255, 140], 0.5)));
        }
      }
    ctx.putImageData(img, 0, 0);
  }

  // ---- run at a pixel-art frame rate, only while on screen ----
  let visible = true, raf = 0, last = 0;
  new IntersectionObserver(([e]) => {
    visible = e.isIntersecting;
    if (visible && !raf) raf = requestAnimationFrame(loop);
  }).observe(canvas);
  function loop(now) {
    raf = 0;
    if (!visible || document.hidden) return;
    if (now - last > 66) {
      last = now;
      draw(now);
    }
    if (!reduce || sprouts.some((s) => now - s.born < 2600)) raf = requestAnimationFrame(loop);
  }
  document.addEventListener('visibilitychange', () => !document.hidden && !raf && (raf = requestAnimationFrame(loop)));

  const api = {
    groundY: (x) => gy(Math.round(x)),
    setHour(hh) {
      hour = ((hh % 24) + 24) % 24;
      colours();
      if (!raf) raf = requestAnimationFrame(loop);
      draw(performance.now());
    },
    plant(x, y) {
      x = Math.round(Math.max(4, Math.min(W - 5, x)));
      y = Math.round(Math.max(gy(x) + 2, Math.min(H - 1, y)));
      sprouts.push({ x, y, born: performance.now() });
      if (sprouts.length > 60) sprouts.shift();
      if (!raf) raf = requestAnimationFrame(loop);
      onPlant?.(sprouts.length);
    },
    size: [W, H],
  };
  api.setHour(hour);
  return api;
}
