import { describe, it, expect } from "vitest";
import { EMOTIONS, emotionAt } from "@/content/emotions";

describe("emotionAt", () => {
  it("returns the same first emotion the forest starts with", () => {
    expect(emotionAt(0).id).toBe(EMOTIONS[0]?.id);
  });
  it("falls back to the first emotion instead of undefined", () => {
    expect(emotionAt(EMOTIONS.length).id).toBe(EMOTIONS[0]?.id);
  });
});
