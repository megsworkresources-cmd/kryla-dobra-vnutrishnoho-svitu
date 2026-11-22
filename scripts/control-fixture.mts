// Public app-written labels/data only; no accounts or child storage are accessed.
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { MAZES } from "../src/content/play.i18n";
import { PATTERN_ROUNDS } from "../src/content/game-rounds";
import { tr } from "../src/lib/i18n";

const files = [
  "src/routes/games.tsx",
  "src/activities/games.tsx",
  "src/activities/studio.tsx",
  "src/routes/safe-drawing.tsx",
  "src/routes/maze.tsx",
];
const sources = await Promise.all(files.map((f) => readFile(f, "utf8")));
const keys = sources.flatMap((s) => [...s.matchAll(/t\("([^"\n]+)"/g)].map((m) => m[1] ?? ""));
keys.push(...PATTERN_ROUNDS.map((x) => x.answer.name));
await mkdir("/tmp/browser/stabilization", { recursive: true });
await writeFile(
  "/tmp/browser/stabilization/control_data.json",
  JSON.stringify({
    mazes: MAZES,
    patterns: PATTERN_ROUNDS.map((x) => x.answer.name),
    labels: Object.fromEntries(keys.map((k) => [k, { uk: tr(k, "uk"), en: tr(k, "en") }])),
  }),
);
