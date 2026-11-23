import { describe, expect, it } from "vitest";
import { STORY_MEDIA } from "@/content/story-media";
import { WATCH_CLIPS, watchFilmId } from "@/content/watch-clips";
import { Route } from "@/routes/watch";

describe("Watch film wiring", () => {
  it("gives each Watch story card its own existing MP4 and poster, including the rain film", () => {
    expect(WATCH_CLIPS).toHaveLength(7);
    expect(WATCH_CLIPS.some((clip) => clip.id === "rain")).toBe(true);
    expect(new Set(WATCH_CLIPS.map((clip) => clip.id)).size).toBe(7);

    for (const clip of WATCH_CLIPS) {
      expect(STORY_MEDIA[clip.id], clip.id).toMatch(/\.mp4$/);
      expect(clip.shots[0]?.img, clip.id).toBeTruthy();
    }
  });
});

describe("Watch story deep links", () => {
  it("opens only a known story from the film search parameter", () => {
    const validateSearch = (
      Route.options as {
        validateSearch?: (search: Record<string, unknown>) => { film?: string };
      }
    ).validateSearch;

    expect(validateSearch).toBeTypeOf("function");
    expect(validateSearch?.({ film: "sunflower" })).toEqual({ film: "sunflower" });
    expect(validateSearch?.({ film: "unknown" })).toEqual({ film: undefined });
    expect(validateSearch?.({ film: ["sunflower"] })).toEqual({ film: undefined });
  });
});
