'use client';

import {useEffect, useRef, type ReactNode} from 'react';
import {getLenis} from '@/components/providers/runtime';
import {useApp} from '@/lib/store';

type Props = {open: boolean; onClose: () => void; title: string; children: ReactNode};

/** Native <dialog>: focus trapping, Esc and inert background for free. */
export default function Modal({open, onClose, title, children}: Props) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) {
      d.showModal();
      getLenis()?.stop();
    } else if (!open && d.open) {
      d.close();
    }
    if (!open && useApp.getState().loaded) getLenis()?.start();
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-label={title}
      onClose={onClose}
      onClick={e => e.target === ref.current && onClose()}
      data-lenis-prevent
      className="m-auto max-h-[90svh] w-[min(1000px,94vw)] overflow-y-auto rounded-3xl border border-white/10 bg-ink-800 p-0 text-bone shadow-2xl backdrop:bg-transparent open:animate-[modalin_0.6s_cubic-bezier(0.19,1,0.22,1)]"
    >
      <div className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-white/10 bg-ink-800/90 px-6 py-4 backdrop-blur">
        <p className="font-display text-lg font-semibold">{title}</p>
        <button
          type="button"
          onClick={onClose}
          className="grid h-10 w-10 place-items-center rounded-full border border-white/10 transition-colors hover:border-acid hover:text-acid"
          aria-label="Close dialog"
        >
          ✕
        </button>
      </div>
      <div className="p-6">{children}</div>
    </dialog>
  );
}
