/**
 * Telling a tap from the start of a scroll. A finger that travelled was moving
 * the page, not asking for rain or for another star, so only a press that stayed
 * put counts. The rule lives here so every playful surface uses the same slop
 * and the same ownership check instead of drifting apart.
 */

export type Press = { x: number; y: number } | null;

/** How far a finger may drift (both axes added, in px) and still be a tap. */
export const TAP_SLOP = 10;

export function startPress(event: {
  isPrimary?: boolean;
  clientX: number;
  clientY: number;
}): Press {
  // A second finger, or a palm resting on the page, must not take over the press.
  if (event.isPrimary === false) return null;
  return { x: event.clientX, y: event.clientY };
}

export function isTap(
  start: Press,
  event: { isPrimary?: boolean; clientX: number; clientY: number },
): boolean {
  if (!start || event.isPrimary === false) return false;
  return Math.abs(event.clientX - start.x) + Math.abs(event.clientY - start.y) <= TAP_SLOP;
}
