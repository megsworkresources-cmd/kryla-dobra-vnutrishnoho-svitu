/**
 * Six coarse stages, from a resting seed to a fully open sunflower. Keeping the
 * thresholds and final-stage helpers together prevents a five-entry "next" list
 * from being indexed by the sixth (full-bloom) stage.
 */
export const FINAL_GROWTH_STAGE = 5;
export const GROWTH_THRESHOLDS = [1, 3, 7, 12, 20] as const;
export const GROWTH_GLYPHS = ["🌰", "🌱", "🌿", "🌿", "🌼", "🌻"] as const;

export function coarseGrowthStage(stage: number): number {
  if (!Number.isFinite(stage)) return 0;
  return Math.min(Math.max(Math.trunc(stage) || 0, 0), FINAL_GROWTH_STAGE);
}

export function isFinalGrowthStage(stage: number): boolean {
  return coarseGrowthStage(stage) === FINAL_GROWTH_STAGE;
}

/** Null at full bloom: there is intentionally no sixth "next" threshold. */
export function nextGrowthThreshold(stage: number): number | null {
  return GROWTH_THRESHOLDS[coarseGrowthStage(stage)] ?? null;
}

export function growthGlyph(stage: number): string {
  return GROWTH_GLYPHS[coarseGrowthStage(stage)] ?? GROWTH_GLYPHS[FINAL_GROWTH_STAGE];
}

/** The recorded clip shows growth from the seed up to the selected stage. */
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
  return GROWTH_PARTS[coarseGrowthStage(stage)] ?? { from: 0, to: 1 };
}
