import { Cloth } from '@/components/canvasui/Cloth';
import './curtain.css';

// The door: a velvet curtain hung over the site (CanvasUI Cloth). Grab it and throw it aside, or press
// the button; main.js lifts it either way. Browsers without html-in-canvas get the same curtain, flat.
export default function Curtain() {
  return (
    <div className="door" id="door">
      <Cloth className="curtain" pin="top" wind={0.3} stiffness={0.3} settle={0.2} brush={0.35} light={0.75} sheen={0.55} weave={0.7} shadow={0.7} backing={[0.42, 0.03, 0.07]}>
        <div className="curtain-face">
          <img className="door-logo" src="/img/brand/logo-light.png" alt="" draggable={false} />
          <p className="door-kicker">MANAS DASARI · ML RESEARCH &amp; DEV TOOLS</p>
          <h2 className="door-line">Models that survive<br />being doubted.</h2>
          <p className="curtain-hint"><span aria-hidden="true">✋</span> grab the curtain and throw it aside</p>
          <button className="door-btn" id="enter">or just walk in <svg viewBox="0 0 16 16"><path d="M3 8h10M9 4l4 4-4 4" /></svg></button>
        </div>
      </Cloth>
    </div>
  );
}
