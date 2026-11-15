import { beforeEach, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({
  auth: vi.fn(),
  rpc: vi.fn(),
  maybe: vi.fn(),
  middleware: {},
  header: vi.fn(),
}));
vi.mock("@tanstack/react-start", () => ({
  createServerFn: () => ({
    middleware: (items: unknown[]) => {
      expect(items).toEqual([mocks.middleware]);
      return {
        handler: (h: unknown) => h,
        validator: () => ({ handler: (h: unknown) => h }),
        inputValidator: () => ({ handler: (h: unknown) => h }),
      };
    },
  }),
}));
vi.mock("@tanstack/react-start/server", () => ({
  getRequestHeader: () => "Bearer verified",
  setResponseHeader: mocks.header,
}));
vi.mock("@/integrations/supabase/auth-middleware", () => ({
  requireSupabaseAuth: mocks.middleware,
}));
import { readGarden, shareSunflower } from "@/lib/shared-garden.functions";
const context = () => ({
  userId: "owner",
  supabase: {
    auth: { getUser: mocks.auth },
    rpc: mocks.rpc,
    from: () => ({ select: () => ({ eq: () => ({ maybeSingle: mocks.maybe }) }) }),
  },
});
const read = () =>
  (readGarden as unknown as (v: unknown) => Promise<unknown>)({ context: context() });
const share = () =>
  (shareSunflower as unknown as (v: unknown) => Promise<unknown>)({
    context: context(),
    data: { stage: 3, sharing: true },
  });
beforeEach(() => {
  vi.clearAllMocks();
  mocks.auth.mockResolvedValue({
    data: { user: { id: "owner", is_anonymous: false } },
    error: null,
  });
  mocks.maybe.mockResolvedValue({ data: null, error: null });
  mocks.rpc.mockResolvedValue({ data: [], error: null });
});
it("starts sharing off and returns only anonymous garden data with no shared caching", async () => {
  expect(await read()).toEqual({ own: { stage: 0, sharing: false }, flowers: [] });
  expect(mocks.header).toHaveBeenCalledWith("Cache-Control", "no-store");
});
it("sends only the stage and opt-in to the owner-scoped RPC", async () => {
  await share();
  expect(mocks.rpc).toHaveBeenCalledWith("publish_sunflower", { new_stage: 3, opt_in: true });
});
it.each([null, { id: "anonymous", is_anonymous: true }])(
  "denies missing/anonymous caregiver before any garden operation",
  async (user) => {
    mocks.auth.mockResolvedValue({ data: { user }, error: null });
    await expect(read()).rejects.toThrow("Unauthorized");
    await expect(share()).rejects.toThrow("Unauthorized");
    expect(mocks.rpc).not.toHaveBeenCalled();
  },
);
