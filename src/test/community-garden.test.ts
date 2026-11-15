import { expect, it } from "vitest";
import { cleanStages } from "@/content/community";

it("keeps only coarse stages in the public garden payload", () => {
  expect(cleanStages([{ stage: 0 }, { stage: 5 }, 3])).toEqual([0, 5, 3]);
  expect(cleanStages([{ stage: 6 }, { stage: -1 }, { stage: 2.5 }, { stage: "3" }, null])).toEqual(
    [],
  );
  expect(cleanStages([{ id: "secret", stage: 4, owner_id: "adult" }])).toEqual([4]);
});

it("survives malformed payloads without throwing", () => {
  expect(cleanStages(undefined)).toEqual([]);
  expect(cleanStages(null)).toEqual([]);
  expect(cleanStages("stages")).toEqual([]);
  expect(cleanStages({ stage: 3 })).toEqual([]);
});

it("bounds how many flowers a child's page renders", () => {
  expect(cleanStages(Array.from({ length: 200 }, () => ({ stage: 2 })))).toHaveLength(60);
  expect(cleanStages([{ stage: 1 }, { stage: 1 }, { stage: 1 }], 2)).toEqual([1, 1]);
});
