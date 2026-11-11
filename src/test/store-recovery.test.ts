import { describe, expect, it, vi } from "vitest";

describe("saved device settings recovery", () => {
  it("reports unavailable device storage without discarding the current drawing", async () => {
    vi.resetModules();
    localStorage.clear();
    const { addDrawing, getState } = await import("@/lib/store");
    const spy = vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => { throw new Error("quota"); });
    expect(addDrawing("data:image/jpeg;base64,example")).toBe(false);
    expect(getState().drawings).toHaveLength(1);
    spy.mockRestore();
  });
  it("ignores malformed progress values while preserving valid progress and the original storage", async () => {
    vi.resetModules();
    const raw = JSON.stringify({
      completed: { flower: 3, corrupt: "7", negative: -2, nested: {} },
    });
    localStorage.setItem("tyhe-mistse-v1", raw);
    const { getState, totalDone } = await import("@/lib/store");
    expect(totalDone(getState().completed)).toBe(3);
    expect(localStorage.getItem("tyhe-mistse-v1")).toBe(raw);
  });
  it("recovers invalid settings without losing valid device drawings or progress", async () => {
    vi.resetModules();
    const drawing = { id: "saved", data: "data:image/jpeg;base64,example", at: 123 };
    const raw = JSON.stringify({
      volume: 4,
      musicStyle: "missing",
      favorites: null,
      completed: { flower: 2 },
      drawings: [drawing],
    });
    localStorage.setItem("tyhe-mistse-v1", raw);
    const { getState } = await import("@/lib/store");
    const state = getState();
    expect(state.volume).toBe(1);
    expect(state.musicStyle).toBe("bandura");
    expect(state.favorites).toEqual([]);
    expect(state.completed).toEqual({ flower: 2 });
    expect(state.drawings).toEqual([drawing]);
    expect(localStorage.getItem("tyhe-mistse-v1")).toBe(raw);
  });
});
