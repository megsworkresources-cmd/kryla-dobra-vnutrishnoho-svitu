import { expect, it } from "vitest";
import { savedGardenNote } from "@/content/community-garden-note";

const at = (day: number, hour = 12) => new Date(2026, 10, day, hour).getTime();

it("says a snapshot saved earlier the same day is from today", () => {
  expect(savedGardenNote(at(20, 7), at(20, 22))).toEqual({
    key: "Показано сад, збережений сьогодні. Онови, щоб побачити нові квітки.",
  });
});

it("says a snapshot saved the previous calendar day is from yesterday", () => {
  expect(savedGardenNote(at(19, 23), at(20, 1))).toEqual({
    key: "Показано сад, збережений учора. Онови, щоб побачити нові квітки.",
  });
});

it("counts whole calendar days for older snapshots", () => {
  expect(savedGardenNote(at(15), at(20, 9))).toEqual({
    key: "Показано сад, збережений {n} дн. тому. Онови, щоб побачити нові квітки.",
    vars: { n: 5 },
  });
  expect(savedGardenNote(at(13, 23), at(20, 1))).toEqual({
    key: "Показано сад, збережений {n} дн. тому. Онови, щоб побачити нові квітки.",
    vars: { n: 7 },
  });
});

it("never calls a future timestamp old", () => {
  expect(savedGardenNote(at(21), at(20))).toEqual({
    key: "Показано сад, збережений сьогодні. Онови, щоб побачити нові квітки.",
  });
});
