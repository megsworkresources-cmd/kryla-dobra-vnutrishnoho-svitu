import type { ComponentProps } from "react";
import { cleanup, fireEvent, render } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { StoryFilm } from "@/components/StoryFilm";
import { growthPart } from "@/content/growth";

vi.mock("@/components/Scene", () => ({
  Btn: ({ children, ...props }: ComponentProps<"button">) => <button {...props}>{children}</button>,
}));

beforeEach(() => {
  vi.spyOn(HTMLMediaElement.prototype, "play").mockResolvedValue();
  vi.spyOn(HTMLMediaElement.prototype, "pause").mockImplementation(() => {});
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

it("gives every growth stage a longer slice of the same recording", () => {
  const slices = [0, 1, 2, 3, 4, 5].map((stage) => growthPart(stage));
  expect(slices.map((s) => s.from)).toEqual([0, 0, 0, 0, 0, 0]);
  expect(slices.map((s) => s.to)).toEqual([0.07, 0.24, 0.44, 0.64, 0.84, 1]);
  expect(growthPart(5).to).toBe(1);
  expect(growthPart(99).to).toBe(1);
  expect(growthPart(-4).to).toBe(growthPart(0).to);
  expect(growthPart(2.7).to).toBe(growthPart(2).to);
});

it("loops only the slice that matches the flower's stage", () => {
  const { container } = render(
    <StoryFilm
      src="/growth.mp4"
      poster="/poster.jpg"
      playing
      onPause={vi.fn()}
      part={growthPart(3)}
      label="Запис росту соняшника"
    />,
  );
  const video = container.querySelector("video");
  if (!video) throw new Error("Missing video");
  expect(video).toHaveAttribute("aria-label", "Запис росту соняшника");

  let position = 0;
  Object.defineProperty(video, "duration", { configurable: true, value: 10 });
  Object.defineProperty(video, "currentTime", {
    configurable: true,
    get: () => position,
    set: (value: number) => {
      position = value;
    },
  });
  fireEvent.loadedMetadata(video);
  // Only the stage slice repeats; the whole recording never loops on its own.
  expect(video).not.toHaveAttribute("loop");
  expect(position).toBe(0);

  position = 6.5;
  fireEvent.timeUpdate(video);
  expect(position).toBe(0);
});

it("hands the page a starter that plays inside the child's own tap", () => {
  const start: { current: (() => void) | null } = { current: null };
  vi.mocked(HTMLMediaElement.prototype.play).mockClear();
  const view = render(
    <StoryFilm
      src="/growth.mp4"
      poster="/poster.jpg"
      playing={false}
      onPause={vi.fn()}
      startRef={start}
    />,
  );
  // The page's "watch it grow" button runs this synchronously: Safari refuses a play()
  // that arrives after the gesture, which is why the film used to stay paused.
  expect(typeof start.current).toBe("function");
  start.current?.();
  expect(HTMLMediaElement.prototype.play).toHaveBeenCalled();
  view.unmount();
  expect(start.current).toBeNull();
});

it("keeps the whole recording looping when no slice is given", () => {
  const { container } = render(
    <StoryFilm src="/story.mp4" poster="/poster.jpg" playing={false} onPause={vi.fn()} />,
  );
  expect(container.querySelector("video")).toHaveAttribute("loop");
});
