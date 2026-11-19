import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("PWA build output", () => {
  it("writes the service worker beside the deployed client assets", () => {
    const config = readFileSync("vite.config.ts", "utf8");

    expect(config).toContain('outDir: ".output/public"');
  });
});
