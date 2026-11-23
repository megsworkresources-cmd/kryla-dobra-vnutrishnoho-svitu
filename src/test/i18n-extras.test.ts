import { describe, expect, it } from "vitest";
import { tr } from "@/lib/i18n";

describe("shared translations include adventure copy", () => {
  it("translates the five adventure titles through the main translator", () => {
    expect(tr("Кольорові сни", "en")).toBe("Colourful Dreams");
    expect(tr("Світ маленьких див", "en")).toBe("World of Tiny Wonders");
    expect(tr("Дослідники стежинок", "en")).toBe("Trail Explorers");
    expect(tr("Кольорові сни", "uk")).toBe("Кольорові сни");
  });
});
