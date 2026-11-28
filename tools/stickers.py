# Regenerate: python3 tools/stickers.py public/img/own
"""Draw crayon-sticker SVGs (Trazo-like style): wobbly hand-cut contours, a darker hue-matched
outline, a pale upper-left light, lower-right shade, and flat posterised tones. Shapes:
ellipse, poly, stroke (rounded ribbon), ring. Usage: python3 draw.py <outdir>"""
import colorsys, math, os, random, sys

OUT = sys.argv[1]
os.makedirs(OUT, exist_ok=True)


def hx(c):
    c = c.lstrip('#'); return tuple(int(c[i:i + 2], 16) / 255 for i in (0, 2, 4))


def tone(c, dl, ds=0.0, dh=0.0):
    r, g, b = hx(c); h, l, s = colorsys.rgb_to_hls(r, g, b)
    r, g, b = colorsys.hls_to_rgb((h + dh) % 1, max(0, min(1, l + dl)), max(0, min(1, s + ds)))
    return '#%02x%02x%02x' % (round(r * 255), round(g * 255), round(b * 255))


class Wobble:
    def __init__(self, seed):
        rnd = random.Random(seed)
        self.w = [(rnd.uniform(0.5, 1), rnd.uniform(0, 6.28), f) for f in (3, 5, 9, 14, 23)]

    def __call__(self, t, amp):  # t in [0,1) around the contour
        return amp * sum(a * math.sin(f * 6.283 * t + p) for a, p, f in self.w) / 2.6


def ellipse(cx, cy, rx, ry, rot=0, n=96):
    a = math.radians(rot)
    return [(cx + rx * math.cos(t) * math.cos(a) - ry * math.sin(t) * math.sin(a),
             cy + rx * math.cos(t) * math.sin(a) + ry * math.sin(t) * math.cos(a))
            for t in (6.283 * i / n for i in range(n))]


def chaikin(pts, k=3):
    for _ in range(k):
        out = []
        for i in range(len(pts)):
            p, q = pts[i], pts[(i + 1) % len(pts)]
            out += [(0.75 * p[0] + 0.25 * q[0], 0.75 * p[1] + 0.25 * q[1]), (0.25 * p[0] + 0.75 * q[0], 0.25 * p[1] + 0.75 * q[1])]
        pts = out
    return pts


def densify(pts, step=3.0):
    out = []
    for i in range(len(pts)):
        p, q = pts[i], pts[(i + 1) % len(pts)]
        d = math.dist(p, q); n = max(1, int(d / step))
        out += [(p[0] + (q[0] - p[0]) * j / n, p[1] + (q[1] - p[1]) * j / n) for j in range(n)]
    return out


def ribbon(path, width):
    """a rounded ribbon around a polyline: smooth the centre line, offset both sides, round caps"""
    if len(path) > 2:
        pts = [path[0]]
        for _ in range(3):
            pts = [path[0]]
            for i in range(len(path) - 1):
                p, q = path[i], path[i + 1]
                pts += [(0.75 * p[0] + 0.25 * q[0], 0.75 * p[1] + 0.25 * q[1]), (0.25 * p[0] + 0.75 * q[0], 0.25 * p[1] + 0.75 * q[1])]
            pts.append(path[-1]); path = pts
    dense = []
    for i in range(len(path) - 1):  # an open line: no segment back to the start
        p, q = path[i], path[i + 1]
        n = max(1, int(math.dist(p, q) / 3))
        dense += [(p[0] + (q[0] - p[0]) * j / n, p[1] + (q[1] - p[1]) * j / n) for j in range(n)]
    path = dense + [path[-1]]
    r = width / 2; left, right = [], []
    for i, p in enumerate(path):
        a = path[max(0, i - 1)]; b = path[min(len(path) - 1, i + 1)]
        dx, dy = b[0] - a[0], b[1] - a[1]; L = math.hypot(dx, dy) or 1
        nx, ny = -dy / L, dx / L
        left.append((p[0] + nx * r, p[1] + ny * r)); right.append((p[0] - nx * r, p[1] - ny * r))
    def cap(c, frm):
        a0 = math.atan2(frm[1] - c[1], frm[0] - c[0])
        return [(c[0] + r * math.cos(a0 - math.pi * k / 10), c[1] + r * math.sin(a0 - math.pi * k / 10)) for k in range(1, 10)]
    end = cap(path[-1], left[-1]); start = cap(path[0], right[0])
    return left + end + right[::-1] + start


def shape_pts(s):
    k, v = next((k, v) for k, v in s.items() if k in ('ellipse', 'poly', 'stroke', 'ring'))
    if k == 'ellipse': return [ellipse(*v)]
    if k == 'poly': return [densify(chaikin(v, 3) if s.get('smooth', True) else v, 3)]
    if k == 'stroke': return [ribbon(v, s['width'])]
    if k == 'ring':
        cx, cy, rx, ry, rot, irx, iry = v
        return [ellipse(cx, cy, rx, ry, rot), ellipse(cx, cy, irx, iry, rot)[::-1]]


def wobbled(pts, wob, amp):
    n = len(pts); out = []
    for i, p in enumerate(pts):
        a, b = pts[i - 1], pts[(i + 1) % n]
        dx, dy = b[0] - a[0], b[1] - a[1]; L = math.hypot(dx, dy) or 1
        d = wob(i / n, amp)
        out.append((p[0] - dy / L * d, p[1] + dx / L * d))
    return out


def d_of(loops):
    return ' '.join('M' + ' L'.join(f'{x:.1f} {y:.1f}' for x, y in lp) + ' Z' for lp in loops)


def build(name, spec):
    seed = spec.get('seed', 1); defs, body = [], []
    for pi, part in enumerate(spec['parts']):
        base = part['base']; ol = part.get('outline', 6)
        shapes = part['shape'] if isinstance(part['shape'], list) else [part['shape']]
        loops = []
        for si, s in enumerate(shapes):
            for lp in shape_pts(s):
                loops.append(wobbled(lp, Wobble(seed * 31 + pi * 7 + si), part.get('rough', 1.1 if 'stroke' in s else 2.2)))
        d = d_of(loops)
        fr = 'evenodd' if any('ring' in s for s in shapes) else 'nonzero'
        outline = part.get('ink', tone(base, -0.24, 0.1))
        cid = f'{name}-c{pi}'
        defs.append(f'<clipPath id="{cid}"><path d="{d}" clip-rule="{fr}"/></clipPath>')
        # the cut edge: a darker band all round, a little heavier lower right
        body.append(f'<path d="{d}" fill="{outline}" stroke="{outline}" stroke-width="{ol * 2}" stroke-linejoin="round" fill-rule="{fr}" transform="translate(0.8 1.2)"/>')
        body.append(f'<path d="{d}" fill="{base}" fill-rule="{fr}"/>')
        # inside the part: shade toward the lower right, then the light patches
        xs = [p[0] for lp in loops for p in lp]; ys = [p[1] for lp in loops for p in lp]
        x0, x1, y0, y1 = min(xs), max(xs), min(ys), max(ys); w, h = x1 - x0, y1 - y0
        inner = [f'<path d="{d}" fill="none" stroke="{tone(base, 0.12, -0.05)}" stroke-width="{max(2, ol * 0.7):.1f}" fill-rule="{fr}" opacity="0.7"/>']  # pale fringe just inside the cut
        if part.get('depth', 1):
            sh = ellipse(x1 - w * 0.1, y1 - h * 0.05, w * 0.62, h * 0.5, -20)
            inner.append(f'<path d="{d_of([wobbled(sh, Wobble(seed + pi * 3 + 90), 4)])}" fill="{tone(base, -0.07, 0.04)}"/>')
            sh2 = ellipse(x1 - w * 0.02, y1 + h * 0.06, w * 0.4, h * 0.3, -20)
            inner.append(f'<path d="{d_of([wobbled(sh2, Wobble(seed + pi * 3 + 91), 3)])}" fill="{tone(base, -0.12, 0.05)}"/>')
        for li, L in enumerate(part.get('light', [])):
            for lp in shape_pts(L['shape']):
                t = L.get('tone', 1)
                inner.append(f'<path d="{d_of([wobbled(lp, Wobble(seed + pi * 5 + li + 40), 1.6)])}" fill="{tone(base, (0.07, 0.13, 0.2)[t - 1], -0.05)}"/>')
        for li, L in enumerate(part.get('shade', [])):
            for lp in shape_pts(L['shape']):
                inner.append(f'<path d="{d_of([wobbled(lp, Wobble(seed + pi * 5 + li + 60), 1.8)])}" fill="{tone(base, -0.1, 0.05)}"/>')
        body.append(f'<g clip-path="url(#{cid})">' + ''.join(inner) + '</g>')
    for di, det in enumerate(spec.get('details', [])):
        loops = [wobbled(lp, Wobble(seed + di + 200), 0.8) for lp in shape_pts(det['shape'])]
        body.append(f'<path d="{d_of(loops)}" fill="{det["fill"]}" fill-rule="evenodd"/>')
    svg = f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256"><defs>{"".join(defs)}</defs>{"".join(body)}</svg>'
    open(os.path.join(OUT, f'{name}.svg'), 'w').write(svg)


SPECS = {
    'folder': {'seed': 5, 'parts': [
        {'base': '#e9b13f', 'outline': 5, 'shape': {'poly': [[40, 62], [98, 62], [112, 80], [216, 80], [216, 196], [40, 196]], 'smooth': False}},
        {'base': '#fbf6ea', 'outline': 3, 'depth': 0, 'shape': {'poly': [[58, 94], [196, 88], [200, 176], [62, 182]], 'smooth': False}},
        {'base': '#f6cf5f', 'outline': 5, 'shape': {'poly': [[28, 118], [228, 112], [214, 208], [42, 210]], 'smooth': False},
         'light': [{'tone': 2, 'shape': {'ellipse': [86, 140, 42, 12, -4]}}, {'tone': 3, 'shape': {'ellipse': [74, 137, 16, 4, -4]}}]}]},
    'contract': {'seed': 9, 'parts': [
        {'base': '#f7f1e3', 'outline': 5, 'shape': {'poly': [[62, 28], [176, 28], [206, 58], [206, 228], [62, 228]], 'smooth': False},
         'light': [{'tone': 2, 'shape': {'ellipse': [96, 60, 22, 10, 0]}}]},
        {'base': '#e4d8c2', 'outline': 3, 'depth': 0, 'shape': {'poly': [[176, 28], [206, 58], [176, 58]], 'smooth': False}},
        {'base': '#f6a094', 'outline': 3, 'depth': 0, 'shape': {'stroke': [[84, 134], [186, 134]], 'width': 22}},
        {'base': '#e2574c', 'outline': 4, 'shape': {'ring': [168, 190, 28, 28, 0, 16, 16]}}],
        'details': [{'fill': '#bdb19b', 'shape': {'stroke': [[86, 84], [160, 84]], 'width': 8}},
                    {'fill': '#bdb19b', 'shape': {'stroke': [[86, 108], [182, 108]], 'width': 8}},
                    {'fill': '#b8443b', 'shape': {'stroke': [[90, 134], [178, 134]], 'width': 7}},
                    {'fill': '#bdb19b', 'shape': {'stroke': [[86, 160], [140, 160]], 'width': 8}},
                    {'fill': '#e2574c', 'shape': {'stroke': [[168, 178], [168, 192]], 'width': 6}},
                    {'fill': '#e2574c', 'shape': {'ellipse': [168, 202, 3.6, 3.6, 0]}}]},
    'brain': {'seed': 3, 'parts': [
        {'base': '#f4a3b8', 'outline': 5, 'shape': {'stroke': [[140, 176], [150, 216]], 'width': 26}},
        {'base': '#f4a3b8', 'outline': 6, 'shape': {'poly': [[128, 46], [168, 40], [206, 66], [222, 110], [210, 160], [176, 186], [128, 184], [80, 186], [46, 160], [34, 110], [50, 66], [88, 40]]},
         'light': [{'tone': 2, 'shape': {'ellipse': [86, 80, 24, 12, -25]}}, {'tone': 3, 'shape': {'ellipse': [80, 78, 9, 4, -25]}}]}],
        'details': [{'fill': '#d56e8c', 'shape': {'stroke': [[128, 52], [122, 96], [132, 132], [126, 180]], 'width': 6}},
                    {'fill': '#d56e8c', 'shape': {'stroke': [[62, 106], [88, 98], [102, 116]], 'width': 6}},
                    {'fill': '#d56e8c', 'shape': {'stroke': [[70, 150], [94, 140], [106, 156]], 'width': 6}},
                    {'fill': '#d56e8c', 'shape': {'stroke': [[194, 100], [168, 94], [156, 114]], 'width': 6}},
                    {'fill': '#d56e8c', 'shape': {'stroke': [[186, 148], [162, 140], [152, 158]], 'width': 6}}]},
    'sprout': {'seed': 7, 'parts': [
        {'base': '#a87250', 'outline': 5, 'shape': {'ellipse': [128, 208, 76, 24, 0]}, 'light': [{'tone': 1, 'shape': {'ellipse': [102, 200, 30, 7, 0]}}]},
        {'base': '#5fa64c', 'outline': 4, 'shape': {'stroke': [[128, 206], [124, 166], [130, 124]], 'width': 13}},
        {'base': '#7cc566', 'outline': 5, 'shape': {'poly': [[126, 134], [100, 104], [64, 96], [48, 110], [70, 140], [112, 146]]},
         'light': [{'tone': 2, 'shape': {'ellipse': [76, 112, 16, 6, 20]}}]},
        {'base': '#8fd46f', 'outline': 5, 'shape': {'poly': [[132, 124], [150, 86], [188, 60], [214, 66], [204, 104], [166, 126]]},
         'light': [{'tone': 2, 'shape': {'ellipse': [172, 80, 18, 6, -30]}}, {'tone': 3, 'shape': {'ellipse': [166, 80, 7, 3, -30]}}]}],
        'details': [{'fill': '#4c8a3d', 'shape': {'stroke': [[116, 138], [78, 114]], 'width': 4}}, {'fill': '#4c8a3d', 'shape': {'stroke': [[142, 116], [192, 76]], 'width': 4}}]},
    'sparkle': {'seed': 4, 'parts': [
        {'base': '#c3a5f5', 'outline': 6, 'shape': {'poly': [[128, 22], [146, 104], [228, 124], [146, 144], [128, 230], [110, 144], [28, 124], [110, 104]], 'smooth': False},
         'light': [{'tone': 2, 'shape': {'ellipse': [118, 100, 10, 18, 0]}}, {'tone': 3, 'shape': {'ellipse': [116, 92, 4, 8, 0]}}]},
        {'base': '#f6cf5f', 'outline': 3, 'shape': {'poly': [[206, 28], [212, 48], [230, 54], [212, 60], [206, 80], [200, 60], [182, 54], [200, 48]], 'smooth': False}},
        {'base': '#f4a3b8', 'outline': 3, 'depth': 0, 'shape': {'ellipse': [56, 206, 11, 11, 0]}}]},
    'sunset': {'seed': 12, 'parts': [
        {'base': '#f8ad5e', 'outline': 4, 'depth': 0, 'shape': [{'stroke': [[58, 112], [38, 96]], 'width': 13}, {'stroke': [[88, 80], [76, 54]], 'width': 13}, {'stroke': [[128, 68], [128, 38]], 'width': 13}, {'stroke': [[168, 80], [180, 54]], 'width': 13}, {'stroke': [[198, 112], [218, 96]], 'width': 13}]},
        {'base': '#f8ad5e', 'outline': 6, 'shape': {'ellipse': [128, 162, 62, 62, 0]}, 'light': [{'tone': 2, 'shape': {'ellipse': [104, 132, 20, 11, -30]}}, {'tone': 3, 'shape': {'ellipse': [98, 128, 8, 4, -30]}}]},
        {'base': '#3f8a68', 'outline': 6, 'shape': {'poly': [[16, 178], [70, 156], [124, 168], [186, 150], [240, 168], [240, 224], [16, 224]]},
         'light': [{'tone': 1, 'shape': {'ellipse': [76, 168, 30, 5, -10]}}]}]},
    'forecast': {'seed': 2, 'parts': [
        {'base': '#b9d4fb', 'outline': 4, 'shape': {'poly': [[150, 122], [232, 40], [236, 190]]}},
        {'base': '#4f7fe0', 'outline': 5, 'depth': 0, 'shape': {'stroke': [[24, 198], [70, 152], [106, 172], [150, 122], [214, 106]], 'width': 17}},
        {'base': '#f8ad5e', 'outline': 4, 'shape': {'ellipse': [214, 106, 15, 15, 0]}, 'light': [{'tone': 3, 'shape': {'ellipse': [209, 101, 4, 3, 0]}}]}]},
    'merge': {'seed': 6, 'parts': [
        {'base': '#57b46a', 'outline': 5, 'depth': 0, 'shape': [{'stroke': [[86, 80], [86, 180]], 'width': 18}, {'stroke': [[86, 102], [96, 128], [130, 126], [158, 122]], 'width': 18}]},
        {'base': '#57b46a', 'outline': 5, 'shape': [{'ring': [86, 58, 27, 27, 0, 11, 11]}, {'ring': [86, 204, 27, 27, 0, 11, 11]}, {'ring': [182, 120, 27, 27, 0, 11, 11]}],
         'light': [{'tone': 2, 'shape': {'ellipse': [74, 46, 8, 4, -30]}}]}]},
}

for name, spec in SPECS.items():
    build(name, spec)
print('drew', len(SPECS))
