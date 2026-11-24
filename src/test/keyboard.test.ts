import { describe, expect, it } from "vitest";
import {
  contentSpacer,
  coveredHeight,
  hiddenBelow,
  KEYBOARD_MIN_INSET,
  keyboardInset,
} from "@/lib/keyboard";

// A 700px layout viewport with a 300px keyboard: iOS leaves innerHeight alone and
// only the visual viewport gets shorter.
const layout = 700;

describe("on-screen keyboard", () => {
  it("lifts the bar by the gap under the visual viewport", () => {
    expect(hiddenBelow(layout, { height: 400, offsetTop: 0 })).toBe(300);
    expect(keyboardInset(layout, { height: 400, offsetTop: 0 })).toBe(300);
  });

  it("follows the page as iOS pans it to reach a focused field", () => {
    const panned = { height: 400, offsetTop: 120 };
    expect(coveredHeight(layout, panned)).toBe(300);
    expect(hiddenBelow(layout, panned)).toBe(180);
    expect(keyboardInset(layout, panned)).toBe(180);
  });

  it("ignores the URL bar, which takes tens of pixels rather than hundreds", () => {
    const chrome = { height: layout - 60, offsetTop: 0 };
    expect(coveredHeight(layout, chrome)).toBe(60);
    expect(keyboardInset(layout, chrome)).toBe(0);
    expect(keyboardInset(layout, { height: layout - KEYBOARD_MIN_INSET + 1, offsetTop: 0 })).toBe(
      0,
    );
    expect(keyboardInset(layout, { height: layout - KEYBOARD_MIN_INSET, offsetTop: 0 })).toBe(
      KEYBOARD_MIN_INSET,
    );
  });

  it("stays put while pinch-zoomed, which shortens the viewport for another reason", () => {
    // Zoomed to 2x the visual viewport is half as tall, but no keyboard is up.
    const zoomed = { height: 350, offsetTop: 0, scale: 2 };
    expect(coveredHeight(layout, zoomed)).toBe(350);
    expect(hiddenBelow(layout, zoomed)).toBe(350);
    expect(keyboardInset(layout, zoomed)).toBe(0);
    expect(keyboardInset(layout, { height: 350, offsetTop: 0, scale: 2.5 })).toBe(0);
    // Sub-percent rounding is not a pinch.
    expect(keyboardInset(layout, { height: 400, offsetTop: 0, scale: 1.005 })).toBe(300);
    expect(keyboardInset(layout, { height: 400, offsetTop: 0, scale: 1 })).toBe(300);
  });

  it("stays at zero when there is nothing to measure", () => {
    expect(keyboardInset(layout, null)).toBe(0);
    expect(keyboardInset(layout, undefined)).toBe(0);
    expect(hiddenBelow(layout, { height: layout, offsetTop: 0 })).toBe(0);
    // Zoomed out past the layout viewport: never a negative lift.
    expect(hiddenBelow(400, { height: 500, offsetTop: -40 })).toBe(0);
    expect(keyboardInset(400, { height: 500, offsetTop: -40 })).toBe(0);
  });

  it("keeps room at the end of the page for the bar plus the keyboard", () => {
    expect(contentSpacer(151, 300)).toBe(451);
    expect(contentSpacer(151, 0)).toBe(151);
    expect(contentSpacer(151, -20)).toBe(151);
  });
});
