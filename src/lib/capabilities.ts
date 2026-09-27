import type {Tier} from './store';

type Nav = Navigator & {deviceMemory?: number; connection?: {saveData?: boolean}};

export function detectCapabilities(): {tier: Tier; reducedMotion: boolean; isTouch: boolean} {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isTouch = window.matchMedia('(hover: none), (pointer: coarse)').matches;
  const params = new URLSearchParams(window.location.search);

  let webgl2 = false;
  try {
    webgl2 = !!document.createElement('canvas').getContext('webgl2');
  } catch {
    webgl2 = false;
  }

  const nav = navigator as Nav;
  const cores = nav.hardwareConcurrency ?? 4;
  const memory = nav.deviceMemory ?? 8;
  const saveData = !!nav.connection?.saveData;

  let tier: Tier;
  if (params.has('lite') || reducedMotion || !webgl2 || saveData || cores <= 2 || memory <= 2) {
    tier = 'low';
  } else if (isTouch || window.innerWidth < 900 || cores <= 4 || memory <= 4) {
    tier = 'mid';
  } else {
    tier = 'high';
  }

  return {tier, reducedMotion, isTouch};
}
