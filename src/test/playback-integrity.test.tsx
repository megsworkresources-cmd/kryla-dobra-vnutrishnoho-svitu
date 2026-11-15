import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { ColorFlower } from "@/activities/studio";
import { Player } from "@/routes/watch";
import { getState, update } from "@/lib/store";
import { stopSpeaking } from "@/lib/speak";

vi.mock("@/components/Character", () => ({ CharacterSay: () => null }));
vi.mock("@/lib/speak", () => ({
  speak: vi.fn(),
  stopSpeaking: vi.fn(),
  useSpeechState: () => "idle",
}));
vi.mock("@/components/Scene", () => ({
  Btn: ({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
    <button {...props}>{children}</button>
  ),
}));

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

it("counts sunflower completion only when all thirteen areas are colored, once per round", () => {
  vi.useFakeTimers();
  update((s) => ({ ...s, lang: "uk", completed: {} }));
  render(<ColorFlower />);
  const regions = screen.getAllByRole("button", { name: /Соняшник для розфарбовування \d+/ });
  const center = regions[12];
  if (!center) throw new Error("missing sunflower center");
  fireEvent.click(center);
  expect(getState().completed["studio-color"] ?? 0).toBe(0);
  for (const region of regions) fireEvent.click(region);
  expect(getState().completed["studio-color"]).toBe(1);
  fireEvent.click(center);
  expect(getState().completed["studio-color"]).toBe(1);
  act(() => vi.runAllTimers());
});

const clip = {
  id: "test",
  title: "Соняшник, що шукав сонце",
  icon: "🌻",
  shots: [
    {
      img: "/missing-scene.jpg",
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
  ],
};

it("pauses and resumes cartoon timers, and stops narration when closed", () => {
  vi.useFakeTimers();
  const close = vi.fn();
  const { container, unmount } = render(<Player clip={clip} onClose={close} />);
  const stage = container.querySelector("[data-playing]")!;
  expect(stage).toHaveAttribute("data-playing", "true");
  fireEvent.click(screen.getByRole("button", { name: "Пауза" }));
  expect(stage).toHaveAttribute("data-playing", "false");
  expect(stage.querySelector(".animate-fade-up")).not.toHaveStyle({
    animationPlayState: "paused",
  });
  expect(stage.querySelector(".animate-kenburns")).toHaveStyle({ animationPlayState: "paused" });
  act(() => vi.advanceTimersByTime(7100));
  expect(screen.queryByText("Щоранку він повертав голівку до сонця.")).toBeNull();
  fireEvent.click(screen.getByRole("button", { name: "Грати" }));
  act(() => vi.advanceTimersByTime(7100));
  expect(screen.getByText("Щоранку він повертав голівку до сонця.")).toBeInTheDocument();
  unmount();
  expect(stopSpeaking).toHaveBeenCalled();
});

it("shows an accessible error when a cartoon illustration cannot load", () => {
  const { container } = render(<Player clip={clip} onClose={vi.fn()} />);
  const image = container.querySelector('img[src="/missing-scene.jpg"]')!;
  fireEvent.error(image);
  expect(screen.getByRole("alert")).toHaveTextContent(
    "Не вдалося завантажити ілюстрацію. Спробуй інший мультик.",
  );
});

it("retains the same video element across caption changes", async () => {
  vi.useFakeTimers();
  vi.spyOn(HTMLMediaElement.prototype, "play").mockResolvedValue();
  vi.spyOn(HTMLMediaElement.prototype, "pause").mockImplementation(() => {});
  const { container } = render(<Player clip={{ ...clip, id: "sunflower" }} onClose={vi.fn()} />);
  const video = container.querySelector("video");
  expect(video).not.toBeNull();
  act(() => vi.advanceTimersByTime(7100));
  expect(container.querySelector("video")).toBe(video);
  expect(screen.getByText("Щоранку він повертав голівку до сонця.")).toBeInTheDocument();
  cleanup();
  await act(async () => {});
  vi.restoreAllMocks();
});

it("replays from the first caption after completion and allows stepping back", () => {
  vi.useFakeTimers();
  render(<Player clip={clip} onClose={vi.fn()} />);
  fireEvent.click(screen.getByRole("button", { name: "Далі →" }));
  fireEvent.click(screen.getByRole("button", { name: "Попередня сцена" }));
  expect(screen.getByText("Біля білої хатки ріс маленький соняшник.")).toBeVisible();
  fireEvent.click(screen.getByRole("button", { name: "Далі →" }));
  fireEvent.click(screen.getByRole("button", { name: "Далі →" }));
  expect(screen.getByText("Кінець")).toBeVisible();
  fireEvent.click(screen.getByRole("button", { name: "Ще раз" }));
  expect(screen.getByText("Біля білої хатки ріс маленький соняшник.")).toBeVisible();
  expect(screen.getByRole("button", { name: "Попередня сцена" })).toBeDisabled();
});
