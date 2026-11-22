import { describe, expect, it } from "vitest";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";

/**
 * Every film, friends clip and character loop is served from the app's own
 * public/media/video folder. A record that points elsewhere, or at a file whose
 * size has drifted from the record, would silently ship a missing or stale video.
 */
const VIDEO_RECORDS = path.resolve(process.cwd(), "src/assets/video");
const PUBLIC_VIDEO = path.resolve(process.cwd(), "public/media/video");

const RECORDS = readdirSync(VIDEO_RECORDS)
  .filter((name) => name.endsWith(".mp4.asset.json"))
  .map((name) => {
    const record = JSON.parse(readFileSync(path.join(VIDEO_RECORDS, name), "utf8")) as {
      url: string;
      size: number;
    };
    return { name: name.replace(".asset.json", ""), ...record };
  });

describe("story footage ships with the app", () => {
  it("finds the video asset records", () => {
    expect(RECORDS.length).toBeGreaterThan(0);
  });

  for (const { name, url, size } of RECORDS) {
    it(`points ${name} at the app's own /media folder`, () => {
      expect(url).toBe(`/media/video/${name}`);
      expect(size).toBeGreaterThan(0);
    });

    it(`ships ${name} in public/media/video with the recorded size`, () => {
      const file = path.join(PUBLIC_VIDEO, name);
      expect(existsSync(file), `${file} is missing`).toBe(true);
      expect(statSync(file).size).toBe(size);
    });
  }
});
