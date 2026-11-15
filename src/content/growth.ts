/**
 * The recorded sunflower clip is the flower the child watches: each of the six
 * garden stages shows the part of the recording from the seed up to that stage,
 * so the picture always matches "how my sunflower looks today".
 */
export const GROWTH_PARTS: readonly { from: number; to: number }[] = [
  { from: 0, to: 0.07 },
  { from: 0, to: 0.24 },
  { from: 0, to: 0.44 },
  { from: 0, to: 0.64 },
  { from: 0, to: 0.84 },
  { from: 0, to: 1 },
];

/** Clamped slice of the recording for a coarse growth stage (0..5). */
export function growthPart(stage: number): { from: number; to: number } {
  const index = Math.min(Math.max(Math.trunc(stage) || 0, 0), GROWTH_PARTS.length - 1);
  return GROWTH_PARTS[index] ?? { from: 0, to: 1 };
}
