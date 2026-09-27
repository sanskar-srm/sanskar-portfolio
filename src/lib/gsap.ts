'use client';

import gsap from 'gsap';
import {ScrollTrigger} from 'gsap/ScrollTrigger';
import {SplitText} from 'gsap/SplitText';
import {useGSAP} from '@gsap/react';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger, SplitText, useGSAP);
  gsap.defaults({ease: 'expo.out', duration: 1.2});
}

/**
 * Re-sort and re-measure every trigger on the next frame. Call whenever a pin is
 * created or removed: a pin added after later triggers were measured shifts the
 * whole page, and those triggers would otherwise keep stale start/end values.
 */
let queued = 0;
export function queueRefresh() {
  if (typeof window === 'undefined') return;
  cancelAnimationFrame(queued);
  queued = requestAnimationFrame(() => {
    ScrollTrigger.sort();
    ScrollTrigger.refresh();
  });
}

export {gsap, ScrollTrigger, SplitText, useGSAP};
