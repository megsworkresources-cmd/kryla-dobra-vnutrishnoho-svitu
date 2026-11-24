import { describe, expect, it } from "vitest";
import { isTap, startPress, TAP_SLOP } from "@/lib/press";

const at = (x: number, y: number, isPrimary?: boolean) =>
  isPrimary === undefined ? { clientX: x, clientY: y } : { clientX: x, clientY: y, isPrimary };

describe("tap versus scroll", () => {
  it("counts a finger that stayed put as a tap", () => {
    const start = startPress(at(40, 90));
    expect(isTap(start, at(40, 90))).toBe(true);
    expect(isTap(start, at(46, 94))).toBe(true);
  });

  it("stops counting once the finger has travelled past the slop", () => {
    const start = startPress(at(40, 90));
    expect(isTap(start, at(40, 90 + TAP_SLOP))).toBe(true);
    expect(isTap(start, at(40, 90 + TAP_SLOP + 1))).toBe(false);
    expect(isTap(start, at(40 + 60, 90))).toBe(false);
  });

  it("ignores a second pointer, so a resting palm cannot turn a scroll into a tap", () => {
    expect(startPress(at(40, 90, false))).toBeNull();
    expect(isTap(startPress(at(40, 90)), at(40, 90, false))).toBe(false);
  });

  it("has nothing to compare without a start", () => {
    expect(isTap(null, at(40, 90))).toBe(false);
  });
});
