import { beforeEach, expect, it, vi } from "vitest";
import { readSavedStages, saveStages } from "@/lib/community-cache";

const KEY = "tyhe-mistse-community-garden-v1";

beforeEach(() => window.localStorage.clear());

it("keeps the coarse stages this device last saw", () => {
  expect(readSavedStages()).toEqual([]);
  expect(saveStages([0, 3, 5])).toBe(true);
  expect(readSavedStages()).toEqual([0, 3, 5]);
  expect(saveStages([])).toBe(true);
  expect(readSavedStages()).toEqual([]);
});

it("drops anything that is not a coarse stage from a saved snapshot", () => {
  window.localStorage.setItem(
    KEY,
    JSON.stringify({ stages: [{ stage: 1, owner_id: "adult" }, { stage: 6 }, 2, "3"] }),
  );
  expect(readSavedStages()).toEqual([1, 2]);
  window.localStorage.setItem(KEY, "not json");
  expect(readSavedStages()).toEqual([]);
  window.localStorage.setItem(KEY, JSON.stringify(["2"]));
  expect(readSavedStages()).toEqual([]);
});

it("keeps the page working when storage refuses a write", () => {
  const spy = vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
    throw new Error("full");
  });
  expect(saveStages([1])).toBe(false);
  spy.mockRestore();
});
