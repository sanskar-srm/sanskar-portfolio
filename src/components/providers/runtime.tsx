'use client';

import Lenis from 'lenis';
import {useEffect} from 'react';
import {detectCapabilities} from '@/lib/capabilities';
import {gsap, queueRefresh, ScrollTrigger} from '@/lib/gsap';
import {lens, lensTarget, pointer, scroll} from '@/lib/live';
import {useApp} from '@/lib/store';

let lenisInstance: Lenis | null = null;
export const getLenis = () => lenisInstance;

export function scrollToTarget(target: string | HTMLElement | number) {
  const el = typeof target === 'string' ? document.querySelector<HTMLElement>(target) : target;
  if (el === null) return;
  if (lenisInstance) {
    lenisInstance.scrollTo(el, {duration: 1.8, easing: t => 1 - Math.pow(1 - t, 4)});
  } else if (typeof el === 'number') {
    window.scrollTo({top: el});
  } else {
    el.scrollIntoView();
  }
}

/** Frame-rate independent damping factor. */
const damp = (factor: number, dt: number) => 1 - Math.pow(1 - factor, dt * 60);

export default function Runtime() {
  const tier = useApp(s => s.tier);
  const reducedMotion = useApp(s => s.reducedMotion);
  const isTouch = useApp(s => s.isTouch);
  const loaded = useApp(s => s.loaded);

  // 1. Capabilities
  useEffect(() => {
    useApp.getState().setCaps(detectCapabilities());
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = () => useApp.getState().setCaps(detectCapabilities());
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  // 2. Smooth scroll + scroll state
  useEffect(() => {
    if (tier === 'pending') return;

    const measureChapters = () => {
      const els = Array.from(document.querySelectorAll<HTMLElement>('[data-chapter]'));
      return els.map(el => {
        const r = el.getBoundingClientRect();
        return {top: r.top + window.scrollY, height: r.height};
      });
    };
    let sections = measureChapters();
    const onRefresh = () => (sections = measureChapters());
    ScrollTrigger.addEventListener('refresh', onRefresh);

    let lastY = window.scrollY;
    const update = (y: number, velocity: number) => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      scroll.progress = max > 0 ? y / max : 0;
      scroll.velocity = velocity;
      if (y !== lastY) scroll.direction = y > lastY ? 1 : -1;
      lastY = y;

      const mid = y + window.innerHeight * 0.5;
      let chapter = 0;
      for (let i = 0; i < sections.length; i++) {
        const s = sections[i];
        if (mid >= s.top) chapter = i + Math.min(1, (mid - s.top) / Math.max(1, s.height));
      }
      scroll.chapter = chapter;

      const app = useApp.getState();
      app.setChapter(Math.min(sections.length - 1, Math.floor(chapter)));
      app.setNavHidden(!app.menuOpen && y > 160 && scroll.direction === 1);
    };

    if (reducedMotion) {
      const onScroll = () => {
        update(window.scrollY, 0);
      };
      window.addEventListener('scroll', onScroll, {passive: true});
      onScroll();
      return () => {
        window.removeEventListener('scroll', onScroll);
        ScrollTrigger.removeEventListener('refresh', onRefresh);
      };
    }

    const lenis = new Lenis({lerp: 0.085, smoothWheel: true, wheelMultiplier: 0.95, autoRaf: false});
    lenisInstance = lenis;
    lenis.on('scroll', (e: Lenis) => {
      ScrollTrigger.update();
      update(e.scroll, e.velocity);
    });
    const raf = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);
    if (!useApp.getState().loaded) lenis.stop();

    return () => {
      gsap.ticker.remove(raf);
      lenis.destroy();
      lenisInstance = null;
      ScrollTrigger.removeEventListener('refresh', onRefresh);
    };
  }, [tier, reducedMotion]);

  // 3. Unlock scrolling once the preloader lifts
  useEffect(() => {
    if (!loaded) {
      document.documentElement.style.overflow = 'hidden';
      return;
    }
    document.documentElement.style.overflow = '';
    lenisInstance?.start();
    // Fonts + images have settled by now; re-measure every trigger.
    queueRefresh();
    document.fonts?.ready.then(queueRefresh);

    // Late layout shifts (fonts, images, re-split text) move every trigger below them.
    const main = document.getElementById('main');
    if (!main) return;
    let lastHeight = main.offsetHeight;
    const ro = new ResizeObserver(() => {
      const h = main.offsetHeight;
      if (Math.abs(h - lastHeight) > 2) {
        lastHeight = h;
        queueRefresh();
      }
    });
    ro.observe(main);
    return () => ro.disconnect();
  }, [loaded]);

  // 4. Pointer tracking, damping, and lens easing
  useEffect(() => {
    if (tier === 'pending') return;
    const fine = !isTouch && !reducedMotion;
    document.documentElement.classList.toggle('has-cursor', fine);

    const onMove = (e: PointerEvent) => {
      if (e.pointerType === 'touch') return;
      pointer.x = e.clientX;
      pointer.y = e.clientY;
      if (!pointer.active) {
        pointer.lx = e.clientX;
        pointer.ly = e.clientY;
      }
      pointer.active = true;
    };
    const onLeave = () => (pointer.active = false);

    let prevX = pointer.lx;
    let prevY = pointer.ly;
    const tick = (_t: number, deltaMs: number) => {
      const dt = Math.min(deltaMs, 64) / 1000;
      const k = damp(0.2, dt);
      pointer.lx += (pointer.x - pointer.lx) * k;
      pointer.ly += (pointer.y - pointer.ly) * k;
      const tx = pointer.active ? (pointer.x / window.innerWidth) * 2 - 1 : 0;
      const ty = pointer.active ? (pointer.y / window.innerHeight) * 2 - 1 : 0;
      const kn = damp(0.06, dt);
      pointer.nx += (tx - pointer.nx) * kn;
      pointer.ny += (ty - pointer.ny) * kn;
      pointer.velocity = Math.hypot(pointer.lx - prevX, pointer.ly - prevY);
      prevX = pointer.lx;
      prevY = pointer.ly;
      lens.r += (lensTarget() - lens.r) * damp(0.16, dt);
      if (lens.r < 0.3) lens.r = 0;
    };

    window.addEventListener('pointermove', onMove, {passive: true});
    document.documentElement.addEventListener('pointerleave', onLeave);
    gsap.ticker.add(tick);
    return () => {
      window.removeEventListener('pointermove', onMove);
      document.documentElement.removeEventListener('pointerleave', onLeave);
      gsap.ticker.remove(tick);
    };
  }, [tier, isTouch, reducedMotion]);

  // 5. In-page anchors go through Lenis
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement).closest<HTMLAnchorElement>('a[href^="#"]');
      if (!a) return;
      const hash = a.getAttribute('href')!;
      const el = hash === '#' || hash === '#top' ? document.body : document.querySelector<HTMLElement>(hash);
      if (!el) return;
      e.preventDefault();
      useApp.getState().setMenuOpen(false);
      scrollToTarget(el === document.body ? 0 : el);
      history.replaceState(null, '', hash === '#' ? ' ' : hash);
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);

  return null;
}
