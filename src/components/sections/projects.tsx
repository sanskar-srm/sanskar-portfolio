'use client';

import Image from 'next/image';
import {useRef, useState} from 'react';
import {profile} from '@/content/profile';
import {projects, realLink, type Project} from '@/content/projects';
import {gsap, useGSAP} from '@/lib/gsap';
import {useApp} from '@/lib/store';
import Magnetic from '@/components/ui/magnetic';
import Modal from '@/components/ui/modal';
import {Eyebrow, FadeIn, SplitReveal} from '@/components/ui/reveal';
import TiltCard from '@/components/ui/tilt-card';
import {cn} from '@/lib/utils';

const github = profile.socials.find(s => s.label === 'GitHub')!.href;

function ProjectLinks({p, size = 'md'}: {p: Project; size?: 'md' | 'lg'}) {
  const live = realLink(p.liveUrl);
  const code = realLink(p.githubUrl);
  const cls =
    size === 'lg'
      ? 'inline-flex items-center gap-2 rounded-full border border-white/15 px-6 py-3 font-medium transition-colors hover:border-acid hover:text-acid'
      : 'inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-2 text-sm transition-colors hover:border-acid hover:text-acid';
  return (
    <>
      {live && (
        <Magnetic strength={0.25}>
          <a href={live} target="_blank" rel="noopener noreferrer" className={cls}>
            Live demo <span aria-hidden>↗</span>
            <span className="sr-only">for {p.title} (opens in a new tab)</span>
          </a>
        </Magnetic>
      )}
      {code && (
        <Magnetic strength={0.25}>
          <a href={code} target="_blank" rel="noopener noreferrer" className={cls}>
            Source <span aria-hidden>↗</span>
            <span className="sr-only">for {p.title} on GitHub (opens in a new tab)</span>
          </a>
        </Magnetic>
      )}
    </>
  );
}

function ProjectCard({p, index, onOpen}: {p: Project; index: number; onOpen: () => void}) {
  const href = realLink(p.liveUrl) ?? realLink(p.githubUrl);
  return (
    <TiltCard max={6} className="group rounded-[28px]">
      <article className="glass flex h-full flex-col overflow-hidden rounded-[28px]" aria-labelledby={`project-${index}`}>
        <button
          type="button"
          onClick={onOpen}
          data-cursor="Open"
          className="relative block aspect-[16/10] w-full overflow-hidden bg-ink-800 lg:aspect-[2.1/1]"
          aria-label={`Open details for ${p.title}`}
        >
          <Image
            src={p.imageUrl}
            alt=""
            fill
            sizes="(max-width: 1024px) 92vw, 58vw"
            className="object-cover transition-transform duration-[1.4s] ease-expo group-hover:scale-[1.06]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink-950/80 via-ink-950/10 to-transparent" />
          <span className="absolute left-5 top-5 rounded-full bg-ink-950/60 px-3 py-1 font-mono text-[11px] text-bone/80 backdrop-blur">
            {String(index + 1).padStart(2, '0')} / {String(projects.length).padStart(2, '0')}
          </span>
        </button>
        <div className="flex flex-1 flex-col gap-4 p-6 md:p-7">
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <h3 id={`project-${index}`} className="font-display text-3xl font-bold tracking-tight md:text-4xl">
              {p.title}
            </h3>
            <span className="font-mono text-xs uppercase tracking-[0.18em] text-acid">{p.role}</span>
          </div>
          <p className="line-clamp-2 max-w-2xl text-bone/65">{p.description}</p>
          <ul className="flex flex-wrap gap-2" aria-label="Tech stack">
            {p.tech.map(t => (
              <li key={t} className="rounded-full bg-white/[0.06] px-3 py-1 text-xs text-bone/75">
                {t}
              </li>
            ))}
          </ul>
          <div className="mt-auto flex flex-wrap items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onOpen}
              className="inline-flex items-center gap-2 rounded-full bg-bone px-4 py-2 text-sm font-medium text-ink-950 transition-colors hover:bg-acid"
            >
              Details <span aria-hidden>+</span>
            </button>
            {href && <ProjectLinks p={p} />}
          </div>
        </div>
      </article>
    </TiltCard>
  );
}

export default function Projects() {
  const root = useRef<HTMLElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState<Project | null>(null);
  const tier = useApp(s => s.tier);
  const reducedMotion = useApp(s => s.reducedMotion);
  const loaded = useApp(s => s.loaded);

  useGSAP(
    () => {
      if (tier === 'pending' || reducedMotion || !loaded) return;
      const mm = gsap.matchMedia();
      mm.add('(min-width: 1024px)', () => {
        const el = track.current!;
        const slides = gsap.utils.toArray<HTMLElement>('[data-slide]', el);
        const distance = () => el.scrollWidth - window.innerWidth;

        // Curve the row in 3D: slides rotate away from the viewport center.
        const curve = () => {
          const mid = window.innerWidth / 2;
          slides.forEach(s => {
            const r = s.getBoundingClientRect();
            const d = (r.left + r.width / 2 - mid) / window.innerWidth; // -1..1
            gsap.set(s, {rotateY: d * -28, z: -Math.abs(d) * 260, opacity: 1 - Math.min(0.55, Math.abs(d) * 0.6)});
          });
        };

        gsap.to(el, {
          x: () => -distance(),
          ease: 'none',
          scrollTrigger: {
            trigger: pinRef.current,
            start: 'top top',
            end: () => `+=${distance()}`,
            scrub: 0.8,
            pin: true,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            onUpdate: curve,
            onRefresh: curve,
          },
        });
        curve();
      });
      return () => mm.revert();
    },
    {dependencies: [tier, reducedMotion, loaded], scope: root}
  );

  return (
    <section ref={root} id="projects" data-chapter aria-labelledby="projects-title" className="relative">
      <div ref={pinRef} className="relative flex min-h-[100svh] flex-col justify-center overflow-hidden py-24 lg:py-0">
        <div className="mx-auto mb-10 flex w-full max-w-[1600px] flex-wrap items-end justify-between gap-6 px-5 md:px-10 lg:mb-8">
          <div>
            <Eyebrow index="03">Selected work</Eyebrow>
            <SplitReveal as="h2" id="projects-title" mode="chars" className="mt-6 font-display text-giga font-extrabold uppercase">
              Featured <span className="font-serif font-normal normal-case italic text-acid">Projects</span>
            </SplitReveal>
          </div>
          <FadeIn className="hidden items-center gap-3 font-mono text-xs uppercase tracking-[0.2em] text-mist lg:flex">
            Scroll <span className="inline-block h-px w-16 bg-acid" /> Explore
          </FadeIn>
        </div>

        <div className="[perspective:1600px]">
          <div
            ref={track}
            className={cn(
              'flex flex-col gap-8 px-5 md:px-10',
              // Reduced motion has no pinned scroll, so the row becomes a plain grid.
              reducedMotion ? 'lg:mx-auto lg:grid lg:max-w-[1600px] lg:grid-cols-2' : 'lg:w-max lg:flex-row lg:gap-10 lg:[transform-style:preserve-3d]'
            )}
          >
            {projects.map((p, i) => (
              <div key={p.title} data-slide className={reducedMotion ? undefined : 'lg:w-[min(50vw,780px)] lg:shrink-0'}>
                <FadeIn>
                  <ProjectCard p={p} index={i} onOpen={() => setActive(p)} />
                </FadeIn>
              </div>
            ))}
            <div data-slide className={cn('flex items-center', !reducedMotion && 'lg:w-[30vw] lg:shrink-0')}>
              <a
                href={github}
                target="_blank"
                rel="noopener noreferrer"
                data-cursor="GitHub"
                className="group flex w-full flex-col justify-between gap-16 rounded-[28px] border border-dashed border-white/15 p-8 transition-colors duration-500 hover:border-acid/60 lg:aspect-[4/4.2]"
              >
                <span className="eyebrow">More soon</span>
                <span className="font-display text-4xl font-bold leading-tight tracking-tight md:text-5xl">
                  More work on <span className="text-acid">GitHub</span>
                  <span className="ml-3 inline-block transition-transform duration-500 ease-expo group-hover:translate-x-2 group-hover:-translate-y-2" aria-hidden>
                    ↗
                  </span>
                </span>
              </a>
            </div>
          </div>
        </div>
      </div>

      <Modal open={!!active} onClose={() => setActive(null)} title={active?.title ?? 'Project'}>
        {active && (
          <div className="space-y-6">
            <div className="relative aspect-video overflow-hidden rounded-2xl bg-ink-900">
              <Image src={active.imageUrl} alt={`${active.title} cover`} fill sizes="1000px" className="object-cover" />
            </div>
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-acid">{active.role}</p>
            <p className="text-lg leading-relaxed text-bone/80">{active.description}</p>
            <ul className="flex flex-wrap gap-2" aria-label="Tech stack">
              {active.tech.map(t => (
                <li key={t} className="rounded-full bg-white/[0.06] px-3 py-1 text-sm text-bone/80">
                  {t}
                </li>
              ))}
            </ul>
            <div className="flex flex-wrap gap-3">
              <ProjectLinks p={active} size="lg" />
            </div>
          </div>
        )}
      </Modal>
    </section>
  );
}
