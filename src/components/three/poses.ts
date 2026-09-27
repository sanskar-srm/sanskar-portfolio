/**
 * Where the blob sits, and how it looks, for each scroll chapter.
 * The scene interpolates between consecutive poses as the next chapter approaches.
 */
export type Pose = {
  pos: [number, number, number];
  scale: number;
  distort: number;
  freq: number;
  speed: number;
  spin: number;
  colorA: string;
  colorB: string;
  colorC: string;
  /** overall brightness, so the blob can recede behind dense content */
  intensity: number;
};

export const desktopPoses: Pose[] = [
  // 0 hero — right of the headline
  {pos: [2.2, 0.05, -0.3], scale: 1.12, distort: 0.3, freq: 1.05, speed: 0.22, spin: 0.12, colorA: '#2a1266', colorB: '#9d5cff', colorC: '#c8ff3d', intensity: 1},
  // 1 about — slips behind the portrait and peeks around it
  {pos: [2.35, 0.05, -2.6], scale: 1.3, distort: 0.22, freq: 1.4, speed: 0.18, spin: 0.2, colorA: '#150a3a', colorB: '#6d3cf0', colorC: '#c8ff3d', intensity: 0.95},
  // 2 skills — swells into a dim core far behind the grid
  {pos: [0, -0.3, -6.5], scale: 2.6, distort: 0.5, freq: 0.7, speed: 0.16, spin: 0.08, colorA: '#07070f', colorB: '#2a1570', colorC: '#5b2bd6', intensity: 0.42},
  // 3 work — sinks below the fold and dims, leaving the stage to the phone and the gallery
  {pos: [0.6, -4.5, -5.5], scale: 0.85, distort: 0.38, freq: 1.6, speed: 0.34, spin: 0.45, colorA: '#1a0f45', colorB: '#b27bff', colorC: '#c8ff3d', intensity: 0.5},
  // 4 journey — sinks bottom-left, under the sticky column
  {pos: [-2.9, -1.35, -2.4], scale: 0.9, distort: 0.24, freq: 1.2, speed: 0.2, spin: 0.16, colorA: '#101424', colorB: '#5b2bd6', colorC: '#c8ff3d', intensity: 0.75},
  // 5 contact — acid, calm, behind the CTA
  {pos: [1.55, -0.45, -0.6], scale: 1.25, distort: 0.28, freq: 0.95, speed: 0.2, spin: 0.1, colorA: '#18230a', colorB: '#8fcc1f', colorC: '#9d5cff', intensity: 0.9},
];

/** Narrow screens: after the hero the blob peeks in from alternating edges, behind the copy. */
const mobileX = [0.15, 1.15, 0, -1.3, 1.15, 0.95];
const mobileY = [0.75, 0.4, 0, -2.6, -0.6, -1.2];
export const mobilePoses: Pose[] = desktopPoses.map((p, i) => ({
  ...p,
  pos: [mobileX[i], mobileY[i], p.pos[2] - 1.2],
  scale: p.scale * (i === 0 ? 0.6 : 0.7),
  intensity: i === 0 ? p.intensity : p.intensity * 0.55,
}));
