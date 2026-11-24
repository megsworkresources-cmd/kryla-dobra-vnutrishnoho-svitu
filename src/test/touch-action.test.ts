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
    // Stem: a picture is painted along a vertical stroke, and a path is traced with
    // the finger. Every other surface scrolls the page; the Radix primitives under
    // ui/ are unused by any route.
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

  it("keeps both finger-dragged handles claiming the gesture", () => {
    // The cloud and the sky's star move on both axes, so neither can inherit the
    // page-wide manipulation value or the browser turns the drag into a scroll.
    for (const file of ["src/activities/star.tsx", "src/activities/playful.tsx"]) {
      expect(readFileSync(file, "utf8")).toMatch(/touchAction:\s*"none"/);
    }
  });
});
