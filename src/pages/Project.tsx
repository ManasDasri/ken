import { PROJECTS } from '@/legacy/cards.js';
import { Case } from '@/components/WorkCases';
import SiteFooter from '@/components/SiteFooter';
import './project.css';

// One project, full page: /project.html?p=<key>. Its layout is its own (WorkCases), and the next
// project is waiting at the bottom.
export default function Project() {
  const k = new URLSearchParams(location.search).get('p');
  const i = Math.max(0, PROJECTS.findIndex((p) => p.k === k));
  const p = PROJECTS[i], next = PROJECTS[(i + 1) % PROJECTS.length];
  document.title = `${p.name} · Manas Dasari`;
  return (
    <>
      <header className="chrome"></header>
      <div className="toast" id="toast" role="status"></div>
      <main className="pj">
        <a className="pj-back" href="/work.html">← All work</a>
        <Case p={p} i={i} />
        <a className="pj-next" href={`/project.html?p=${next.k}`}>
          <span>Next project</span>
          <b>{next.name}</b>
          <img src={next.img} alt="" loading="lazy" />
        </a>
      </main>
      <SiteFooter />
    </>
  );
}
