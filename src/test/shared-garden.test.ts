import { expect, it } from "vitest";
import { sunflowerInput } from "@/lib/shared-garden.schema";
import { growthStage } from "@/lib/store";

it("shares only explicit consent and a stage, rejecting private child fields", () => {
  expect(sunflowerInput.parse({ stage: 3, sharing: true })).toEqual({ stage: 3, sharing: true });
  expect(sunflowerInput.safeParse({ stage: 3, sharing: true, drawings: ["private"] }).success).toBe(
    false,
  );
  expect(sunflowerInput.safeParse({ stage: 3, sharing: true, feelings: "private" }).success).toBe(
    false,
  );
});
it("requires explicit consent and a valid integer growth stage", () => {
  expect(sunflowerInput.safeParse({ stage: 0 }).success).toBe(false);
  for (const stage of [-1, 6, 1.5])
    expect(sunflowerInput.safeParse({ stage, sharing: true }).success).toBe(false);
  expect(sunflowerInput.parse({ stage: 0, sharing: false }).sharing).toBe(false);
});
it("projects existing private completion totals into six coarse stages only", () => {
  expect([0, 1, 3, 7, 12, 20].map(growthStage)).toEqual([0, 1, 2, 3, 4, 5]);
});
