import { describe, expect, it } from "vitest";
import { ORDER, neighbours } from "@/content/sequence";

describe("Back and Next path", () => {
  it("does not route children through Settings, which lives in the top bar", () => {
    expect(ORDER.some((stop) => stop.to === "/settings")).toBe(false);
    expect(neighbours("/settings")).toEqual({ prev: undefined, next: undefined });
  });
});
