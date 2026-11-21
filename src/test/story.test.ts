import { describe, expect, it } from "vitest";
import { StoryInput } from "@/lib/story.functions";
import { neighbours } from "@/content/sequence";
import { readyStories, readyStory, type ReadyStoryId } from "@/content/ready-story";

const choices = {
  who: "solomiya",
  place: "sky",
  feeling: "calm",
  age: "8-10",
  lang: "uk",
} as const;

describe("Claude story companion", () => {
  it("provides a complete local story in each language without personal content", () => {
    const uk = readyStory("uk");
    const en = readyStory("en");
    expect(uk.scenes).toHaveLength(4);
    expect(en.scenes).toHaveLength(4);
    expect(en.title).toBe("The seed's adventure");
    expect(en.scenes.every((s) => !/[А-Яа-яЇїІіЄєҐґ]/.test(s.text))).toBe(true);
    expect(uk.closing.length).toBeGreaterThan(30);
  });
  it("offers both folk tale retellings fully written in Ukrainian and English", () => {
    const uk = readyStories("uk");
    const en = readyStories("en");
    expect(uk.map((story) => story.id)).toEqual(["seed", "mitten", "bun"]);
    expect(en.map((story) => story.title)).toEqual([
      "The seed's adventure",
      "The Mitten",
      "The Bun",
    ]);

    const ids: ReadyStoryId[] = ["seed", "mitten", "bun"];
    for (const id of ids) {
      const ua = readyStory("uk", id);
      const eng = readyStory("en", id);
      expect(ua.scenes).toHaveLength(4);
      expect(eng.scenes).toHaveLength(4);
      expect(ua.scenes.every((scene) => /[А-Яа-яЇїІіЄєҐґ]/.test(scene.text))).toBe(true);
      expect(eng.scenes.every((scene) => !/[А-Яа-яЇїІіЄєҐґ]/.test(scene.text))).toBe(true);
      expect(ua.closing.length).toBeGreaterThan(20);
      expect(ua.title).not.toBe(eng.title);
    }
  });

  it("accepts only preset choices and does not accept child-typed text", () => {
    const parsed = StoryInput.parse({ ...choices, text: "a private secret" });
    expect(parsed).toEqual(choices);
    expect("text" in parsed).toBe(false);
  });

  it("rejects a feeling outside the approved choices", () => {
    expect(StoryInput.safeParse({ ...choices, feeling: "something-private" }).success).toBe(false);
  });

  it("is connected to the shared Back and Next path", () => {
    expect(neighbours("/watch").next?.to).toBe("/story");
    expect(neighbours("/story").next?.to).toBe("/bedtime");
    expect(neighbours("/bedtime").next?.to).toBe("/stroll");
    expect(neighbours("/stroll").next?.to).toBe("/puddles");
    expect(neighbours("/puddles").next?.to).toBe("/maze");
    expect(neighbours("/together").next?.to).toBe("/dreams");
    expect(neighbours("/island").next?.to).toBe("/garden");
  });
});
