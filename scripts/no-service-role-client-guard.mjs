#!/usr/bin/env node
/**
 * Fails the build if app code imports the generated service-role Supabase
 * client (`src/integrations/supabase/client.server.ts`).
 *
 * The app must reach Supabase through the authenticated browser client; account
 * deletion uses the `delete_my_account` security-definer RPC, so no code path
 * needs a client that bypasses RLS.
 *
 *   node scripts/no-service-role-client-guard.mjs
 *
 * Vite also calls this from vite.config.ts before every build.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const SOURCE_EXTENSIONS = new Set([".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs"]);
const GENERATED_CLIENT_FILE = /^client\.server\./;
const SERVICE_ROLE_SPECIFIER = /(?:^|\/)client\.server(?:\.(?:ts|tsx|js|jsx|mjs|cjs))?$/;

/** Every source file under `<root>/src`, skipping the generated client itself. */
function sourceFiles(root) {
  const srcDir = path.join(root, "src");
  const files = [];
  const walk = (dir) => {
    for (const entry of fs
      .readdirSync(dir, { withFileTypes: true })
      .sort((a, b) => a.name.localeCompare(b.name))) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(full);
      } else if (
        SOURCE_EXTENSIONS.has(path.extname(entry.name)) &&
        !GENERATED_CLIENT_FILE.test(entry.name)
      ) {
        files.push(full);
      }
    }
  };
  if (fs.existsSync(srcDir)) walk(srcDir);
  return files;
}

function scriptKind(file) {
  const ext = path.extname(file);
  if (ext === ".tsx") return ts.ScriptKind.TSX;
  if (ext === ".jsx") return ts.ScriptKind.JSX;
  if (ext === ".ts") return ts.ScriptKind.TS;
  return ts.ScriptKind.JS;
}

function lineOf(source, node) {
  return source.getLineAndCharacterOfPosition(node.getStart(source)).line + 1;
}

/**
 * Finds imports, re-exports, dynamic imports and require() calls that point at
 * the generated service-role client.
 *
 * @param {string} [root]
 * @returns {{ file: string, line: number, specifier: string }[]}
 */
export function findServiceRoleClientImports(root = process.cwd()) {
  const found = [];

  for (const file of sourceFiles(root)) {
    const text = fs.readFileSync(file, "utf8");
    const source = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true, scriptKind(file));

    const check = (node, moduleSpecifier) => {
      if (!moduleSpecifier || !ts.isStringLiteralLike(moduleSpecifier)) return;
      const specifier = moduleSpecifier.text;
      if (!SERVICE_ROLE_SPECIFIER.test(specifier.replace(/^@\//, ""))) return;
      found.push({ file, line: lineOf(source, node), specifier });
    };

    const visit = (node) => {
      if (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) {
        check(node, node.moduleSpecifier);
      } else if (
        ts.isImportEqualsDeclaration(node) &&
        ts.isExternalModuleReference(node.moduleReference)
      ) {
        check(node, node.moduleReference.expression);
      } else if (ts.isCallExpression(node)) {
        const dynamicImport = node.expression.kind === ts.SyntaxKind.ImportKeyword;
        const requireCall = ts.isIdentifier(node.expression) && node.expression.text === "require";
        if ((dynamicImport || requireCall) && node.arguments.length === 1) {
          check(node, node.arguments[0]);
        }
      }
      ts.forEachChild(node, visit);
    };

    visit(source);
  }

  return found;
}

/**
 * @param {string} [root]
 */
export function assertNoServiceRoleClientImports(root = process.cwd()) {
  const found = findServiceRoleClientImports(root);
  if (found.length === 0) return;

  const locations = found.map(
    ({ file, line, specifier }) => `  ${path.relative(root, file)}:${line} → ${specifier}`,
  );
  throw new Error(
    [
      "App code must not import the generated service-role Supabase client:",
      ...locations,
      "",
      'Use the authenticated client from "@/integrations/supabase/client" instead.',
      "Account deletion goes through the delete_my_account RPC; no service-role fallback is needed.",
    ].join("\n"),
  );
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    assertNoServiceRoleClientImports();
    console.log("✓ app code does not import the service-role Supabase client");
  } catch (error) {
    console.error(`✗ ${error.message}`);
    process.exitCode = 1;
  }
}
