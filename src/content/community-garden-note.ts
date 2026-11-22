/**
 * How the saved shared-garden snapshot is described to a child.
 *
 * Kept apart from the route so the day wording can be tested directly: a
 * snapshot saved earlier today, yesterday, or several days ago must not read as
 * if it were fresh.
 */
export interface SavedGardenNote {
  key: string;
  vars?: { n: number };
}

const dayStart = (date: Date) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();

export function savedGardenNote(at: number, now = Date.now()): SavedGardenNote {
  const days = Math.round((dayStart(new Date(now)) - dayStart(new Date(at))) / 86_400_000);
  if (days <= 0) {
    return { key: "Показано сад, збережений сьогодні. Онови, щоб побачити нові квітки." };
  }
  if (days === 1) {
    return { key: "Показано сад, збережений учора. Онови, щоб побачити нові квітки." };
  }
  return {
    key: "Показано сад, збережений {n} дн. тому. Онови, щоб побачити нові квітки.",
    vars: { n: days },
  };
}
