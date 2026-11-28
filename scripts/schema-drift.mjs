#!/usr/bin/env node
/**
 * Compares the deployed Supabase schema with `supabase/schema-contract.json` and the
 * baseline migration, and fails on drift.
 *
 * This project was built in the dashboard, so the live database is the only place some
 * objects ever existed. The baseline migration and the contract now record what they
 * should be; this check is what keeps the record honest. It reads the catalogue only —
 * no table contents, no writes (except `--write`, which rewrites the local contract).
 *
 *   SUPABASE_DB_URL='postgresql://...' bun run db:drift
 *   SUPABASE_DB_URL='postgresql://...' bun run db:drift --write   # adopt the live schema
 *   node scripts/schema-drift.mjs --url 'postgresql://...' --require
 *
 * The connection string is read from SUPABASE_DB_URL, LOVABLE_DB_MIGRATION_URL,
 * POSTGRES_URL or DATABASE_URL, and is never printed.
 */
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { parseArgs } from "node:util";
import postgres from "postgres";
import { diffSchema } from "./schema-drift-core.mjs";

try {
  process.loadEnvFile?.(".env");
} catch {
  // A missing .env is fine: the check reports that it is not configured.
}

const CONTRACT_PATH = path.resolve("supabase/schema-contract.json");

const { values } = parseArgs({
  options: {
    url: { type: "string" },
    contract: { type: "string", default: CONTRACT_PATH },
    write: { type: "boolean", default: false },
    require: { type: "boolean", default: false },
    help: { type: "boolean", short: "h", default: false },
  },
});

if (values.help) {
  console.log(
    [
      "Usage: node scripts/schema-drift.mjs [--require] [--write] [--url <connection string>]",
      "",
      "  --require  fail (instead of skipping) when no database URL is configured",
      "  --write    replace the contract with what the live database reports",
      "  --url      connection string; otherwise read from the environment",
      "",
      "Reads only the PostgreSQL catalogue: tables, columns, RLS, policies, grants and",
      "function signatures. Table contents are never read and nothing is modified.",
    ].join("\n"),
  );
  process.exit(0);
}

const databaseUrl =
  values.url ??
  process.env.SUPABASE_DB_URL ??
  process.env.LOVABLE_DB_MIGRATION_URL ??
  process.env.POSTGRES_URL ??
  process.env.DATABASE_URL ??
  "";

if (!databaseUrl) {
  const message = [
    "No database URL configured, so the deployed schema cannot be compared.",
    "",
    "Set SUPABASE_DB_URL (Supabase dashboard → Project Settings → Database → Connection",
    "string → URI) and run again:",
    "",
    "  SUPABASE_DB_URL='postgresql://...' bun run db:drift",
    "",
    "In GitHub Actions, store it as the repository secret SUPABASE_DB_URL.",
  ].join("\n");
  if (values.require) {
    console.error(`✗ ${message}`);
    process.exit(1);
  }
  console.log(`! ${message}`);
  process.exit(0);
}

const contractPath = path.resolve(values.contract);
let contract;
try {
  contract = JSON.parse(readFileSync(contractPath, "utf8"));
} catch (error) {
  console.error(
    `✗ cannot read the schema contract at ${path.relative(process.cwd(), contractPath)}: ${error.message}`,
  );
  if (!values.write) process.exit(1);
  contract = {};
}

const sql = postgres(databaseUrl, {
  max: 1,
  connect_timeout: 15,
  // Supabase requires TLS; a local override opts out with ?sslmode=disable.
  ssl: /sslmode=disable/.test(databaseUrl) ? false : "require",
  onnotice: () => {},
});

const redact = (text) => String(text).split(databaseUrl).join("<database url>");

/** Build the snapshot the contract is compared against. */
async function readSnapshot() {
  const tables = await sql`
    select n.nspname || '.' || c.relname as table_name, c.relrowsecurity as rls
    from pg_class c
    join pg_namespace n on n.oid = c.relnamespace
    where c.relkind = 'r' and n.nspname = 'public'
    order by 1
  `;
  const columns = await sql`
    select table_name, column_name, data_type, is_nullable, column_default
    from information_schema.columns
    where table_schema = 'public'
    order by table_name, ordinal_position
  `;
  const policies = await sql`
    select tablename, policyname, permissive, roles, cmd, qual, with_check
    from pg_policies
    where schemaname = 'public'
    order by tablename, policyname
  `;
  const tableGrants = await sql`
    select table_name, grantee, privilege_type
    from information_schema.role_table_grants
    where table_schema = 'public' and grantee in ('anon', 'authenticated')
  `;
  const functions = await sql`
    select
      format('%I.%I(%s)', n.nspname, p.proname, pg_get_function_identity_arguments(p.oid)) as identity,
      p.proname as name,
      pg_get_function_result(p.oid) as returns,
      case when p.prosecdef then 'DEFINER' else 'INVOKER' end as security,
      case p.provolatile when 'v' then 'VOLATILE' when 's' then 'STABLE' else 'IMMUTABLE' end as volatility,
      coalesce(p.proconfig, '{}'::text[]) as config,
      p.prosrc as body
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public' and p.prokind = 'f'
    order by 1
  `;
  const functionGrants = await sql`
    select routine_name, grantee, privilege_type
    from information_schema.role_routine_grants
    where routine_schema = 'public' and grantee in ('anon', 'authenticated')
  `;

  /** @type {import("./schema-drift-core.mjs").SchemaSnapshot} */
  const snapshot = { tables: {}, functions: {} };
  const addGrant = (target, role, privilege) => {
    target[role] = [...(target[role] ?? []), privilege];
  };

  for (const row of tables) {
    snapshot.tables[row.table_name] = {
      rls: Boolean(row.rls),
      columns: {},
      grants: { anon: [], authenticated: [] },
      policies: {},
    };
  }
  for (const row of columns) {
    const table = snapshot.tables[`public.${row.table_name}`];
    if (!table) continue;
    table.columns[row.column_name] = {
      type: row.data_type,
      nullable: row.is_nullable === "YES",
      default: row.column_default ?? null,
    };
  }
  for (const row of tableGrants) {
    const table = snapshot.tables[`public.${row.table_name}`];
    if (table) addGrant(table.grants, row.grantee, row.privilege_type);
  }
  for (const row of policies) {
    const table = snapshot.tables[`public.${row.tablename}`];
    if (!table) continue;
    table.policies[row.policyname] = {
      command: row.cmd,
      roles: row.roles ?? [],
      permissive: row.permissive === "PERMISSIVE",
      using: row.qual ?? null,
      check: row.with_check ?? null,
    };
  }

  /** @type {Map<string, string>} */
  const identityByName = new Map();
  for (const row of functions) {
    identityByName.set(row.name, row.identity);
    snapshot.functions[row.identity] = {
      returns: row.returns,
      security: row.security,
      volatility: row.volatility,
      config: row.config ?? [],
      grants: { anon: [], authenticated: [] },
      body: row.body ?? "",
    };
  }
  for (const row of functionGrants) {
    const identity = identityByName.get(row.routine_name);
    if (!identity) continue;
    addGrant(snapshot.functions[identity].grants, row.grantee, row.privilege_type);
  }

  return snapshot;
}

/** The contract as the live database reports it, keeping the reviewed safety fragments. */
function contractFromLive(live, previous) {
  const tables = {};
  for (const [name, table] of Object.entries(live.tables)) {
    tables[name] = {
      rls: table.rls,
      columns: table.columns,
      grants: table.grants,
      policies: table.policies,
    };
  }
  const functions = {};
  for (const [identity, fn] of Object.entries(live.functions)) {
    functions[identity] = {
      returns: fn.returns,
      security: fn.security,
      volatility: fn.volatility,
      config: fn.config,
      grants: fn.grants,
      ...(previous.functions?.[identity]?.bodyMustInclude
        ? { bodyMustInclude: previous.functions[identity].bodyMustInclude }
        : {}),
    };
  }
  return {
    $comment:
      previous.$comment ??
      "Expected shape of the deployed public schema; compared by scripts/schema-drift.mjs.",
    tables,
    functions,
  };
}

try {
  const live = await readSnapshot();

  if (values.write) {
    const next = contractFromLive(live, contract);
    writeFileSync(contractPath, `${JSON.stringify(next, null, 2)}\n`);
    console.log(
      `✓ wrote ${path.relative(process.cwd(), contractPath)} from the live database ` +
        `(${Object.keys(live.tables).length} tables, ${Object.keys(live.functions).length} functions)`,
    );
    console.log(
      "  Review the file against supabase/migrations before committing: --write adopts the database, it does not judge it.",
    );
    process.exit(0);
  }

  const report = diffSchema(contract, live);
  for (const warning of report.warnings) console.warn(`! ${warning}`);
  for (const failure of report.failures) console.error(`✗ ${failure}`);

  if (report.failures.length > 0) {
    console.error(
      `\n✗ schema drift: ${report.failures.length} difference(s) between the live database and ` +
        `supabase/schema-contract.json.\n` +
        "  Either the migration is missing a change that was made in the dashboard, or the\n" +
        "  dashboard was changed without a migration. Bring the two back together:\n" +
        "    · add the change to supabase/migrations/ so it is versioned, or\n" +
        "    · if the contract is stale, run `bun run db:drift --write` and review the diff.",
    );
    process.exitCode = 1;
  } else {
    console.log(
      `✓ deployed schema matches the contract: ${report.checked.tables} tables, ` +
        `${report.checked.policies} policies, ${report.checked.functions} functions`,
    );
  }
} catch (error) {
  console.error(`✗ schema check failed: ${redact(error?.message ?? error)}`);
  process.exitCode = 1;
} finally {
  await sql.end({ timeout: 5 });
}
