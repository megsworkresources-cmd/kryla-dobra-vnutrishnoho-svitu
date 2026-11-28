import { describe, expect, it } from "vitest";
import {
  diffSchema,
  normalizeExpr,
  type SchemaContract,
  type SchemaSnapshot,
} from "../../scripts/schema-drift-core.mjs";

const OWNER =
  "owner_id = auth.uid() and coalesce((auth.jwt() ->> 'is_anonymous')::boolean, false) = false";
const TABLE = "public.shared_sunflowers";
const GROW = "public.grow_sunflower(integer,boolean)";

const contract: SchemaContract = {
  tables: {
    [TABLE]: {
      rls: true,
      columns: {
        owner_id: { type: "uuid", nullable: false, default: null },
        stage: { type: "smallint", nullable: false, default: "0" },
        stage_updated_at: {
          type: "timestamp with time zone",
          nullable: false,
          default: "now()",
        },
      },
      grants: { anon: [], authenticated: ["SELECT", "DELETE"] },
      policies: {
        sunflower_owner_read: {
          command: "SELECT",
          roles: ["authenticated"],
          permissive: true,
          using: OWNER,
          check: null,
        },
      },
    },
  },
  functions: {
    [GROW]: {
      returns: "TABLE(stage smallint, capped boolean)",
      security: "DEFINER",
      volatility: "VOLATILE",
      config: ["search_path=public"],
      grants: { anon: [], authenticated: ["EXECUTE"] },
      bodyMustInclude: ["new_stage not between 0 and 5", "interval 20 hours"],
    },
  },
};

const live = (): SchemaSnapshot => ({
  tables: {
    [TABLE]: {
      rls: true,
      columns: {
        owner_id: { type: "uuid", nullable: false, default: null },
        stage: { type: "smallint", nullable: false, default: "0" },
        stage_updated_at: {
          type: "timestamp with time zone",
          nullable: false,
          default: "now()",
        },
      },
      grants: { anon: [], authenticated: ["SELECT", "DELETE"] },
      policies: {
        sunflower_owner_read: {
          command: "SELECT",
          roles: ["authenticated"],
          permissive: true,
          using: OWNER,
          check: null,
        },
      },
    },
  },
  functions: {
    [GROW]: {
      returns: "TABLE(stage smallint, capped boolean)",
      security: "DEFINER",
      volatility: "VOLATILE",
      config: ["search_path=public"],
      grants: { anon: [], authenticated: ["EXECUTE"] },
      body:
        "BEGIN IF new_stage NOT BETWEEN 0 AND 5 THEN RAISE EXCEPTION 'Invalid'; END IF; " +
        "IF cur.stage_updated_at <= now() - interval '20 hours' THEN target := cur.stage + 1; END IF; END;",
    },
  },
});

const table = (snapshot: SchemaSnapshot) => {
  const found = snapshot.tables[TABLE];
  if (!found) throw new Error(`fixture is missing ${TABLE}`);
  return found;
};

const grow = (snapshot: SchemaSnapshot) => {
  const found = snapshot.functions[GROW];
  if (!found) throw new Error(`fixture is missing ${GROW}`);
  return found;
};

const readPolicy = (snapshot: SchemaSnapshot) => {
  const found = table(snapshot).policies["sunflower_owner_read"];
  if (!found) throw new Error("fixture is missing sunflower_owner_read");
  return found;
};

describe("schema drift", () => {
  it("passes when the database matches the contract", () => {
    const report = diffSchema(contract, live());
    expect(report.failures).toEqual([]);
    expect(report.checked).toEqual({ tables: 1, policies: 1, functions: 1 });
  });

  it("ignores formatting, case, parentheses and casts", () => {
    const formatted = live();
    readPolicy(formatted).using =
      "((OWNER_ID) = (AUTH.UID())) AND (COALESCE((AUTH.JWT() ->> 'is_anonymous'::text)::BOOLEAN, FALSE) = FALSE)";
    const stage = table(formatted).columns["stage"];
    if (stage) stage.default = "'0'::smallint";
    expect(diffSchema(contract, formatted).failures).toEqual([]);
    expect(normalizeExpr("a  =  b::text")).toBe("a b");
  });

  it("reports a missing table and function", () => {
    const broken = live();
    delete broken.tables[TABLE];
    delete broken.functions[GROW];
    const failures = diffSchema(contract, broken).failures;
    expect(failures).toContain(`table ${TABLE} is missing from the database`);
    expect(failures).toContain(`function ${GROW} is missing from the database`);
  });

  it("reports a missing column and policy", () => {
    const partial = live();
    delete table(partial).columns["stage"];
    delete table(partial).policies["sunflower_owner_read"];
    const failures = diffSchema(contract, partial).failures;
    expect(failures.some((line) => line.includes('column "stage" is missing'))).toBe(true);
    expect(failures.some((line) => line.includes('policy "sunflower_owner_read" is missing'))).toBe(
      true,
    );
  });

  it("catches a policy that admits everyone", () => {
    const weakened = live();
    readPolicy(weakened).using = "true";
    const failures = diffSchema(contract, weakened).failures;
    expect(failures).toHaveLength(1);
    expect(failures[0]).toContain("USING is true");
  });

  it("catches a policy added in the dashboard", () => {
    const extra = live();
    table(extra).policies["anyone_can_write"] = {
      command: "INSERT",
      roles: ["anon"],
      permissive: true,
      using: null,
      check: "true",
    };
    const failures = diffSchema(contract, extra).failures;
    expect(
      failures.some((line) => line.includes('policy "anyone_can_write" is not in the contract')),
    ).toBe(true);
  });

  it("catches row level security being switched off", () => {
    const open = live();
    table(open).rls = false;
    expect(diffSchema(contract, open).failures[0]).toContain("row level security is disabled");
  });

  it("catches widened table and function grants", () => {
    const widened = live();
    table(widened).grants["anon"] = ["SELECT"];
    grow(widened).grants["anon"] = ["EXECUTE"];
    const failures = diffSchema(contract, widened).failures;
    expect(failures.some((line) => line.includes("grants for anon are [SELECT]"))).toBe(true);
    expect(failures.some((line) => line.includes("execute for anon is [EXECUTE]"))).toBe(true);
  });

  it("catches a function that would run as the caller or lost its daily limit", () => {
    const changed = live();
    grow(changed).security = "INVOKER";
    grow(changed).config = ["search_path="];
    grow(changed).body =
      "BEGIN INSERT INTO public.shared_sunflowers VALUES (auth.uid(), new_stage); END;";
    const failures = diffSchema(contract, changed).failures;
    expect(failures.some((line) => line.includes("security is INVOKER"))).toBe(true);
    expect(failures.some((line) => line.includes("settings are"))).toBe(true);
    expect(
      failures.some((line) => line.includes('body no longer contains "interval 20 hours"')),
    ).toBe(true);
  });

  it("warns about unrelated objects without failing", () => {
    const extra = live();
    extra.tables["public.tmp_notes"] = {
      rls: false,
      columns: {},
      grants: { anon: [], authenticated: [] },
      policies: {},
    };
    const report = diffSchema(contract, extra);
    expect(report.failures).toEqual([]);
    expect(report.warnings).toEqual(["table public.tmp_notes exists but is not in the contract"]);
  });
});
