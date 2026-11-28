import { $, $$ } from './common.js';
import { PROJECTS } from './cards.js';

// One case file per project, laid out on the desk: a photo of the site, a sticky note with the
// question, and a receipt for how it's built, where the number that matters is the total.
const pad = (n) => String(n + 1).padStart(2, '0');
const arrow = '<svg viewBox="0 0 16 16"><path d="M4 12 12 4M5 4h7v7" /></svg>';
// a barcode that's the same for a project every time
const barcode = (name) => {
  let h = 2166136261;
  for (const c of name) h = Math.imul(h ^ c.charCodeAt(0), 16777619) >>> 0;
  return Array.from({ length: 46 }, (_, i) => `<i style="width:${1 + ((h >>> (i % 29)) & 3)}px"></i>`).join('');
};

$('#cases').innerHTML = PROJECTS.map((p, i) => `
  <article class="case" id="${p.k}" data-tone="${p.tone}">
    <header class="case-head">
      <p class="case-no"><i></i>Case file ${pad(i)} · ${p.kind}</p>
      <h2>${p.name}</h2>
      <p class="case-tag">${p.tag}</p>
      <p class="case-links">
        <a class="btn" href="${p.site}" target="_blank" rel="noopener">${p.siteLabel === 'Site' ? 'Open the site' : `Open ${p.siteLabel}`} ${arrow}</a>
        <a class="btn ghost" href="https://github.com/${p.repo}" target="_blank" rel="noopener">Read the code ${arrow}</a>
      </p>
    </header>
    <div class="desk">
      <div class="desk-left">
        <a class="print" href="${p.site}" target="_blank" rel="noopener" tabindex="-1">
          <i class="tape"></i>
          <img src="${p.img}" alt="${p.name}, the live site" loading="lazy" />
          <span class="print-cap">fig. ${pad(i)} · ${p.host}</span>
        </a>
        <div class="note"><b>The question</b>${p.about}</div>
      </div>
      <div class="receipt-wrap">
        <div class="receipt">
          <p class="r-top"><b>RECEIPT</b><span>No. ${pad(i)}</span></p>
          <p class="r-name">${p.name.toUpperCase()}</p>
          <p class="r-host">${p.host}</p>
          <hr />
          <p class="r-cols"><span>QTY</span><span>HOW IT’S BUILT</span></p>
          <ol>${p.xray.map(([k, v], j) => `<li><span>${pad(j)}</span><span><b>${k.toUpperCase()}</b>${v}</span></li>`).join('')}</ol>
          <hr />
          <p class="r-line"><span>STACK</span><span>${p.stack.join(' · ')}</span></p>
          <hr />
          <p class="r-total"><span>TOTAL</span><b>${p.stat}</b></p>
          <p class="r-unit">${p.statLabel}</p>
          <hr />
          <p class="r-result">${p.result}</p>
          <p class="r-code" aria-hidden="true">${barcode(p.name)}</p>
          <p class="r-thanks">* SHOW YOUR WORK *</p>
        </div>
      </div>
    </div>
    <p class="case-stack">${p.stack.map((t) => `<span>${t}</span>`).join('')}</p>
  </article>`).join('');

// the index on the side follows along as you read
const index = $('#case-index');
index.innerHTML = PROJECTS.map((p, i) => `<a href="#${p.k}" data-tone="${p.tone}"><em>${pad(i)}</em>${p.name}</a>`).join('');
const links = $$('a', index);
const io = new IntersectionObserver((es) => es.forEach((e) => {
  if (e.isIntersecting) links.forEach((a) => a.classList.toggle('on', a.hash === `#${e.target.id}`));
}), { rootMargin: '-40% 0px -55% 0px' });
$$('.case').forEach((c) => io.observe(c));
