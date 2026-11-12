import { fireEvent, render, screen, cleanup, act } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Release } from "@/activities/clouds";
import { Sounds } from "@/activities/sky";
import { speak } from "@/lib/speak";
import { getState, update } from "@/lib/store";
import { MagicStage } from "@/components/MagicStage";

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
  it("completes the ordered trail and resets without changing device progress", () => {
    const saved = getState().completed;
    render(<MagicStage theme="meadow" />);
    for (let n = 1; n <= 6; n++)
      fireEvent.click(screen.getByRole("button", { name: `Крок стежки ${n}` }));
    expect(screen.getByRole("button", { name: "Крок стежки 6" })).toHaveTextContent("🌼");
    fireEvent.click(screen.getByRole("button", { name: "Почати спочатку" }));
    expect(screen.getByRole("button", { name: "Крок стежки 2" })).toBeDisabled();
    expect(getState().completed).toEqual(saved);
  });

  it("remembers matched pairs but lets a mismatched pair be tried again", () => {
    render(<MagicStage theme="clouds" />);
    const card = (n: number) => screen.getByRole("button", { name: `Картка ${n}` });
    fireEvent.click(card(1));
    fireEvent.click(card(2));
    fireEvent.click(card(4));
    expect(card(1)).toHaveAttribute("aria-pressed", "false");
    fireEvent.click(card(1));
    expect(card(4)).toHaveAttribute("aria-pressed", "true");
    fireEvent.click(card(2));
    fireEvent.click(card(6));
    fireEvent.click(card(3));
    fireEvent.click(card(5));
    for (let n = 1; n <= 6; n++) expect(card(n)).toHaveAttribute("aria-pressed", "true");
  });

  it("plants the selected flower without uploading or changing saved garden growth", () => {
    const saved = getState().completed;
    render(<MagicStage theme="garden" />);
    fireEvent.click(screen.getByRole("button", { name: "Обрати квітку 3" }));
    fireEvent.click(screen.getByRole("button", { name: "Посадити квітку 1" }));
    expect(screen.getByRole("button", { name: "Посадити квітку 1" })).toHaveTextContent("🌷");
    expect(getState().completed).toEqual(saved);
  });

  it("activates shared magic controls with a keyboard-generated click", () => {
    update((s) => ({ ...s, lang: "uk", reduceMotion: true }));
    render(<MagicStage theme="meadow" count={1} />);
    expect(screen.getByRole("button", { name: "Крок стежки 2" })).toBeDisabled();
    fireEvent.click(screen.getByRole("button", { name: "Крок стежки 1" }), { detail: 0 });
    expect(screen.getByRole("button", { name: "Крок стежки 2" })).toBeEnabled();
  });
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
