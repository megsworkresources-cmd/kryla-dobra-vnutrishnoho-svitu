/**
 * iPhone Safari rules for recorded footage and voices, in one place.
 *
 * - It grants muted inline autoplay from the element's attributes, which React sets as
 *   properties, so CSS-size layouts can lose the permission.
 * - It refuses programmatic playback outside a real gesture (Low Power Mode, some
 *   embedded views), so a rejected `play()` is retried on the child's next touch.
 * - It only counts touchend/click/keydown as activation for speech, so a voice retry
 *   asks for those instead of pointerdown.
 */
type Retry = () => void;
export type GestureType = "pointerdown" | "touchend" | "click" | "keydown";

/** Everything a touch, a tap or a key press offers, in the order Safari fires it. */
const ALL_GESTURES: GestureType[] = ["pointerdown", "touchend", "click", "keydown"];

const retries = new Map<Retry, GestureType[]>();
const listening = new Set<GestureType>();

function runRetries(type: GestureType) {
  const due: Retry[] = [];
  for (const [retry, types] of retries) {
    if (!types.includes(type)) continue;
    retries.delete(retry);
    due.push(retry);
  }
  due.forEach((retry) => {
    try {
      retry();
    } catch {
      // A retry that fails again registers itself once more.
    }
  });
}

function listen(type: GestureType) {
  if (listening.has(type) || typeof window === "undefined") return;
  listening.add(type);
  window.addEventListener(type, () => runRetries(type), { capture: true, passive: true });
}

/**
 * Run `retry` inside the next real gesture. Returns a canceller for when the footage
 * leaves the page before the child touches anything.
 */
export function whenTouched(retry: Retry, types: GestureType[] = ALL_GESTURES): () => void {
  retries.set(retry, types);
  for (const type of types) listen(type);
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
