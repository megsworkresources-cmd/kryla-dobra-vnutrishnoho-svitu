import { describe, expect, it, vi } from "vitest";

describe("saved device settings recovery", () => {
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
