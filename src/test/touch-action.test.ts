import { describe, expect, it } from "vitest";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

// An unlayered rule outranks every Tailwind utility, so this one has to stay in the
// base layer; otherwise touch-none / touch-pan-y stop applying to buttons without a
// word of warning, which is how the sky's star lost its vertical drag.
const css = readFileSync("src/styles.css", "utf8");

function sources(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    if (entry.isDirectory()) return sources(join(dir, entry.name));
    return entry.name.endsWith(".tsx") ? [join(dir, entry.name)] : [];
  });
}

const touchNone = sources("src").filter((file) =>
  /\btouch-none\b/.test(readFileSync(file, "utf8")),
);

describe("page-wide touch-action", () => {
  it("stays in the base layer, so Tailwind touch utilities still win on buttons", () => {
    expect(css.match(/touch-action:\s*manipulation/g) ?? []).toHaveLength(1);
    expect(css).toMatch(/@layer base\s*\{[^}]*touch-action:\s*manipulation/);
  });

  it("is claimed by drawing and tracing surfaces only, never by a tap target", () => {
    // Stem: a picture is painted along a vertical stroke. Attention trail: only the
    // numbered step dots claim the stroke, so the strip itself still scrolls. Every
    // other surface scrolls the page; the Radix primitives under ui/ are unused.
    const drawing = [
      "src/activities/studio.tsx",
      "src/routes/safe-drawing.tsx",
      "src/components/MagicStage.tsx",
    ];
    const unexpected = touchNone.filter(
      (file) => !drawing.includes(file) && !file.startsWith("src/components/ui/"),
    );
    expect(unexpected).toEqual([]);
    expect(touchNone.length).toBeGreaterThanOrEqual(drawing.length);
  });

  it("keeps every dragged surface on the primary pointer", () => {
    // A stroke begins on a step dot, a cloud or the sky's star; a second finger
    // landing there must not start, take over or cancel it. Puddles and games share
    // press.ts, whose ownership rule has its own test.
    for (const file of [
      "src/activities/star.tsx",
      "src/activities/playful.tsx",
      "src/components/MagicStage.tsx",
    ]) {
      const guards = readFileSync(file, "utf8").match(/isPrimary === false/g) ?? [];
      expect(guards.length).toBeGreaterThanOrEqual(3);
    }
  });

  it("keeps both finger-dragged handles claiming the gesture", () => {
    // The cloud and the sky's star move on both axes, so neither can inherit the
    // page-wide manipulation value or the browser turns the drag into a scroll.
    for (const file of ["src/activities/star.tsx", "src/activities/playful.tsx"]) {
      expect(readFileSync(file, "utf8")).toMatch(/touchAction:\s*"none"/);
    }
  });
});
