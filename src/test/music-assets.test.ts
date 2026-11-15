import { describe, expect, it } from "vitest";
import { existsSync, statSync } from "node:fs";
import path from "node:path";
import bandura from "@/assets/audio/quiet-bandura.mp3.asset.json";
import sopilka from "@/assets/audio/quiet-sopilka.mp3.asset.json";
import tsymbaly from "@/assets/audio/quiet-tsymbaly.mp3.asset.json";
import lullaby from "@/assets/audio/quiet-lullaby.mp3.asset.json";

/**
 * Playback must never quietly go back to another host: every recording is served
 * from the app's own public/audio folder, and every asset record has to say so.
 */
const TRACKS = [
  { name: "bandura", record: bandura },
  { name: "sopilka", record: sopilka },
  { name: "tsymbaly", record: tsymbaly },
  { name: "lullaby", record: lullaby },
] as const;

const PUBLIC_AUDIO = path.resolve(process.cwd(), "public/audio");

describe("recorded music ships with the app", () => {
  for (const { name, record } of TRACKS) {
    it(`points ${name} at the app's own /audio folder`, () => {
      expect(record.url).toBe(`/audio/quiet-${name}.mp3`);
    });

    it(`ships the ${name} recording in public/audio`, () => {
      const file = path.join(PUBLIC_AUDIO, `quiet-${name}.mp3`);
      expect(existsSync(file), `${file} is missing`).toBe(true);
      expect(statSync(file).size).toBe(record.size);
    });
  }
});
