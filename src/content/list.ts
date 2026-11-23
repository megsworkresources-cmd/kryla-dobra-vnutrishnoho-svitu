/** Deterministic fixed-list lookup, including corrupt/non-finite counters and empty data. */
export function itemAtOr<T>(items: readonly T[], index: number, fallback: T): T {
  if (!items.length) return fallback;
  const finite = Number.isFinite(index) ? Math.trunc(index) : 0;
  const slot = ((finite % items.length) + items.length) % items.length;
  return items[slot] ?? fallback;
}
