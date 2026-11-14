import { describe, expect, it } from "vitest";
import { StoryInput } from "@/lib/story.functions";
import { neighbours } from "@/content/sequence";
import { readyStory } from "@/content/ready-story";

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
    expect(neighbours("/story").next?.to).toBe("/garden");
  });
});
