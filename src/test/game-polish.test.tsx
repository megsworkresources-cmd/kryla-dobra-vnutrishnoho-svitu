import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { Bubbles, Pairs, Stars } from "@/routes/games";
import { deal } from "@/content/game-cards";
import { chime } from "@/lib/audio";
import { getState, update } from "@/lib/store";

vi.mock("@/components/Character", () => ({ CharacterSay: () => null }));
vi.mock("@/lib/audio", () => ({ chime: vi.fn(), sfx: vi.fn() }));

beforeEach(() => {
  vi.useFakeTimers();
  update((s) => ({ ...s, lang: "uk", reduceMotion: true }));
});
afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.restoreAllMocks();
});

it("deals exactly two of each existing character", () => {
  const cards = deal();
  expect(cards).toHaveLength(12);
  for (const who of ["solomiya", "taras", "olenka", "marko", "daryna", "lihtaryk"])
    expect(cards.filter((c) => c.who === who)).toHaveLength(2);
});

it("keeps nine reachable bubbles with reduced motion without saving play", () => {
  const progress = getState().completed;
  render(<Bubbles />);
  expect(screen.getAllByRole("button", { name: "Бульбашка" })).toHaveLength(9);
  fireEvent.click(screen.getAllByRole("button", { name: "Бульбашка" })[0] as HTMLElement);
  act(() => vi.advanceTimersByTime(20000));
  expect(screen.getAllByRole("button", { name: "Бульбашка" })).toHaveLength(9);
  expect(getState().completed).toEqual(progress);
});

it("reset cancels a pending memory match", () => {
  vi.spyOn(Math, "random").mockReturnValue(0.999);
  render(<Pairs />);
  fireEvent.click(screen.getByRole("button", { name: "Картка 1: Закрита картка" }));
  fireEvent.click(screen.getByRole("button", { name: "Картка 7: Закрита картка" }));
  fireEvent.click(screen.getByRole("button", { name: "Почати спочатку" }));
  act(() => vi.advanceTimersByTime(1500));
  expect(screen.getByRole("status")).toHaveTextContent("Знайдено пар: 0 із 6");
  expect(screen.getByRole("button", { name: "Картка 1: Закрита картка" })).toHaveAttribute(
    "aria-pressed",
    "false",
  );
});

it("undo removes the last star and exit cancels queued notes", () => {
  const { unmount } = render(<Stars />);
  const sky = screen.getByRole("button", { name: "Нічне небо для зірок" });
  fireEvent.keyDown(sky, { key: "Enter" });
  fireEvent.keyDown(sky, { key: "Enter" });
  fireEvent.click(screen.getByRole("button", { name: "Прибрати останню зірку" }));
  expect(screen.getByRole("button", { name: "▶ Заграти сузір'я" })).toBeEnabled();
  fireEvent.click(screen.getByRole("button", { name: "Прибрати останню зірку" }));
  expect(screen.getByRole("button", { name: "▶ Заграти сузір'я" })).toBeDisabled();
  fireEvent.keyDown(sky, { key: "Enter" });
  fireEvent.click(screen.getByRole("button", { name: "▶ Заграти сузір'я" }));
  unmount();
  const calls = vi.mocked(chime).mock.calls.length;
  act(() => vi.runAllTimers());
  expect(chime).toHaveBeenCalledTimes(calls);
});
