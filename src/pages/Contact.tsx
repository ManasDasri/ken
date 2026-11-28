import { useState } from 'react';
import Shell from '@/kit/Shell';
import Glitch from '@/kit/Glitch';
import { Section, Socials } from '@/kit/ui';

const MAIL = 'dasarimanas049@gmail.com';
const TOPICS = ['An internship', 'A research idea', 'A model to build', 'Open source', 'Just saying hi'];
const fmt = (d: Date) => d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });

function Calendar({ pick, onPick }: { pick: Date | null; onPick: (d: Date) => void }) {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const [month, setMonth] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const first = (month.getDay() + 6) % 7, days = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const thisMonth = month.getFullYear() === today.getFullYear() && month.getMonth() === today.getMonth();
  return (
    <div className="cal">
      <div className="cal-hd">
        <b>{month.toLocaleDateString('en-GB', { month: 'long' })} <span>{month.getFullYear()}</span></b>
        <span>
          <button disabled={thisMonth} onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))} aria-label="Previous month">‹</button>
          <button onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))} aria-label="Next month">›</button>
        </span>
      </div>
      <div className="cal-grid" role="grid">
        {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => <span key={i} className="cal-dow">{d}</span>)}
        {Array.from({ length: first }, (_, i) => <span key={`b${i}`} />)}
        {Array.from({ length: days }, (_, i) => {
          const d = new Date(month.getFullYear(), month.getMonth(), i + 1);
          const on = pick?.getTime() === d.getTime(), isToday = d.getTime() === today.getTime();
          return <button key={i} disabled={d < today} className={`${on ? 'on' : ''}${isToday ? ' today' : ''}`} onClick={() => onPick(d)} aria-pressed={on} aria-label={fmt(d)}>{i + 1}</button>;
        })}
      </div>
    </div>
  );
}

export default function Contact() {
  const [pick, setPick] = useState<Date | null>(null);
  const [topic, setTopic] = useState(TOPICS[0]);
  const subject = `${topic}${pick ? `: a call on ${fmt(pick)}?` : ': let’s talk'}`;
  const body = `Hi Manas,\n\nI’d like to talk about ${topic.toLowerCase()}${pick ? `, maybe on ${fmt(pick)}` : ''}. Here’s the gist:\n\n`;
  const href = `mailto:${MAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  return (
    <Shell page="contact">
      <div className="intro chello">
        <span className="avail"><b className="ft-dot" />Open to internships · Bengaluru, IST</span>
        <Glitch text="Got a hunch?" className="big" />
        <h2>Let’s go test it.</h2>
        <p>Internship, research gig, or a model that has to actually work? Pick a day, say what it’s about, and I’ll get back to you to set up a call.</p>
      </div>

      <Section title="Book a call" note="the email writes itself" side="l">
        <div className="book">
          <Calendar pick={pick} onPick={setPick} />
          <div className="book-side">
            <p className="book-k">What’s it about?</p>
            <div className="topics">
              {TOPICS.map((t) => <button key={t} className={t === topic ? 'on' : ''} onClick={() => setTopic(t)} aria-pressed={t === topic}>{t}</button>)}
            </div>
            <p className="book-k">Your draft</p>
            <div className="draft">
              <p><span>To</span>{MAIL}</p>
              <p><span>Subject</span><b>{subject}</b></p>
              <p className="draft-body">Hi Manas, I’d like to talk about {topic.toLowerCase()}{pick ? <>, maybe on <b>{fmt(pick)}</b></> : null}. Here’s the gist…</p>
            </div>
            <a className="btn send" href={href}>Open it in my mail app <span aria-hidden="true">↗</span></a>
          </div>
        </div>
      </Section>

      <Section title="Or find me here" rail="Elsewhere">
        <Socials />
      </Section>
    </Shell>
  );
}
