import {create} from 'zustand';

/**
 * - pending: capabilities not detected yet (SSR / first paint)
 * - low:     no WebGL / weak device / reduced motion → 2D fallback
 * - mid:     phones, tablets, modest laptops → light 3D, no post-processing
 * - high:    desktop → full scene + post-processing
 */
export type Tier = 'pending' | 'low' | 'mid' | 'high';

type AppState = {
  tier: Tier;
  reducedMotion: boolean;
  isTouch: boolean;
  /** Preloader finished and the curtain has lifted. */
  loaded: boolean;
  /** The WebGL scene compiled and rendered its first frame. */
  sceneReady: boolean;
  /** Index of the chapter currently in the middle of the viewport. */
  chapter: number;
  navHidden: boolean;
  menuOpen: boolean;
  setCaps: (caps: {tier: Tier; reducedMotion: boolean; isTouch: boolean}) => void;
  setTier: (tier: Tier) => void;
  setLoaded: () => void;
  setSceneReady: () => void;
  setChapter: (chapter: number) => void;
  setNavHidden: (hidden: boolean) => void;
  setMenuOpen: (open: boolean) => void;
};

export const useApp = create<AppState>(set => ({
  tier: 'pending',
  reducedMotion: false,
  isTouch: false,
  loaded: false,
  sceneReady: false,
  chapter: 0,
  navHidden: false,
  menuOpen: false,
  setCaps: caps => set(caps),
  setTier: tier => set({tier}),
  setLoaded: () => set({loaded: true}),
  setSceneReady: () => set({sceneReady: true}),
  setChapter: chapter => set(s => (s.chapter === chapter ? s : {chapter})),
  setNavHidden: navHidden => set(s => (s.navHidden === navHidden ? s : {navHidden})),
  setMenuOpen: menuOpen => set({menuOpen}),
}));

export const use3D = () => useApp(s => s.tier === 'mid' || s.tier === 'high');
export const useMotionOK = () => useApp(s => s.tier !== 'pending' && !s.reducedMotion);
