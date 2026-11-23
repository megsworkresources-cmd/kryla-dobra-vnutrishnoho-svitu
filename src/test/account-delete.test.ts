import { beforeEach, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  rpc: vi.fn(),
  middleware: {},
}));

vi.mock("@tanstack/react-start", () => ({
  createServerFn: () => ({
    middleware: (items: unknown[]) => {
      expect(items).toEqual([mocks.middleware]);
      return {
        handler: (h: unknown) => h,
        validator: () => ({ handler: (h: unknown) => h }),
      };
    },
  }),
}));
vi.mock("@/integrations/supabase/auth-middleware", () => ({
  requireSupabaseAuth: mocks.middleware,
}));

import { deleteMyAccount } from "@/lib/account.functions";

const run = () =>
  (deleteMyAccount as unknown as (v: unknown) => Promise<{ ok: boolean }>)({
    context: {
      userId: "owner",
      supabase: { rpc: mocks.rpc, from: vi.fn() },
    },
  });

beforeEach(() => vi.clearAllMocks());

it("deletes through the security-definer RPC without any admin key", async () => {
  mocks.rpc.mockResolvedValue({ data: null, error: null });

  expect(await run()).toEqual({ ok: true });
  expect(mocks.rpc).toHaveBeenCalledWith("delete_my_account");
});

it("reports a failure when the RPC is not installed", async () => {
  const quiet = vi.spyOn(console, "error").mockImplementation(() => {});
  mocks.rpc.mockResolvedValue({
    data: null,
    error: { code: "PGRST202", message: "function not found" },
  });

  expect(await run()).toEqual({ ok: false });
  quiet.mockRestore();
});

it("reports a failure instead of switching credentials on a permission error", async () => {
  const quiet = vi.spyOn(console, "error").mockImplementation(() => {});
  mocks.rpc.mockResolvedValue({ data: null, error: { code: "42501", message: "denied" } });

  expect(await run()).toEqual({ ok: false });
  quiet.mockRestore();
});
