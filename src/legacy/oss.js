import { $, $$, githubPRs, ago } from './common.js';

// ---------- pull requests, live: the counts, the hand-picked cards' status, and every merge ----------
const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
githubPRs().then((items) => {
  const merged = items.filter((p) => p.merged).sort((a, b) => Date.parse(b.merged) - Date.parse(a.merged));
  const open = items.filter((p) => p.open);
  $('#st-merged').textContent = merged.length;
  $('#st-open').textContent = open.length;
  $('#st-repos').textContent = new Set(merged.map((p) => p.repo)).size;
  // the hand-picked cards keep their words, but their status follows GitHub
  for (const card of $$('#prs .pr')) {
    const hit = items.find((p) => card.href.startsWith(p.url));
    if (hit) card.querySelector('em').textContent = hit.merged ? 'merged' : 'in review';
  }
  const week = Date.now() - 7 * 864e5;
  // titles and names come from GitHub, so everything is escaped, and links must point at github.com
  const row = (p) => `<li><a href="${/^https:\/\/github\.com\//.test(p.url) ? esc(p.url) : '#'}" target="_blank" rel="noopener">
      <img src="https://github.com/${encodeURIComponent(p.repo.split('/')[0])}.png?size=64" alt="" loading="lazy" />
      <span class="feed-what"><b>${esc(p.repo)}</b><span>${esc(p.title)}</span></span>
      <span class="feed-when">${p.merged ? `${Date.parse(p.merged) > week ? '<i class="new">new</i>' : ''}merged ${ago(p.merged)}` : '<i class="rev">in review</i>'}</span>
      <em>#${Number(p.n) || ''}</em></a></li>`;
  const feed = $('#feed'), rows = [...open, ...merged];
  feed.innerHTML = rows.map(row).join('');
  // four to start with; the rest on request
  const SHOW = 4;
  if (rows.length > SHOW) {
    feed.classList.add('short');
    const more = Object.assign(document.createElement('button'), { className: 'feed-more', type: 'button' });
    more.textContent = `View ${rows.length - SHOW} more`;
    more.setAttribute('aria-expanded', 'false');
    more.addEventListener('click', () => {
      const open = feed.classList.toggle('short') === false;
      more.textContent = open ? 'Show fewer' : `View ${rows.length - SHOW} more`;
      more.setAttribute('aria-expanded', String(open));
    });
    feed.after(more);
  }
}).catch(() => {
  $('#feed').innerHTML = '<li class="feed-msg">GitHub didn’t answer just now (it limits how often it can be asked). <a href="https://github.com/pulls?q=is%3Apr+author%3AManasDasri+-user%3AManasDasri" target="_blank" rel="noopener">See them all on GitHub ↗</a></li>';
});

// The last year of GitHub contributions, as a grid of days (weeks run left to right).
const graph = $('#graph'), total = $('#graph-total');
const fmt = (d) => new Date(`${d}T00:00:00`).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
fetch('https://github-contributions-api.jogruber.de/v4/ManasDasri?y=last')
  .then((r) => (r.ok ? r.json() : Promise.reject(new Error(r.status))))
  .then(({ total: t, contributions: days }) => {
    const grid = document.createElement('div');
    grid.className = 'days';
    // pad the first week so each column starts on a Sunday, as GitHub draws it
    const lead = new Date(`${days[0].date}T00:00:00`).getDay();
    for (let i = 0; i < lead; i++) grid.append(document.createElement('span'));
    for (const d of days) {
      const cell = document.createElement('i');
      cell.className = `l${d.level}`;
      cell.dataset.tip = `${d.count} contribution${d.count === 1 ? '' : 's'} on ${fmt(d.date)}`;
      grid.append(cell);
    }
    const tip = Object.assign(document.createElement('div'), { className: 'graph-tip' });
    graph.replaceChildren(grid, tip);
    grid.addEventListener('pointerover', (e) => {
      if (!e.target.dataset.tip) return;
      tip.textContent = e.target.dataset.tip;
      const g = graph.getBoundingClientRect(), c = e.target.getBoundingClientRect();
      tip.style.left = `${c.left - g.left + c.width / 2}px`;
      tip.style.top = `${c.top - g.top}px`;
      tip.classList.add('on');
    });
    grid.addEventListener('pointerleave', () => tip.classList.remove('on'));
    total.textContent = `${Object.values(t).reduce((a, b) => a + b, 0).toLocaleString('en-IN')} contributions in the last year`;
  })
  .catch(() => {
    graph.replaceChildren(Object.assign(document.createElement('p'), { className: 'graph-msg', textContent: 'GitHub didn’t answer just now. The full history is on github.com/ManasDasri.' }));
  });
