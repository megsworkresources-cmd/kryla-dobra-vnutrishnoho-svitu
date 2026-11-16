import { afterEach, expect, it, vi } from "vitest";
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    auth: {
      getSession: () =>
        Promise.resolve({
          data: {
            session: (globalThis as { __noSession?: boolean }).__noSession ? null : { user: {} },
          },
        }),
    },
  },
}));
vi.mock("@/lib/voice.functions", () => ({ speakNatural: vi.fn() }));
afterEach(() => {
  vi.unstubAllGlobals();
  vi.resetModules();
});

it("uses the gesture-primed audio element for delayed natural speech", async () => {
  const players: {
    src: string;
    play: ReturnType<typeof vi.fn>;
    pause: ReturnType<typeof vi.fn>;
  }[] = [];
  vi.stubGlobal(
    "Audio",
    class {
      src: string;
      volume = 0;
      onplaying = null;
      onended = null;
      onerror = null;
      play = vi.fn().mockResolvedValue(undefined);
      pause = vi.fn();
      constructor(src = "") {
        this.src = src;
        players.push(this);
      }
    },
  );
  const { update } = await import("@/lib/store");
  update((s) => ({
    ...s,
    sound: true,
    voice: true,
    volume: 1,
    voiceVolume: 1,
    voiceEngine: "natural",
  }));
  const { speakNatural } = await import("@/lib/voice.functions");
  vi.mocked(speakNatural).mockResolvedValue({ ok: true, audio: "data:audio/wav;base64,AAAA" });
  const { unlockAudio } = await import("@/lib/audio");
  const speech = await import("@/lib/speak");
  unlockAudio();
  speech.unlockSpeech();
  speech.speak("Привіт! Так звучатиме казка.");
  await vi.waitFor(() => expect(players[0]?.src).toBe("data:audio/wav;base64,AAAA"));
  expect(players).toHaveLength(1);
  expect(players[0]?.play).toHaveBeenCalledTimes(2);
  speech.stopSpeaking();
});

it("does not automatically repeat requests after insufficient credits", async () => {
  const { update } = await import("@/lib/store");
  update((s) => ({
    ...s,
    sound: true,
    voice: true,
    volume: 1,
    voiceVolume: 1,
    voiceEngine: "natural",
  }));
  const { speakNatural } = await import("@/lib/voice.functions");
  vi.mocked(speakNatural).mockReset().mockResolvedValue({ ok: false, error: "402" });
  const { unlockAudio } = await import("@/lib/audio");
  const speech = await import("@/lib/speak");
  unlockAudio();
  speech.speak("Привіт! Так звучатиме казка.");
  await vi.waitFor(() => expect(speech.getSpeechState()).toBe("unavailable"));
  speech.speak("Інша фраза");
  expect(speakNatural).toHaveBeenCalledTimes(1);
  speech.stopSpeaking();
});

it("never requests AI voices when no grown-up is signed in", async () => {
  (globalThis as { __noSession?: boolean }).__noSession = true;
  vi.stubGlobal(
    "Audio",
    class {
      volume = 0;
      play = vi.fn().mockResolvedValue(undefined);
      pause = vi.fn();
    },
  );
  const { update } = await import("@/lib/store");
  update((s) => ({
    ...s,
    sound: true,
    voice: true,
    volume: 1,
    voiceVolume: 1,
    voiceEngine: "natural",
  }));
  const { speakNatural } = await import("@/lib/voice.functions");
  vi.mocked(speakNatural).mockReset();
  const speech = await import("@/lib/speak");
  speech.unlockSpeech?.();
  speech.speak("Привіт");
  await new Promise((r) => setTimeout(r, 20));
  expect(speakNatural).not.toHaveBeenCalled();
  (globalThis as { __noSession?: boolean }).__noSession = false;
  speech.stopSpeaking();
});
