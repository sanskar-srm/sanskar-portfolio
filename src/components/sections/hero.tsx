'use client';

import {useRef} from 'react';
import {profile} from '@/content/profile';
import {gsap, SplitText, useGSAP} from '@/lib/gsap';
import {pointer} from '@/lib/live';
import {useApp} from '@/lib/store';
import Magnetic from '@/components/ui/magnetic';
import XRay from '@/components/ui/xray';

const tags = ['Full-stack', 'React Native', 'Android · iOS', 'Generative AI'];

function Name({outline = false}: {outline?: boolean}) {
  const line = outline ? 'text-outline-acid' : '';
  return (
    <>
      <span data-name-line className={`block whitespace-nowrap ${line}`}>
        {profile.firstName}
      </span>
      <span data-name-line className={`block whitespace-nowrap pl-[0.4em] md:pl-[1.2em] ${line}`}>
        {profile.lastName}
        <span className={outline ? 'text-outline-acid' : 'text-acid'}>.</span>
      </span>
    </>
  );
}

/** The alternate "behind the scenes" layer the x-ray lens reveals over the name. */
function NameXRay() {
  return (
    <div className="absolute inset-0 bg-ink-950/90">
      <div className="grid-bp absolute inset-0" />
      <div className="scanlines absolute inset-0" />
      <div className="relative font-display text-mega font-extrabold uppercase">
        <Name outline />
      </div>
      <div className="absolute left-2 top-2 font-mono text-[10px] text-acid">&lt;h1 class=&quot;name&quot;&gt;</div>
      <div className="absolute bottom-2 right-2 space-y-1 text-right font-mono text-[10px] uppercase leading-relaxed text-acid/80">
        <p>font: display / 800</p>
        <p>size: clamp(2.5rem, 9.2vw, 10.5rem)</p>
        <p>tracking: -0.045em</p>
      </div>
      <div className="absolute inset-y-0 left-[0.4em] w-px bg-acid/40 md:left-[1.2em]" />
      <div className="absolute inset-x-0 top-1/2 h-px bg-acid/40" />
    </div>
  );
}

export default function Hero() {
  const root = useRef<HTMLElement>(null);
  const loaded = useApp(s => s.loaded);
  const reducedMotion = useApp(s => s.reducedMotion);
  // Only whether capabilities are known — a later tier downgrade must not rebuild pins.
  const tier = useApp(s => (s.tier === 'pending' ? 'pending' : 'ready'));

  useGSAP(
    () => {
      if (!loaded || reducedMotion || tier === 'pending') return;
      const q = gsap.utils.selector(root);

      // Intro
      const split = SplitText.create(q('[data-hero-name] [data-name-line]'), {type: 'words,chars', mask: 'chars', wordsClass: 'split-word'});
      const tl = gsap.timeline({delay: 0.35});
      tl.from(split.chars, {yPercent: 115, rotate: 8, duration: 1.5, stagger: 0.035, ease: 'expo.out'})
        .from(q('[data-hero-fade]'), {y: 24, opacity: 0, filter: 'blur(8px)', duration: 1.2, stagger: 0.08}, '-=1.1')
        .from(q('[data-hero-tag]'), {scale: 0.6, opacity: 0, duration: 1, stagger: 0.1, ease: 'back.out(2)'}, '-=1')
        .from(q('[data-hero-rule]'), {scaleX: 0, duration: 1.4, ease: 'expo.inOut'}, '-=1.2');

      // Scroll-out: multi-layer parallax at different speeds
      q('[data-speed]').forEach(el => {
        const speed = parseFloat((el as HTMLElement).dataset.speed!);
        gsap.to(el, {
          yPercent: speed * 100,
          ease: 'none',
          scrollTrigger: {trigger: root.current, start: 'top top', end: 'bottom top', scrub: true},
        });
      });
      gsap.to(q('[data-hero-fadeout]'), {
        opacity: 0,
        ease: 'none',
        scrollTrigger: {trigger: root.current, start: '20% top', end: '80% top', scrub: true},
      });

      // Mouse parallax: each layer drifts by its depth, damped via quickTo
      const layers = q('[data-depth]').map(el => ({
        depth: parseFloat((el as HTMLElement).dataset.depth!),
        x: gsap.quickTo(el, 'x', {duration: 1.2, ease: 'power3.out'}),
        y: gsap.quickTo(el, 'y', {duration: 1.2, ease: 'power3.out'}),
      }));
      const tick = () => layers.forEach(l => (l.x(pointer.nx * l.depth * 40), l.y(pointer.ny * l.depth * 30)));
      gsap.ticker.add(tick);

      return () => {
        gsap.ticker.remove(tick);
        split.revert();
      };
    },
    {dependencies: [loaded, reducedMotion, tier], scope: root}
  );

  return (
    <section
      ref={root}
      id="top"
      data-chapter
      aria-label="Introduction"
      className="relative flex min-h-[100svh] flex-col overflow-hidden px-5 pb-8 pt-28 md:px-10 md:pb-10"
    >
      {/* Back layer: giant outline word, slowest */}
      <div data-speed="0.25" className="pointer-events-none absolute inset-x-0 top-[18%] select-none" aria-hidden>
        <div data-depth="-0.4" className="whitespace-nowrap font-display text-[26vw] font-extrabold uppercase leading-none text-outline opacity-40">
          Full—Stack
        </div>
      </div>

      <div className="relative mx-auto flex w-full max-w-[1600px] flex-1 flex-col justify-between">
        {/* Top meta row */}
        <div data-hero-fadeout className="flex flex-wrap items-center justify-between gap-4">
          <p data-hero-fade className="eyebrow flex items-center gap-3">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-acid opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-acid" />
            </span>
            Open to new opportunities
          </p>
          <p data-hero-fade className="eyebrow">{profile.role} · Web &amp; Mobile</p>
        </div>

        {/* Mid layer: the name */}
        <div data-speed="-0.35" className="relative my-10 md:my-0">
          <div data-depth="0.35" className="inline-block">
            <XRay reveal={<NameXRay />} hint="Tap to x-ray the name" hintClassName="top-full bottom-auto mt-4 left-0 translate-x-0">
              <h1 data-hero-name className="font-display text-mega font-extrabold uppercase">
                <span className="sr-only">
                  {profile.firstName} {profile.lastName} — {profile.role}
                </span>
                <span aria-hidden>
                  <Name />
                </span>
              </h1>
            </XRay>
          </div>

          {/* Foreground floating tags */}
          <div data-depth="1" className="pointer-events-none absolute -top-6 right-0 hidden flex-col items-end gap-3 lg:flex" aria-hidden>
            {tags.map((t, i) => (
              <span
                key={t}
                data-hero-tag
                className="glass rounded-full px-4 py-2 font-mono text-[11px] uppercase tracking-[0.18em] text-bone/80"
                style={{marginRight: `${i * 2.5}rem`}}
              >
                <span className="mr-2 text-acid">✦</span>
                {t}
              </span>
            ))}
          </div>
        </div>

        {/* Bottom row */}
        <div data-speed="-0.15" data-hero-fadeout>
          <div data-hero-rule className="mb-6 h-px origin-left bg-white/15" />
          <div className="grid items-end gap-8 md:grid-cols-[1fr_auto_auto]">
            <p data-hero-fade className="max-w-md text-balance text-base leading-relaxed text-bone/70 md:text-lg">
              {profile.tagline}
            </p>
            <div data-hero-fade className="flex flex-wrap items-center gap-3">
              <Magnetic>
                <a
                  href="#contact"
                  className="group relative inline-flex items-center gap-3 overflow-hidden rounded-full bg-acid px-7 py-4 font-medium text-ink-950"
                >
                  <span className="absolute inset-0 translate-y-full rounded-full bg-bone transition-transform duration-500 ease-expo group-hover:translate-y-0" />
                  <span className="relative">Get in touch</span>
                  <span className="relative transition-transform duration-500 ease-expo group-hover:translate-x-1" aria-hidden>
                    →
                  </span>
                </a>
              </Magnetic>
              <Magnetic>
                <a
                  href="#projects"
                  className="inline-flex items-center gap-2 rounded-full border border-white/15 px-7 py-4 font-medium transition-colors duration-300 hover:border-acid hover:text-acid"
                >
                  View work
                </a>
              </Magnetic>
              <Magnetic>
                  <div className="glass inline-flex items-center rounded-full p-1">
                    <a
                      href={profile.resume}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-full px-5 py-3 font-medium transition-colors duration-300 hover:text-acid"
                    >
                      Resume <span aria-hidden>↗</span>
                      <span className="sr-only">(view, opens in a new tab)</span>
                    </a>
                    <a
                      href={`${profile.resume}?download=1`}
                      aria-label="Download resume (PDF)"
                      className="grid h-11 w-11 place-items-center rounded-full bg-white/10 transition-colors duration-300 hover:bg-acid hover:text-ink-950"
                    >
                      <span aria-hidden>↓</span>
                    </a>
                  </div>
              </Magnetic>
            </div>
            <div data-hero-fade className="hidden items-center gap-3 md:flex" aria-hidden>
              <span className="eyebrow">Scroll</span>
              <span className="relative h-12 w-px overflow-hidden bg-white/15">
                <span className="absolute inset-x-0 top-0 h-1/2 animate-[scrollcue_2s_ease-in-out_infinite] bg-acid" />
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
