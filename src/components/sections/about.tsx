'use client';

import Image from 'next/image';
import {useRef} from 'react';
import {milestoneGroups} from '@/content/milestones';
import {profile} from '@/content/profile';
import {appProjects, projects} from '@/content/projects';
import {skills} from '@/content/skills';
import {gsap, queueRefresh, useGSAP} from '@/lib/gsap';
import {useApp} from '@/lib/store';
import CountUp from '@/components/ui/count-up';
import {Eyebrow} from '@/components/ui/reveal';
import XRay from '@/components/ui/xray';

const count = (key: string) => milestoneGroups.find(g => g.key === key)?.items.length ?? 0;

const stats = [
  {value: projects.length + appProjects.length, label: 'Featured projects'},
  {value: count('hackathons'), label: 'Hackathons'},
  {value: count('bootcamps') + count('courses'), label: 'Certifications & courses'},
  {value: skills.length, label: 'Core technologies'},
];

function PortraitXRay() {
  return (
    <div className="absolute inset-0 overflow-hidden bg-ink-950">
      <Image
        src={profile.photo}
        alt=""
        fill
        sizes="(max-width: 1024px) 90vw, 36vw"
        className="object-cover object-top [filter:grayscale(1)_invert(1)_contrast(1.7)_brightness(0.95)]"
      />
      <div className="absolute inset-0 bg-acid mix-blend-multiply" />
      <div className="grid-bp absolute inset-0 opacity-70" />
      <div className="scanlines absolute inset-0" />
      <div className="absolute left-4 top-4 space-y-1 font-mono text-[10px] uppercase leading-relaxed text-ink-950">
        <p>subject: {profile.firstName} {profile.lastName}</p>
        <p>role: {profile.role}</p>
        <p>status: building</p>
      </div>
      <div className="absolute bottom-4 right-4 font-mono text-[10px] uppercase text-ink-950">scan 01 / xray</div>
      {/* corner brackets */}
      {['left-3 top-3 border-l border-t', 'right-3 top-3 border-r border-t', 'left-3 bottom-3 border-l border-b', 'right-3 bottom-3 border-r border-b'].map(c => (
        <span key={c} className={`absolute h-6 w-6 border-ink-950 ${c}`} />
      ))}
    </div>
  );
}

export default function About() {
  const root = useRef<HTMLElement>(null);
  const pin = useRef<HTMLDivElement>(null);
  // Only whether capabilities are known — a later tier downgrade must not rebuild pins.
  const tier = useApp(s => (s.tier === 'pending' ? 'pending' : 'ready'));
  const reducedMotion = useApp(s => s.reducedMotion);
  const loaded = useApp(s => s.loaded);

  useGSAP(
    () => {
      if (tier === 'pending' || reducedMotion || !loaded) return;
      const q = gsap.utils.selector(root);
      const words = q('[data-word]');
      const mm = gsap.matchMedia();

      // Desktop: pin the whole chapter while the statement "reads itself".
      mm.add('(min-width: 1024px)', () => {
        const tl = gsap.timeline({
          scrollTrigger: {trigger: pin.current, start: 'top top', end: '+=130%', scrub: 0.6, pin: true, anticipatePin: 1, refreshPriority: 3},
        });
        tl.fromTo(words, {opacity: 0.12}, {opacity: 1, stagger: 0.05, ease: 'none'}, 0)
          .fromTo(q('[data-portrait]'), {scale: 1.18, filter: 'saturate(0.2)'}, {scale: 1, filter: 'saturate(1)', ease: 'none'}, 0)
          .fromTo(q('[data-portrait-frame]'), {clipPath: 'inset(12% 12% 12% 12% round 24px)'}, {clipPath: 'inset(0% 0% 0% 0% round 24px)', ease: 'none'}, 0);
      });
      // Mobile: same read-along, no pin
      mm.add('(max-width: 1023px)', () => {
        gsap.fromTo(words, {opacity: 0.12}, {
          opacity: 1,
          stagger: 0.05,
          ease: 'none',
          scrollTrigger: {trigger: q('[data-statement]')[0], start: 'top 80%', end: 'bottom 45%', scrub: 0.6},
        });
      });
      queueRefresh();
      return () => {
        mm.revert();
        queueRefresh();
      };
    },
    {dependencies: [tier, reducedMotion, loaded], scope: root}
  );

  return (
    <section ref={root} id="about" data-chapter aria-labelledby="about-title" className="relative">
      <div ref={pin} className="relative flex min-h-[100svh] items-center px-5 py-24 md:px-10">
        <div className="mx-auto grid w-full max-w-[1600px] items-center gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-7">
            <Eyebrow index="01">About</Eyebrow>
            <h2 id="about-title" className="sr-only">
              About me
            </h2>
            <p
              data-statement
              className="mt-8 font-display text-[clamp(1.6rem,3.1vw,3.1rem)] font-semibold leading-[1.12] tracking-[-0.025em]"
            >
              {profile.bio.split(' ').map((w, i) => (
                <span key={i} data-word className="inline-block">
                  {w}&nbsp;
                </span>
              ))}
            </p>

            <ul className="mt-10 flex flex-wrap gap-2" aria-label="What I build">
              {profile.disciplines.map((d, i) => (
                <li key={d} className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-bone/80">
                  <span className="font-mono text-[10px] text-acid">0{i + 1}</span>
                  {d}
                </li>
              ))}
            </ul>

            <dl className="mt-12 grid grid-cols-2 gap-x-8 gap-y-10 border-t border-white/10 pt-10 sm:grid-cols-4">
              {stats.map(s => (
                <div key={s.label} className="flex flex-col">
                  <dt className="eyebrow order-2 mt-3">{s.label}</dt>
                  <dd className="order-1 font-display text-5xl font-bold tracking-tight md:text-6xl">
                    <CountUp value={s.value} />
                    <span className="text-acid">+</span>
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="lg:col-span-5">
            <div data-portrait-frame className="relative mx-auto aspect-[4/5] max-w-md overflow-hidden rounded-3xl border border-white/10">
              <XRay reveal={<PortraitXRay />} className="h-full w-full" hint="Tap to x-ray">
                <div data-portrait className="relative h-full w-full">
                  <Image
                    src={profile.photo}
                    alt={`Portrait of ${profile.firstName} ${profile.lastName}`}
                    fill
                    priority
                    sizes="(max-width: 1024px) 90vw, 36vw"
                    className="object-cover object-top"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink-950/70 via-transparent to-transparent" />
                </div>
              </XRay>
              <div className="pointer-events-none absolute bottom-5 left-5 z-20 flex items-center [@media(hover:none)]:hidden gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-bone/80">
                <span className="h-1.5 w-1.5 rounded-full bg-acid" /> Hover to x-ray
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
