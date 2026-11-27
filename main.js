import { $, $$, reduce } from './common.js';
import { PROJECTS } from './cards.js';

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

// ---------- the projects: real folders on the desk; hover one (or tap it) and the pages slide out ----------
{
  const pad = (n) => String(n + 1).padStart(2, '0');
  const box = $('#folders');
  box.innerHTML = PROJECTS.map((p, i) => `
    <article class="folder" data-tone="${p.tone}" tabindex="0" aria-label="${p.name}">
      <div class="fd-back"><span class="fd-tab">${pad(i)} · ${p.kind}</span></div>
      <div class="fd-paper fd-spec" aria-hidden="true">
        <header>${p.host}</header>
        ${p.xray.map(([k, v]) => `<p><b>${k}</b>${v}</p>`).join('')}
      </div>
      <div class="fd-paper fd-shot"><img src="${p.img}" alt="${p.name}, the site" loading="lazy" /></div>
      <div class="fd-front">
        <img class="stk fd-stk" src="img/stickers/${p.sticker}.svg" alt="" />
        <div class="fd-label"><small>No. ${pad(i)} — ${p.stack.join(' · ')}</small><h3>${p.name}</h3></div>
        <p class="fd-tag">${p.tag}</p>
        <footer>
          <span class="fd-stamp"><b>${p.stat}</b> ${p.statLabel}</span>
          <span class="fd-links"><a href="${p.site}" target="_blank" rel="noopener">${p.siteLabel === 'Site' ? 'Open' : p.siteLabel} ↗</a><a href="https://github.com/${p.repo}" target="_blank" rel="noopener">Code ↗</a></span>
        </footer>
      </div>
    </article>`).join('');
  const folders = $$('.folder', box);
  // touch has no hover, so a tap pulls the pages out (and slides the last ones back)
  box.addEventListener('pointerup', (e) => {
    const f = e.target.closest('.folder');
    if (e.pointerType === 'mouse' || !f || e.target.closest('a')) return;
    folders.forEach((o) => o.classList.toggle('up', o === f && !o.classList.contains('up')));
  });
}

