import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { describe, expect, it, vi } from "vitest";
import { checkCaregiver, safeReturnPath } from "@/lib/caregiver-guard";
import { routeTree } from "@/routeTree.gen";

const router = () => createRouter({ routeTree, context: { queryClient: new QueryClient() } });
const ids = (path: string) =>
  router()
    .matchRoutes(path)
    .map((m) => m.routeId as string);

describe("caregiver gate", () => {
  it("redirects to caregiver sign-in with the requested page when signed out", async () => {
    const verify = vi.fn();
    const res = await checkCaregiver({ href: "/parents", getToken: async () => null, verify });
    expect(res).toEqual({ ok: false, redirectTo: "/caregiver-login", returnTo: "/parents" });
    expect(verify).not.toHaveBeenCalled();
  });

  it("lets a caregiver in only when the server confirms the token", async () => {
    const res = await checkCaregiver({
      href: "/parents",
      getToken: async () => "a.b.c",
      verify: async () => ({ userId: "u1", email: "mum@example.com" }),
    });
    expect(res).toEqual({ ok: true, caregiver: { userId: "u1", email: "mum@example.com" } });
  });

  it("denies a token the server rejects (forged or expired)", async () => {
    const res = await checkCaregiver({
      href: "/parents",
      getToken: async () => "forged.token.x",
      verify: async () => {
        throw new Error("Unauthorized");
      },
    });
    expect(res.ok).toBe(false);
  });

  it("after sign-out (session cleared) /parents is locked again", async () => {
    let token: string | null = "a.b.c";
    const verify = async () => ({ userId: "u1", email: null });
    expect(
      (await checkCaregiver({ href: "/parents", getToken: async () => token, verify })).ok,
    ).toBe(true);
    token = null; // supabase.auth.signOut() clears the stored session
    expect(
      (await checkCaregiver({ href: "/parents", getToken: async () => token, verify })).ok,
    ).toBe(false);
  });

  it("refuses off-site return targets", () => {
    expect(safeReturnPath("//evil.com")).toBe("/parents");
    expect(safeReturnPath("https://evil.com")).toBe("/parents");
    expect(safeReturnPath("/parents")).toBe("/parents");
  });
  it("rejects expired sessions and token lookup failures", async () => {
    const verify = vi.fn(async () => {
      throw new Error("expired");
    });
    expect(
      await checkCaregiver({ href: "/parents", getToken: async () => "expired.token.x", verify }),
    ).toEqual({ ok: false, redirectTo: "/caregiver-login", returnTo: "/parents" });
    expect(
      (
        await checkCaregiver({
          href: "/parents",
          getToken: async () => {
            throw new Error("offline");
          },
          verify,
        })
      ).ok,
    ).toBe(false);
  });
  it("avoids redirect loops back into sign-in or recovery", () => {
    expect(safeReturnPath("/caregiver-login?redirect=/parents")).toBe("/parents");
    expect(safeReturnPath("/reset-password#type=recovery")).toBe("/parents");
  });
});

describe("route layout", () => {
  it("puts /parents behind the caregiver gate", () => {
    expect(ids("/parents")).toContain("/_caregiver");
  });

  it.each([
    "/",
    "/world",
    "/forest",
    "/meadow",
    "/games",
    "/watch",
    "/helper",
    "/settings",
    "/studio",
    "/caregiver-login",
    "/reset-password",
    "/explore",
    "/safe",
    "/friends",
    "/garden",
    "/clouds",
    "/sky",
    "/path",
  ])("keeps %s public and account-free", (p) => {
    const m = ids(p);
    expect(m).not.toContain("/_caregiver");
    expect(m.at(-1)).not.toBe("__root__");
  });
});
