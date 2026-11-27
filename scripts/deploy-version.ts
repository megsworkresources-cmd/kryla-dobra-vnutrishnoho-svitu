import { execFileSync } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import type { Plugin } from "vite";
import { clientOutputDirectory } from "./pwa-build";

/** Where the deployed build says which commit it came from. */
export const VERSION_FILE = "version.json";

const SHA = /^[0-9a-f]{7,40}$/i;

/**
 * The commit this build came from. The host's own variable wins (Vercel exposes
 * VERCEL_GIT_COMMIT_SHA, Actions exposes GITHUB_SHA); a local build falls back to git.
 * "unknown" is a valid answer: the deploy check then says so instead of guessing.
 */
export function resolveBuildCommit(
  env: Record<string, string | undefined> = process.env,
  readGit: (args: string[]) => string = (args) =>
    execFileSync("git", args, { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }),
) {
  const fromHost = (env["VERCEL_GIT_COMMIT_SHA"] ?? env["GITHUB_SHA"] ?? "").trim();
  if (SHA.test(fromHost)) return fromHost.toLowerCase();
  try {
    const fromGit = readGit(["rev-parse", "HEAD"]).trim();
    return SHA.test(fromGit) ? fromGit.toLowerCase() : "unknown";
  } catch {
    return "unknown";
  }
}

/** One small, cacheable file the health check can read without rendering the app. */
export function versionPayload(commit: string, builtAt: string) {
  return `${JSON.stringify({ commit, builtAt }, null, 2)}\n`;
}

/** Written beside the files the host actually deploys, after the SW is generated. */
export function writeDeployVersion(): Plugin {
  return {
    name: "write-deploy-version",
    apply: "build",
    enforce: "post",
    buildApp: {
      order: "post",
      async handler(builder) {
        const output = resolve(builder.config.root, clientOutputDirectory(builder.config));
        await mkdir(output, { recursive: true });
        const commit = resolveBuildCommit();
        await writeFile(
          join(output, VERSION_FILE),
          versionPayload(commit, new Date().toISOString()),
        );
        console.info(`[deploy version] commit ${commit} written to ${VERSION_FILE}`);
      },
    },
  };
}
