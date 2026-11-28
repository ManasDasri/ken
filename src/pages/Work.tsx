import RetroPixelButton from '@/components/rareui/RetroPixelButton';
import KoiPond from '@/components/KoiPond';
export default function Work() {
  return (
    <>
      <header className="chrome"></header>
      <div className="toast" id="toast" role="status"></div>
      <main className="workpage">
        <section className="ab-hero">
          <span className="frame-label"># work</span>
          <h1 className="glitch ab-title">The evidence locker.</h1>
          <p className="ab-sub">Six case studies: the question, how it’s built, and what came out, with the numbers on the page. Research you can check, and tools people actually install.</p>
        </section>
        <section className="cases">
          <nav className="case-index" id="case-index" aria-label="Case studies"></nav>
          <div className="case-list" id="cases"></div>
        </section>

        <section className="also-row">
          <h2 className="glitch ab-h">Also on the bench.</h2>
          <div className="also-grid">
            <a href="https://gradientworksai.in/" target="_blank" rel="noopener"><b>Gradient Works</b><span>My applied AI studio: custom models for teams, with a baseline to beat and a written result.</span><em>Studio ↗</em></a>
            <a href="https://github.com/ManasDasri/analogue-risk" target="_blank" rel="noopener"><b>Analogue Risk</b><span>Forecasting market risk from historical analogues, re-tested on 15 new assets. In research.</span><em>Code ↗</em></a>
            <a href="https://github.com/ManasDasri/Atmos" target="_blank" rel="noopener"><b>Atmos</b><span>Placing a cheaper, denser air-quality sensor network for Bengaluru.</span><em>Code ↗</em></a>
          </div>
        </section>
        <section className="ab-cta">
          <p className="kicker">HAVE SOMETHING IN MIND?</p>
          <h2 className="glitch ab-h">Let’s make yours next.</h2>
          <div className="cta"><RetroPixelButton href="index.html#contact" pixelColor="#22c55e">Pick a day to talk</RetroPixelButton><RetroPixelButton href="resume.pdf" target="_blank" rel="noopener" pixelColor="#a855f7">Résumé</RetroPixelButton></div>
        </section>
      </main>

      <KoiPond />
    </>
  );
}
