import { beforeEach, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  rpc: vi.fn(),
  removeOwnRow: vi.fn(),
  adminDelete: vi.fn(),
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
vi.mock("@/integrations/supabase/client.server", () => ({
  supabaseAdmin: { auth: { admin: { deleteUser: mocks.adminDelete } } },
}));

import { deleteMyAccount } from "@/lib/account.functions";

const run = () =>
  (deleteMyAccount as unknown as (v: unknown) => Promise<{ ok: boolean }>)({
    context: {
      userId: "owner",
      supabase: {
        rpc: mocks.rpc,
        from: () => ({ delete: () => ({ eq: mocks.removeOwnRow }) }),
      },
    },
  });

beforeEach(() => {
  vi.clearAllMocks();
  mocks.removeOwnRow.mockResolvedValue({ error: null });
});

it("deletes through the security-definer RPC without any admin key", async () => {
  mocks.rpc.mockResolvedValue({ data: null, error: null });

  expect(await run()).toEqual({ ok: true });
  expect(mocks.rpc).toHaveBeenCalledWith("delete_my_account");
  expect(mocks.removeOwnRow).not.toHaveBeenCalled();
  expect(mocks.adminDelete).not.toHaveBeenCalled();
});

it("falls back to the admin client where the RPC is not installed yet", async () => {
  const quiet = vi.spyOn(console, "error").mockImplementation(() => {});
  mocks.rpc.mockResolvedValue({
    data: null,
    error: { code: "PGRST202", message: "function not found" },
  });
  mocks.adminDelete.mockResolvedValue({ error: null });

  expect(await run()).toEqual({ ok: true });
  expect(mocks.removeOwnRow).toHaveBeenCalledWith("owner_id", "owner");
  expect(mocks.adminDelete).toHaveBeenCalledWith("owner");
  quiet.mockRestore();
});

it("also falls back when Postgres reports the function as undefined", async () => {
  const quiet = vi.spyOn(console, "error").mockImplementation(() => {});
  mocks.rpc.mockResolvedValue({ data: null, error: { code: "42883", message: "undefined" } });
  mocks.adminDelete.mockResolvedValue({ error: null });

  expect(await run()).toEqual({ ok: true });
  expect(mocks.adminDelete).toHaveBeenCalledWith("owner");
  quiet.mockRestore();
});

it("reports failure when neither path can delete the account", async () => {
  const quiet = vi.spyOn(console, "error").mockImplementation(() => {});
  mocks.rpc.mockResolvedValue({ data: null, error: { code: "PGRST202", message: "not found" } });
  mocks.adminDelete.mockResolvedValue({ error: { status: 401, code: "invalid_key" } });

  expect(await run()).toEqual({ ok: false });
  quiet.mockRestore();
});

it("does not switch to the admin key when the RPC fails for another reason", async () => {
  const quiet = vi.spyOn(console, "error").mockImplementation(() => {});
  mocks.rpc.mockResolvedValue({ data: null, error: { code: "42501", message: "denied" } });

  expect(await run()).toEqual({ ok: false });
  expect(mocks.removeOwnRow).not.toHaveBeenCalled();
  expect(mocks.adminDelete).not.toHaveBeenCalled();
  quiet.mockRestore();
});
