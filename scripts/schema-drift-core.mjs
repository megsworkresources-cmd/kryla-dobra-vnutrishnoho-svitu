/**
 * Pure comparison between the expected schema contract (`supabase/schema-contract.json`)
 * and a snapshot read from the live database. Kept free of connections and I/O so the
 * rules are unit tested; `scripts/schema-drift.mjs` does the reading.
 *
 * Expressions are normalised before comparing: case, whitespace, parentheses and
 * type casts are ignored, so reformatting a policy in the dashboard is not drift,
 * while changing who it admits is.
 */

const TYPE_CAST =
  /::\s*(?:text|boolean|bool|uuid|smallint|integer|int4|int8|bigint|numeric|timestamptz|timestamp with time zone|timestamp without time zone|character varying|varchar|jsonb|json|name|regclass|regprocedure|oid|double precision|real)/g;

/**
 * Reduce a SQL expression, type or body fragment to comparable tokens.
 * @param {unknown} value
 * @returns {string | null}
 */
export function normalizeExpr(value) {
  if (value === null || value === undefined) return null;
  const text = String(value).trim();
  if (!text) return "";
  return text
    .toLowerCase()
    .replace(TYPE_CAST, " ")
    .replace(/[^a-z0-9_]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

const privileges = (list) =>
  [...new Set((Array.isArray(list) ? list : []).map((item) => String(item).toUpperCase()))].sort();

const sameSet = (a, b) => a.length === b.length && a.every((item, index) => item === b[index]);

const quote = (name) => `"${name}"`;

/**
 * @param {import("./schema-drift-core.mjs").SchemaContract} contract
 * @param {import("./schema-drift-core.mjs").SchemaSnapshot} live
 * @returns {import("./schema-drift-core.mjs").DriftReport}
 */
export function diffSchema(contract, live) {
  /** @type {string[]} */
  const failures = [];
  /** @type {string[]} */
  const warnings = [];
  let policyCount = 0;

  const expectedTables = contract.tables ?? {};
  const liveTables = live.tables ?? {};

  for (const [table, spec] of Object.entries(expectedTables)) {
    const actual = liveTables[table];
    if (!actual) {
      failures.push(`table ${table} is missing from the database`);
      continue;
    }

    if (Boolean(spec.rls) !== Boolean(actual.rls)) {
      failures.push(
        `table ${table}: row level security is ${actual.rls ? "enabled" : "disabled"}, contract says ${spec.rls ? "enabled" : "disabled"}`,
      );
    }

    for (const [column, expected] of Object.entries(spec.columns ?? {})) {
      const found = actual.columns?.[column];
      if (!found) {
        failures.push(`table ${table}: column ${quote(column)} is missing`);
        continue;
      }
      if (normalizeExpr(found.type) !== normalizeExpr(expected.type)) {
        failures.push(
          `table ${table}: column ${quote(column)} is ${found.type}, contract says ${expected.type}`,
        );
      }
      if (Boolean(found.nullable) !== Boolean(expected.nullable)) {
        failures.push(
          `table ${table}: column ${quote(column)} is ${found.nullable ? "nullable" : "NOT NULL"}, contract says ${expected.nullable ? "nullable" : "NOT NULL"}`,
        );
      }
      if ((normalizeExpr(found.default) ?? null) !== (normalizeExpr(expected.default) ?? null)) {
        failures.push(
          `table ${table}: default of ${quote(column)} is ${found.default ?? "none"}, contract says ${expected.default ?? "none"}`,
        );
      }
    }
    for (const column of Object.keys(actual.columns ?? {})) {
      if (!(column in (spec.columns ?? {}))) {
        failures.push(`table ${table}: column ${quote(column)} is not in the contract`);
      }
    }

    for (const role of ["anon", "authenticated"]) {
      const expected = privileges(spec.grants?.[role]);
      const found = privileges(actual.grants?.[role]);
      if (!sameSet(expected, found)) {
        failures.push(
          `table ${table}: grants for ${role} are [${found.join(", ")}], contract says [${expected.join(", ")}]`,
        );
      }
    }

    const expectedPolicies = spec.policies ?? {};
    const actualPolicies = actual.policies ?? {};
    for (const [name, policy] of Object.entries(expectedPolicies)) {
      policyCount += 1;
      const found = actualPolicies[name];
      if (!found) {
        failures.push(`table ${table}: policy ${quote(name)} is missing`);
        continue;
      }
      if (String(found.command).toUpperCase() !== String(policy.command).toUpperCase()) {
        failures.push(
          `table ${table}: policy ${quote(name)} applies to ${found.command}, contract says ${policy.command}`,
        );
      }
      if (!sameSet(privileges(found.roles), privileges(policy.roles))) {
        failures.push(
          `table ${table}: policy ${quote(name)} applies to [${privileges(found.roles).join(", ")}], contract says [${privileges(policy.roles).join(", ")}]`,
        );
      }
      if (Boolean(found.permissive ?? true) !== Boolean(policy.permissive ?? true)) {
        failures.push(
          `table ${table}: policy ${quote(name)} changed between permissive and restrictive`,
        );
      }
      for (const clause of /** @type {const} */ (["using", "check"])) {
        const expectedClause = normalizeExpr(policy[clause]);
        const foundClause = normalizeExpr(found[clause]);
        if (expectedClause !== foundClause) {
          failures.push(
            `table ${table}: policy ${quote(name)} ${clause === "using" ? "USING" : "WITH CHECK"} is ${found[clause] ?? "absent"}, contract says ${policy[clause] ?? "absent"}`,
          );
        }
      }
    }
    for (const name of Object.keys(actualPolicies)) {
      if (!(name in expectedPolicies)) {
        failures.push(`table ${table}: policy ${quote(name)} is not in the contract`);
      }
    }
  }

  for (const table of Object.keys(liveTables)) {
    if (!(table in expectedTables))
      warnings.push(`table ${table} exists but is not in the contract`);
  }

  const expectedFunctions = contract.functions ?? {};
  const liveFunctions = live.functions ?? {};
  for (const [identity, spec] of Object.entries(expectedFunctions)) {
    const actual = liveFunctions[identity];
    if (!actual) {
      failures.push(`function ${identity} is missing from the database`);
      continue;
    }
    for (const field of /** @type {const} */ (["returns", "security", "volatility"])) {
      if (normalizeExpr(actual[field]) !== normalizeExpr(spec[field])) {
        failures.push(
          `function ${identity}: ${field} is ${actual[field]}, contract says ${spec[field]}`,
        );
      }
    }
    const expectedConfig = privileges(spec.config ?? []);
    const foundConfig = privileges(actual.config ?? []);
    if (!sameSet(expectedConfig, foundConfig)) {
      failures.push(
        `function ${identity}: settings are [${foundConfig.join(", ")}], contract says [${expectedConfig.join(", ")}]`,
      );
    }
    for (const role of ["anon", "authenticated"]) {
      const expected = privileges(spec.grants?.[role]);
      const found = privileges(actual.grants?.[role]);
      if (!sameSet(expected, found)) {
        failures.push(
          `function ${identity}: execute for ${role} is [${found.join(", ")}], contract says [${expected.join(", ")}]`,
        );
      }
    }
    const body = normalizeExpr(actual.body) ?? "";
    for (const fragment of spec.bodyMustInclude ?? []) {
      if (!body.includes(normalizeExpr(fragment) ?? "")) {
        failures.push(`function ${identity}: body no longer contains ${JSON.stringify(fragment)}`);
      }
    }
  }
  for (const identity of Object.keys(liveFunctions)) {
    if (!(identity in expectedFunctions)) {
      warnings.push(`function ${identity} exists but is not in the contract`);
    }
  }

  return {
    failures,
    warnings,
    checked: {
      tables: Object.keys(expectedTables).length,
      policies: policyCount,
      functions: Object.keys(expectedFunctions).length,
    },
  };
}
