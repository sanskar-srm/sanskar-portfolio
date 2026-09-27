'use client';

import dynamic from 'next/dynamic';
import Image from 'next/image';
import {useEffect, useMemo, useRef, useState} from 'react';
import type {AppProject} from '@/content/projects';
import {AndroidIcon, AppleIcon} from '@/components/icons';
import {gsap, queueRefresh, useGSAP} from '@/lib/gsap';
import {use3D, useApp} from '@/lib/store';
import {cn} from '@/lib/utils';
import Magnetic from '@/components/ui/magnetic';
import {FadeIn} from '@/components/ui/reveal';
import type {ScreenProgress} from '@/components/three/phone-scene';

const PhoneScene = dynamic(() => import('@/components/three/phone-scene'), {ssr: false});

const platformIcon: Record<string, typeof AndroidIcon> = {Android: AndroidIcon, iOS: AppleIcon};

/** Lightweight stand-in for low-power devices and reduced motion. */
function CssPhone({app, active}: {app: AppProject; active: number}) {
  return (
    <div className="relative mx-auto aspect-[1.62/3.44] h-full max-h-[70vh] rounded-[2.6rem] border border-white/15 bg-ink-800 p-2.5 shadow-[0_40px_120px_-30px_rgba(157,92,255,0.45)]">
      <div className="relative h-full w-full overflow-hidden rounded-[2.1rem] bg-black">
        {app.screens.map((s, i) => (
          <Image
            key={s.src}
            src={s.src}
            alt={i === active ? `${app.title} — ${s.title}` : ''}
            fill
            sizes="360px"
            className="object-cover transition-opacity duration-700"
            style={{opacity: i === active ? 1 : 0}}
          />
        ))}
        <span className="absolute left-1/2 top-2.5 h-5 w-20 -translate-x-1/2 rounded-full bg-black" />
      </div>
    </div>
  );
}

export default function AppShowcase({app, index}: {app: AppProject; index: number}) {
  const root = useRef<HTMLDivElement>(null);
  const pin = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const progress = useRef<ScreenProgress>({current: 0}).current;
  const [active, setActive] = useState(0);
  const [near, setNear] = useState(false);
  const show3D = use3D();
  const ready = useApp(s => s.tier !== 'pending');
  const reducedMotion = useApp(s => s.reducedMotion);
  const loaded = useApp(s => s.loaded);
  const n = app.screens.length;
  const screenSrcs = useMemo(() => app.screens.map(s => s.src), [app.screens]);

  // Only create the phone's WebGL context once the showcase is close to the viewport.
  useEffect(() => {
    if (!stage.current) return;
    const io = new IntersectionObserver(([e]) => e.isIntersecting && setNear(true), {rootMargin: '600px 0px'});
    io.observe(stage.current);
    return () => io.disconnect();
  }, []);

  // Keep the captions in sync with the screen the phone is showing.
  useEffect(() => {
    const tick = () => {
      const i = Math.round(Math.min(Math.max(progress.current, 0), 1) * (n - 1));
      setActive(prev => (prev === i ? prev : i));
    };
    gsap.ticker.add(tick);
    return () => gsap.ticker.remove(tick);
  }, [n, progress]);

  useGSAP(
    () => {
      if (!ready || !loaded) return;
      if (reducedMotion) return;
      const mm = gsap.matchMedia();

      // Desktop: pin the showcase; scrolling walks the phone through every screen.
      mm.add('(min-width: 1024px)', () => {
        gsap.fromTo(
          progress,
          {current: 0},
          {
            current: 1,
            ease: 'none',
            scrollTrigger: {
              trigger: pin.current,
              start: 'top top',
              end: () => `+=${window.innerHeight * (n * 0.75)}`,
              scrub: 0.8,
              pin: true,
              anticipatePin: 1,
              // Between About (3) and the web gallery (1); earlier showcases refresh first.
              refreshPriority: 2.9 - index * 0.1,
              invalidateOnRefresh: true,
            },
          }
        );
      });

      // Mobile / tablet: auto-advance through the screens while visible.
      mm.add('(max-width: 1023px)', () => {
        const tl = gsap.timeline({repeat: -1, paused: true});
        for (let i = 1; i < n; i++) tl.to(progress, {current: i / (n - 1), duration: 1.1, ease: 'power2.inOut'}, `+=2.2`);
        tl.to(progress, {current: 0, duration: 1.1, ease: 'power2.inOut'}, '+=2.2');
        const io = new IntersectionObserver(([e]) => (e.isIntersecting ? tl.play() : tl.pause()), {threshold: 0.25});
        if (root.current) io.observe(root.current);
        return () => {
          io.disconnect();
          tl.kill();
        };
      });

      queueRefresh();
      return () => {
        mm.revert();
        queueRefresh();
      };
    },
    {dependencies: [ready, reducedMotion, loaded, n, index], scope: root}
  );

  const goTo = (i: number) => {
    gsap.to(progress, {current: i / Math.max(1, n - 1), duration: reducedMotion ? 0 : 0.9, ease: 'power2.inOut', overwrite: true});
  };

  return (
    <div ref={root} id="app-dev" className="relative">
      <div ref={pin} className="relative flex min-h-[100svh] items-center px-5 py-20 md:px-10 lg:py-0">
        <div className="mx-auto grid w-full max-w-[1600px] items-center gap-12 lg:grid-cols-12 lg:gap-10">
          {/* copy */}
          <div className="order-2 lg:order-1 lg:col-span-6">
            <FadeIn className="flex items-center gap-3">
              <span className="rounded-full border border-acid/40 bg-acid/10 px-3 py-1 font-mono text-[11px] uppercase tracking-[0.2em] text-acid">
                A · App Dev
              </span>
              <span className="font-mono text-xs text-mist">
                {String(index + 1).padStart(2, '0')} — {app.role}
              </span>
            </FadeIn>

            <FadeIn className="mt-8 flex items-center gap-5">
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl border border-white/10 md:h-20 md:w-20">
                <Image src={app.icon} alt={`${app.title} app icon`} fill sizes="80px" className="object-cover" />
              </div>
              <div>
                <h3 className="font-display text-huge font-extrabold uppercase">{app.title}</h3>
                <p className="font-serif text-xl italic text-acid md:text-2xl">{app.tagline}</p>
              </div>
            </FadeIn>

            <FadeIn className="mt-6 max-w-xl text-bone/65 md:text-lg">{app.description}</FadeIn>

            {/* feature list, driven by the phone */}
            <ol className="mt-8 max-w-xl space-y-1" aria-label="Screens">
              {app.screens.map((s, i) => (
                <li key={s.src}>
                  <button
                    type="button"
                    onClick={() => goTo(i)}
                    aria-current={active === i ? 'step' : undefined}
                    className={cn(
                      'group relative w-full overflow-hidden rounded-2xl border px-5 py-4 text-left transition-colors duration-500',
                      active === i ? 'border-acid/40 bg-white/[0.04]' : 'border-transparent hover:bg-white/[0.02]'
                    )}
                  >
                    <span className="flex items-baseline gap-4">
                      <span className={cn('font-mono text-xs transition-colors', active === i ? 'text-acid' : 'text-mist')}>
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <span>
                        <span className={cn('block font-display text-lg font-semibold transition-colors', active === i ? 'text-bone' : 'text-bone/50')}>
                          {s.title}
                        </span>
                        <span
                          className={cn(
                            'block overflow-hidden text-sm text-bone/60 transition-all duration-500',
                            active === i ? 'mt-1 max-h-20 opacity-100' : 'max-h-0 opacity-0'
                          )}
                        >
                          {s.caption}
                        </span>
                      </span>
                    </span>
                  </button>
                </li>
              ))}
            </ol>

            <FadeIn className="mt-8 flex flex-wrap items-center gap-2">
              {app.platforms.map(p => {
                const Icon = platformIcon[p];
                return (
                  <span key={p} className="inline-flex items-center gap-2 rounded-full bg-bone px-3 py-1.5 text-xs font-semibold text-ink-950">
                    {Icon && <Icon aria-hidden className="h-3.5 w-3.5" />}
                    {p}
                  </span>
                );
              })}
              {app.tech.map(t => (
                <span key={t} className="rounded-full bg-white/[0.06] px-3 py-1.5 text-xs text-bone/75">
                  {t}
                </span>
              ))}
            </FadeIn>

            {app.githubUrl && (
              <FadeIn className="mt-8">
                <Magnetic strength={0.25}>
                  <a
                    href={app.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group relative inline-flex items-center gap-3 overflow-hidden rounded-full bg-acid px-7 py-4 font-medium text-ink-950"
                  >
                    <span className="absolute inset-0 translate-y-full rounded-full bg-bone transition-transform duration-500 ease-expo group-hover:translate-y-0" />
                    <span className="relative">View source on GitHub</span>
                    <span className="relative" aria-hidden>
                      ↗
                    </span>
                    <span className="sr-only">(opens in a new tab)</span>
                  </a>
                </Magnetic>
              </FadeIn>
            )}
          </div>

          {/* phone */}
          <div ref={stage} className="relative order-1 h-[62svh] lg:order-2 lg:col-span-6 lg:h-[88svh]">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 select-none text-center font-display text-[16vw] font-extrabold uppercase leading-none text-outline opacity-50 lg:text-[7vw]"
            >
              {app.title}
            </div>
            <div className="absolute inset-0">
              {show3D && !reducedMotion ? (
                near && <PhoneScene screens={screenSrcs} progress={progress} label={`${app.title} running on a phone`} />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <CssPhone app={app} active={active} />
                </div>
              )}
            </div>
            {/* screen pager */}
            <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 items-center gap-2 lg:bottom-6">
              {app.screens.map((s, i) => (
                <button
                  key={s.src}
                  type="button"
                  onClick={() => goTo(i)}
                  aria-label={`Show ${s.title}`}
                  className={cn('h-1.5 rounded-full transition-all duration-500', active === i ? 'w-8 bg-acid' : 'w-3 bg-white/25 hover:bg-white/50')}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
