'use client';

import {AnimatePresence, motion} from 'motion/react';
import {useEffect} from 'react';
import {chapters, profile} from '@/content/profile';
import {getLenis} from '@/components/providers/runtime';
import {useApp} from '@/lib/store';
import {cn} from '@/lib/utils';
import Magnetic from '@/components/ui/magnetic';

const links = chapters.slice(1);
const ease = [0.19, 1, 0.22, 1] as const;

export default function Nav() {
  const hidden = useApp(s => s.navHidden);
  const chapter = useApp(s => s.chapter);
  const menuOpen = useApp(s => s.menuOpen);
  const setMenuOpen = useApp(s => s.setMenuOpen);
  const loaded = useApp(s => s.loaded);

  useEffect(() => {
    const lenis = getLenis();
    if (menuOpen) lenis?.stop();
    else if (loaded) lenis?.start();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setMenuOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [menuOpen, loaded, setMenuOpen]);

  return (
    <>
      <a
        href="#main"
        className="fixed left-4 top-4 z-[150] -translate-y-20 rounded-full bg-acid px-4 py-2 text-sm font-semibold text-ink-950 focus:translate-y-0"
      >
        Skip to content
      </a>

      <motion.header
        className="fixed inset-x-0 top-0 z-[80] px-4 pt-4 md:px-8 md:pt-6"
        initial={{y: -100}}
        animate={{y: loaded && !hidden ? 0 : -110}}
        transition={{duration: 0.9, ease}}
      >
        <nav aria-label="Primary" className="mx-auto flex max-w-[1600px] items-center justify-between">
          <a href="#top" className="group flex items-center gap-3" aria-label={`${profile.firstName} ${profile.lastName} — back to top`}>
            <span className="grid h-10 w-10 place-items-center rounded-full bg-bone font-display text-sm font-extrabold text-ink-950 transition-transform duration-500 ease-expo group-hover:rotate-[360deg]">
              SB
            </span>
            <span className="hidden font-display text-sm font-semibold tracking-tight sm:block">
              {profile.firstName} {profile.lastName}
            </span>
          </a>

          <div className="glass hidden items-center gap-1 rounded-full p-1.5 md:flex">
            {links.map((l, i) => {
              const active = chapter === i + 1;
              return (
                <a
                  key={l.id}
                  href={`#${l.id}`}
                  aria-current={active ? 'true' : undefined}
                  className={cn(
                    'relative rounded-full px-4 py-2 text-sm transition-colors duration-300',
                    active ? 'text-ink-950' : 'text-bone/70 hover:text-bone'
                  )}
                >
                  {active && (
                    <motion.span
                      layoutId="nav-pill"
                      className="absolute inset-0 rounded-full bg-acid"
                      transition={{type: 'spring', stiffness: 380, damping: 32}}
                    />
                  )}
                  <span className="relative">{l.label}</span>
                </a>
              );
            })}
          </div>

          <div className="flex items-center gap-2">
            <Magnetic strength={0.3} className="hidden sm:inline-block">
              <a
                href={profile.resume}
                target="_blank"
                rel="noopener noreferrer"
                className="glass inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium transition-colors hover:border-acid/50 hover:text-acid"
              >
                Resume <span aria-hidden>↗</span>
              </a>
            </Magnetic>
            <button
              type="button"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              className="glass relative grid h-11 w-11 place-items-center rounded-full md:hidden"
            >
              <span className={cn('absolute h-px w-5 bg-bone transition-transform duration-500 ease-expo', menuOpen ? 'rotate-45' : '-translate-y-1')} />
              <span className={cn('absolute h-px w-5 bg-bone transition-transform duration-500 ease-expo', menuOpen ? '-rotate-45' : 'translate-y-1')} />
            </button>
          </div>
        </nav>
      </motion.header>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            id="mobile-menu"
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
            className="fixed inset-0 z-[70] flex flex-col justify-between bg-ink-950/95 px-6 pb-10 pt-28 backdrop-blur-xl md:hidden"
            initial={{clipPath: 'circle(0% at calc(100% - 2.4rem) 2.4rem)'}}
            animate={{clipPath: 'circle(150% at calc(100% - 2.4rem) 2.4rem)'}}
            exit={{clipPath: 'circle(0% at calc(100% - 2.4rem) 2.4rem)'}}
            transition={{duration: 0.8, ease}}
          >
            <ul className="space-y-2">
              {links.map((l, i) => (
                <li key={l.id} className="overflow-hidden">
                  <motion.a
                    href={`#${l.id}`}
                    className="flex items-baseline gap-4 font-display text-5xl font-bold tracking-tight"
                    initial={{y: '110%'}}
                    animate={{y: 0}}
                    transition={{duration: 0.9, delay: 0.15 + i * 0.06, ease}}
                  >
                    <span className="font-mono text-xs text-acid">0{i + 1}</span>
                    {l.label}
                  </motion.a>
                </li>
              ))}
            </ul>
            <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-mist">
              {profile.socials.map(s => (
                <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" className="hover:text-acid">
                  {s.label}
                </a>
              ))}
              <a href={profile.resume} target="_blank" rel="noopener noreferrer" className="text-acid">
                Resume ↗
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
