import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { tr } from "@/lib/i18n";
import ts from "typescript";

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
    // English copy lives in the main dictionary plus the practice-upgrade extras.
    const dict =
      readFileSync("src/lib/i18n.ts", "utf8") + readFileSync("src/lib/i18n.extras.ts", "utf8");
    const missing: string[] = [];
    for (const file of walk("src")) {
      if (file.includes("i18n") || file.includes(".server.") || file.includes("test/")) continue;
      const text = readFileSync(file, "utf8");
      const source = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true);
      const visit = (node: ts.Node) => {
        if (ts.isStringLiteral(node)) {
          const s = node.text;
          if (CYR.test(s) && !/[=<>]|Мова \/ Language/.test(s) && s !== "Українська") {
            if (!dict.includes(`"${s}"`) && !dict.includes(`\n  ${s}:`))
              missing.push(`${file}: ${s}`);
          }
        }
        ts.forEachChild(node, visit);
      };
      visit(source);
    }
    expect(missing).toEqual([]);
  });
});
