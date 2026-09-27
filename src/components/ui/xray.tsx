'use client';

import {useEffect, useRef, useState, type ReactNode} from 'react';
import {gsap} from '@/lib/gsap';
import {lens, pointer} from '@/lib/live';
import {useApp} from '@/lib/store';
import {cn} from '@/lib/utils';

type Props = {
  /** What everyone sees. */
  children: ReactNode;
  /** The hidden layer revealed inside the lens. Decorative: hidden from AT. */
  reveal: ReactNode;
  className?: string;
  /** Touch hint copy */
  hint?: string;
  hintClassName?: string;
};

/**
 * X-ray lens. The reveal layer sits on top of the content and is clipped to a
 * circle that follows the damped pointer. The same global lens radius drives
 * the WebGL blob's x-ray, so the effect reads as one continuous tool.
 *
 * Touch: tap to open the lens from the tap point, tap again to close.
 */
export default function XRay({children, reveal, className, hint = 'Tap to x-ray', hintClassName}: Props) {
  const root = useRef<HTMLDivElement>(null);
  const layer = useRef<HTMLDivElement>(null);
  const isTouch = useApp(s => s.isTouch);
  const reducedMotion = useApp(s => s.reducedMotion);
  const [open, setOpen] = useState(false);
  const touchState = useRef({x: 0, y: 0, r: 0});

  // Pointer mode
  useEffect(() => {
    if (isTouch || !root.current || !layer.current) return;
    const el = root.current;
    const clip = layer.current;
    let visible = false;
    const io = new IntersectionObserver(([entry]) => (visible = entry.isIntersecting));
    io.observe(el);

    const tick = () => {
      if (!visible) return;
      if (lens.r <= 0.5) {
        clip.style.clipPath = 'circle(0px at -100px -100px)';
        return;
      }
      const rect = el.getBoundingClientRect();
      clip.style.clipPath = `circle(${lens.r.toFixed(1)}px at ${(pointer.lx - rect.left).toFixed(1)}px ${(pointer.ly - rect.top).toFixed(1)}px)`;
    };
    gsap.ticker.add(tick);
    return () => {
      io.disconnect();
      gsap.ticker.remove(tick);
    };
  }, [isTouch]);

  // Touch mode
  const onTap = (e: React.MouseEvent) => {
    if (!isTouch || !root.current || !layer.current) return;
    const rect = root.current.getBoundingClientRect();
    const s = touchState.current;
    const next = !open;
    if (next) {
      s.x = e.clientX - rect.left;
      s.y = e.clientY - rect.top;
    }
    const maxR = Math.hypot(Math.max(s.x, rect.width - s.x), Math.max(s.y, rect.height - s.y));
    gsap.to(s, {
      r: next ? maxR : 0,
      duration: reducedMotion ? 0 : next ? 1.1 : 0.7,
      ease: next ? 'expo.out' : 'expo.inOut',
      onUpdate: () => {
        if (layer.current) layer.current.style.clipPath = `circle(${s.r}px at ${s.x}px ${s.y}px)`;
      },
    });
    setOpen(next);
  };

  return (
    <div
      ref={root}
      data-xray
      onClick={onTap}
      className={cn('relative isolate', className)}
    >
      {children}
      <div
        ref={layer}
        aria-hidden
        className="pointer-events-none absolute inset-0 z-10"
        style={{clipPath: 'circle(0px at -100px -100px)'}}
      >
        {reveal}
      </div>
      {isTouch && (
        <span
          aria-hidden
          className={cn(
            'pointer-events-none absolute bottom-3 left-1/2 z-20 -translate-x-1/2 whitespace-nowrap rounded-full border border-acid/40 bg-ink-950/70 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.2em] text-acid backdrop-blur',
            hintClassName
          )}
        >
          {open ? 'Tap to close' : hint}
        </span>
      )}
    </div>
  );
}
