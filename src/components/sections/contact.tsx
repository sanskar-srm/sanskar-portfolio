'use client';

import {AnimatePresence, motion} from 'motion/react';
import {useState, type FormEvent} from 'react';
import {sendEmailAction} from '@/app/actions';
import {profile} from '@/content/profile';
import Magnetic from '@/components/ui/magnetic';
import {Eyebrow, FadeIn, SplitReveal} from '@/components/ui/reveal';

type Status = {kind: 'idle' | 'sending' | 'ok' | 'error'; message?: string};

export default function Contact() {
  const [status, setStatus] = useState<Status>({kind: 'idle'});

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    setStatus({kind: 'sending'});
    const result = await sendEmailAction({
      name: String(data.get('name') ?? ''),
      email: String(data.get('email') ?? ''),
      message: String(data.get('message') ?? ''),
    });
    if (result.success) {
      setStatus({kind: 'ok', message: "Message sent! Thanks for reaching out. I'll get back to you soon."});
      form.reset();
    } else {
      setStatus({kind: 'error', message: result.error ?? 'Something went wrong. Please email me directly.'});
    }
  };

  return (
    <section id="contact" data-chapter aria-labelledby="contact-title" className="relative pb-10 pt-28 md:pt-40">
      <div className="mx-auto max-w-[1600px] px-5 md:px-10">
        <Eyebrow index="05">Get in touch</Eyebrow>
        <SplitReveal as="h2" id="contact-title" mode="chars" className="mt-8 font-display text-mega font-extrabold uppercase">
          Let&apos;s build
          <br />
          <span className="font-serif font-normal normal-case italic text-acid">something</span> together
        </SplitReveal>

        <FadeIn className="mt-12 md:mt-16">
          <Magnetic strength={0.2} className="w-full sm:w-auto">
            <a
              href={`mailto:${profile.email}`}
              data-cursor="Email"
              className="group relative flex items-center justify-between gap-6 overflow-hidden rounded-full border border-white/15 px-6 py-5 sm:inline-flex md:px-10 md:py-7"
            >
              <span className="absolute inset-0 origin-bottom scale-y-0 bg-acid transition-transform duration-700 ease-expo group-hover:scale-y-100" />
              <span className="relative truncate font-display text-[clamp(0.9rem,3.9vw,1.875rem)] font-semibold tracking-tight transition-colors duration-500 group-hover:text-ink-950">
                {profile.email}
              </span>
              <span className="relative grid h-10 w-10 shrink-0 place-items-center rounded-full bg-acid text-ink-950 transition-all duration-500 group-hover:rotate-45 group-hover:bg-ink-950 group-hover:text-acid md:h-14 md:w-14" aria-hidden>
                ↗
              </span>
            </a>
          </Magnetic>
        </FadeIn>

        <div className="mt-20 grid gap-16 lg:grid-cols-12">
          <FadeIn className="lg:col-span-5">
            <p className="max-w-md text-lg leading-relaxed text-bone/65">{profile.contactBlurb}</p>
            <ul className="mt-10 border-t border-white/10">
              {profile.socials.map(s => (
                <li key={s.label} className="border-b border-white/10">
                  <a
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center justify-between py-5 font-display text-2xl font-semibold tracking-tight transition-colors hover:text-acid md:text-3xl"
                  >
                    <span className="transition-transform duration-500 ease-expo group-hover:translate-x-3">{s.label}</span>
                    <span className="text-mist transition-all duration-500 ease-expo group-hover:rotate-45 group-hover:text-acid" aria-hidden>
                      ↗
                    </span>
                    <span className="sr-only">(opens in a new tab)</span>
                  </a>
                </li>
              ))}
            </ul>
          </FadeIn>

          <FadeIn delay={0.1} className="lg:col-span-7">
            <form onSubmit={onSubmit} className="glass space-y-5 rounded-[28px] p-6 md:p-10" aria-describedby="form-status">
              <div className="grid gap-5 md:grid-cols-2">
                <div className="space-y-2">
                  <label htmlFor="name" className="eyebrow block">
                    Name
                  </label>
                  <input id="name" name="name" required autoComplete="name" placeholder="Your name" className="input-field" />
                </div>
                <div className="space-y-2">
                  <label htmlFor="email" className="eyebrow block">
                    Email
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    autoComplete="email"
                    placeholder="your.email@example.com"
                    className="input-field"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label htmlFor="message" className="eyebrow block">
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  required
                  rows={6}
                  placeholder="Tell me about your project…"
                  className="input-field resize-none"
                  data-lenis-prevent
                />
              </div>
              <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
                <p id="form-status" role="status" aria-live="polite" className="min-h-6 text-sm">
                  <AnimatePresence mode="wait">
                    {status.message && (
                      <motion.span
                        key={status.kind}
                        initial={{opacity: 0, y: 8}}
                        animate={{opacity: 1, y: 0}}
                        exit={{opacity: 0}}
                        className={status.kind === 'ok' ? 'text-acid' : 'text-red-400'}
                      >
                        {status.message}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </p>
                <Magnetic strength={0.3}>
                  <button
                    type="submit"
                    disabled={status.kind === 'sending'}
                    className="group relative inline-flex items-center gap-3 overflow-hidden rounded-full bg-acid px-8 py-4 font-medium text-ink-950 disabled:opacity-60"
                  >
                    <span className="absolute inset-0 translate-y-full rounded-full bg-bone transition-transform duration-500 ease-expo group-hover:translate-y-0" />
                    <span className="relative">{status.kind === 'sending' ? 'Sending…' : 'Send message'}</span>
                    <span className="relative" aria-hidden>
                      →
                    </span>
                  </button>
                </Magnetic>
              </div>
            </form>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}
