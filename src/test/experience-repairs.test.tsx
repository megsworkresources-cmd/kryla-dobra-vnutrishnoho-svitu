import { fireEvent, render, screen, cleanup, act } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Release } from "@/activities/clouds";
import { Sounds } from "@/activities/sky";
import { speak } from "@/lib/speak";
import { update } from "@/lib/store";

vi.mock("@/components/Character", () => ({ CharacterSay: () => null }));
vi.mock("@/components/Scene", () => ({
  Btn: ({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
    <button {...props}>{children}</button>
  ),
  DoneCard: ({ text }: { text: string }) => <p>{text}</p>,
}));

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe("experience repair regressions", () => {
  it("finishes cloud release even when animations are disabled", () => {
    vi.useFakeTimers();
    update((s) => ({ ...s, reduceMotion: true, lang: "uk" }));
    render(<Release />);
    fireEvent.click(screen.getByRole("button", { name: "Відпустити хмаринку" }));
    act(() => vi.advanceTimersByTime(3600));
    expect(screen.queryByRole("textbox")).toBeNull();
  });

  it("does not start a nature sound when the master sound switch is off", () => {
    const context = vi.fn(() => {
      throw new Error("sound should not start");
    });
    vi.stubGlobal("AudioContext", context);
    update((s) => ({ ...s, sound: false }));
    render(<Sounds />);
    fireEvent.click(screen.getByRole("button", { name: "Дощ" }));
    expect(context).not.toHaveBeenCalled();
  });

  it("does not speak at zero volume even for an explicit preview", () => {
    const say = vi.fn();
    vi.stubGlobal("speechSynthesis", { cancel: vi.fn(), speak: say, getVoices: () => [] });
    vi.stubGlobal(
      "SpeechSynthesisUtterance",
      class {
        constructor(public text: string) {}
      },
    );
    update((s) => ({ ...s, sound: true, volume: 0, voiceEngine: "device" }));
    speak("Привіт", { force: true });
    expect(say).not.toHaveBeenCalled();
  });
});
