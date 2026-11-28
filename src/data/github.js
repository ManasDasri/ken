// ---------- my pull requests to other people's projects, live from GitHub ----------
// GitHub's search allows only a few unauthenticated calls a minute, so one answer is kept for a few
// minutes and shared by every page. My own repos, Sprout's org and a close collaborator's repos don't count.
const PR_QUERY = 'author:ManasDasri is:pr -user:ManasDasri -org:Sprout-DevLabs -user:AnushreeKasturi';
let prs = null;
export const githubPRs = () => (prs ??= (async () => {
  try {
    const hit = JSON.parse(localStorage.getItem('gh-prs') || 'null');
    if (hit && Date.now() - hit.t < 5 * 60e3) return hit.items;
  } catch {}
  const r = await fetch(`https://api.github.com/search/issues?q=${encodeURIComponent(PR_QUERY)}&sort=updated&order=desc&per_page=100`);
  if (!r.ok) throw new Error(r.status);
  const items = (await r.json()).items
    .filter((it) => it.state === 'open' || it.pull_request?.merged_at)
    .map((it) => ({
      repo: it.repository_url.split('/repos/')[1], title: it.title, url: it.html_url, n: it.number,
      merged: it.pull_request.merged_at, open: it.state === 'open', updated: it.updated_at,
    }));
  try { localStorage.setItem('gh-prs', JSON.stringify({ t: Date.now(), items })); } catch {}
  return items;
})());
export const ago = (iso) => {
  const s = (Date.parse(iso) - Date.now()) / 1000, rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
  for (const [u, n] of [['year', 31536000], ['month', 2592000], ['week', 604800], ['day', 86400], ['hour', 3600], ['minute', 60]]) if (Math.abs(s) >= n) return rtf.format(Math.round(s / n), u);
  return 'just now';
};
