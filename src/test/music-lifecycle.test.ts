import { afterEach, expect, it, vi } from "vitest";

afterEach(() => { vi.unstubAllGlobals(); });

it("does not start a late recording after its activity has exited", async () => {
  vi.resetModules();
  let deliver: ((r: Response) => void) | undefined;
  const pending = new Promise<Response>((resolve) => { deliver = resolve; });
  vi.stubGlobal("fetch", vi.fn(() => pending));
  const start = vi.fn();
  const context = {
    state: "running", currentTime: 0, destination: {},
    createGain: () => ({ connect: vi.fn(), disconnect: vi.fn(), gain: { value: 0, setTargetAtTime: vi.fn() } }),
    createBufferSource: () => ({ connect: vi.fn(), start, stop: vi.fn(), disconnect: vi.fn(), playbackRate: { value: 1 } }),
    decodeAudioData: vi.fn(async () => ({ duration: 30 })),
  };
  vi.stubGlobal("AudioContext", class { constructor() { return context; } });
  const { unlockAudio, startMusic } = await import("@/lib/audio");
  unlockAudio();
  const stop = startMusic({} as AudioNode, "bandura", false);
  stop();
  if (!deliver) throw new Error("recording request not created");
  deliver(new Response(new ArrayBuffer(8)));
  await vi.waitFor(() => expect(context.decodeAudioData).toHaveBeenCalled());
  expect(start).not.toHaveBeenCalled();
});