/**
 * The public community garden carries coarse growth stages only. Keep the
 * payload to valid stages and a calm, bounded length before it reaches a child.
 */
export const PUBLIC_GARDEN_LIMIT = 60;

export function cleanStages(rows: unknown, limit = PUBLIC_GARDEN_LIMIT): number[] {
  if (!Array.isArray(rows)) return [];
  return rows
    .map((row) =>
      typeof row === "number" ? row : (row as { stage?: unknown } | null | undefined)?.stage,
    )
    .filter(
      (stage): stage is number =>
        typeof stage === "number" && Number.isInteger(stage) && stage >= 0 && stage <= 5,
    )
    .slice(0, limit);
}
