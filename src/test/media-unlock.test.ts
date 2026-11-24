import { afterEach, describe, expect, it, vi } from "vitest";
import { pendingMediaRetries, primeSilentVideo, whenTouched } from "@/lib/media-unlock";

const cancellers: (() => void)[] = [];

afterEach(() => {
  cancellers.splice(0).forEach((cancel) => cancel());
});

describe("recorded footage on iPhone Safari", () => {
  it("retries blocked playback inside the child's next real gesture", () => {
    const retry = vi.fn();
    cancellers.push(whenTouched(retry));
    expect(pendingMediaRetries()).toBe(1);
    window.dispatchEvent(new Event("pointerdown"));
    expect(retry).toHaveBeenCalledTimes(1);
    // The retry runs once: a child who keeps tapping must not re-trigger old footage.
    expect(pendingMediaRetries()).toBe(0);
    window.dispatchEvent(new Event("pointerdown"));
    expect(retry).toHaveBeenCalledTimes(1);
  });

  it("accepts a keyboard activation too", () => {
    const retry = vi.fn();
    cancellers.push(whenTouched(retry));
    window.dispatchEvent(new Event("keydown"));
    expect(retry).toHaveBeenCalledTimes(1);
  });

  it("forgets a retry whose footage left the page", () => {
    const retry = vi.fn();
    const cancel = whenTouched(retry);
    cancel();
    window.dispatchEvent(new Event("touchend"));
    expect(retry).not.toHaveBeenCalled();
  });

  it("keeps a failing retry out of the way of the others", () => {
    const broken = vi.fn(() => {
      throw new Error("still blocked");
    });
    const healthy = vi.fn();
    cancellers.push(whenTouched(broken), whenTouched(healthy));
    window.dispatchEvent(new Event("pointerdown"));
    expect(broken).toHaveBeenCalledTimes(1);
    expect(healthy).toHaveBeenCalledTimes(1);
  });

  it("marks footage silent and inline for Safari's autoplay rule", () => {
    const el = document.createElement("video");
    primeSilentVideo(el);
    expect(el.muted).toBe(true);
    expect(el.defaultMuted).toBe(true);
    expect(el.hasAttribute("muted")).toBe(true);
    expect(el.hasAttribute("playsinline")).toBe(true);
    expect(el.hasAttribute("webkit-playsinline")).toBe(true);
    primeSilentVideo(null);
  });
});
