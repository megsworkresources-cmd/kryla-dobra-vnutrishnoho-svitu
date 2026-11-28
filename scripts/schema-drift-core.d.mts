export interface ColumnContract {
  type: string;
  nullable: boolean;
  default: string | null;
}

export interface PolicyContract {
  command: string;
  roles: string[];
  permissive?: boolean;
  using: string | null;
  check: string | null;
}

export interface TableContract {
  rls: boolean;
  columns: Record<string, ColumnContract>;
  grants: Record<string, string[]>;
  policies?: Record<string, PolicyContract>;
}

export interface FunctionContract {
  returns: string;
  security: string;
  volatility: string;
  config?: string[];
  grants: Record<string, string[]>;
  bodyMustInclude?: string[];
}

export interface SchemaContract {
  tables?: Record<string, TableContract>;
  functions?: Record<string, FunctionContract>;
}

export interface TableSnapshot {
  rls: boolean;
  columns: Record<string, ColumnContract>;
  grants: Record<string, string[]>;
  policies: Record<string, PolicyContract>;
}

export interface FunctionSnapshot extends FunctionContract {
  body?: string;
}

export interface SchemaSnapshot {
  tables: Record<string, TableSnapshot>;
  functions: Record<string, FunctionSnapshot>;
}

export interface DriftReport {
  failures: string[];
  warnings: string[];
  checked: { tables: number; policies: number; functions: number };
}

export function normalizeExpr(value: unknown): string | null;

export function diffSchema(contract: SchemaContract, live: SchemaSnapshot): DriftReport;
