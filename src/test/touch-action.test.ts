import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

// An unlayered rule outranks every Tailwind utility, so this one has to stay in the
// base layer; otherwise touch-none / touch-pan-y stop applying to buttons without a
// word of warning, which is how the sky's star lost its vertical drag.
const css = readFileSync("src/styles.css", "utf8");

describe("page-wide touch-action", () => {
  it("stays in the base layer, so Tailwind touch utilities still win on buttons", () => {
    expect(css.match(/touch-action:\s*manipulation/g) ?? []).toHaveLength(1);
    expect(css).toMatch(/@layer base\s*\{[^}]*touch-action:\s*manipulation/);
  });
});
