import { describe, expect, it } from "vitest";
import {
  AGES,
  CATEGORIES,
  CRISIS,
  LIBRARY,
  REGIONS,
  RESOURCES,
  SERVICES,
} from "@/content/resources.i18n";

describe("family resource directory", () => {
  it("retains 39 unique bilingual resources with valid filter references and official HTTPS links", () => {
    expect(RESOURCES).toHaveLength(39);
    expect(new Set(RESOURCES.map((r) => r.id)).size).toBe(39);
    for (const r of RESOURCES) {
      expect(new URL(r.url).protocol).toBe("https:");
      expect(r.name.uk.trim().length).toBeGreaterThan(0);
      expect(r.name.en.trim().length).toBeGreaterThan(0);
      expect(r.desc.uk.trim().length).toBeGreaterThan(0);
      expect(r.desc.en.trim().length).toBeGreaterThan(0);
      for (const key of r.cats) expect(CATEGORIES[key]).toBeDefined();
      for (const key of r.ages) expect(AGES[key]).toBeDefined();
      for (const key of r.regions) expect(REGIONS[key]).toBeDefined();
      for (const key of r.services) expect(SERVICES[key]).toBeDefined();
    }
    for (const topic of LIBRARY)
      for (const tip of topic.tips) {
        expect(tip.uk.trim().length).toBeGreaterThan(0);
        expect(tip.en.trim().length).toBeGreaterThan(0);
      }
  });
  it.each([
    "112",
    "101",
    "102",
    "103",
    "116111",
    "0800500225",
    "0800210106",
    "0800331200",
    "0800100102",
    "116123",
    "0800500335",
    "1547",
    "1548",
  ])("retains the published crisis contact %s", (tel) => {
    expect(CRISIS.some((c) => c.tel === tel)).toBe(true);
  });
  it("unknown prices remain unknown rather than defaulting to free", () => {
    expect(RESOURCES.find((r) => r.id === "learningua")?.cost).toBeUndefined();
    expect(RESOURCES.find((r) => r.id === "ilearn")?.cost).toBeUndefined();
  });
});
