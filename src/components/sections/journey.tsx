'use client';

import Image from 'next/image';
import {useRef, useState} from 'react';
import {milestoneGroups, type Milestone} from '@/content/milestones';
import type {Experience} from '@/lib/experience';
import {gsap, useGSAP} from '@/lib/gsap';
import {useApp} from '@/lib/store';
import Modal from '@/components/ui/modal';
import {Eyebrow, FadeIn, SplitReveal} from '@/components/ui/reveal';

function Node() {
  return (
    <span
      data-node
      aria-hidden
      className="absolute -left-[5px] top-2 h-[11px] w-[11px] rounded-full border border-white/30 bg-ink-900 transition-colors duration-500 md:-left-[6px] md:h-[13px] md:w-[13px]"
    />
  );
}

function ExperienceItem({e}: {e: Experience}) {
  return (
    <li className="relative pb-14 pl-8 md:pl-12">
      <Node />
      <FadeIn>
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-acid">
          {e.start} — {e.end || 'Present'}
          {e.location && <span className="text-mist"> · {e.location}</span>}
        </p>
        <h4 className="mt-3 font-display text-2xl font-bold tracking-tight md:text-4xl">{e.role}</h4>
        <p className="mt-1 text-lg text-bone/70">
          {e.link ? (
            <a href={e.link} target="_blank" rel="noopener noreferrer" className="underline decoration-white/20 underline-offset-4 hover:text-acid">
              {e.company}
            </a>
          ) : (
            e.company
          )}
        </p>
        {e.description && <p className="mt-4 max-w-2xl leading-relaxed text-bone/65">{e.description}</p>}
        {e.highlights.length > 0 && (
          <ul className="mt-4 max-w-2xl space-y-2">
            {e.highlights.map(h => (
              <li key={h} className="flex gap-3 text-bone/70">
                <span className="mt-2.5 h-1 w-3 shrink-0 bg-acid" aria-hidden />
                {h}
              </li>
            ))}
          </ul>
        )}
        {e.tech.length > 0 && (
          <ul className="mt-5 flex flex-wrap gap-2" aria-label="Technologies">
            {e.tech.map(t => (
              <li key={t} className="rounded-full bg-white/[0.06] px-3 py-1 text-xs text-bone/75">
                {t}
              </li>
            ))}
          </ul>
        )}
      </FadeIn>
    </li>
  );
}

function MilestoneItem({m, onView}: {m: Milestone; onView: () => void}) {
  return (
    <li className="relative pb-10 pl-8 md:pl-12">
      <Node />
      <FadeIn className="group flex flex-wrap items-start justify-between gap-4 border-b border-white/[0.07] pb-8">
        <div className="max-w-xl">
          <h4 className="font-display text-xl font-semibold tracking-tight md:text-2xl">{m.title}</h4>
          <p className="mt-1 text-bone/60">{m.issuer}</p>
          {m.award && (
            <span className="mt-3 inline-block rounded-full border border-acid/30 bg-acid/10 px-3 py-1 font-mono text-[11px] uppercase tracking-[0.14em] text-acid">
              {m.award}
            </span>
          )}
        </div>
        {m.imageUrl && (
          <button
            type="button"
            onClick={onView}
            data-cursor="View"
            className="inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-2 text-sm transition-colors hover:border-acid hover:text-acid"
          >
            View certificate <span aria-hidden>↗</span>
          </button>
        )}
      </FadeIn>
    </li>
  );
}

export default function Journey({experience}: {experience: Experience[]}) {
  const root = useRef<HTMLElement>(null);
  const [cert, setCert] = useState<Milestone | null>(null);
  const reducedMotion = useApp(s => s.reducedMotion);
  const loaded = useApp(s => s.loaded);

  useGSAP(
    () => {
      if (reducedMotion || !loaded) return;
      const q = gsap.utils.selector(root);
      // The spine draws itself as you scroll; nodes light up as the line passes them.
      gsap.fromTo(
        q('[data-spine-fill]'),
        {scaleY: 0},
        {scaleY: 1, ease: 'none', scrollTrigger: {trigger: q('[data-spine]')[0], start: 'top 60%', end: 'bottom 60%', scrub: 0.5}}
      );
      q('[data-node]').forEach(n => {
        gsap.to(n, {
          backgroundColor: '#c8ff3d',
          borderColor: '#c8ff3d',
          boxShadow: '0 0 18px rgba(200,255,61,0.7)',
          duration: 0.4,
          scrollTrigger: {trigger: n, start: 'top 60%', toggleActions: 'play none none reverse'},
        });
      });
    },
    {dependencies: [reducedMotion, loaded], scope: root}
  );

  const total = experience.length + milestoneGroups.reduce((n, g) => n + g.items.length, 0);

  return (
    <section ref={root} id="journey" data-chapter aria-labelledby="journey-title" className="relative py-28 md:py-40">
      <div className="mx-auto max-w-[1600px] px-5 md:px-10">
        <Eyebrow index="04">Journey</Eyebrow>
        <SplitReveal as="h2" id="journey-title" mode="chars" className="mt-6 font-display text-giga font-extrabold uppercase">
          {experience.length > 0 ? 'Work &' : 'Awards &'}{' '}
          <span className="font-serif font-normal normal-case italic text-acid">Milestones</span>
        </SplitReveal>
      </div>
      <div className="mx-auto mt-16 grid max-w-[1600px] gap-16 px-5 md:mt-24 md:px-10 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <div className="lg:sticky lg:top-32">
            <FadeIn className="max-w-sm text-bone/60">
              Hackathons, bootcamps and courses — the milestones that keep sharpening how I build.
            </FadeIn>
            <FadeIn className="mt-10 flex items-baseline gap-3">
              <span className="font-display text-7xl font-bold tracking-tight">{String(total).padStart(2, '0')}</span>
              <span className="eyebrow">entries logged</span>
            </FadeIn>
          </div>
        </div>

        <div data-spine className="relative lg:col-span-7 lg:col-start-6">
          <div aria-hidden className="absolute bottom-0 left-0 top-2 w-px bg-white/10">
            <div data-spine-fill className="h-full w-full origin-top bg-gradient-to-b from-acid via-acid to-violet" />
          </div>

          {experience.length > 0 && (
            <div className="mb-6">
              <h3 className="eyebrow mb-8 pl-8 md:pl-12">Experience</h3>
              <ol>
                {experience.map(e => (
                  <ExperienceItem key={e.id} e={e} />
                ))}
              </ol>
            </div>
          )}

          {milestoneGroups.map(g => (
            <div key={g.key} className="mb-6">
              <h3 className="eyebrow mb-8 pl-8 md:pl-12">{g.label}</h3>
              <ol>
                {g.items.map(m => (
                  <MilestoneItem key={m.title} m={m} onView={() => setCert(m)} />
                ))}
              </ol>
            </div>
          ))}
        </div>
      </div>

      <Modal open={!!cert} onClose={() => setCert(null)} title={cert?.title ?? 'Certificate'}>
        {cert?.imageUrl && (
          <div className="relative aspect-[1.414/1] w-full">
            <Image src={cert.imageUrl} alt={`${cert.title} certificate`} fill sizes="1000px" className="object-contain" />
          </div>
        )}
      </Modal>
    </section>
  );
}
