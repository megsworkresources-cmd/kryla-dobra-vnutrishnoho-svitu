import { expect, it } from "vitest";
import { canWater, localDay } from "@/content/watering";
import { careCount, getState, update, waterFlower } from "@/lib/store";

it("uses the child's own local day, not UTC", () => {
  expect(localDay(new Date(2026, 0, 5, 0, 5))).toBe("2026-01-05");
  expect(localDay(new Date(2026, 10, 15, 23, 59))).toBe("2026-11-15");
  expect(localDay(new Date(2026, 10, 16, 0, 0))).toBe("2026-11-16");
});

it("lets the flower be watered once a day and never twice", () => {
  expect(canWater(null, "2026-11-15")).toBe(true);
  expect(canWater("2026-11-14", "2026-11-15")).toBe(true);
  expect(canWater("2026-11-15", "2026-11-15")).toBe(false);
});

it("adds one care step per day and keeps it on the device", () => {
  update((s) => ({ ...s, completed: {}, careSteps: 0, wateredOn: null }));
  waterFlower("2026-11-15");
  expect(getState().careSteps).toBe(1);
  expect(getState().wateredOn).toBe("2026-11-15");
  expect(careCount(getState())).toBe(1);

  waterFlower("2026-11-15");
  expect(getState().careSteps).toBe(1);

  waterFlower("2026-11-16");
  expect(getState().careSteps).toBe(2);
  expect(careCount(getState())).toBe(2);
});
