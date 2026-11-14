import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { tr } from "./i18n";

export const StoryInput = z.object({
  who: z.enum(["solomiya", "taras", "olenka", "marko", "daryna", "lihtaryk"]),
  place: z.enum(["garden", "forest", "meadow", "clouds", "sky", "studio", "path", "safe"]),
  feeling: z.enum(["calm", "sad", "worried", "angry", "proud", "curious"]),
  age: z.enum(["5-7", "8-10", "11-13"]),
  lang: z.enum(["uk", "en"]),
});

export const makeStory = createServerFn({ method: "POST" })
  .inputValidator(StoryInput)
  .handler(async ({ data }) => {
    const { generateStory, StoryError } = await import("./story.server");
    try {
      return {
        ok: true as const,
        story: await generateStory(data, process.env["LOVABLE_API_KEY"]),
      };
    } catch (error) {
      return {
        ok: false as const,
        error: error instanceof StoryError ? error.code : "fail",
        message:
          error instanceof StoryError
            ? error.message
            : tr(
                "Казка цього разу не склалася. Спробуй інший вибір або відкрий готову казку.",
                data.lang,
              ),
      };
    }
  });
