import { $ } from './common.js';

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
