// The project cards: one front (the shot and the number that matters), one back (how it's built).
// Home files them as folders (main.js); the work page spreads them on the table (work.js).
import { reduce } from './common.js';

export const PROJECTS = [
  { k: 'clause', sticker: 'sparkle-four', name: 'Clause Risk Review', tag: 'Does legal pretraining help a model find risky clauses?', tone: 'yellow', kind: 'Research', img: 'img/clause.jpg', host: 'clause-risk-review.hf.space',
    site: 'https://kenx049-clause-risk-review.static.hf.space/index.html', repo: 'ManasDasri/NNDL', siteLabel: 'Results',
    stat: '0.879', statLabel: 'document F1 · BERT', stack: ['PyTorch', 'Transformers', 'CUAD'],
    about: 'Does legal pretraining help a model find risky contract clauses? TextCNN, BERT and Legal-BERT train on identical windows and per-contract splits; every threshold is tuned on validation data only.',
    result: 'BERT hit 0.879 document F1 on 76 held-out contracts. Legal-BERT gave no measurable gain, and the write-up says so.',
    xray: [['Data', 'CUAD v1, 510 contracts · splits per contract'], ['Model', 'TextCNN · BERT · Legal-BERT'], ['Evaluate', 'thresholds from validation · noisy-OR pooling']] },
  { k: 'eeg', sticker: 'heart-cat', name: 'Med-EEG', tag: 'Can two EEG numbers track a meditator’s focus?', tone: 'blue', kind: 'Research', img: 'img/neurodial.jpg', host: 'algorithmicbit.tech/neurodial',
    site: 'https://www.algorithmicbit.tech/neurodial/', repo: 'ManasDasri/Med-EEG', siteLabel: 'NeuroDial',
    stat: '0.609', statLabel: 'within-person AUC · depth', stack: ['Python', 'MNE', 'scikit-learn'],
    about: 'Can two EEG numbers track a meditator’s focus? Person-held-out models, checked against shuffled labels and non-EEG baselines, with a pre-registered replication on a second dataset.',
    result: 'Depth decoded at within-person AUC 0.609. The expertise result was confounded by sex, and the write-up says so.',
    xray: [['Raw', 'OpenNeuro ds001787 · 64-channel BioSemi'], ['Clean', 'filter, notch, ICA · epochs before each probe'], ['Test', 'leave-one-subject-out vs chance and baselines']] },
  { k: 'sprout', sticker: 'rocket', name: 'Sprout', tag: 'A map of your codebase, for you and your AI agent.', tone: 'green', kind: 'Dev tool', img: 'img/sprout.jpg', host: 'sprout-devlabs.github.io',
    site: 'https://sprout-devlabs.github.io/sprout-web/', repo: 'Sprout-DevLabs/sprout', siteLabel: 'Site',
    stat: 'v0.7.0', statLabel: 'on Homebrew and Scoop', stack: ['Go', 'MCP', 'git'],
    about: 'A map of your codebase for you and your AI agent: where to start reading, what a change breaks, which tests to run. One Go binary, and an MCP server coding agents call directly.',
    result: 'Ships through a Homebrew tap, a Scoop bucket and Linux packages.',
    xray: [['Input', 'your project, or a GitHub URL · git history'], ['Analysis', 'gitignore-aware walk · hotspots · usage graph'], ['Output', 'terminal tree · --ai map · MCP server']] },
  { k: 'forme', sticker: 'yellow-pencil', name: 'Forme', tag: '53 free motion components for React, installed as source.', tone: 'purple', kind: 'Components', img: 'img/forme.jpg', host: 'forme-amber.vercel.app',
    site: 'https://forme-amber.vercel.app', repo: 'ManasDasri/forme', siteLabel: 'Site',
    stat: '53', statLabel: 'motion components, free', stack: ['React', 'TypeScript', 'WebGL'],
    about: '53 free motion components for React (shaders, ASCII scenes, HUD instruments) that you install as source with one shadcn command.',
    result: 'The accessibility badges are tests: CI fails when the code doesn’t back them up.',
    xray: [['Source', 'registry components · catalog of traits'], ['Build', 'shadcn registry JSON · gzipped sizes · trait tests'], ['Ship', 'Vercel /r/ registry · install smoke test in CI']] },
  { k: 'flow', sticker: 'sleepy-fox', name: 'Flow', tag: 'A study room you share with friends.', tone: 'pink', kind: 'Product', img: 'img/flow.jpg', host: 'flow-study.me',
    site: 'https://flow-study.me', repo: 'ManasDasri/Flow-study', siteLabel: 'Site',
    stat: 'v1.0', statLabel: 'released November 2026', stack: ['Express', 'Supabase', 'WebRTC'],
    about: 'A study room you share with friends. Start a focus block and a sun sinks for everyone; when it sets, you all take a break. Video runs peer to peer.',
    result: 'v1.0 is out. Free, and the code is open.',
    xray: [['Browser', 'vanilla JS · peer-to-peer WebRTC video'], ['Realtime', 'Supabase Realtime · Cloudflare TURN relay'], ['Server', 'Express /ai · Groq Llama 3 · Postgres with RLS']] },
  { k: 'velora', sticker: 'paper-plane', name: 'Velora', tag: 'Probability cones for stock prices, not one price target.', tone: 'orange', kind: 'Product', img: 'img/velora.jpg', host: 'velora-one-lake.vercel.app',
    site: 'https://velora-one-lake.vercel.app', repo: 'ManasDasri/Velora', siteLabel: 'Site',
    stat: '95%', statLabel: 'VaR and CVaR level', stack: ['React', 'Monte Carlo', 'Canvas'],
    about: 'Probability cones for stock prices: thousands of simulated paths with regime switching and jump shocks, instead of one price target.',
    result: 'Fan charts, upside probability, VaR and CVaR, drawn on a plain canvas.',
    xray: [['Data', 'Twelve Data prices · Finnhub headlines'], ['Model', 'Monte Carlo · Markov regimes · headline sentiment'], ['Output', 'canvas fan chart · VaR and CVaR at 95%']] },
];

const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
const pad = (n) => String(n).padStart(2, '0');
// a row of pixels, the same for a name every time
const strip = (name) => {
  let h = 7;
  for (const c of name) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return Array.from({ length: 9 }, (_, i) => `<i style="opacity:${[1, 0.65, 0.35, 0][(h >> (i * 2)) & 3]}"></i>`).join('');
};
// the blocks a card dissolves into when it turns over: mostly ink, a few in colour
const blocks = () => Array.from({ length: 10 * 14 }, () => `<i style="--r:${(Math.random() * 0.2).toFixed(3)}s"${Math.random() < 0.1 ? ` class="t${Math.floor(Math.random() * 4)}"` : ''}></i>`).join('');

export function cardHTML(p, i) {
  const n = `No. ${pad(i + 1)} / ${pad(PROJECTS.length)}`;
  return `
  <article class="pcard" data-tone="${p.tone}" data-k="${p.k}" aria-label="${esc(p.name)}">
    <div class="pc-body">
      <div class="pc-face pc-front">
        <header><span>${n}</span><span class="pc-kind">${p.kind}</span></header>
        <div class="pc-shot"><span class="pc-bar"><i></i><i></i><i></i><em>${p.host}</em></span><div class="pc-img"><img src="${p.img}" alt="" loading="lazy" draggable="false" /><canvas aria-hidden="true"></canvas></div></div>
        <h3>${esc(p.name)}</h3>
        <p class="pc-stat"><b>${p.stat}</b><small>${p.statLabel}</small></p>
        <footer><span>${p.stack.join(' · ')}</span><span class="pc-strip" aria-hidden="true">${strip(p.name)}</span></footer>
      </div>
      <div class="pc-face pc-back">
        <header><span>${n}</span><span>HOW IT’S BUILT</span></header>
        <dl>${p.xray.map(([a, b], j) => `<div style="--j:${j}"><dt>${a}</dt><dd>${b}</dd></div>`).join('')}</dl>
        <p class="pc-res">${esc(p.result)}</p>
        <p class="pc-links"><a href="${p.site}" target="_blank" rel="noopener">${p.siteLabel} ↗</a><a href="https://github.com/${p.repo}" target="_blank" rel="noopener">Code ↗</a></p>
        <i class="pc-scan" aria-hidden="true"></i>
      </div>
      <div class="pc-px" aria-hidden="true">${blocks()}</div>
    </div>
    <button class="pc-flip" aria-label="Flip ${esc(p.name)}" aria-pressed="false"><svg viewBox="0 0 16 16"><path d="M13 6.5A5 5 0 0 0 3.6 5M3 9.5a5 5 0 0 0 9.4 1.5" /><path d="M3.5 2.5v2.8h2.8M12.5 13.5v-2.8H9.7" /></svg></button>
  </article>`;
}

// turning a card over: it breaks into blocks, swaps sides under them, and the blocks clear
export const flip = (card, on = !card.on) => {
  if (!!card.on === on) return;
  card.on = on;
  card.querySelector('.pc-flip').setAttribute('aria-pressed', on);
  if (reduce) return card.classList.toggle('flipped', on);
  const px = card.querySelector('.pc-px');
  px.classList.remove('go');
  void px.offsetWidth;
  px.classList.add('go');
  clearTimeout(card.ft);
  card.ft = setTimeout(() => card.classList.toggle('flipped', on), 230);
};

// the screenshot sits as a coarse mosaic and sharpens in steps while you hover
const STEPS = [18, 36, 72];
export function wire(card) {
  card.querySelector('.pc-flip').addEventListener('click', (e) => {
    e.stopPropagation();
    flip(card);
  });
  const img = card.querySelector('.pc-img img'), cv = card.querySelector('.pc-img canvas');
  if (reduce || !matchMedia('(hover: hover)').matches) return cv.remove();
  const g = cv.getContext('2d');
  let level = 0, timer;
  const paint = () => {
    if (level === STEPS.length) return (cv.style.opacity = 0);
    // crop the way the image is shown: 16:10 from the top
    const { naturalWidth: w, naturalHeight: h } = img;
    const sw = Math.min(w, h * 1.6), sh = sw / 1.6;
    cv.width = STEPS[level];
    cv.height = Math.round(STEPS[level] / 1.6);
    g.drawImage(img, (w - sw) / 2, 0, sw, sh, 0, 0, cv.width, cv.height);
    cv.style.opacity = 1;
  };
  const to = (target) => {
    clearInterval(timer);
    timer = setInterval(() => {
      if (level === target) return clearInterval(timer);
      level += Math.sign(target - level);
      paint();
    }, 75);
  };
  if (img.complete && img.naturalWidth) paint();
  else img.addEventListener('load', paint, { once: true });
  card.addEventListener('pointerenter', (e) => e.pointerType === 'mouse' && to(STEPS.length));
  card.addEventListener('pointerleave', () => to(0));
}
