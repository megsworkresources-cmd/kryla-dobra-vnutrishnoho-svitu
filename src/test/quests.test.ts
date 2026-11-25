import { describe, expect, it } from "vitest";
import { QUESTS, QUEST_IDS } from "@/content/quests.i18n";
import { neighbours, ORDER } from "@/content/sequence";

describe("original adventures", () => {
  it("has the six adventures in order", () => {
    expect(QUEST_IDS).toEqual(["dreams", "wonders", "raindrop", "trails", "morning", "island"]);
  });
  it.each(QUEST_IDS)("%s has three complete bilingual chapters and choices", (id) => {
    const q = QUESTS[id];
    expect(q.chapters).toHaveLength(3);
    for (const c of q.chapters) {
      expect(c.spots.length).toBeGreaterThanOrEqual(3);
      for (const s of [c.text, c.task, ...c.spots.map((x) => x.text)]) {
        expect(s.uk.length).toBeGreaterThan(0);
        expect(s.en.length).toBeGreaterThan(0);
      }
    }
    expect(q.choices).toHaveLength(3);
  });
  it("every adventure sits in Back/Next order", () => {
    for (const id of QUEST_IDS) expect(ORDER.some((s) => s.to === `/${id}`)).toBe(true);
    expect(neighbours("/together").next?.to).toBe("/dreams");
  });
});
