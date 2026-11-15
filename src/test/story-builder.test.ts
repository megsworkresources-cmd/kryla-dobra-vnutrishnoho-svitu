import { expect, it } from "vitest";
import { composedStory } from "@/content/story-builder";

const base = { who: "solomiya", place: "meadow", feeling: "calm", lang: "uk" } as const;

it("always writes four scenes, a title and a closing", () => {
  const story = composedStory(base);
  expect(story.scenes).toHaveLength(4);
  expect(story.title.length).toBeGreaterThan(0);
  expect(story.closing.length).toBeGreaterThan(0);
  for (const scene of story.scenes) expect(scene.text.trim().length).toBeGreaterThan(12);
});

it("keeps the hero and place the child chose", () => {
  const story = composedStory({ ...base, who: "taras", place: "forest" });
  const all = [story.title, ...story.scenes.map((s) => s.text), story.closing].join(" ");
  expect(all).toContain("Тарас");
  expect(all).toContain("Ліс");
  expect(all).not.toContain("{who}");
  expect(all).not.toContain("{place}");
});

it("answers each feeling and place differently", () => {
  const calm = composedStory({ ...base, feeling: "calm" });
  const angry = composedStory({ ...base, feeling: "angry" });
  expect(calm.scenes[2]?.text).not.toBe(angry.scenes[2]?.text);
  const sea = composedStory({ ...base, place: "clouds" });
  expect(sea.scenes[1]?.text).not.toBe(calm.scenes[1]?.text);
});

it("writes the English story in English", () => {
  const story = composedStory({ ...base, lang: "en" });
  const all = [story.title, ...story.scenes.map((s) => s.text), story.closing].join(" ");
  expect(all).not.toMatch(/[А-Яа-яІіЇїЄє]/);
  expect(all).toContain("Solomiya");
});

it("never asks a child to hold their breath", () => {
  const all = [composedStory(base), composedStory({ ...base, feeling: "worried", lang: "en" })]
    .flatMap((s) => [s.title, ...s.scenes.map((x) => x.text), s.closing])
    .join(" ")
    .toLowerCase();
  expect(all).not.toContain("затримуй");
  expect(all).not.toContain("hold your breath");
});
