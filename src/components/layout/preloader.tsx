'use client';

import {useEffect, useRef, useState} from 'react';
import {profile} from '@/content/profile';
import {gsap} from '@/lib/gsap';
import {useApp} from '@/lib/store';

const MIN_MS = 1700;
const MAX_MS = 7000;

function preloadImage(src: string) {
  return new Promise<void>(resolve => {
    const img = new Image();
    img.onload = img.onerror = () => resolve();
    img.src = src;
  });
}

/**
 * Real progress: fonts, the hero portrait, and (on 3D tiers) the first rendered
 * WebGL frame each contribute a share. A time floor keeps the intro from flashing,
 * a ceiling guarantees the site never gets stuck behind the curtain.
 */
export default function Preloader() {
  const root = useRef<HTMLDivElement>(null);
  const counter = useRef<HTMLSpanElement>(null);
  const bar = useRef<HTMLDivElement>(null);
  const [gone, setGone] = useState(false);
  const tier = useApp(s => s.tier);

  useEffect(() => {
    if (tier === 'pending') return;
    const {reducedMotion} = useApp.getState();
    const needsScene = tier === 'mid' || tier === 'high';
    const start = performance.now();

    const tasks = {fonts: 0, image: 0, scene: needsScene ? 0 : 1};
    document.fonts?.ready.then(() => (tasks.fonts = 1));
    preloadImage(profile.photo).then(() => (tasks.image = 1));
    const unsub = useApp.subscribe(s => {
      if (s.sceneReady) tasks.scene = 1;
    });
    if (useApp.getState().sceneReady) tasks.scene = 1;

    const shown = {v: 0};
    let finished = false;

    const finish = () => {
      if (finished) return;
      finished = true;
      gsap.ticker.remove(tick);
      const el = root.current;
      if (!el) return;
      if (reducedMotion) {
        gsap.to(el, {opacity: 0, duration: 0.4, onComplete: done});
        useApp.getState().setLoaded();
        return;
      }
      const tl = gsap.timeline({onComplete: done});
      tl.to('[data-pl-inner]', {yPercent: -30, opacity: 0, duration: 0.7, ease: 'power3.in'})
        .add(() => useApp.getState().setLoaded(), '-=0.1')
        .to('[data-pl-panel="ink"]', {yPercent: -100, duration: 1.1, ease: 'expo.inOut'}, '-=0.25')
        .to('[data-pl-panel="acid"]', {yPercent: -100, duration: 1.1, ease: 'expo.inOut'}, '<0.12');
    };
    const done = () => setGone(true);

    const tick = (_t: number, deltaMs: number) => {
      const elapsed = performance.now() - start;
      const real = tasks.fonts * 0.25 + tasks.image * 0.25 + tasks.scene * 0.5;
      const timeCap = Math.min(1, elapsed / MIN_MS);
      const target = elapsed > MAX_MS ? 1 : Math.min(real, timeCap);
      const dt = Math.min(deltaMs, 100) / 1000;
      // ease toward the target, but never crawl: at least 40%/s
      shown.v = Math.min(target, shown.v + Math.max((target - shown.v) * (1 - Math.exp(-dt * 5)), dt * 0.4));
      const pct = Math.round(shown.v * 100);
      if (counter.current) counter.current.textContent = String(pct).padStart(3, '0');
      if (bar.current) bar.current.style.transform = `scaleX(${shown.v})`;
      if (shown.v === 1) finish();
    };
    gsap.ticker.add(tick);

    if (!reducedMotion) {
      gsap.fromTo(
        '[data-pl-char]',
        {yPercent: 110},
        {yPercent: 0, duration: 1.1, stagger: 0.035, ease: 'expo.out', delay: 0.1}
      );
    }

    return () => {
      unsub();
      gsap.ticker.remove(tick);
    };
  }, [tier]);

  if (gone) return null;

  const name = `${profile.firstName} ${profile.lastName}`;
  return (
    <div ref={root} className="fixed inset-0 z-[200]" role="status" aria-live="polite" aria-label="Loading portfolio">
      <div data-pl-panel="acid" className="absolute inset-0 bg-acid" aria-hidden />
      <div data-pl-panel="ink" className="absolute inset-0 bg-ink-950" aria-hidden />
      <div data-pl-inner className="relative flex h-full flex-col justify-between p-6 md:p-10">
        <div className="flex items-center justify-between eyebrow">
          <span>Portfolio ©{new Date().getFullYear()}</span>
          <span className="hidden sm:inline">{profile.role}</span>
        </div>

        <div className="overflow-hidden">
          <p className="font-display text-[clamp(2.4rem,9vw,8rem)] font-extrabold uppercase leading-[0.9] tracking-[-0.04em]" aria-hidden>
            {name.split(' ').map((word, w) => (
              <span key={w} className="inline-block whitespace-nowrap">
                {word.split('').map((c, i) => (
                  <span key={i} data-pl-char className="inline-block will-transform">
                    {c}
                  </span>
                ))}
                {w === 0 && ' '}
              </span>
            ))}
          </p>
        </div>

        <div className="flex items-end justify-between gap-6">
          <div className="h-px flex-1 overflow-hidden bg-white/10">
            <div ref={bar} className="h-full origin-left scale-x-0 bg-acid" />
          </div>
          <span className="font-display text-6xl font-bold tabular-nums leading-none md:text-8xl">
            <span ref={counter}>000</span>
          </span>
        </div>
      </div>
    </div>
  );
}
