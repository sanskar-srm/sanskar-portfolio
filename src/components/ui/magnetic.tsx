'use client';

import {motion, useMotionValue, useSpring} from 'motion/react';
import {useRef, type ReactNode} from 'react';
import {useApp} from '@/lib/store';
import {cn} from '@/lib/utils';

type Props = {
  children: ReactNode;
  className?: string;
  /** 0..1 — how far the element follows the pointer */
  strength?: number;
};

/** Pulls its child toward the pointer while hovered; springs back on leave. */
export default function Magnetic({children, className, strength = 0.35}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const disabled = useApp(s => s.isTouch || s.reducedMotion);
  const x = useSpring(useMotionValue(0), {stiffness: 180, damping: 14, mass: 0.2});
  const y = useSpring(useMotionValue(0), {stiffness: 180, damping: 14, mass: 0.2});
  const ix = useSpring(useMotionValue(0), {stiffness: 180, damping: 14, mass: 0.2});
  const iy = useSpring(useMotionValue(0), {stiffness: 180, damping: 14, mass: 0.2});

  const onMove = (e: React.PointerEvent) => {
    if (disabled || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    const dx = e.clientX - (r.left + r.width / 2);
    const dy = e.clientY - (r.top + r.height / 2);
    x.set(dx * strength);
    y.set(dy * strength);
    ix.set(dx * strength * 0.35);
    iy.set(dy * strength * 0.35);
  };
  const onLeave = () => {
    x.set(0);
    y.set(0);
    ix.set(0);
    iy.set(0);
  };

  return (
    <motion.div
      ref={ref}
      className={cn('inline-block', className)}
      style={{x, y}}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
    >
      <motion.div style={{x: ix, y: iy}}>{children}</motion.div>
    </motion.div>
  );
}
