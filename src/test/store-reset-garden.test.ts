import { beforeEach, expect, it } from "vitest";
import { readSavedGarden, saveGarden } from "@/lib/community-cache";
import { resetProgress } from "@/lib/store";

beforeEach(() => window.localStorage.clear());

it("drops the cached shared garden when a grown-up clears progress", () => {
  expect(saveGarden([0, 3])).toBe(true);
  expect(readSavedGarden().stages).toEqual([0, 3]);

  resetProgress();

  expect(readSavedGarden()).toEqual({ stages: [], at: null });
});
