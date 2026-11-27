import type { ComponentProps, ReactNode } from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { Player } from "@/routes/watch";
import { Story } from "@/activities/sky";
import { CharacterSay } from "@/components/Character";
import { update } from "@/lib/store";

vi.mock("@/components/Scene", () => ({
  Btn: ({ children, ...props }: ComponentProps<"button">) => <button {...props}>{children}</button>,
  Scene: ({ children }: { children?: ReactNode }) => <div>{children}</div>,
  DoneCard: ({ text }: { text: string }) => <p>{text}</p>,
}));
vi.mock("@/lib/speak", () => ({
  speak: vi.fn(),
  stopSpeaking: vi.fn(),
  useSpeechState: () => "idle",
}));

const clip = {
  id: "sunflower",
  title: "Соняшник, що шукав сонце",
  icon: "🌻",
  shots: [
    {
      img: "/first-scene.jpg",
      who: "solomiya" as const,
      text: "Біля білої хатки ріс маленький соняшник.",
      fx: "🌻",
    },
    {
      img: "/second-scene.jpg",
      who: "solomiya" as const,
      text: "Щоранку він повертав голівку до сонця.",
      fx: "☀️",
    },
    {
      img: "/third-scene.jpg",
      who: "solomiya" as const,
      text: "Одного дня хмарка сховала сонечко.",
      fx: "☁️",
    },
  ],
};

beforeEach(() => {
  update((s) => ({
    ...s,
    lang: "uk",
    sound: false,
    voice: false,
    reduceMotion: false,
  }));
  vi.spyOn(HTMLMediaElement.prototype, "play").mockResolvedValue();
  vi.spyOn(HTMLMediaElement.prototype, "pause").mockImplementation(() => {});
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

/**
 * iPhone Safari refuses a play() that arrives after the tap's event has finished, so the
 * film snaps back to paused. Record whether the recording started while a real click was
 * still being dispatched: the window capture listener runs before React's handler, the
 * window bubble listener after it, and effects only ever run outside that window.
 */
function playbackInsideTheTap() {
  let inTap = false;
  const calls: boolean[] = [];
  const enter = () => {
    inTap = true;
  };
  const leave = () => {
    inTap = false;
  };
  window.addEventListener("click", enter, true);
  window.addEventListener("click", leave, false);
  vi.mocked(HTMLMediaElement.prototype.play).mockImplementation(() => {
    calls.push(inTap);
    return Promise.resolve();
  });
  return {
    get calls() {
      return calls.length;
    },
    get started() {
      return calls.includes(true);
    },
    stop() {
      window.removeEventListener("click", enter, true);
      window.removeEventListener("click", leave, false);
    },
  };
}

it("starts the cartoon footage from the play toggle, inside the child's tap", () => {
  render(<Player clip={clip} onClose={vi.fn()} />);
  fireEvent.click(screen.getByRole("button", { name: "Пауза" }));
  const recorder = playbackInsideTheTap();
  fireEvent.click(screen.getByRole("button", { name: "Грати" }));
  recorder.stop();
  // A state-only toggle would let the effect call play() after the gesture, which Safari drops.
  expect(recorder.calls).toBeGreaterThan(0);
  expect(recorder.started).toBe(true);
  expect(screen.getByRole("button", { name: "Пауза" })).toBeInTheDocument();
});

it("starts the cartoon footage from a scene dot, inside the child's tap", () => {
  render(<Player clip={clip} onClose={vi.fn()} />);
  fireEvent.click(screen.getByRole("button", { name: "Пауза" }));
  const recorder = playbackInsideTheTap();
  fireEvent.click(screen.getByRole("button", { name: "Сцена 2" }));
  recorder.stop();
  expect(recorder.started).toBe(true);
});

it("starts the night-sky story footage from «Дивитися», inside the child's tap", () => {
  render(<Story id="lantern" />);
  const recorder = playbackInsideTheTap();
  fireEvent.click(screen.getByRole("button", { name: "Дивитися" }));
  recorder.stop();
  expect(recorder.calls).toBeGreaterThan(0);
  expect(recorder.started).toBe(true);
  expect(screen.getByRole("button", { name: "Пауза" })).toBeInTheDocument();
});

it("starts the character loop from its play toggle, inside the child's tap", () => {
  render(<CharacterSay who="solomiya" text="Привіт" autoSpeak={false} />);
  fireEvent.click(screen.getByRole("button", { name: "Пауза" }));
  const recorder = playbackInsideTheTap();
  fireEvent.click(screen.getByRole("button", { name: "Грати" }));
  recorder.stop();
  expect(recorder.calls).toBeGreaterThan(0);
  expect(recorder.started).toBe(true);
  expect(screen.getByRole("button", { name: "Пауза" })).toBeInTheDocument();
});
