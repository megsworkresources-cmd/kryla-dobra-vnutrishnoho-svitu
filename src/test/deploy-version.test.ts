import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  resolveBuildCommit,
  VERSION_FILE,
  versionPayload,
  writeDeployVersion,
} from "../../scripts/deploy-version";

const FULL = "2c2b778a418fa84c624fc6cce88e4280488dcc70";
const OTHER = "deadbeefdeadbeefdeadbeefdeadbeefdeadbeef";
const roots: string[] = [];

afterEach(async () => {
  vi.unstubAllEnvs();
  for (const root of roots.splice(0)) await rm(root, { recursive: true, force: true });
});

describe("build commit", () => {
  it("prefers the host's own commit over the checkout", () => {
    const readGit = vi.fn(() => OTHER);
    expect(resolveBuildCommit({ VERCEL_GIT_COMMIT_SHA: FULL, GITHUB_SHA: OTHER }, readGit)).toBe(
      FULL,
    );
    expect(readGit).not.toHaveBeenCalled();
  });

  it("uses the CI commit when the host variable is absent", () => {
    expect(resolveBuildCommit({}, () => OTHER)).toBe(OTHER);
  });

  it("falls back to git for a local build", () => {
    expect(resolveBuildCommit({}, () => `${FULL}\n`)).toBe(FULL);
  });

  it("says unknown rather than guessing when nothing names the commit", () => {
    expect(
      resolveBuildCommit({}, () => {
        throw new Error("not a repository");
      }),
    ).toBe("unknown");
    // A branch name is not a commit, so it must not be reported as one.
    expect(resolveBuildCommit({ VERCEL_GIT_COMMIT_SHA: "main" }, () => "")).toBe("unknown");
  });

  it("writes a payload the deploy check accepts as a commit", () => {
    const payload = JSON.parse(versionPayload(FULL, "2026-11-27T00:00:00.000Z"));
    expect(payload).toEqual({ commit: FULL, builtAt: "2026-11-27T00:00:00.000Z" });
    // Same shape scripts/verify-deploy.mjs requires before it compares with --expect.
    expect(payload.commit).toMatch(/^[0-9a-f]{7,40}$/i);
    expect(versionPayload(FULL, "now").endsWith("\n")).toBe(true);
  });
});

describe("version file", () => {
  it("lands in the client directory the host deploys, not the server output", async () => {
    const root = await mkdtemp(join(tmpdir(), "deploy-version-"));
    roots.push(root);
    vi.stubEnv("VERCEL_GIT_COMMIT_SHA", FULL);
    // Vite types the hook as a function or { handler }; this plugin uses the ordered form.
    const hook = writeDeployVersion().buildApp as
      { handler?: (builder: unknown) => Promise<void> } | undefined;
    const handler = hook?.handler;
    if (typeof handler !== "function") throw new Error("Missing buildApp handler");
    await handler({
      config: {
        root,
        build: { outDir: "dist/server" },
        environments: { client: { build: { outDir: "dist/client" } } },
      },
    });

    const written = JSON.parse(await readFile(join(root, "dist/client", VERSION_FILE), "utf8"));
    expect(written.commit).toBe(FULL);
    expect(typeof written.builtAt).toBe("string");
    await expect(readFile(join(root, "dist/server", VERSION_FILE), "utf8")).rejects.toMatchObject({
      code: "ENOENT",
    });
  });
});
