import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Btn, Scene } from "@/components/Scene";
import { CharacterSay } from "@/components/Character";
import { pageHead } from "@/content/journeys";
import { MAZE, MAZES } from "@/content/play.i18n";
import type { Bi } from "@/content/adventures.i18n";
import { chime } from "@/lib/audio";
import { markDone, pick, useStore } from "@/lib/store";
import { useLang, useT } from "@/lib/i18n";

export const Route = createFileRoute("/maze")({
  head: () =>
    pageHead("Стежка Ліхтарика", "Проведи Їжачка Ліхтарика лабіринтом до теплої хатинки."),
  component: Maze,
});

type P = [number, number];
const find = (g: string[], ch: string): P => {
  const r = g.findIndex((row) => row.includes(ch));
  return [Math.max(0, r), Math.max(0, (g[r] ?? "").indexOf(ch))];
};

/** Pure move rule: walls and edges block, everything else is walkable. */
export function step(g: string[], [r, c]: P, dr: number, dc: number): P | null {
  const cell = g[r + dr]?.[c + dc];
  return cell === undefined || cell === "#" ? null : [r + dr, c + dc];
}

function Maze() {
  const t = useT();
  const lang = useLang();
  const L = (x: Bi) => (lang === "en" ? x.en : x.uk);
  const age = useStore((s) => s.age);
  const grid = pick(age, MAZES);
  const [pos, setPos] = useState<P>(() => find(grid, "S"));
  const [bump, setBump] = useState(false);
  const goal = find(grid, "E");
  const done = pos[0] === goal[0] && pos[1] === goal[1];
  useEffect(() => setPos(find(grid, "S")), [grid]);

  const move = (dr: number, dc: number) => {
    if (done) return;
    const n = step(grid, pos, dr, dc);
    if (!n) {
      setBump(true);
      return;
    }
    setBump(false);
    setPos(n);
    if (n[0] === goal[0] && n[1] === goal[1]) {
      chime(660);
      markDone("maze");
    } else chime(392);
  };
  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      const d = (
        { ArrowUp: [-1, 0], ArrowDown: [1, 0], ArrowLeft: [0, -1], ArrowRight: [0, 1] } as Record<
          string,
          P
        >
      )[e.key];
      if (d) {
        e.preventDefault();
        move(d[0], d[1]);
      }
    };
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  });

  const n = grid[0]?.length ?? 5;
  return (
    <Scene title="Стежка Ліхтарика" back="/world" compact>
      <div className="space-y-4">
        <CharacterSay
          who="lihtaryk"
          text={L(done ? MAZE.done : bump ? MAZE.bump : MAZE.intro)}
          mood={done ? "cheer" : "talk"}
        />
        <div
          role="grid"
          aria-label={t("Лабіринт")}
          className="paper-card mx-auto grid w-full max-w-md gap-px p-0"
          style={{ gridTemplateColumns: `repeat(${n}, 1fr)` }}
        >
          {grid.flatMap((row, r) =>
            [...row].map((ch, c) => {
              const here = pos[0] === r && pos[1] === c;
              const adj = Math.abs(pos[0] - r) + Math.abs(pos[1] - c) === 1;
              return (
                <button
                  key={`${r}-${c}`}
                  type="button"
                  aria-label={
                    here
                      ? t("Ліхтарик тут")
                      : ch === "E"
                        ? t("Хатинка")
                        : ch === "#"
                          ? t("Кущик")
                          : t("Стежка")
                  }
                  onClick={() => adj && move(r - pos[0], c - pos[1])}
                  className={`flex aspect-square items-center justify-center rounded-lg text-lg sm:text-2xl ${ch === "#" ? "bg-primary/70" : "bg-secondary"} ${adj && ch !== "#" && !done ? "ring-2 ring-accent" : ""}`}
                >
                  {here ? "🦔" : ch === "E" ? "🏡" : ch === "#" ? "🌳" : ""}
                </button>
              );
            }),
          )}
        </div>
        <div className="mx-auto grid max-w-[14rem] grid-cols-3 gap-2">
          <span />
          <Btn variant="soft" aria-label={L(MAZE.up)} onClick={() => move(-1, 0)}>
            ↑
          </Btn>
          <span />
          <Btn variant="soft" aria-label={L(MAZE.left)} onClick={() => move(0, -1)}>
            ←
          </Btn>
          <Btn variant="soft" aria-label={L(MAZE.down)} onClick={() => move(1, 0)}>
            ↓
          </Btn>
          <Btn variant="soft" aria-label={L(MAZE.right)} onClick={() => move(0, 1)}>
            →
          </Btn>
        </div>
        {done && (
          <div className="flex justify-center">
            <Btn onClick={() => setPos(find(grid, "S"))}>{t("Ще раз")}</Btn>
          </div>
        )}
        <section className="paper-card p-4">
          <h2 className="font-display text-lg font-bold">{t("Без екрана")}</h2>
          <p>{L(MAZE.away)}</p>
        </section>
      </div>
    </Scene>
  );
}
