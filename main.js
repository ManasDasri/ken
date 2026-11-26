import { $, $$, reduce, toast } from './common.js';

// ---------- the door: once per visit ----------
const door = $('#door');
function enter() {
  if (document.body.classList.contains('in')) return;
  document.body.classList.add('in');
  try { sessionStorage.setItem('in', '1'); } catch {}
  setTimeout(() => (door.style.display = 'none'), 1100);
}
let seen = false;
try { seen = sessionStorage.getItem('in') === '1'; } catch {}
if (seen || reduce) {
  document.body.classList.add('in');
  door.style.display = 'none';
} else {
  $('#enter').addEventListener('click', enter);
  addEventListener('wheel', enter, { once: true, passive: true });
  addEventListener('touchmove', enter, { once: true, passive: true });
  addEventListener('keydown', (e) => ['Enter', ' ', 'ArrowDown', 'PageDown'].includes(e.key) && enter());
  $('#enter').focus();
}

const hero = $('#home');

// ---------- research / code: the selection slides between them ----------
const boxLabel = $('#boxlabel');
const slider = $('.toggle .slider');
const moveSlider = (b) => {
  slider.style.left = `${b.offsetLeft}px`;
  slider.style.width = `${b.offsetWidth}px`;
};
$$('.toggle button').forEach((b) =>
  b.addEventListener('click', () => {
    $$('.toggle button').forEach((o) => {
      o.classList.toggle('on', o === b);
      o.setAttribute('aria-pressed', o === b);
    });
    moveSlider(b);
    boxLabel.innerHTML = b.dataset.mode === 'code' ? 'engineer <b>0.99</b>' : 'researcher <b>0.97</b>';
  })
);
document.fonts.ready.then(() => moveSlider($('.toggle button.on')));

// ---------- the hero sentence arrives one piece at a time ----------
$$('.pitch .line > *').forEach((el, i) => (el.style.animationDelay = `${1.3 + i * 0.12}s`));
{
  // the install command types itself out, then waits for a hover to run again
  const term = $('#term'), full = term.textContent;
  const type = () => {
    let i = 2;
    term.textContent = '$ ';
    const t = setInterval(() => {
      term.textContent = full.slice(0, ++i);
      if (i >= full.length) clearInterval(t);
    }, 55);
  };
  if (!reduce) {
    term.textContent = '$ ';
    setTimeout(type, 2200);
    term.closest('.chip').addEventListener('pointerenter', type);
  }
  // the loss curve trains again when you hover it
  const loss = $('.chip-loss svg path');
  $('.chip-loss').addEventListener('pointerenter', () => {
    loss.style.animation = 'none';
    loss.getBoundingClientRect();
    loss.style.animation = 'draw 1.6s var(--ease) forwards';
  });
}

// ---------- pixels drifting under the name ----------
{
  const box = $('#pixels'), colours = ['#f5b800', '#a855f7', '#22c55e', '#3b82f6', '#ec4899', '#cfcfd6'];
  let seed = 11;
  const r = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
  const w = box.clientWidth;
  for (let row = 0; row < 5; row++) {
    const span = 0.3 + row * 0.12; // widens as it falls
    for (let k = 0; k < 5 + row * 2; k++) {
      if (r() < 0.45) continue;
      const i = document.createElement('i');
      const x = w / 2 + (r() - 0.5) * w * span;
      i.style.cssText = `left:${Math.round(x / 13) * 13}px;top:${row * 13}px;background:${colours[Math.floor(r() * colours.length)]};opacity:${(0.85 - row * 0.12).toFixed(2)};--d:${(2 + r() * 3).toFixed(1)}s;--dl:${(r() * 3).toFixed(1)}s`;
      box.append(i);
    }
  }
}

// ---------- hero canvas: drag the frames, or drag out a selection ----------
const frames = $$('.frame');
frames.forEach((f, i) => f.style.setProperty('--i', i));
for (const f of frames) {
  let start = null, dx = 0, dy = 0;
  f.addEventListener('pointerdown', (e) => {
    if (e.button !== 0) return;
    start = { x: e.clientX, y: e.clientY, dx, dy, moved: false };
    f.setPointerCapture(e.pointerId);
    e.preventDefault();
  });
  f.addEventListener('pointermove', (e) => {
    if (!start) return;
    const mx = e.clientX - start.x, my = e.clientY - start.y;
    if (!start.moved && Math.hypot(mx, my) < 4) return;
    start.moved = true;
    f.classList.add('held');
    dx = start.dx + mx;
    dy = start.dy + my;
    f.style.setProperty('--dx', `${dx}px`);
    f.style.setProperty('--dy', `${dy}px`);
  });
  const drop = () => {
    if (!start) return;
    f.classList.remove('held');
    f.dataset.dragged = start.moved ? '1' : '';
    start = null;
  };
  f.addEventListener('pointerup', drop);
  f.addEventListener('pointercancel', drop);
  f.addEventListener('click', (e) => {
    if (f.dataset.dragged) {
      e.preventDefault();
      f.dataset.dragged = '';
    }
  });
}
{
  const box = $('#marquee');
  let o = null;
  hero.addEventListener('pointerdown', (e) => {
    if (e.button !== 0 || e.target.closest('a, button, .frame, .chip, .toggle, .box')) return;
    const h = hero.getBoundingClientRect();
    o = { x: e.clientX - h.left, y: e.clientY - h.top };
    frames.forEach((f) => f.classList.remove('sel'));
  });
  addEventListener('pointermove', (e) => {
    if (!o) return;
    const h = hero.getBoundingClientRect();
    const x = e.clientX - h.left, y = e.clientY - h.top;
    const l = Math.min(x, o.x), t = Math.min(y, o.y), w = Math.abs(x - o.x), ht = Math.abs(y - o.y);
    Object.assign(box.style, { left: `${l}px`, top: `${t}px`, width: `${w}px`, height: `${ht}px` });
    box.classList.toggle('on', w + ht > 6);
    const sel = { left: l + h.left, top: t + h.top, right: l + w + h.left, bottom: t + ht + h.top };
    for (const f of frames) {
      const r = f.getBoundingClientRect();
      f.classList.toggle('sel', w + ht > 6 && r.left < sel.right && r.right > sel.left && r.top < sel.bottom && r.bottom > sel.top);
    }
  });
  addEventListener('pointerup', () => {
    if (!o) return;
    o = null;
    box.classList.remove('on');
    const n = frames.filter((f) => f.classList.contains('sel')).length;
    if (n) toast(`${n} frame${n > 1 ? 's' : ''} selected. Drag them anywhere.`);
  });
}


// ---------- the projects, in an editor ----------
{
  const P = {
    'clause-risk-review': { name: 'Clause Risk Review', dot: '#f5b800', img: 'img/clause.jpg', lang: 'Python', state: 'results published', site: 'https://kenx049-clause-risk-review.static.hf.space/index.html', repo: 'ManasDasri/NNDL',
      about: 'Does legal pretraining help a model find risky contract clauses? TextCNN, BERT and Legal-BERT train on identical windows and per-contract splits; every threshold is tuned on validation data only.',
      result: 'BERT: 0.879 document F1 on 76 held-out contracts. Legal-BERT: no measurable gain.', stack: ['PyTorch', 'Transformers', 'CUAD v1'] },
    'med-eeg': { name: 'Med-EEG', dot: '#3b82f6', img: 'img/neurodial.jpg', lang: 'Python', state: 'results published', site: 'https://www.algorithmicbit.tech/neurodial/', repo: 'ManasDasri/Med-EEG',
      about: 'Can two EEG numbers track a meditator’s focus? Person-held-out models, checked against shuffled labels and non-EEG baselines, with a pre-registered replication on a second dataset.',
      result: 'Depth decoded at within-person AUC 0.609. The expertise result was confounded by sex, and says so.', stack: ['MNE', 'scikit-learn', 'statsmodels'] },
    sprout: { name: 'Sprout', dot: '#22c55e', img: 'img/sprout.jpg', lang: 'Go', state: 'v0.7.0 shipped', site: 'https://sprout-devlabs.github.io/sprout-web/', repo: 'Sprout-DevLabs/sprout',
      about: 'A map of your codebase for you and your AI agent: where to start reading, what a change breaks, which tests to run. One binary, and an MCP server coding agents call directly.',
      result: 'Ships through a Homebrew tap, a Scoop bucket and Linux packages.', stack: ['Go', 'MCP', 'git'] },
    forme: { name: 'Forme', dot: '#a855f7', img: 'img/forme.jpg', lang: 'TypeScript', state: 'live', site: 'https://forme-amber.vercel.app', repo: 'ManasDasri/forme',
      about: '53 free motion components for React (shaders, ASCII scenes, HUD instruments) that you install as source with one shadcn command.',
      result: 'Each component’s accessibility badges are tests: CI fails if the code doesn’t back them up.', stack: ['React', 'WebGL', 'shadcn registry'] },
    flow: { name: 'Flow', dot: '#ec4899', img: 'img/flow.jpg', lang: 'JavaScript', state: 'v1.0 live', site: 'https://flow-study.me', repo: 'ManasDasri/Flow-study',
      about: 'A study room you share with friends. Start a focus block and a sun sinks for everyone; when it sets, you all take a break. Video runs peer to peer.',
      result: 'v1.0 released November 2026. Free, and the code is open.', stack: ['Express', 'Supabase', 'WebRTC'] },
    velora: { name: 'Velora', dot: '#f97316', img: 'img/velora.jpg', lang: 'JavaScript', state: 'live', site: 'https://velora-one-lake.vercel.app', repo: 'ManasDasri/Velora',
      about: 'Probability cones for stock prices: thousands of simulated paths with regime switching and jump shocks, instead of one price target.',
      result: 'Fan charts, upside probability, VaR and CVaR, drawn on a plain canvas.', stack: ['React', 'Monte Carlo', 'Canvas'] },
  };
  const keys = Object.keys(P);
  const el = (tag, cls, text) => Object.assign(document.createElement(tag), cls ? { className: cls } : {}, text != null ? { textContent: text } : {});
  const tree = $('#tree'), view = $('#ide-view'), tabs = $$('#ide-tabs button');
  let cur = 'sprout', tab = 'readme';

  for (const k of keys) {
    const li = el('li');
    const b = el('button');
    b.dataset.k = k;
    const dot = el('i', 'fdot');
    dot.style.background = P[k].dot;
    b.append(el('span', 'chev', '▸'), dot, `${k}/`);
    b.addEventListener('click', () => open(k));
    li.append(b);
    tree.append(li);
  }

  const readme = (p) => {
    const wrap = el('article', 'md');
    const h = el('h3', null, p.name);
    h.append(el('span', 'badge', `● ${p.state}`));
    const img = el('img');
    Object.assign(img, { src: p.img, alt: `${p.name} screenshot`, loading: 'lazy' });
    const shot = el('a', 'md-shot');
    Object.assign(shot, { href: p.site, target: '_blank', rel: 'noopener' });
    shot.append(img, el('span', null, 'open site ↗'));
    const links = el('p', 'md-links');
    const a1 = el('a', null, 'Open the site ↗'), a2 = el('a', null, 'Read the code ↗');
    Object.assign(a1, { href: p.site, target: '_blank', rel: 'noopener' });
    Object.assign(a2, { href: `https://github.com/${p.repo}`, target: '_blank', rel: 'noopener' });
    links.append(a1, a2);
    const res = el('blockquote', null, p.result);
    wrap.append(h, shot, el('p', null, p.about), res, links);
    return wrap;
  };
  // stack.json, highlighted by hand: keys, strings and punctuation each get a colour
  const json = (k, p) => {
    const obj = { name: k, lang: p.lang, stack: p.stack, status: p.state, repo: p.repo, site: p.site };
    const lines = JSON.stringify(obj, null, 2).split('\n');
    const pre = el('pre', 'code');
    lines.forEach((line, i) => {
      const row = el('span', 'ln');
      row.append(el('em', null, String(i + 1)));
      const re = /("(?:[^"\\]|\\.)*")(\s*:)?|([{}\[\],])/g;
      let last = 0, m;
      while ((m = re.exec(line))) {
        if (m.index > last) row.append(line.slice(last, m.index));
        if (m[3]) row.append(el('b', 'pun', m[3]));
        else if (m[2]) row.append(el('b', 'key', m[1]), el('b', 'pun', m[2].trim()));
        else row.append(el('b', 'str', m[1]));
        last = re.lastIndex;
      }
      if (last < line.length) row.append(line.slice(last));
      pre.append(row, '\n');
    });
    return pre;
  };
  function paint() {
    const p = P[cur];
    view.replaceChildren(tab === 'readme' ? readme(p) : json(cur, p));
    view.scrollTop = 0;
    tabs.forEach((t) => t.setAttribute('aria-selected', t.dataset.tab === tab));
    $$('#tree button').forEach((b) => b.classList.toggle('on', b.dataset.k === cur));
    $('#st-lang').textContent = p.lang;
    $('#st-state').textContent = `● ${p.state}`;
    view.classList.remove('fade');
    void view.offsetWidth;
    view.classList.add('fade');
  }
  function open(k) {
    cur = k;
    paint();
  }
  tabs.forEach((t) => t.addEventListener('click', () => { tab = t.dataset.tab; paint(); }));
  paint();

  // ---- the terminal ----
  const out = $('#term-out'), input = $('#term-in');
  const print = (text, cls) => {
    const line = el('div', cls, text);
    out.append(line);
    while (out.childElementCount > 40) out.firstChild.remove();
    out.scrollTop = out.scrollHeight;
  };
  const find = (q) => keys.find((k) => k.startsWith((q || '').toLowerCase().replace(/\/$/, '')));
  const LOG = ['a1f9c2e  Released Flow v1.0', '7c3e0b1  First PRs merged into rules_go and gpui-kit', '4d2a8f6  First PR merged into Gleam', 'e91b7aa  Shipped Sprout on Homebrew', '0b5c1d3  Started Flow'];
  const run = (raw) => {
    const [cmd, arg] = raw.trim().split(/\s+/);
    if (!cmd) return;
    print(`~/projects $ ${raw}`, 'echo');
    switch (cmd) {
      case 'help': print('ls · open <project> · cat stack · git log · whoami · clear'); break;
      case 'ls': print(keys.map((k) => `${k}/`).join('  ')); break;
      case 'open': case 'cd': case 'code': {
        const k = find(arg);
        if (k) { open(k); print(`opened ${k}/README.md`, 'ok'); }
        else print(`no project called "${arg ?? ''}". try ls`, 'err');
        break;
      }
      case 'cat': tab = 'json'; paint(); print(`showing ${cur}/stack.json`, 'ok'); break;
      case 'git': print(LOG.join('\n')); break;
      case 'whoami': print('manas dasari · cs @ amrita, class of 2028 · open to internships'); break;
      case 'clear': out.replaceChildren(); break;
      case 'sudo': print('nice try.', 'err'); break;
      default: print(`zsh: command not found: ${cmd}. try help`, 'err');
    }
  };
  const history = [];
  let hi = 0;
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      history.push(input.value);
      hi = history.length;
      run(input.value);
      input.value = '';
    } else if (e.key === 'ArrowUp' && hi > 0) {
      input.value = history[--hi];
      e.preventDefault();
    } else if (e.key === 'ArrowDown') {
      input.value = history[++hi] ?? '';
    } else if (e.key === 'Tab') {
      // complete a project name
      const [c, a = ''] = input.value.split(/\s+/);
      const k = a !== undefined && find(a);
      if (c && k) { input.value = `${c} ${k}`; e.preventDefault(); }
    }
  });
  // the first time the editor comes into view, it types a command on its own
  new IntersectionObserver(([e], o) => {
    if (!e.isIntersecting) return;
    o.disconnect();
    print('type help to see what this terminal does', 'dim');
    if (reduce) return;
    const demo = 'open sprout';
    let i = 0;
    const t = setInterval(() => {
      input.value = demo.slice(0, ++i);
      if (i === demo.length) {
        clearInterval(t);
        setTimeout(() => { run(demo); input.value = ''; }, 350);
      }
    }, 70);
  }, { threshold: 0.5 }).observe($('#ide'));
}
