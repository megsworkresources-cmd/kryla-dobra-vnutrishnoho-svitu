import type { ComponentProps } from "react";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { Player } from "@/routes/watch";
import { speak } from "@/lib/speak";
import { update } from "@/lib/store";

vi.mock("@/components/Scene", () => ({
  Btn: ({ children, ...props }: ComponentProps<"button">) => <button {...props}>{children}</button>,
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
  update((s) => ({ ...s, lang: "uk", voice: false }));
  vi.spyOn(HTMLMediaElement.prototype, "play").mockResolvedValue();
  vi.spyOn(HTMLMediaElement.prototype, "pause").mockImplementation(() => {});
  vi.useFakeTimers();
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.restoreAllMocks();
});

it("opens every cartoon beat at its own point in the footage", () => {
  const { container } = render(<Player clip={clip} onClose={vi.fn()} />);
  const video = container.querySelector("video");
  if (!video) throw new Error("Missing video");
  Object.defineProperty(video, "duration", { configurable: true, value: 9 });
  const seek = vi.fn();
  let position = 0;
  Object.defineProperty(video, "currentTime", {
    configurable: true,
    get: () => position,
    set: (value: number) => {
      position = value;
      seek(value);
    },
  });
  act(() => {
    fireEvent.loadedMetadata(video);
  });
  expect(seek).not.toHaveBeenCalled();
  act(() => {
    fireEvent.click(screen.getByRole("button", { name: "Далі →" }));
  });
  expect(seek).toHaveBeenLastCalledWith(3);
  act(() => {
    fireEvent.click(screen.getByRole("button", { name: "Далі →" }));
  });
  expect(seek).toHaveBeenLastCalledWith(6);
  expect(container.querySelector("video")).toBe(video);
});

it("draws a separate animated scene for every beat", () => {
  const { container } = render(<Player clip={{ ...clip, id: "no-footage" }} onClose={vi.fn()} />);
  expect(container.querySelector("[data-shot]")).toHaveAttribute("data-shot", "0");
  expect(container.querySelector(".animate-kenburns")).not.toBeNull();
  act(() => {
    fireEvent.click(screen.getByRole("button", { name: "Далі →" }));
  });
  expect(container.querySelector("[data-shot]")).toHaveAttribute("data-shot", "1");
});

it("lets the child hear the current line even when character voices are off", () => {
  render(<Player clip={clip} onClose={vi.fn()} />);
  act(() => {
    fireEvent.click(screen.getByRole("button", { name: "Послухати" }));
  });
  expect(vi.mocked(speak)).toHaveBeenCalledWith("Біля білої хатки ріс маленький соняшник.", {
    force: true,
    who: "solomiya",
  });
});
