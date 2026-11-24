/**
 * iPhone Safari rules for recorded footage, in one place.
 *
 * - It grants muted inline autoplay from the element's attributes, which React sets as
 *   properties, so CSS-size layouts can lose the permission.
 * - It refuses programmatic playback outside a real gesture (Low Power Mode, some
 *   embedded views), so a rejected `play()` is retried on the child's next touch.
 */
type Retry = () => void;

const retries = new Set<Retry>();
let listening = false;

function runRetries() {
  if (retries.size === 0) return;
  const pending = [...retries];
  retries.clear();
  pending.forEach((retry) => {
    try {
      retry();
    } catch {
      // A retry that fails again registers itself once more.
    }
  });
}

/**
 * Run `retry` inside the next real gesture. Returns a canceller for when the footage
 * leaves the page before the child touches anything.
 */
export function whenTouched(retry: Retry): () => void {
  retries.add(retry);
  if (!listening && typeof window !== "undefined") {
    listening = true;
    for (const type of ["pointerdown", "touchend", "keydown"] as const)
      window.addEventListener(type, runRetries, { capture: true, passive: true });
  }
  return () => {
    retries.delete(retry);
  };
}

export function pendingMediaRetries() {
  return retries.size;
}

/** Silent, inline and attribute-marked, so Safari allows the first frame by itself. */
export function primeSilentVideo(el: HTMLVideoElement | null) {
  if (!el) return;
  el.defaultMuted = true;
  el.muted = true;
  for (const attr of ["muted", "playsinline", "webkit-playsinline"] as const) {
    if (!el.hasAttribute(attr)) el.setAttribute(attr, "");
  }
}
