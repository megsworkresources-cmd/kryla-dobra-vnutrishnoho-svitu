import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { tr } from "@/lib/i18n";

const CYR = /[А-Яа-яЇїІіЄєҐґ]/;

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) return walk(p);
    return p.endsWith(".ts") || p.endsWith(".tsx") ? [p] : [];
  });
}

describe("UA/EN language switch", () => {
  it("translates interface strings to US English and keeps Ukrainian as-is", () => {
    expect(tr("Тихе Місце", "en")).toBe("Quiet Place");
    expect(tr("Назад", "en")).toBe("Back");
    expect(tr("Назад", "uk")).toBe("Назад");
    expect(tr("Крок {i} з {n}", "en", { i: 2, n: 5 })).toBe("Step 2 of 5");
  });

  it("has an English entry for every Ukrainian string shown in the app", () => {
    const dict = readFileSync("src/lib/i18n.ts", "utf8");
    const missing: string[] = [];
    for (const file of walk("src")) {
      if (file.includes("i18n") || file.includes("suggest.server") || file.includes("test/")) continue;
      const text = readFileSync(file, "utf8");
      const re = /'([^'\\\n]*[А-Яа-яЇїІіЄєҐґ][^'\\\n]*)'|"([^"\\\n]*[А-Яа-яЇїІіЄєҐґ][^"\\\n]*)"/g;
      for (const m of text.matchAll(re)) {
        const s = (m[1] ?? m[2]) as string;
        // skip JSX/markup capture artifacts and the intentional bilingual toggle labels
        if (/[=<>]|t\('|t\("|Мова \/ Language/.test(s) || s === "Українська") continue;
        if (!dict.includes(`"${s}"`)) missing.push(`${file}: ${s}`);
      }
    }
    expect(missing).toEqual([]);
  });
});
