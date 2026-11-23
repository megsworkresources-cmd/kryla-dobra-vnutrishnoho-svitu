import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { StoryFilm } from "@/components/StoryFilm";
import { update } from "@/lib/store";

beforeEach(() => {
  update((s) => ({ ...s, lang: "uk" }));
  update((s) => ({ ...s, reduceMotion: false }));
  vi.spyOn(HTMLMediaElement.prototype, "play").mockResolvedValue();
  vi.spyOn(HTMLMediaElement.prototype, "pause").mockImplementation(() => {});
  vi.spyOn(HTMLMediaElement.prototype, "load").mockImplementation(() => {});
});
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

it("pauses on exit and ignores stale play success after leaving", async () => {
  let resolvePlay: (() => void) | undefined;
  vi.mocked(HTMLMediaElement.prototype.play).mockImplementation(
    () =>
      new Promise<void>((resolve) => {
        resolvePlay = resolve;
      }),
  );
  const { unmount } = render(
    <StoryFilm src="/test.mp4" poster="/test.jpg" playing onPause={vi.fn()} />,
  );
  unmount();
  const calls = vi.mocked(HTMLMediaElement.prototype.pause).mock.calls.length;
  await act(async () => resolvePlay?.());
  expect(HTMLMediaElement.prototype.pause).toHaveBeenCalledTimes(calls + 1);
});

it("reports autoplay rejection and pauses the story owner", async () => {
  vi.mocked(HTMLMediaElement.prototype.play).mockRejectedValue(
    new DOMException("Blocked", "NotAllowedError"),
  );
  const pause = vi.fn();
  render(<StoryFilm src="/test.mp4" poster="/test.jpg" playing onPause={pause} />);
  expect(await screen.findByText("Натисни «Грати», щоб продовжити відео.")).toBeInTheDocument();
  expect(pause).toHaveBeenCalledTimes(1);
});

it("handles missing media, allows reload, and pauses on page interruption", () => {
  const pause = vi.fn();
  const { container } = render(
    <StoryFilm src="/test.mp4" poster="/test.jpg" playing={false} onPause={pause} />,
  );
  const media = container.querySelector("video");
  if (!media) throw new Error("Missing video");
  fireEvent.error(media);
  expect(screen.getByRole("alert")).toHaveTextContent("Відео недоступне");
  fireEvent.click(screen.getByRole("button", { name: "Спробувати ще" }));
  expect(HTMLMediaElement.prototype.load).toHaveBeenCalledTimes(1);
  fireEvent(window, new Event("pagehide"));
  expect(pause).toHaveBeenCalledTimes(2);
});

it("notifies a story owner when its film fails", () => {
  const failure = vi.fn();
  const { container } = render(
    <StoryFilm
      src="/missing.mp4"
      poster="/test.jpg"
      playing={false}
      onPause={vi.fn()}
      onError={failure}
    />,
  );
  const media = container.querySelector("video");
  if (!media) throw new Error("Missing video");
  fireEvent.error(media);
  expect(failure).toHaveBeenCalledTimes(1);
});

it("does not restart footage when only the owner's callback changes", () => {
  const { rerender } = render(
    <StoryFilm src="/test.mp4" poster="/test.jpg" playing onPause={() => {}} />,
  );
  rerender(<StoryFilm src="/test.mp4" poster="/test.jpg" playing onPause={() => {}} />);
  expect(HTMLMediaElement.prototype.play).toHaveBeenCalledTimes(1);
});

it("pauses the owner when the browser interrupts active video", () => {
  const pause = vi.fn();
  const { container } = render(
    <StoryFilm src="/test.mp4" poster="/test.jpg" playing onPause={pause} />,
  );
  const video = container.querySelector("video");
  if (!video) throw new Error("Missing video");
  fireEvent.pause(video);
  expect(pause).toHaveBeenCalledTimes(1);
});

it("cancels a late loop restart after leaving the story", async () => {
  let finish: (() => void) | undefined;
  const { container, unmount } = render(
    <StoryFilm src="/test.mp4" poster="/test.jpg" playing startAt={0.2} onPause={vi.fn()} />,
  );
  const media = container.querySelector("video");
  if (!media) throw new Error("Missing video");
  await act(async () => {});
  vi.mocked(HTMLMediaElement.prototype.play).mockImplementation(
    () =>
      new Promise<void>((resolve) => {
        finish = resolve;
      }),
  );
  fireEvent.ended(media);
  unmount();
  const calls = vi.mocked(HTMLMediaElement.prototype.pause).mock.calls.length;
  await act(async () => finish?.());
  expect(HTMLMediaElement.prototype.pause).toHaveBeenCalledTimes(calls + 1);
});

it("pauses the owner when a loop restart is blocked", async () => {
  const pause = vi.fn();
  const { container } = render(
    <StoryFilm src="/test.mp4" poster="/test.jpg" playing startAt={0.2} onPause={pause} />,
  );
  const media = container.querySelector("video");
  if (!media) throw new Error("Missing video");
  vi.mocked(HTMLMediaElement.prototype.play).mockRejectedValue(new Error("blocked"));
  fireEvent.ended(media);
  await screen.findByText("Натисни «Грати», щоб продовжити відео.");
  expect(pause).toHaveBeenCalledTimes(1);
});

it("only permits one recorded video to own playback", async () => {
  const { container } = render(
    <>
      <StoryFilm src="/one.mp4" poster="/test.jpg" playing onPause={vi.fn()} />
      <StoryFilm src="/two.mp4" poster="/test.jpg" playing onPause={vi.fn()} />
    </>,
  );
  await act(async () => {});
  const first = container.querySelector("video");
  if (!first) throw new Error("Missing first video");
  expect(vi.mocked(HTMLMediaElement.prototype.pause).mock.contexts).toContain(first);
});

it("keeps a poster instead of playing when reduced motion is saved", () => {
  update((s) => ({ ...s, reduceMotion: true }));
  render(<StoryFilm src="/test.mp4" poster="/test.jpg" playing onPause={vi.fn()} />);
  expect(HTMLMediaElement.prototype.play).not.toHaveBeenCalled();
  expect(screen.getByRole("img")).toHaveAttribute("src", "/test.jpg");
});

it("does not restart a loop after pagehide even before its owner rerenders", () => {
  const { container } = render(
    <StoryFilm src="/test.mp4" poster="/test.jpg" playing startAt={0} onPause={vi.fn()} />,
  );
  const media = container.querySelector("video");
  if (!media) throw new Error("Missing video");
  fireEvent(window, new Event("pagehide"));
  fireEvent.ended(media);
  expect(HTMLMediaElement.prototype.play).toHaveBeenCalledTimes(1);
});
