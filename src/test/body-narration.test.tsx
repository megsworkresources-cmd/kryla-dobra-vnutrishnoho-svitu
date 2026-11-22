import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { BodyMap } from "@/activities/forest";
import { update } from "@/lib/store";
import { speak, stopSpeaking } from "@/lib/speak";

vi.mock("@/components/Character", () => ({ CharacterSay: () => null }));
vi.mock("@/lib/speak", () => ({
  speak: vi.fn(),
  stopSpeaking: vi.fn(),
  useSpeechState: () => "idle",
}));

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

it("body narration waits for an explicit tap and cleans up when leaving", () => {
  vi.stubGlobal("speechSynthesis", {});
  update((s) => ({ ...s, lang: "uk", sound: true, voice: true }));
  const view = render(<BodyMap />);
  expect(speak).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole("button", { name: "Послухати ще раз" }));
  expect(speak).toHaveBeenCalledTimes(1);
  expect(vi.mocked(speak).mock.calls[0]?.[1]).toEqual({ force: true });
  vi.mocked(stopSpeaking).mockClear();
  view.unmount();
  expect(stopSpeaking).toHaveBeenCalled();
});
