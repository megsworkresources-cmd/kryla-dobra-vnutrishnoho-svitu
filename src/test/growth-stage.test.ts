import { expect, it } from "vitest";
import { coarseGrowthStage, growthGlyph, growthPart, nextGrowthThreshold } from "@/content/growth";

it("gives all six stages a next threshold except full bloom", () => {
  expect([0, 1, 2, 3, 4, 5].map(nextGrowthThreshold)).toEqual([1, 3, 7, 12, 20, null]);
});

it("clamps malformed stages and always provides the final full-bloom recording", () => {
  expect([-2, 99, Number.NaN, 2.8].map(coarseGrowthStage)).toEqual([0, 5, 0, 2]);
  expect(growthPart(5)).toEqual({ from: 0, to: 1 });
  expect(growthPart(99)).toEqual({ from: 0, to: 1 });
  expect(growthGlyph(5)).toBe("🌻");
});
