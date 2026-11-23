import { describe, expect, it } from "vitest";
import { pwaWorkboxOptions } from "../../scripts/pwa-workbox";
import { canCacheNavigation } from "@/lib/pwa-policy";

describe("shared production and browser-harness worker policy", () => {
  it("uses NetworkFirst with the prepared offline fallback for public navigations", () => {
    const policy = pwaWorkboxOptions();
    expect(policy.navigateFallback).toBeNull();
    expect(policy.runtimeCaching?.[0]?.handler).toBe("NetworkFirst");
    expect(policy.runtimeCaching?.[0]?.options?.precacheFallback?.fallbackURL).toBe(
      "/offline.html",
    );
    expect(policy.globPatterns).toContain("offline.html");
    expect(policy.globPatterns?.some((p) => p.includes("html") && p !== "offline.html")).toBe(
      false,
    );
  });
  it("never caches private, account or OAuth navigation paths", () => {
    const matcher = pwaWorkboxOptions().runtimeCaching?.[0]?.urlPattern;
    expect(matcher).toBe(canCacheNavigation);
    for (const path of [
      "/parents",
      "/shared-garden",
      "/caregiver-login",
      "/reset-password",
      "/auth/confirm",
      "/~oauth/authorize",
      "/.lovable/oauth/consent",
      "/api/public/mcp",
    ]) {
      expect(
        canCacheNavigation({
          request: { mode: "cors" },
          url: new URL(`https://test.example${path}`),
        }),
      ).toBe(false);
      expect(
        canCacheNavigation({
          request: { mode: "navigate" },
          url: new URL(`https://test.example${path}`),
        }),
      ).toBe(false);
    }
    expect(
      canCacheNavigation({
        request: { mode: "navigate" },
        url: new URL("https://test.example/games"),
      }),
    ).toBe(true);
  });
});
