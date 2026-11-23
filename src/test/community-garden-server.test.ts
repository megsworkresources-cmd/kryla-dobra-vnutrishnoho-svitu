import { afterEach, expect, it, vi } from "vitest";

vi.mock("@tanstack/react-start", () => ({
  createServerFn: () => ({ handler: (handler: () => unknown) => handler }),
}));
vi.mock("@tanstack/react-start/server", () => ({ setResponseHeader: vi.fn() }));
const { rpc, createClient } = vi.hoisted(() => {
  const rpc = vi.fn();
  return { rpc, createClient: vi.fn(() => ({ rpc })) };
});
vi.mock("@supabase/supabase-js", () => ({ createClient }));
afterEach(() => {
  vi.unstubAllEnvs();
  vi.clearAllMocks();
});

it("fails closed when the public projection is missing, without reading the table", async () => {
  vi.stubEnv("SUPABASE_URL", "https://example.test");
  vi.stubEnv("SUPABASE_PUBLISHABLE_KEY", "sb_publishable_test");
  rpc.mockResolvedValue({ data: null, error: { code: "PGRST202" } });
  const { readCommunityGarden } = await import("@/lib/community-garden.functions");
  expect(await readCommunityGarden()).toEqual({ ok: false, stages: [] });
  expect(rpc).toHaveBeenCalledExactlyOnceWith("read_public_sunflower_stages");
  expect(createClient).toHaveBeenCalledTimes(1);
});

it("returns only valid coarse stages from the public projection", async () => {
  vi.stubEnv("SUPABASE_URL", "https://example.test");
  vi.stubEnv("SUPABASE_PUBLISHABLE_KEY", "sb_publishable_test");
  rpc.mockResolvedValue({
    data: [{ stage: 2, owner_id: "private" }, { stage: 5 }, { stage: 6 }],
    error: null,
  });
  const { readCommunityGarden } = await import("@/lib/community-garden.functions");
  expect(await readCommunityGarden()).toEqual({ ok: true, stages: [2, 5] });
});
