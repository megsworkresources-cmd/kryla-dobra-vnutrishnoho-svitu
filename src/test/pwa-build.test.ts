import { describe, expect, it } from "vitest";
import { canCacheNavigation } from "@/lib/pwa-policy";
import { clientOutputDirectory, inspectPrecache, verifyPwaOutput } from "../../scripts/pwa-build";
import { mkdtemp, mkdir, writeFile, rm } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";

describe("PWA build output", () => {
  it("uses the deployed client directory rather than the nonexistent .output/public", () => {
    expect(
      clientOutputDirectory({
        build: { outDir: "dist" },
        environments: { client: { build: { outDir: "dist/client" } } },
      }),
    ).toBe("dist/client");
    expect(clientOutputDirectory({ build: { outDir: "custom-client" } })).toBe("custom-client");
  });
  it("verifies install icons beside the worker in the actual client output", async () => {
    const root = await mkdtemp(join(tmpdir(), "pwa-output-"));
    const output = join(root, "dist/client");
    try {
      await mkdir(join(output, "assets"), { recursive: true });
      await writeFile(
        join(output, "sw.js"),
        'x.precacheAndRoute([{url:"assets/app.js",revision:null},{url:"assets/app.css",revision:null},{url:"offline.html",revision:"1"},{url:"icon-192.png",revision:"1"}])',
      );
      for (const file of ["assets/app.js", "assets/app.css", "offline.html", "icon-192.png"])
        await writeFile(join(output, file), "test-asset");
      expect(await verifyPwaOutput(output)).toBe(4);
      await rm(join(output, "icon-192.png"));
      await expect(verifyPwaOutput(output)).rejects.toMatchObject({ code: "ENOENT" });
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });
  it("rejects the original empty precache and icon-only output", () => {
    expect(() => inspectPrecache("x.precacheAndRoute([])")).toThrow("Incomplete PWA precache");
    expect(() =>
      inspectPrecache('x.precacheAndRoute([{url:"icon-192.png",revision:"1"}])'),
    ).toThrow("Incomplete PWA precache");
  });
  it("requires executable assets, styles, icons and an offline fallback", () => {
    expect(
      inspectPrecache(
        'x.precacheAndRoute([{url:"assets/app.js",revision:null},{url:"assets/app.css",revision:null},{url:"offline.html",revision:"1"},{url:"icon-192.png",revision:"1"}])',
      ),
    ).toHaveLength(4);
  });
  it("never runtime-caches accounts, caregiver data, APIs or OAuth", () => {
    for (const pathname of [
      "/parents",
      "/shared-garden",
      "/caregiver-login",
      "/reset-password",
      "/auth/confirm",
      "/~oauth",
      "/.lovable/oauth/consent",
      "/api/public/mcp",
    ]) {
      expect(canCacheNavigation({ request: { mode: "navigate" }, url: { pathname } })).toBe(false);
    }
    expect(
      canCacheNavigation({ request: { mode: "navigate" }, url: { pathname: "/garden" } }),
    ).toBe(true);
    expect(
      canCacheNavigation({ request: { mode: "cors" }, url: { pathname: "/assets/app.js" } }),
    ).toBe(false);
  });
  it("navigation matcher is self-contained when Workbox serializes it", () => {
    const copied = new Function(
      `return (${canCacheNavigation.toString()})`,
    )() as typeof canCacheNavigation;
    expect(copied({ request: { mode: "navigate" }, url: { pathname: "/garden" } })).toBe(true);
    expect(copied({ request: { mode: "navigate" }, url: { pathname: "/parents" } })).toBe(false);
  });
});
