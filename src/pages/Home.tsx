import Shell from '@/kit/Shell';
import { Section, ProjectRows, Socials, Stack, Hello, ProofStats, Merges } from '@/kit/ui';
import Door from '@/components/Door';
import Glitch from '@/kit/Glitch';

export default function Home() {
  return (
    <>
      <Door />
      <Shell page="index">
        <div className="intro">
          <div className="who">
            <Glitch text="Manas Dasari" />
            <img src="/img/own/sparkle.svg" alt="" />
            <span className="where">Bengaluru, India</span>
          </div>
          <h2>I show my work.</h2>
          <p>I train models and then try to break them, ship developer tools people install, and send fixes to other people’s projects. Every project here comes with the number that matters.</p>
          <div className="btns">
            <a className="btn" href="mailto:dasarimanas049@gmail.com">Email me</a>
            <a className="btn ghost" href="/resume.pdf" target="_blank" rel="noopener">Résumé</a>
          </div>
        </div>

        <Section title="Work" id="work" aside="6 projects + 3 on the bench" note="click for the live site, or the code button for the repo">
          <ProjectRows />
        </Section>

        <Section title="Socials">
          <Socials />
        </Section>

        <Section title="Stack" note="what I open every day" side="l">
          <Stack />
        </Section>

        <Hello />

        <Section title="Live proof" aside="from the GitHub API" note="updates itself when something merges">
          <ProofStats />
          <Merges show={4} />
        </Section>
      </Shell>
    </>
  );
}
