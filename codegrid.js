// The background: a dot grid that turns into code around the cursor. Only the patch under the
// cursor is ever drawn (a few hundred glyphs), never the whole screen.
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
if (fine && !reduce) {
  const STEP = 26, R = 190;
  const GLYPHS = '{}[]()<>=;:+-*/&|!?#$_01.,'.split('').concat(['=>', '//', '&&', 'fn', '::', '0x', '++', '!=']);
  const TONES = [[134, 239, 172], [252, 211, 77], [216, 180, 254], [147, 197, 253]];
  const cv = Object.assign(document.createElement('canvas'), { className: 'codegrid' });
  cv.setAttribute('aria-hidden', 'true');
  document.body.prepend(cv);
  const ctx = cv.getContext('2d');
  let dpr = 1, dirty = null, mx = -1e4, my = -1e4, raf = 0;
  const size = () => {
    dpr = Math.min(devicePixelRatio || 1, 2);
    cv.width = innerWidth * dpr;
    cv.height = innerHeight * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    dirty = null;
  };
  size();
  addEventListener('resize', size);
  // the same cell always shows the same glyph, so moving reveals code rather than noise
  const hash = (i, j) => {
    let h = (i * 374761393 + j * 668265263) | 0;
    h = Math.imul(h ^ (h >>> 13), 1274126177);
    return (h ^ (h >>> 16)) >>> 0;
  };
  const dark = () => document.documentElement.dataset.theme === 'dark';
  function draw() {
    raf = 0;
    if (dirty) ctx.clearRect(dirty[0], dirty[1], dirty[2], dirty[3]);
    const x0 = mx - R, y0 = my - R;
    dirty = [x0 - 20, y0 - 20, R * 2 + 40, R * 2 + 40];
    if (mx < -1e3) return;
    const ox = scrollX, oy = scrollY;
    const i0 = Math.floor((x0 + ox) / STEP), i1 = Math.ceil((mx + R + ox) / STEP);
    const j0 = Math.floor((y0 + oy) / STEP), j1 = Math.ceil((my + R + oy) / STEP);
    const isDark = dark();
    for (let j = j0; j <= j1; j++)
      for (let i = i0; i <= i1; i++) {
        const x = i * STEP + 13 - ox, y = j * STEP + 13 - oy;
        const d = Math.hypot(x - mx, y - my);
        if (d > R) continue;
        const p = 1 - d / R;
        const h = hash(i, j);
        // the four quadrants around the cursor each get a colour
        const tone = TONES[(x >= mx ? 0 : 1) + (y >= my ? 0 : 2)];
        const a = Math.min(1, p * 1.6);
        if (p > 0.18) {
          const g = GLYPHS[h % GLYPHS.length];
          ctx.font = `500 ${Math.round(9 + p * 5)}px "Geist Mono", ui-monospace, monospace`;
          ctx.fillStyle = `rgba(${tone[0]},${tone[1]},${tone[2]},${a})`;
          if (isDark) ctx.fillStyle = `rgba(${tone[0]},${tone[1]},${tone[2]},${a * 0.9})`;
          ctx.fillText(g, x, y);
        } else {
          const s = 3 + p * 8;
          ctx.fillStyle = `rgba(${tone[0]},${tone[1]},${tone[2]},${a * 0.8})`;
          ctx.fillRect(x - s / 2, y - s / 2, s, s);
        }
      }
  }
  const queue = () => raf || (raf = requestAnimationFrame(draw));
  addEventListener('pointermove', (e) => {
    if (e.pointerType !== 'mouse') return;
    mx = e.clientX;
    my = e.clientY;
    queue();
  });
  addEventListener('scroll', queue, { passive: true });
  document.addEventListener('pointerleave', () => {
    mx = my = -1e4;
    queue();
  });
}
