import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

/**
 * The baseline migration is what a rebuild runs; the contract is what the drift check
 * compares the deployed database against. They are two views of one schema, so every
 * object must appear in both. This test keeps them from drifting apart without a
 * database connection, which also covers pull requests in CI.
 */
const root = process.cwd();
const migration = readFileSync(
  path.join(root, "supabase/migrations/20261127180000_baseline_public_schema.sql"),
  "utf8",
);
const contract = JSON.parse(
  readFileSync(path.join(root, "supabase/schema-contract.json"), "utf8"),
) as {
  tables: Record<string, { columns: Record<string, unknown>; policies?: Record<string, unknown> }>;
  functions: Record<string, { bodyMustInclude?: string[] }>;
};
const generatedTypes = readFileSync(path.join(root, "src/integrations/supabase/types.ts"), "utf8");

const unique = (values: string[]) => [...new Set(values)];

const migrationTables = unique(
  [...migration.matchAll(/create table if not exists public\.(\w+)/gi)].map(
    (match) => `public.${match[1]}`,
  ),
);

const migrationPolicies = [
  ...migration.matchAll(/create policy (?:"([^"]+)"|(\w+)) on public\.(\w+)/gi),
].map((match) => ({ name: match[1] ?? match[2], table: `public.${match[3]}` }));

/** `new_stage integer, opt_in boolean` → `integer,boolean`, matching pg_get_function_identity_arguments. */
const identityArguments = (argumentsList: string) =>
  argumentsList
    .split(",")
    .map((argument) => argument.trim())
    .filter(Boolean)
    .map((argument) => argument.split(/\s+/).pop())
    .join(",");

const migrationFunctions = unique(
  [...migration.matchAll(/create or replace function public\.(\w+)\(([^)]*)\)/gi)].map(
    (match) => `public.${match[1]}(${identityArguments(match[2] ?? "")})`,
  ),
);

describe("baseline migration and schema contract", () => {
  it("declares the same tables", () => {
    expect(new Set(migrationTables)).toEqual(new Set(Object.keys(contract.tables)));
  });

  it("declares the same policies on the same tables", () => {
    const fromMigration = migrationPolicies.map(({ table, name }) => `${table}:${name}`).sort();
    const fromContract = Object.entries(contract.tables)
      .flatMap(([table, spec]) =>
        Object.keys(spec.policies ?? {}).map((name) => `${table}:${name}`),
      )
      .sort();
    expect(fromMigration).toEqual(fromContract);
  });

  it("declares the same functions", () => {
    expect(new Set(migrationFunctions)).toEqual(new Set(Object.keys(contract.functions)));
  });

  it("documents every contract column in the migration", () => {
    for (const [table, spec] of Object.entries(contract.tables)) {
      expect(migrationTables).toContain(table);
      for (const column of Object.keys(spec.columns)) {
        expect(migration).toMatch(new RegExp(`\\b${column}\\b`));
      }
    }
  });

  it("agrees with the generated Supabase types the app compiles against", () => {
    for (const table of Object.keys(contract.tables)) {
      expect(generatedTypes).toContain(`${table.replace("public.", "")}: {`);
    }
    for (const identity of Object.keys(contract.functions)) {
      const name = identity.slice("public.".length, identity.indexOf("("));
      expect(generatedTypes).toContain(`${name}:`);
    }
  });

  it("keeps the safety fragments each RPC must contain", () => {
    // A body fragment that no longer appears in the migration would make the drift
    // check fail on a schema the migration itself creates.
    for (const [identity, spec] of Object.entries(contract.functions)) {
      const name = identity.slice("public.".length, identity.indexOf("("));
      const body = migration.slice(migration.indexOf(`function public.${name}`));
      for (const fragment of spec.bodyMustInclude ?? []) {
        const tokens = fragment
          .toLowerCase()
          .replace(/::\s*[a-z_][a-z0-9_ ]*/g, " ")
          .replace(/[^a-z0-9_]+/g, " ")
          .trim()
          .split(/\s+/)
          .join(" ");
        const bodyTokens = body
          .toLowerCase()
          .replace(/[^a-z0-9_]+/g, " ")
          .replace(/\s+/g, " ");
        expect(bodyTokens, `${identity} must contain "${fragment}"`).toContain(tokens);
      }
    }
  });
});
