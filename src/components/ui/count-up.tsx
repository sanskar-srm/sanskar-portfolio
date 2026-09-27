'use client';

import {animate, useInView} from 'motion/react';
import {useEffect, useRef} from 'react';
import {useApp} from '@/lib/store';

/** Counts from 0 to `value` the first time it scrolls into view. */
export default function CountUp({value, pad = 2, className}: {value: number; pad?: number; className?: string}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, {once: true, margin: '0px 0px -15% 0px'});
  const reducedMotion = useApp(s => s.reducedMotion);
  const format = (n: number) => String(Math.round(n)).padStart(pad, '0');

  useEffect(() => {
    if (!inView || !ref.current) return;
    if (reducedMotion) {
      ref.current.textContent = format(value);
      return;
    }
    const controls = animate(0, value, {
      duration: 1.8,
      ease: [0.19, 1, 0.22, 1],
      onUpdate: v => {
        if (ref.current) ref.current.textContent = format(v);
      },
    });
    return () => controls.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, reducedMotion, value]);

  return (
    <span ref={ref} className={className} aria-label={String(value)}>
      {format(value)}
    </span>
  );
}
