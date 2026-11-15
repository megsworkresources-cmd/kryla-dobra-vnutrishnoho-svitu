import { act, cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";

function audioContextStub() {
  const sources: { stop: ReturnType<typeof vi.fn> }[] = [];
  const node = () => ({
    connect: vi.fn((target: unknown) => target),
    disconnect: vi.fn(),
  });
  const context = {
    state: "running",
    currentTime: 0,
    sampleRate: 100,
    destination: {},
    createGain: () => ({
      ...node(),
      gain: {
        value: 0,
        setValueAtTime: vi.fn(),
        linearRampToValueAtTime: vi.fn(),
        setTargetAtTime: vi.fn(),
      },
    }),
    createBuffer: () => ({ getChannelData: () => new Float32Array(300) }),
    createBufferSource: () => {
      const source = {
        ...node(),
        start: vi.fn(),
        stop: vi.fn(),
        playbackRate: { value: 1 },
      };
      sources.push(source);
      return source;
    },
    createBiquadFilter: () => ({
      ...node(),
      type: "lowpass",
      frequency: { value: 0 },
    }),
    createOscillator: () => ({
      ...node(),
      frequency: {
        value: 0,
        setValueAtTime: vi.fn(),
        exponentialRampToValueAtTime: vi.fn(),
      },
      start: vi.fn(),
      stop: vi.fn(),
    }),
    decodeAudioData: vi.fn(),
  };
  vi.stubGlobal(
    "AudioContext",
    class {
      constructor() {
        return context;
      }
    },
  );
  return { context, sources };
}

beforeEach(async () => {
  vi.resetModules();
  // The store module is reloaded by resetModules, so reach the fresh instance.
  const { update } = await import("@/lib/store");
  update((state) => ({
    ...state,
    sound: true,
    music: true,
    volume: 1,
    musicVolume: 0.5,
    effectsVolume: 0.5,
    musicStyle: "bandura",
  }));
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

it("does not create audio before a user gesture unlocks it", async () => {
  const constructor = vi.fn();
  vi.stubGlobal("AudioContext", constructor);
  const { playAmbient } = await import("@/lib/audio");
  playAmbient("garden");
  expect(constructor).not.toHaveBeenCalled();
});

it("stops the previous soundscape on replacement and route cleanup", async () => {
  const { sources } = audioContextStub();
  vi.stubGlobal(
    "fetch",
    vi.fn(() => new Promise(() => {})),
  );
  const { unlockAudio, playAmbient, stopAmbient } = await import("@/lib/audio");
  unlockAudio();
  playAmbient("garden");
  expect(sources).toHaveLength(1);
  playAmbient("forest");
  expect(sources[0]!.stop).toHaveBeenCalledTimes(1);
  expect(sources).toHaveLength(2);
  stopAmbient();
  expect(sources[1]!.stop).toHaveBeenCalledTimes(1);
});

it("keeps music stopped when its saved volume is zero", async () => {
  const { sources } = audioContextStub();
  const { update } = await import("@/lib/store");
  update((state) => ({ ...state, musicVolume: 0 }));
  const { unlockAudio, playAmbient } = await import("@/lib/audio");
  unlockAudio();
  playAmbient("garden");
  expect(sources).toHaveLength(0);
});

it("surfaces recording load failure and resets status when stopped", async () => {
  audioContextStub();
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => new Response("missing", { status: 404 })),
  );
  const { unlockAudio, startMusic, stopAmbient, useMusicStatus } = await import("@/lib/audio");
  function Status() {
    return <span>{useMusicStatus()}</span>;
  }
  render(<Status />);
  act(() => {
    unlockAudio();
    startMusic({} as AudioNode, "bandura", false);
  });
  expect(await screen.findByText("error")).toBeInTheDocument();
  act(() => stopAmbient());
  expect(screen.getByText("idle")).toBeInTheDocument();
});
