export interface ServiceRoleClientImport {
  file: string;
  line: number;
  specifier: string;
}

export function findServiceRoleClientImports(root?: string): ServiceRoleClientImport[];

export function assertNoServiceRoleClientImports(root?: string): void;
