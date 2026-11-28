import WorkStack from '@/components/WorkStack';
import RetroPixelButton from '@/components/rareui/RetroPixelButton';
import SiteFooter from '@/components/SiteFooter';
export default function Work() {
  return (
    <>
      <header className="chrome"></header>
      <div className="toast" id="toast" role="status"></div>
      <main className="workpage">
        <WorkStack />

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
          <div className="cta"><RetroPixelButton href="index.html#contact" pixelColor="var(--brass)">Pick a day to talk</RetroPixelButton><RetroPixelButton href="resume.pdf" target="_blank" rel="noopener" pixelColor="var(--mute)">Résumé</RetroPixelButton></div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
