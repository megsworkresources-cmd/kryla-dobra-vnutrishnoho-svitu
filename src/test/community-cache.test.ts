import { beforeEach, expect, it, vi } from "vitest";
import { readSavedGarden, saveGarden, SAVE_TTL_MS } from "@/lib/community-cache";

const KEY = "tyhe-mistse-community-garden-v1";

beforeEach(() => window.localStorage.clear());

it("keeps the coarse stages this device last saw and when it saw them", () => {
  expect(readSavedGarden()).toEqual({ stages: [], at: null });
  const before = Date.now();
  expect(saveGarden([0, 3, 5])).toBe(true);
  const saved = readSavedGarden();
  expect(saved.stages).toEqual([0, 3, 5]);
  expect(saved.at).toBeGreaterThanOrEqual(before);
  expect(saved.at).toBeLessThanOrEqual(Date.now());
  expect(saveGarden([])).toBe(true);
  expect(readSavedGarden().stages).toEqual([]);
});

it("drops anything that is not a coarse stage from a saved snapshot", () => {
  window.localStorage.setItem(
    KEY,
    JSON.stringify({
      stages: [{ stage: 1, owner_id: "adult" }, { stage: 6 }, 2, "3"],
      at: Date.now(),
    }),
  );
  expect(readSavedGarden().stages).toEqual([1, 2]);
  window.localStorage.setItem(KEY, "not json");
  expect(readSavedGarden()).toEqual({ stages: [], at: null });
  window.localStorage.setItem(KEY, JSON.stringify(["2"]));
  expect(readSavedGarden()).toEqual({ stages: [], at: null });
});

it("expires a snapshot after a few days instead of showing old flowers", () => {
  window.localStorage.setItem(KEY, JSON.stringify({ stages: [2], at: Date.now() }));
  expect(readSavedGarden().stages).toEqual([2]);

  window.localStorage.setItem(
    KEY,
    JSON.stringify({ stages: [2], at: Date.now() - SAVE_TTL_MS - 60_000 }),
  );
  expect(readSavedGarden()).toEqual({ stages: [], at: null });

  // Just inside the window is still usable.
  window.localStorage.setItem(
    KEY,
    JSON.stringify({ stages: [2], at: Date.now() - SAVE_TTL_MS + 60_000 }),
  );
  expect(readSavedGarden().stages).toEqual([2]);
});

it("treats an undated or impossible save time as expired", () => {
  for (const at of [undefined, "yesterday", -5, 0]) {
    window.localStorage.setItem(KEY, JSON.stringify({ stages: [2], at }));
    expect(readSavedGarden()).toEqual({ stages: [], at: null });
  }
});

it("keeps the page working when storage refuses a write", () => {
  const spy = vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
    throw new Error("full");
  });
  expect(saveGarden([1])).toBe(false);
  spy.mockRestore();
});
