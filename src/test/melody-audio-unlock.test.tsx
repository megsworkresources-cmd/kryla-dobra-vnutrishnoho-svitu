import { act, cleanup, render } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { Melody } from "@/activities/games";
import { destroyAudio, unlockAudio } from "@/lib/audio";

const chime = vi.hoisted(() => vi.fn());
vi.mock("@/lib/audio", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/audio")>();
  return { ...actual, chime };
});
vi.mock("@/components/Character", () => ({ CharacterSay: () => null }));
vi.mock("@/components/Scene", () => ({
  Btn: ({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
    <button {...props}>{children}</button>
  ),
}));

afterEach(() => {
  cleanup();
  destroyAudio();
  vi.useRealTimers();
  chime.mockClear();
});

it("waits for the first real user gesture before playing the opening melody", () => {
  vi.useFakeTimers();
  render(<Melody />);
  act(() => vi.advanceTimersByTime(2000));
  expect(chime).not.toHaveBeenCalled();

  act(() => unlockAudio());
  act(() => vi.advanceTimersByTime(500));
  expect(chime).toHaveBeenCalledTimes(1);
  expect(chime).toHaveBeenCalledWith(523);
});
