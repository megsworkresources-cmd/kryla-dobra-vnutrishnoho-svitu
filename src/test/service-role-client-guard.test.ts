import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import {
  assertNoServiceRoleClientImports,
  findServiceRoleClientImports,
} from "../../scripts/no-service-role-client-guard.mjs";

const roots: string[] = [];

function fixture(files: Record<string, string>) {
  const root = mkdtempSync(path.join(tmpdir(), "supabase-guard-"));
  roots.push(root);
  for (const [name, contents] of Object.entries(files)) {
    const target = path.join(root, "src", name);
    mkdirSync(path.dirname(target), { recursive: true });
    writeFileSync(target, contents);
  }
  return root;
}

afterEach(() => {
  for (const root of roots.splice(0)) rmSync(root, { recursive: true, force: true });
});

describe("service-role Supabase client guard", () => {
  it("allows the authenticated client and the unimported generated file", () => {
    const root = fixture({
      "lib/auth.ts":
        'import { supabase } from "@/integrations/supabase/client";\nexport const auth = supabase;',
      "integrations/supabase/client.server.ts": "export const supabaseAdmin = {};",
    });

    expect(findServiceRoleClientImports(root)).toEqual([]);
    expect(() => assertNoServiceRoleClientImports(root)).not.toThrow();
  });

  it("reports static, re-exported and dynamic imports", () => {
    const root = fixture({
      "a.ts": 'import { supabaseAdmin } from "@/integrations/supabase/client.server";',
      "b.ts": 'export * from "./integrations/supabase/client.server";',
      "c.ts":
        'export async function load() {\n  return import("../integrations/supabase/client.server");\n}',
    });

    const found = findServiceRoleClientImports(root);
    expect(found.map((entry) => path.relative(path.join(root, "src"), entry.file))).toEqual([
      "a.ts",
      "b.ts",
      "c.ts",
    ]);
    expect(found.map((entry) => entry.line)).toEqual([1, 1, 2]);
    expect(() => assertNoServiceRoleClientImports(root)).toThrow(/service-role Supabase client/);
  });

  it("passes for this repository's app code", () => {
    expect(findServiceRoleClientImports(process.cwd())).toEqual([]);
  });
});
