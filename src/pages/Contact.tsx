export default function Contact() {
  return (
    <>
      <header className="chrome"></header>
      <main className="subpage">
        <section className="contact" id="contact">
          <div className="ascii" id="ascii" aria-hidden="true"></div>
          <span className="frame-label"># say hi</span>
          <div className="cbox">
            <div className="cbox-copy">
              <p className="kicker">GOT A HUNCH?</p>
              <h2 className="glitch">Let’s go test it.</h2>
              <p>Internships, research, or a model you need built and tested properly. Pick a day and I’ll get back to you to set up a call.</p>
            </div>
            <div className="cal" id="cal">
              <div className="cal-head"><button id="cal-prev" aria-label="Previous month"><svg viewBox="0 0 16 16"><path d="M10 3 5 8l5 5" /></svg></button><b id="cal-title"></b><button id="cal-next" aria-label="Next month"><svg viewBox="0 0 16 16"><path d="m6 3 5 5-5 5" /></svg></button></div>
              <div className="cal-grid" id="cal-grid" role="grid"></div>
              <p className="cal-pick" id="cal-pick">Pick a day</p>
              <a className="btn wide" id="cal-go" href="mailto:dasarimanas049@gmail.com?subject=Let%E2%80%99s%20talk">Request a call <svg viewBox="0 0 16 16"><path d="M4 12 12 4M5 4h7v7" /></svg></a>
            </div>
          </div>
          <div className="tiles">
            <a href="https://github.com/ManasDasri" target="_blank" rel="noopener"><b>GitHub</b><small>ManasDasri</small><span>↗</span></a>
            <a href="https://www.linkedin.com/in/manas-dasari-2a52163a5/" target="_blank" rel="noopener"><b>LinkedIn</b><small>in/manas-dasari</small><span>↗</span></a>
            <a href="https://x.com/ManasDmg9" target="_blank" rel="noopener"><b>X</b><small>@ManasDmg9</small><span>↗</span></a>
            <a href="https://leetcode.com/u/ManasDasari/" target="_blank" rel="noopener"><b>LeetCode</b><small>ManasDasari</small><span>↗</span></a>
            <a href="resume.pdf" target="_blank" rel="noopener"><b>Résumé</b><small>one page, PDF</small><span>↗</span></a>
            <button id="copy"><b>Email</b><small>dasarimanas049@gmail.com</small><span>⧉</span></button>
          </div>
        </section>
      </main>
      <footer className="foot"></footer>
    </>
  );
}
