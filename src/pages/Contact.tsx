import { useEffect, useRef, useState } from 'react';
import Shell from '@/kit/Shell';
import { Section, Socials } from '@/kit/ui';
import { sky } from '@/kit/asciiSky.js';

const MAIL = 'dasarimanas049@gmail.com';
const fmt = (d: Date) => d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });

// pick a day; the button drafts the email for it
function Calendar() {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const [month, setMonth] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [pick, setPick] = useState<Date | null>(null);
  const first = (month.getDay() + 6) % 7, days = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const thisMonth = month.getFullYear() === today.getFullYear() && month.getMonth() === today.getMonth();
  const href = pick
    ? `mailto:${MAIL}?subject=${encodeURIComponent(`A call on ${fmt(pick)}?`)}&body=${encodeURIComponent(`Hi Manas,\n\nCould we talk on ${fmt(pick)}? Here's what it's about:\n\n`)}`
    : `mailto:${MAIL}?subject=${encodeURIComponent('Let’s talk')}`;
  return (
    <div className="cal">
      <div className="cal-hd">
        <button disabled={thisMonth} onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))} aria-label="Previous month">‹</button>
        <b>{month.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}</b>
        <button onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))} aria-label="Next month">›</button>
      </div>
      <div className="cal-grid" role="grid">
        {['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map((d) => <span key={d} className="cal-dow">{d}</span>)}
        {Array.from({ length: first }, (_, i) => <span key={`b${i}`} />)}
        {Array.from({ length: days }, (_, i) => {
          const d = new Date(month.getFullYear(), month.getMonth(), i + 1), past = d < today;
          const on = pick?.getTime() === d.getTime();
          return <button key={i} disabled={past} className={on ? 'on' : d.getTime() === today.getTime() ? 'today' : ''} onClick={() => setPick(d)} aria-pressed={on}>{i + 1}</button>;
        })}
      </div>
      <p className="cal-pick">{pick ? <><b>{fmt(pick)}</b> · I’ll reply to set a time</> : 'Pick a day'}</p>
      <a className="btn" href={href} style={{ width: '100%', justifyContent: 'center' }}>Request a call ↗</a>
    </div>
  );
}

export default function Contact() {
  const box = useRef<HTMLDivElement>(null);
  useEffect(() => sky(box.current!), []);
  return (
    <Shell page="contact">
      <div className="sky" ref={box} aria-hidden="true" />
      <Section title="Got a hunch? Let’s go test it." note="I answer every one" side="l">
        <div className="talk">
          <div>
            <p>Internship, research gig, or a model that has to actually work? Pick a day and I’ll get back to you to set up a call.</p>
            <p style={{ color: 'var(--mute)' }}>Or just write: <a className="more" href={`mailto:${MAIL}`}>{MAIL}</a></p>
          </div>
          <Calendar />
        </div>
      </Section>
      <Section title="Socials">
        <Socials />
      </Section>
    </Shell>
  );
}
