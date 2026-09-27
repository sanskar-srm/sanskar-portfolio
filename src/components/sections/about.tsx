'use client';

import Image from 'next/image';
import {useRef} from 'react';
import {milestoneGroups} from '@/content/milestones';
import {profile} from '@/content/profile';
import {appProjects, projects} from '@/content/projects';
import {skills} from '@/content/skills';
import {gsap, queueRefresh, useGSAP} from '@/lib/gsap';
import {useApp} from '@/lib/store';
import CountUp from '@/components/ui/count-up';
import {Eyebrow} from '@/components/ui/reveal';
import XRay from '@/components/ui/xray';

const count = (key: string) => milestoneGroups.find(g => g.key === key)?.items.length ?? 0;

const stats = [
  {value: projects.length + appProjects.length, label: 'Featured projects'},
  {value: count('hackathons'), label: 'Hackathons'},
  {value: count('bootcamps') + count('courses'), label: 'Certifications & courses'},
  {value: skills.length, label: 'Core technologies'},
];

/** Deterministic 0/1 rows (same on server and client, so no hydration mismatch). */
const BINARY_ROWS = Array.from({length: 16}, (_, r) =>
  Array.from({length: 28}, (_, c) => ((Math.imul(r + 1, 2654435761) ^ Math.imul(c + 7, 40503)) >>> 7) & 1).join('')
);

/**
 * Skull + bones drawn in the portrait's 4:5 frame (viewBox 400×500), aligned to the
 * face in /profile.jpg (object-cover, object-top): eyes ≈ (182,310)/(266,312), chin ≈ (218,445).
 * Binary code scrolls inside the cranium where the brain would be.
 */
function Skeleton({animate}: {animate: boolean}) {
  const bone = {fill: 'rgba(7,7,10,0.16)', stroke: '#07070a', strokeWidth: 2.2, strokeLinejoin: 'round' as const};
  return (
    <svg viewBox="0 0 400 500" className="absolute inset-0 h-full w-full" aria-hidden>
      <defs>
        <clipPath id="xray-brain">
          <ellipse cx="222" cy="240" rx="74" ry="44" />
        </clipPath>
      </defs>
      <g transform="rotate(2.5 222 320)">
        {/* cranium + face */}
        <path
          {...bone}
          d="M140 300C128 230 168 188 222 188C276 188 316 230 304 300C301 318 298 330 296 342C294 372 284 398 268 418C254 434 240 444 222 446C204 444 190 434 176 418C160 398 150 372 148 342C146 330 143 318 140 300Z"
        />
        {/* brain: binary code */}
        <g clipPath="url(#xray-brain)">
          <g fontFamily="ui-monospace, monospace" fontSize="7.5" fontWeight="600" fill="#07070a" textAnchor="middle" opacity="0.85">
            {animate && <animateTransform attributeName="transform" type="translate" from="0 0" to="0 -128" dur="12s" repeatCount="indefinite" />}
            {[...BINARY_ROWS, ...BINARY_ROWS].map((row, i) => (
              <text key={i} x="222" y={198 + i * 8} letterSpacing="0.6">
                {row}
              </text>
            ))}
          </g>
        </g>
        <ellipse cx="222" cy="240" rx="74" ry="44" fill="none" stroke="#07070a" strokeWidth="1" strokeDasharray="2 3" opacity="0.6" />
        {/* coronal suture */}
        <path d="M146 262l8-5 7 4 8-6 7 4 8-5 8 3 8-4 8 3 9-3 8 3 8-4 8 4 8-3 8 5 7-4 8 6 7-4 8 5" fill="none" stroke="#07070a" strokeWidth="1.2" opacity="0.7" />
        {/* eye sockets */}
        <ellipse cx="182" cy="310" rx="27" ry="22" fill="rgba(7,7,10,0.82)" stroke="#07070a" strokeWidth="2.2" />
        <ellipse cx="266" cy="312" rx="27" ry="22" fill="rgba(7,7,10,0.82)" stroke="#07070a" strokeWidth="2.2" />
        {/* nasal cavity */}
        <path d="M222 328C214 340 209 352 212 360Q222 366 232 360C235 352 230 340 222 328Z" fill="rgba(7,7,10,0.82)" stroke="#07070a" strokeWidth="1.8" />
        {/* cheekbones */}
        <path d="M150 334Q170 352 196 343M294 336Q274 354 248 345" fill="none" stroke="#07070a" strokeWidth="1.8" strokeLinecap="round" />
        {/* jaw hinge + mandible */}
        <path d="M156 380Q176 404 198 404M288 380Q268 404 246 404" fill="none" stroke="#07070a" strokeWidth="1.6" strokeLinecap="round" />
        {/* teeth */}
        <g stroke="#07070a" strokeWidth="1.3" fill="rgba(7,7,10,0.1)">
          {Array.from({length: 8}, (_, i) => (
            <rect key={`u${i}`} x={190 + i * 8} y="372" width="8" height="13" rx="2" />
          ))}
          {Array.from({length: 7}, (_, i) => (
            <rect key={`l${i}`} x={194 + i * 8} y="387" width="8" height="11" rx="2" />
          ))}
        </g>
        {/* cervical vertebrae */}
        {Array.from({length: 4}, (_, i) => (
          <g key={`v${i}`} {...bone} strokeWidth={1.8}>
            <rect x="206" y={452 + i * 13} width="30" height="10" rx="3" />
            <rect x="196" y={455 + i * 13} width="10" height="4" rx="2" />
            <rect x="236" y={455 + i * 13} width="10" height="4" rx="2" />
          </g>
        ))}
      </g>
      {/* clavicles + sternum notch */}
      <path d="M216 494C188 486 146 480 96 486M228 494C256 486 298 480 348 486" fill="none" stroke="#07070a" strokeWidth="5" strokeLinecap="round" />
      <path d="M216 494C188 486 146 480 96 486M228 494C256 486 298 480 348 486" fill="none" stroke="rgba(200,255,61,0.6)" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function PortraitXRay() {
  const reducedMotion = useApp(s => s.reducedMotion);
  return (
    <div className="absolute inset-0 overflow-hidden bg-ink-950">
      <Image
        src={profile.photo}
        alt=""
        fill
        sizes="(max-width: 1024px) 90vw, 36vw"
        className="object-cover object-top [filter:grayscale(1)_invert(1)_contrast(1.7)_brightness(0.95)]"
      />
      <div className="absolute inset-0 bg-acid mix-blend-multiply" />
      <div className="grid-bp absolute inset-0 opacity-70" />
      <div className="scanlines absolute inset-0" />
      <Skeleton animate={!reducedMotion} />
      <div className="absolute left-4 top-4 space-y-1 font-mono text-[10px] uppercase leading-relaxed text-ink-950">
        <p>subject: {profile.firstName} {profile.lastName}</p>
        <p>role: {profile.role}</p>
        <p>status: building</p>
      </div>
      <div className="absolute bottom-4 right-4 font-mono text-[10px] uppercase text-ink-950">scan 01 / xray</div>
      {/* corner brackets */}
      {['left-3 top-3 border-l border-t', 'right-3 top-3 border-r border-t', 'left-3 bottom-3 border-l border-b', 'right-3 bottom-3 border-r border-b'].map(c => (
        <span key={c} className={`absolute h-6 w-6 border-ink-950 ${c}`} />
      ))}
    </div>
  );
}

export default function About() {
  const root = useRef<HTMLElement>(null);
  const pin = useRef<HTMLDivElement>(null);
  // Only whether capabilities are known — a later tier downgrade must not rebuild pins.
  const tier = useApp(s => (s.tier === 'pending' ? 'pending' : 'ready'));
  const reducedMotion = useApp(s => s.reducedMotion);
  const loaded = useApp(s => s.loaded);

  useGSAP(
    () => {
      if (tier === 'pending' || reducedMotion || !loaded) return;
      const q = gsap.utils.selector(root);
      const words = q('[data-word]');
      const mm = gsap.matchMedia();

      // Desktop: pin the whole chapter while the statement "reads itself".
      mm.add('(min-width: 1024px)', () => {
        const tl = gsap.timeline({
          scrollTrigger: {trigger: pin.current, start: 'top top', end: '+=130%', scrub: 0.6, pin: true, anticipatePin: 1, refreshPriority: 3},
        });
        tl.fromTo(words, {opacity: 0.12}, {opacity: 1, stagger: 0.05, ease: 'none'}, 0)
          .fromTo(q('[data-portrait]'), {scale: 1.18, filter: 'saturate(0.2)'}, {scale: 1, filter: 'saturate(1)', ease: 'none'}, 0)
          .fromTo(q('[data-portrait-frame]'), {clipPath: 'inset(12% 12% 12% 12% round 24px)'}, {clipPath: 'inset(0% 0% 0% 0% round 24px)', ease: 'none'}, 0);
      });
      // Mobile: same read-along, no pin
      mm.add('(max-width: 1023px)', () => {
        gsap.fromTo(words, {opacity: 0.12}, {
          opacity: 1,
          stagger: 0.05,
          ease: 'none',
          scrollTrigger: {trigger: q('[data-statement]')[0], start: 'top 80%', end: 'bottom 45%', scrub: 0.6},
        });
      });
      queueRefresh();
      return () => {
        mm.revert();
        queueRefresh();
      };
    },
    {dependencies: [tier, reducedMotion, loaded], scope: root}
  );

  return (
    <section ref={root} id="about" data-chapter aria-labelledby="about-title" className="relative">
      <div ref={pin} className="relative flex min-h-[100svh] items-center px-5 py-24 md:px-10">
        <div className="mx-auto grid w-full max-w-[1600px] items-center gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-7">
            <Eyebrow index="01">About</Eyebrow>
            <h2 id="about-title" className="sr-only">
              About me
            </h2>
            <p
              data-statement
              className="mt-8 font-display text-[clamp(1.6rem,3.1vw,3.1rem)] font-semibold leading-[1.12] tracking-[-0.025em]"
            >
              {profile.bio.split(' ').map((w, i) => (
                <span key={i} data-word className="inline-block">
                  {w}&nbsp;
                </span>
              ))}
            </p>

            <ul className="mt-10 flex flex-wrap gap-2" aria-label="What I build">
              {profile.disciplines.map((d, i) => (
                <li key={d} className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-bone/80">
                  <span className="font-mono text-[10px] text-acid">0{i + 1}</span>
                  {d}
                </li>
              ))}
            </ul>

            <dl className="mt-12 grid grid-cols-2 gap-x-8 gap-y-10 border-t border-white/10 pt-10 sm:grid-cols-4">
              {stats.map(s => (
                <div key={s.label} className="flex flex-col">
                  <dt className="eyebrow order-2 mt-3">{s.label}</dt>
                  <dd className="order-1 font-display text-5xl font-bold tracking-tight md:text-6xl">
                    <CountUp value={s.value} />
                    <span className="text-acid">+</span>
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="lg:col-span-5">
            <div data-portrait-frame className="relative mx-auto aspect-[4/5] max-w-md overflow-hidden rounded-3xl border border-white/10">
              <XRay reveal={<PortraitXRay />} className="h-full w-full" hint="Tap to x-ray">
                <div data-portrait className="relative h-full w-full">
                  <Image
                    src={profile.photo}
                    alt={`Portrait of ${profile.firstName} ${profile.lastName}`}
                    fill
                    priority
                    sizes="(max-width: 1024px) 90vw, 36vw"
                    className="object-cover object-top"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink-950/70 via-transparent to-transparent" />
                </div>
              </XRay>
              <div className="pointer-events-none absolute bottom-5 left-5 z-20 flex items-center [@media(hover:none)]:hidden gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-bone/80">
                <span className="h-1.5 w-1.5 rounded-full bg-acid" /> Hover to x-ray
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
