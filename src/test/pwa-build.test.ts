import { describe, expect, it } from "vitest";
import { canCacheNavigation } from "@/lib/pwa-policy";
import { inspectPrecache } from "../../scripts/pwa-build";

describe("PWA build output", () => {
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
