'use client';

import {useRef} from 'react';
import {projects} from '@/content/projects';
import {skills} from '@/content/skills';
import {gsap, ScrollTrigger, useGSAP} from '@/lib/gsap';
import {scroll} from '@/lib/live';
import {useApp} from '@/lib/store';
import {Eyebrow, FadeIn, SplitReveal} from '@/components/ui/reveal';
import TiltCard from '@/components/ui/tilt-card';

const skillNames = new Set(skills.map(s => s.name));
const alsoUsed = Array.from(new Set(projects.flatMap(p => p.tech))).filter(t => !skillNames.has(t));

/** Two rows of oversized type; direction and speed react to scroll velocity. */
function VelocityMarquee() {
  const rows = useRef<HTMLDivElement>(null);
  const reducedMotion = useApp(s => s.reducedMotion);
  const tier = useApp(s => s.tier);

  useGSAP(
    () => {
      if (reducedMotion || tier === 'pending' || !rows.current) return;
      const tracks = gsap.utils.toArray<HTMLElement>('[data-track]', rows.current);
      const state = tracks.map((_, i) => ({x: 0, dir: i % 2 === 0 ? -1 : 1}));
      let visible = false;
      const st = ScrollTrigger.create({trigger: rows.current, start: 'top bottom', end: 'bottom top', onToggle: s => (visible = s.isActive)});
      const tick = (_t: number, dt: number) => {
        if (!visible) return;
        const boost = 1 + Math.min(Math.abs(scroll.velocity) * 0.25, 12);
        tracks.forEach((el, i) => {
          const s = state[i];
          s.x += s.dir * (dt / 1000) * 2.2 * boost * (scroll.direction === 1 ? 1 : -1);
          s.x = gsap.utils.wrap(-50, 0, s.x);
          el.style.transform = `translate3d(${s.x}%,0,0)`;
        });
      };
      gsap.ticker.add(tick);
      return () => {
        gsap.ticker.remove(tick);
        st.kill();
      };
    },
    {dependencies: [reducedMotion, tier], scope: rows}
  );

  const names = skills.map(s => s.name);
  return (
    <div ref={rows} aria-hidden className="relative -rotate-2 select-none space-y-2 py-10">
      {[names, [...names].reverse()].map((row, r) => (
        <div key={r} className="overflow-hidden whitespace-nowrap">
          <div data-track className="inline-flex will-transform">
            {[...row, ...row].map((n, i) => (
              <span
                key={i}
                className={`mx-6 font-display text-[clamp(3rem,9vw,8.5rem)] font-extrabold uppercase leading-none tracking-[-0.04em] ${
                  (i + r) % 3 === 0 ? 'text-acid' : 'text-outline'
                }`}
              >
                {n}
                <span className="mx-6 text-bone/20">✦</span>
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function Skills() {
  const grid = useRef<HTMLUListElement>(null);
  const reducedMotion = useApp(s => s.reducedMotion);
  const loaded = useApp(s => s.loaded);

  useGSAP(
    () => {
      if (reducedMotion || !loaded || !grid.current) return;
      const items = gsap.utils.toArray<HTMLElement>('[data-skill]', grid.current);
      gsap.set(items, {y: 60, opacity: 0, rotateX: -35});
      ScrollTrigger.batch(items, {
        start: 'top 90%',
        once: true,
        onEnter: batch => gsap.to(batch, {y: 0, opacity: 1, rotateX: 0, duration: 1.2, stagger: 0.07, ease: 'expo.out'}),
      });
    },
    {dependencies: [reducedMotion, loaded], scope: grid}
  );

  return (
    <section id="skills" data-chapter aria-labelledby="skills-title" className="relative py-28 md:py-40">
      <div className="mx-auto max-w-[1600px] px-5 md:px-10">
        <div className="grid gap-8 md:grid-cols-2 md:items-end">
          <div>
            <Eyebrow index="02">Arsenal</Eyebrow>
            <SplitReveal as="h2" id="skills-title" mode="chars" className="mt-6 font-display text-giga font-extrabold uppercase">
              My Tech <span className="font-serif font-normal normal-case italic text-acid">Arsenal</span>
            </SplitReveal>
          </div>
          <FadeIn className="max-w-md text-bone/60 md:justify-self-end">
            The tools I reach for to turn complex problems into intuitive, scalable products — from interface to
            infrastructure.
          </FadeIn>
        </div>
      </div>

      <VelocityMarquee />

      <div className="mx-auto max-w-[1600px] px-5 md:px-10">
        <ul ref={grid} className="grid grid-cols-2 gap-3 [perspective:1200px] sm:grid-cols-3 md:gap-4 lg:grid-cols-5">
          {skills.map((s, i) => (
            <li key={s.name} data-skill>
              <TiltCard max={14} className="group h-full rounded-2xl">
                <div className="glass relative flex h-full flex-col justify-between gap-10 overflow-hidden rounded-2xl p-5 transition-colors duration-500 group-hover:border-acid/40 md:p-6">
                  <div className="flex items-start justify-between">
                    <span className="font-mono text-[11px] text-mist">{String(i + 1).padStart(2, '0')}</span>
                    <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-mist/70">{s.group}</span>
                  </div>
                  <s.icon
                    aria-hidden
                    className="h-12 w-12 text-bone/80 transition-all duration-500 ease-expo group-hover:scale-110 group-hover:text-acid md:h-14 md:w-14"
                    style={{transform: 'translateZ(40px)'}}
                  />
                  <p className="font-display text-lg font-semibold tracking-tight md:text-xl">{s.name}</p>
                  <div className="pointer-events-none absolute -bottom-16 -right-16 h-40 w-40 rounded-full bg-acid/0 blur-3xl transition-colors duration-700 group-hover:bg-acid/20" />
                </div>
              </TiltCard>
            </li>
          ))}
        </ul>

        {alsoUsed.length > 0 && (
          <FadeIn className="mt-12 flex flex-wrap items-center gap-3">
            <span className="eyebrow mr-2">Also worked with</span>
            {alsoUsed.map(t => (
              <span key={t} className="rounded-full border border-white/10 px-4 py-1.5 text-sm text-bone/70">
                {t}
              </span>
            ))}
          </FadeIn>
        )}
      </div>
    </section>
  );
}
