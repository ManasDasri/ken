// ---------- contact: a dusk sky drawn in ASCII ----------
// Real cumulus are painted first (soft puffs piled into domes with flat bases, lit from above, shaded
// underneath, warm where the sunset is behind them), then every character cell takes its colour and its
// character from that painting. The clouds drift; open sky is a fine screen of faint characters.
export function sky(host, card = null) {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const cv = document.createElement('canvas');
  cv.setAttribute('aria-hidden', 'true');
  host.append(cv);
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
    if (card) {
      const hr = host.getBoundingClientRect(), cr = card.getBoundingClientRect();
      hole = { l: cr.left - hr.left + 14, t: cr.top - hr.top + 14, r: cr.right - hr.left - 14, b: cr.bottom - hr.top - 14 };
    }
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
        if (hole && x > hole.l && x < hole.r && py > hole.t && py < hole.b) continue;
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
  const ro = new ResizeObserver(() => { size(); draw(performance.now()); });
  ro.observe(host);
  draw(0);
  let io = null, on = false;
  if (!reduce) {
    // only while the section is on screen, about 12 frames a second: clouds are slow
    let last = 0;
    io = new IntersectionObserver(([e]) => { on = e.isIntersecting; if (on) { last = performance.now(); requestAnimationFrame(loop); } });
    io.observe(host);
    const loop = (t) => {
      if (!on || document.hidden) return;
      requestAnimationFrame(loop);
      if (t - last < 80) return;
      draw(t, t - last);
      last = t;
    };
  }
  return () => { ro.disconnect(); io?.disconnect(); on = false; cv.remove(); };
}
