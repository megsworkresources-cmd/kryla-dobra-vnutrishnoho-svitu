import { describe, expect, it } from "vitest";
import { StoryInput } from "@/lib/story.functions";
import { neighbours } from "@/content/sequence";

const choices = { who: "solomiya", place: "sky", feeling: "calm", age: "8-10", lang: "uk" } as const;

describe("Claude story companion", () => {
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
