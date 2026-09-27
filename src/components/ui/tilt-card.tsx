'use client';

import {motion, useMotionTemplate, useMotionValue, useSpring, useTransform} from 'motion/react';
import {useRef, type ReactNode} from 'react';
import {useApp} from '@/lib/store';
import {cn} from '@/lib/utils';

type Props = {children: ReactNode; className?: string; max?: number; glare?: boolean};

/** Perspective tilt that follows the pointer, with a moving specular glare. */
export default function TiltCard({children, className, max = 10, glare = true}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const disabled = useApp(s => s.isTouch || s.reducedMotion);
  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);
  const spring = {stiffness: 150, damping: 18, mass: 0.4};
  const rotateX = useSpring(useTransform(py, [0, 1], [max, -max]), spring);
  const rotateY = useSpring(useTransform(px, [0, 1], [-max, max]), spring);
  const gx = useTransform(px, v => `${v * 100}%`);
  const gy = useTransform(py, v => `${v * 100}%`);
  const glareOpacity = useSpring(0, spring);
  const glareBg = useMotionTemplate`radial-gradient(circle at ${gx} ${gy}, rgba(255,255,255,0.18), transparent 55%)`;

  const onMove = (e: React.PointerEvent) => {
    if (disabled || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    px.set((e.clientX - r.left) / r.width);
    py.set((e.clientY - r.top) / r.height);
    glareOpacity.set(1);
  };
  const onLeave = () => {
    px.set(0.5);
    py.set(0.5);
    glareOpacity.set(0);
  };

  return (
    <div className="[perspective:1100px]">
      <motion.div
        ref={ref}
        onPointerMove={onMove}
        onPointerLeave={onLeave}
        style={disabled ? undefined : {rotateX, rotateY, transformStyle: 'preserve-3d'}}
        className={cn('relative will-transform', className)}
      >
        {children}
        {glare && !disabled && (
          <motion.div
            aria-hidden
            className="pointer-events-none absolute inset-0 rounded-[inherit] mix-blend-overlay"
            style={{background: glareBg, opacity: glareOpacity}}
          />
        )}
      </motion.div>
    </div>
  );
}
