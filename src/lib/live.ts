/**
 * Per-frame mutable state shared between the DOM cursor, the x-ray lens and the
 * WebGL scene. Kept outside React so reading it every frame never re-renders.
 */

export const LENS_R = 92;

export const pointer = {
  /** raw position (px) */
  x: -9999,
  y: -9999,
  /** damped position (px) — used for the lens and cursor ring */
  lx: -9999,
  ly: -9999,
  /** normalized, damped (-1..1), for parallax */
  nx: 0,
  ny: 0,
  /** px per frame */
  velocity: 0,
  active: false,
};

export const lens = {
  /** current radius (px), eased toward target */
  r: 0,
  /** set by DOM x-ray regions */
  overXray: false,
  /** set by the WebGL scene when the pointer is over the blob */
  overBlob: false,
  /** set by the cursor when over links/buttons (the lens yields to hover states) */
  overInteractive: false,
};

export const scroll = {
  /** 0..1 over the whole page */
  progress: 0,
  /** chapter index + progress towards the next chapter, e.g. 2.4 */
  chapter: 0,
  velocity: 0,
  direction: 1 as 1 | -1,
};

export const lensTarget = () =>
  (lens.overXray || lens.overBlob) && !lens.overInteractive && pointer.active ? LENS_R : 0;
