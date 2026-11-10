import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ getUser: vi.fn(), header: vi.fn(), middleware: {} }));
vi.mock("@tanstack/react-start", () => ({
  createServerFn: () => ({
    middleware: (items: unknown[]) => {
      expect(items).toEqual([mocks.middleware]);
      return { handler: (handler: (args: unknown) => unknown) => handler };
    },
  }),
}));
vi.mock("@tanstack/react-start/server", () => ({
  setResponseHeader: mocks.header,
  getRequestHeader: () => "Bearer validated.token.example",
}));
vi.mock("@/integrations/supabase/auth-middleware", () => ({
  requireSupabaseAuth: mocks.middleware,
}));
import { verifyCaregiver } from "@/lib/caregiver.functions";

const verify = () =>
  (verifyCaregiver as unknown as (args: unknown) => Promise<unknown>)({
    context: { supabase: { auth: { getUser: mocks.getUser } } },
  });

describe("caregiver server identity", () => {
  beforeEach(() => vi.clearAllMocks());
  it("returns only server-verified account identity and forbids shared caching", async () => {
    mocks.getUser.mockResolvedValue({
      data: {
        user: {
          id: "caregiver",
          email: "adult@example.test",
          email_confirmed_at: "2026-11-10",
          is_anonymous: false,
        },
      },
      error: null,
    });
    expect(await verify()).toEqual({ userId: "caregiver", email: "adult@example.test" });
    expect(mocks.header).toHaveBeenCalledWith("Cache-Control", "no-store");
    expect(mocks.getUser).toHaveBeenCalledWith("validated.token.example");
  });
  it.each([
    { user: null },
    { user: { id: "anonymous", is_anonymous: true, email_confirmed_at: "2026-11-10" } },
  ])("rejects missing or anonymous identity: %j", async (data) => {
    mocks.getUser.mockResolvedValue({ data, error: null });
    await expect(verify()).rejects.toThrow("Unauthorized");
  });
  it("rejects invalid or expired credentials reported by Auth", async () => {
    mocks.getUser.mockResolvedValue({ data: { user: null }, error: new Error("JWT expired") });
    await expect(verify()).rejects.toThrow("Unauthorized");
  });
});
