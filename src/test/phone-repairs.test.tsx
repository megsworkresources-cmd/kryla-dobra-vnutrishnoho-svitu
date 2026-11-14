import { afterEach, expect, it, vi } from "vitest";
import { update } from "@/lib/store";
import { unlockAudio } from "@/lib/audio";
import { speak, stopSpeaking, getSpeechState, syncSpeechVolume } from "@/lib/speak";

afterEach(() => {
  vi.unstubAllGlobals();
});

it("tracks real speech completion and ignores an exited utterance", async () => {
  let utterance: SpeechSynthesisUtterance | undefined;
  vi.stubGlobal("speechSynthesis", {
    cancel: vi.fn(),
    resume: vi.fn(),
    getVoices: () => [],
    speak: (u: SpeechSynthesisUtterance) => {
      utterance = u;
    },
  });
  vi.stubGlobal(
    "SpeechSynthesisUtterance",
    class {
      constructor(public text: string) {}
    },
  );
  update((s) => ({
    ...s,
    sound: true,
    voice: true,
    volume: 1,
    voiceVolume: 1,
    voiceEngine: "device",
  }));
  unlockAudio();
  speak("Привіт", { localOnly: true });
  expect(getSpeechState()).toBe("loading");
  if (!utterance) throw new Error("No utterance queued");
  const first = utterance;
  first.onstart?.({} as SpeechSynthesisEvent);
  expect(getSpeechState()).toBe("playing");
  first.onend?.({} as SpeechSynthesisEvent);
  expect(getSpeechState()).toBe("idle");
  speak("Привіт", { localOnly: true });
  stopSpeaking();
  utterance?.onstart?.({} as SpeechSynthesisEvent);
  expect(getSpeechState()).toBe("idle");
});

it("does not construct an audio context before a gesture or while muted", async () => {
  const construct = vi.fn();
  vi.stubGlobal("AudioContext", construct);
  update((s) => ({ ...s, sound: false }));
  unlockAudio();
  expect(construct).not.toHaveBeenCalled();
});

it("clears speech when the saved voice preference is switched off", async () => {
  const cancel = vi.fn();
  vi.stubGlobal("speechSynthesis", { cancel, getVoices: () => [], speak: vi.fn() });
  update((s) => ({ ...s, sound: true, voice: false, volume: 1, voiceVolume: 1 }));
  syncSpeechVolume();
  expect(cancel).toHaveBeenCalled();
});

it("reports unavailable device speech instead of leaving a playing state", () => {
  update((s) => ({
    ...s,
    sound: true,
    voice: true,
    volume: 1,
    voiceVolume: 1,
    voiceEngine: "device",
  }));
  speak("Привіт", { localOnly: true });
  expect(getSpeechState()).toBe("unavailable");
});
