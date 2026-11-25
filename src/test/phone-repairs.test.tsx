import { afterEach, expect, it, vi } from "vitest";
import { update } from "@/lib/store";
import { unlockAudio } from "@/lib/audio";
import {
  speak,
  stopSpeaking,
  pauseSpeaking,
  resumeSpeaking,
  getSpeechState,
  syncSpeechVolume,
} from "@/lib/speak";

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
  // A real synthesiser with a line in progress, which is the case stopSpeaking interrupts.
  vi.stubGlobal("speechSynthesis", { cancel, speaking: true, getVoices: () => [], speak: vi.fn() });
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

it("device speech updates real pause/resume state and ignores events after exit", () => {
  let utterance: SpeechSynthesisUtterance | undefined;
  vi.stubGlobal("speechSynthesis", {
    cancel: vi.fn(),
    pause: vi.fn(),
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
  if (!utterance) throw new Error("No device utterance");
  utterance.onstart?.({} as SpeechSynthesisEvent);
  pauseSpeaking();
  expect(getSpeechState()).toBe("paused");
  resumeSpeaking();
  utterance.onresume?.({} as SpeechSynthesisEvent);
  expect(getSpeechState()).toBe("playing");
  stopSpeaking();
  utterance.onresume?.({} as SpeechSynthesisEvent);
  expect(getSpeechState()).toBe("idle");
});

it("resuming paused device speech never leaves a stuck loading state", () => {
  let utterance: SpeechSynthesisUtterance | undefined;
  const resume = vi.fn();
  vi.stubGlobal("speechSynthesis", {
    cancel: vi.fn(),
    resume,
    pause: vi.fn(),
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
  utterance?.onstart?.({} as SpeechSynthesisEvent);
  pauseSpeaking();
  expect(getSpeechState()).toBe("paused");
  resumeSpeaking();
  expect(resume).toHaveBeenCalled();
  expect(getSpeechState()).toBe("playing");
  stopSpeaking();
});

it("never restarts the line that is already being spoken", () => {
  let queued = 0;
  let utterance: SpeechSynthesisUtterance | undefined;
  vi.stubGlobal("speechSynthesis", {
    cancel: vi.fn(),
    resume: vi.fn(),
    getVoices: () => [],
    speak: (u: SpeechSynthesisUtterance) => {
      queued += 1;
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
  // The greeting effect and the speaker button can ask for the same line at once.
  speak("Привіт", { localOnly: true, who: "olenka" });
  speak("Привіт", { localOnly: true, who: "olenka" });
  speak("Привіт", { localOnly: true, who: "olenka", force: true });
  expect(queued).toBe(1);
  // Once the line has finished, asking again plays it again.
  utterance?.onend?.({} as SpeechSynthesisEvent);
  speak("Привіт", { localOnly: true, who: "olenka" });
  expect(queued).toBe(2);
  stopSpeaking();
});

it("speaks a line Safari accepted but never started on the child's next touch", () => {
  const spoken: SpeechSynthesisUtterance[] = [];
  vi.stubGlobal("speechSynthesis", {
    cancel: vi.fn(),
    resume: vi.fn(),
    getVoices: () => [],
    speak: (u: SpeechSynthesisUtterance) => {
      spoken.push(u);
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
  // A character's greeting comes from an effect, outside the touch itself.
  speak("Привіт", { localOnly: true, who: "olenka" });
  expect(spoken).toHaveLength(1);
  // Safari never fires onstart: the child touches the screen and hears the line.
  window.dispatchEvent(new Event("pointerdown"));
  expect(spoken).toHaveLength(1);
  window.dispatchEvent(new Event("touchend"));
  expect(spoken).toHaveLength(2);
  spoken[1]?.onstart?.({} as SpeechSynthesisEvent);
  expect(getSpeechState()).toBe("playing");
  // One retry only: a child who keeps tapping must not re-hear the same line.
  window.dispatchEvent(new Event("touchend"));
  expect(spoken).toHaveLength(2);
  stopSpeaking();
});

it("does not re-speak a character line that really started", () => {
  const spoken: SpeechSynthesisUtterance[] = [];
  vi.stubGlobal("speechSynthesis", {
    cancel: vi.fn(),
    resume: vi.fn(),
    getVoices: () => [],
    speak: (u: SpeechSynthesisUtterance) => {
      spoken.push(u);
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
  speak("Привіт", { localOnly: true, who: "olenka" });
  spoken[0]?.onstart?.({} as SpeechSynthesisEvent);
  window.dispatchEvent(new Event("touchend"));
  expect(spoken).toHaveLength(1);
  stopSpeaking();
});

it("does not cancel an idle synthesiser before speaking", () => {
  const cancel = vi.fn();
  const speakNow = vi.fn();
  vi.stubGlobal("speechSynthesis", {
    cancel,
    resume: vi.fn(),
    getVoices: () => [],
    speak: speakNow,
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
  expect(speakNow).toHaveBeenCalledTimes(1);
  expect(cancel).not.toHaveBeenCalled();
  stopSpeaking();
});
