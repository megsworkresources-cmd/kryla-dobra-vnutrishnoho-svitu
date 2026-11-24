import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { CharacterSay } from "@/components/Character";
import { update } from "@/lib/store";

beforeEach(() => {
  update((s) => ({ ...s, lang: "uk", sound: true, voice: false }));
  vi.spyOn(HTMLMediaElement.prototype, "play").mockResolvedValue();
  vi.spyOn(HTMLMediaElement.prototype, "pause").mockImplementation(() => {});
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

it("shows a still portrait under reduced motion until the child asks for the loop", () => {
  update((s) => ({ ...s, reduceMotion: true }));
  const { container } = render(<CharacterSay who="solomiya" text="Привіт" autoSpeak={false} />);
  expect(container.querySelector("video")).toBeNull();
  expect(HTMLMediaElement.prototype.play).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole("button", { name: "Грати відео" }));
  expect(HTMLMediaElement.prototype.play).toHaveBeenCalledTimes(1);
});

it("retries a loop the device blocked on the child's next touch", async () => {
  update((s) => ({ ...s, reduceMotion: false }));
  vi.mocked(HTMLMediaElement.prototype.play).mockRejectedValueOnce(
    new DOMException("Blocked", "NotAllowedError"),
  );
  render(<CharacterSay who="marko" text="Привіт" autoSpeak={false} />);
  await act(async () => {});
  expect(HTMLMediaElement.prototype.play).toHaveBeenCalledTimes(1);
  window.dispatchEvent(new Event("pointerdown"));
  await act(async () => {});
  expect(vi.mocked(HTMLMediaElement.prototype.play).mock.calls.length).toBeGreaterThanOrEqual(2);
});
