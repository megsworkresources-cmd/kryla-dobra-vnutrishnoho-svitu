import { afterEach, expect, it, vi } from "vitest";
import { synthesize } from "@/lib/voice.server";

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

it("shares simultaneous synthesis and reuses a completed app-line recording", async () => {
  vi.stubEnv("LOVABLE_API_KEY", "test-key");
  const upstream = vi.fn(
    async () =>
      new Response(new Uint8Array([1, 2, 3]), {
        status: 200,
        headers: { "Content-Type": "audio/wav" },
      }),
  );
  vi.stubGlobal("fetch", upstream);
  const first = synthesize("Кешований тестовий рядок", "Leda", "uk", "narrator");
  const second = synthesize("Кешований тестовий рядок", "Leda", "uk", "narrator");
  const [a, b] = await Promise.all([first, second]);
  const replay = await synthesize("Кешований тестовий рядок", "Leda", "uk", "narrator");
  expect(a).toBe(b);
  expect(replay).toBe(a);
  expect(a.startsWith("data:audio/wav;base64,")).toBe(true);
  expect(upstream).toHaveBeenCalledTimes(1);
});
