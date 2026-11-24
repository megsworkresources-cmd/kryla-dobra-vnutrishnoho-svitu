/**
 * The on-screen keyboard shrinks the visual viewport without shrinking the layout
 * viewport, and `position: fixed` stays glued to the layout viewport. So on iOS the
 * bottom bar ends up behind the keyboard unless we lift it by the gap between the
 * two. The arithmetic lives here, away from the effect that wires it up, so it can
 * be tested without a phone.
 */

import { useEffect, useState } from "react";

export type VisualViewportLike = { height: number; offsetTop: number };

/**
 * Pixels of the layout viewport below the visual viewport's bottom edge. This is
 * the distance a fixed element has to move up to sit just above the keyboard.
 */
export function hiddenBelow(layoutHeight: number, view?: VisualViewportLike | null): number {
  if (!view) return 0;
  return Math.max(0, Math.round(layoutHeight - view.offsetTop - view.height));
}

/**
 * How much shorter the visual viewport is than the layout viewport: the keyboard
 * plus whatever browser chrome the layout viewport still includes.
 */
export function coveredHeight(layoutHeight: number, view?: VisualViewportLike | null): number {
  if (!view) return 0;
  return Math.max(0, Math.round(layoutHeight - view.height));
}

/**
 * A keyboard takes a big bite at once; the URL bar collapsing and settling takes
 * tens of pixels. Below this the page is merely being resized, and lifting the bar
 * would leave it floating in mid-air.
 */
export const KEYBOARD_MIN_INSET = 120;

/**
 * How far to lift the bottom bar, in px: 0 when no keyboard is showing, otherwise
 * the distance to the visual viewport's bottom edge (which changes as iOS pans the
 * page to reach a focused field).
 */
export function keyboardInset(
  layoutHeight: number,
  view?: VisualViewportLike | null,
  minimum = KEYBOARD_MIN_INSET,
): number {
  if (coveredHeight(layoutHeight, view) < minimum) return 0;
  return hiddenBelow(layoutHeight, view);
}

/**
 * Space the page keeps at its end, so the last controls can still be scrolled
 * above the lifted bar instead of hiding behind the keyboard.
 */
export function contentSpacer(barHeight: number, inset: number): number {
  return Math.max(0, Math.round(barHeight)) + Math.max(0, Math.round(inset));
}

/**
 * Publishes the lift as `--kb-inset` and returns it. Reads the visual viewport on
 * every resize and pan; without one (older browsers) nothing changes.
 */
export function useKeyboardInset(): number {
  const [inset, setInset] = useState(0);
  useEffect(() => {
    const root = document.documentElement;
    const update = () => {
      const next = keyboardInset(window.innerHeight, window.visualViewport);
      setInset(next);
      root.style.setProperty("--kb-inset", `${next}px`);
    };
    update();
    const view = window.visualViewport;
    const target: EventTarget = view ?? window;
    target.addEventListener("resize", update);
    if (view) view.addEventListener("scroll", update);
    return () => {
      target.removeEventListener("resize", update);
      if (view) view.removeEventListener("scroll", update);
      root.style.removeProperty("--kb-inset");
    };
  }, []);
  return inset;
}
