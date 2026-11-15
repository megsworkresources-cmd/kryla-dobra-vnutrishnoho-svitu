import { afterEach, beforeEach, expect, it, vi } from "vitest";

function stubAudio() {
  const gains: { gain: { setTargetAtTime: ReturnType<typeof vi.fn> } }[] = [];
  const sources: { start: ReturnType<typeof vi.fn>; stop: ReturnType<typeof vi.fn> }[] = [];
  const node = () => ({ connect: vi.fn((target: unknown) => target), disconnect: vi.fn() });
  const context = {
    state: "running",
    currentTime: 0,
    sampleRate: 100,
    destination: {},
    createGain: () => {
      const created = {
        ...node(),
        gain: {
          value: 0,
          setValueAtTime: vi.fn(),
          linearRampToValueAtTime: vi.fn(),
          setTargetAtTime: vi.fn(),
        },
      };
      gains.push(created);
      return created;
    },
    createBuffer: () => ({ getChannelData: () => new Float32Array(300) }),
    createBufferSource: () => {
      const source = { ...node(), start: vi.fn(), stop: vi.fn(), playbackRate: { value: 1 } };
      sources.push(source);
      return source;
    },
    createBiquadFilter: () => ({ ...node(), type: "lowpass", frequency: { value: 0 } }),
    createOscillator: () => ({
      ...node(),
      frequency: { value: 0, setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() },
      start: vi.fn(),
      stop: vi.fn(),
    }),
    decodeAudioData: vi.fn(),
  };
  const construct = vi.fn();
  vi.stubGlobal(
    "AudioContext",
    class {
      constructor() {
        construct();
        return context;
      }
    },
  );
  return { gains, sources, construct };
}

beforeEach(() => {
  vi.resetModules();
  vi.stubGlobal(
    "fetch",
    vi.fn(() => new Promise<Response>(() => {})),
  );
});

afterEach(() => {
  vi.unstubAllGlobals();
});

it("lowers the music while a character speaks and restores it afterwards", async () => {
  const { gains } = stubAudio();
  const { update } = await import("@/lib/store");
  update((s) => ({ ...s, sound: true, music: true, volume: 1, musicVolume: 1 }));
  const audio = await import("@/lib/audio");
  audio.unlockAudio();
  audio.playAmbient("garden");
  const bus = gains[1]?.gain;
  if (!bus) throw new Error("ambient bus missing");
  audio.duckMusic(true);
  expect(bus.setTargetAtTime).toHaveBeenLastCalledWith(0.105, 0, 0.12);
  audio.duckMusic(false);
  expect(bus.setTargetAtTime).toHaveBeenLastCalledWith(0.35, 0, 0.12);
  audio.stopAmbient();
});

it("plays and stops nature sounds through the shared audio context", async () => {
  const { sources, construct } = stubAudio();
  const { update } = await import("@/lib/store");
  update((s) => ({ ...s, sound: true, volume: 1, effectsVolume: 1 }));
  const audio = await import("@/lib/audio");
  audio.unlockAudio();
  audio.playSoundscape("rain");
  expect(construct).toHaveBeenCalledTimes(1);
  expect(audio.getSoundscape()).toBe("rain");
  const playing = sources[sources.length - 1];
  expect(playing?.start).toHaveBeenCalledTimes(1);
  audio.stopSoundscape();
  expect(audio.getSoundscape()).toBeNull();
  expect(playing?.stop).toHaveBeenCalledTimes(1);
});

it("keeps nature sounds silent while the master switch is off", async () => {
  const { construct } = stubAudio();
  const { update } = await import("@/lib/store");
  update((s) => ({ ...s, sound: false }));
  const audio = await import("@/lib/audio");
  audio.playSoundscape("wind");
  expect(construct).not.toHaveBeenCalled();
  expect(audio.getSoundscape()).toBeNull();
});

it("retries a failed recording when the child returns to the page", async () => {
  stubAudio();
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => new Response("missing", { status: 404 })),
  );
  const { update } = await import("@/lib/store");
  update((s) => ({ ...s, sound: true, music: true, volume: 1, musicVolume: 1 }));
  const audio = await import("@/lib/audio");
  audio.unlockAudio();
  audio.playAmbient("garden");
  await vi.waitFor(() => expect(audio.getMusicStatus()).toBe("error"));
  const retry = vi.fn(async () => new Response(new ArrayBuffer(8)));
  vi.stubGlobal("fetch", retry);
  audio.playAmbient("garden");
  await vi.waitFor(() => expect(retry).toHaveBeenCalled());
  audio.stopAmbient();
});
