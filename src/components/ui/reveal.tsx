'use client';

import {motion} from 'motion/react';
import {useRef, type ReactNode} from 'react';
import {gsap, SplitText, useGSAP} from '@/lib/gsap';
import {useApp} from '@/lib/store';
import {cn} from '@/lib/utils';

type SplitProps = {
  children: ReactNode;
  as?: 'div' | 'h1' | 'h2' | 'h3' | 'p';
  id?: string;
  className?: string;
  /** lines slide up behind a mask; chars stagger in; words blur in */
  mode?: 'lines' | 'chars' | 'words';
  delay?: number;
  /** ScrollTrigger start */
  start?: string;
};

/**
 * SplitText reveal on scroll. Text is fully visible in the SSR HTML and for
 * reduced motion — animation only hides it once JS decides to play it.
 */
export function SplitReveal({children, as: Tag = 'div', id, className, mode = 'lines', delay = 0, start = 'top 85%'}: SplitProps) {
  const ref = useRef<HTMLDivElement>(null);
  // Any block tag works at runtime; typed as div to keep the ref simple.
  const Comp = Tag as 'div';
  // Only whether capabilities are known — a later tier downgrade must not rebuild pins.
  const tier = useApp(s => (s.tier === 'pending' ? 'pending' : 'ready'));
  const reducedMotion = useApp(s => s.reducedMotion);
  const loaded = useApp(s => s.loaded);

  useGSAP(
    () => {
      if (tier === 'pending' || reducedMotion || !loaded || !ref.current) return;
      const el = ref.current;
      const split = SplitText.create(el, {
        type: mode === 'chars' ? 'lines,words,chars' : mode === 'words' ? 'lines,words' : 'lines',
        mask: 'lines',
        linesClass: 'split-line',
        wordsClass: 'split-word',
        autoSplit: true,
        onSplit(self) {
          const targets = mode === 'chars' ? self.chars : mode === 'words' ? self.words : self.lines;
          const from =
            mode === 'words'
              ? {yPercent: 60, opacity: 0, filter: 'blur(10px)'}
              : {yPercent: 115, rotate: mode === 'chars' ? 6 : 2};
          return gsap.from(targets, {
            ...from,
            duration: mode === 'chars' ? 1.1 : 1.3,
            stagger: mode === 'chars' ? 0.022 : mode === 'words' ? 0.03 : 0.1,
            delay,
            ease: 'expo.out',
            scrollTrigger: {trigger: el, start, once: true},
          });
        },
      });
      return () => split.revert();
    },
    {dependencies: [tier, reducedMotion, loaded], scope: ref}
  );

  return (
    <Comp ref={ref} id={id} className={className}>
      {children}
    </Comp>
  );
}

/** Blur + slide-up on enter, for non-text blocks. */
export function FadeIn({
  children,
  className,
  delay = 0,
  y = 40,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
}) {
  const reducedMotion = useApp(s => s.reducedMotion);
  if (reducedMotion) return <div className={className}>{children}</div>;
  return (
    <motion.div
      className={cn(className)}
      initial={{opacity: 0, y, filter: 'blur(8px)'}}
      whileInView={{opacity: 1, y: 0, filter: 'blur(0px)'}}
      viewport={{once: true, margin: '0px 0px -12% 0px'}}
      transition={{duration: 1.1, delay, ease: [0.19, 1, 0.22, 1]}}
    >
      {children}
    </motion.div>
  );
}

/** Section eyebrow: "01 — About" with a drawn rule. */
export function Eyebrow({index, children, className}: {index: string; children: ReactNode; className?: string}) {
  return (
    <FadeIn y={16} className={cn('flex items-center gap-4', className)}>
      <span className="font-mono text-xs text-acid">{index}</span>
      <span className="h-px w-10 bg-white/20" />
      <span className="eyebrow">{children}</span>
    </FadeIn>
  );
}
