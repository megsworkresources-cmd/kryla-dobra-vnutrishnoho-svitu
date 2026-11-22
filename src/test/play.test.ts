import { describe, expect, it } from "vitest";
import { MAZES, COUNT } from "@/content/play.i18n";
import { mazeStep as step, countChoices as choices, countingRound } from "@/content/play";

/** Breadth-first search: every maze must be solvable from S to E. */
function solvable(g: string[]) {
  const r0 = g.findIndex((r) => r.includes("S"));
  const first = g[r0];
  if (!first) return false;
  const start: [number, number] = [r0, first.indexOf("S")];
  const seen = new Set([start.join()]);
  const q = [start];
  while (q.length) {
    const p = q.shift();
    if (!p) break;
    if (g[p[0]]?.[p[1]] === "E") return true;
    for (const [dr, dc] of [
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1],
    ] as const) {
      const n = step(g, p, dr, dc);
      if (n && !seen.has(n.join())) {
        seen.add(n.join());
        q.push(n);
      }
    }
  }
  return false;
}

describe("maze and counting", () => {
  it("every age maze can be finished", () => {
    for (const g of Object.values(MAZES)) expect(solvable(g)).toBe(true);
  });
  it("walls block moves", () => {
    expect(step(["S#", ".E"], [0, 0], 0, 1)).toBeNull();
    expect(step(["S#", ".E"], [0, 0], 1, 0)).toEqual([1, 0]);
  });
  it("answer choices always include the right count", () => {
    for (const r of COUNT.rounds) expect(choices(r.n)).toContain(r.n);
  });
  it("an empty maze cannot move or claim a reachable goal", () => {
    expect(step([], [0, 0], 1, 0)).toBeNull();
    expect(solvable([])).toBe(false);
  });
  it("an empty counting list retains a playable original four-butterfly round", () => {
    const round = countingRound([], NaN);
    expect(round.n).toBe(4);
    expect(round.icon).toBe("🦋");
    expect(choices(round.n)).toEqual([3, 4, 5]);
  });
});
