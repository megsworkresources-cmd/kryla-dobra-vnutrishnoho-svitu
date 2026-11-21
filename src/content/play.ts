import { itemAtOr } from "./list";
import { COUNT, DEFAULT_COUNT_ROUND, type CountRound } from "./play.i18n";

export type MazePosition = [number, number];
export function mazeStep(
  grid: readonly string[],
  [r, c]: MazePosition,
  dr: number,
  dc: number,
): MazePosition | null {
  const cell = grid[r + dr]?.[c + dc];
  return cell === undefined || cell === "#" ? null : [r + dr, c + dc];
}
export function countChoices(n: number) {
  return [n - 1, n, n + 1].filter((value) => value > 0);
}
export function countingRound(rounds: readonly CountRound[], index: number): CountRound {
  return itemAtOr(rounds, index, DEFAULT_COUNT_ROUND);
}
export function currentCountingRound(index: number) {
  return countingRound(COUNT.rounds, index);
}
