import { describe, expect, it } from "vitest";
import { STORY_MEDIA } from "@/content/story-media";
import { WATCH_CLIPS, watchFilmId } from "@/content/watch-clips";

describe("Watch film wiring", () => {
  it("gives each of the six story cards its own existing MP4 and poster", () => {
    expect(WATCH_CLIPS).toHaveLength(6);
    expect(new Set(WATCH_CLIPS.map((clip) => clip.id)).size).toBe(6);

    for (const clip of WATCH_CLIPS) {
      expect(STORY_MEDIA[clip.id], clip.id).toMatch(/\.mp4$/);
      expect(clip.shots[0]?.img, clip.id).toBeTruthy();
    }
  });
});
