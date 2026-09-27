'use client';

import {AnimatePresence, motion} from 'motion/react';
import {useEffect, useRef} from 'react';
import {chapters} from '@/content/profile';
import {gsap} from '@/lib/gsap';
import {scroll} from '@/lib/live';
import {useApp} from '@/lib/store';

/** Right-edge progress rail + bottom-left chapter counter. */
export default function ScrollProgress() {
  const fill = useRef<HTMLDivElement>(null);
  const chapter = useApp(s => s.chapter);
  const loaded = useApp(s => s.loaded);

  useEffect(() => {
    const tick = () => {
      if (fill.current) fill.current.style.transform = `scaleY(${scroll.progress})`;
    };
    gsap.ticker.add(tick);
    return () => gsap.ticker.remove(tick);
  }, []);

  return (
    <div aria-hidden className="pointer-events-none" style={{opacity: loaded ? 1 : 0, transition: 'opacity 1s'}}>
      <div className="fixed right-4 top-1/2 z-[60] hidden h-[38vh] w-px -translate-y-1/2 bg-white/10 md:right-8 md:block">
        <div ref={fill} className="h-full w-full origin-top scale-y-0 bg-acid" />
        {chapters.map((c, i) => (
          <span
            key={c.id}
            className="absolute left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full transition-colors duration-500"
            style={{
              top: `${(i / (chapters.length - 1)) * 100}%`,
              background: i <= chapter ? '#c8ff3d' : 'rgba(255,255,255,0.25)',
            }}
          />
        ))}
      </div>

      <div
        className="fixed bottom-5 left-5 z-[60] hidden items-center gap-3 font-mono text-[11px] uppercase tracking-[0.2em] text-mist transition-opacity duration-500 md:bottom-8 md:left-8 md:flex"
        style={{opacity: chapter === 0 ? 0 : 1}}
      >
        <span className="relative inline-block h-4 w-5 overflow-hidden text-bone">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span
              key={chapter}
              className="absolute inset-0"
              initial={{y: '100%'}}
              animate={{y: 0}}
              exit={{y: '-100%'}}
              transition={{duration: 0.6, ease: [0.19, 1, 0.22, 1]}}
            >
              {String(chapter).padStart(2, '0')}
            </motion.span>
          </AnimatePresence>
        </span>
        <span className="h-px w-8 bg-white/20" />
        <span>{chapters[chapter]?.label}</span>
      </div>
    </div>
  );
}
