import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { Counting, Melody, Patterns } from "@/activities/games";
import { sfx } from "@/lib/audio";
import { getState, update } from "@/lib/store";

vi.mock("@/components/Character", () => ({ CharacterSay: () => null }));
vi.mock("@/lib/audio", () => ({ chime: vi.fn(), sfx: vi.fn() }));

beforeEach(() => {
  vi.useFakeTimers();
  update((s) => ({ ...s, lang: "uk", reduceMotion: true, completed: {} }));
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.restoreAllMocks();
});

it("listens first, then accepts the melody and grows it", () => {
  vi.spyOn(Math, "random").mockReturnValue(0);
  render(<Melody />);
  expect(screen.getByRole("button", { name: "Квітка 1" })).toBeDisabled();
  act(() => vi.advanceTimersByTime(2000));
  expect(screen.getByRole("button", { name: "Квітка 1" })).toBeEnabled();
  fireEvent.click(screen.getByRole("button", { name: "Квітка 1" }));
  fireEvent.click(screen.getByRole("button", { name: "Квітка 3" }));
  expect(screen.getByRole("status")).toHaveTextContent("Нот у мелодії: 3 з 6");
  expect(vi.mocked(sfx)).toHaveBeenCalledWith("confirm");
});

it("offers a gentle retry after a wrong note instead of losing the round", () => {
  render(<Melody />);
  act(() => vi.advanceTimersByTime(2000));
  fireEvent.click(screen.getByRole("button", { name: "Квітка 2" }));
  expect(screen.getByText("Майже! Послухай мелодію ще раз.")).toBeInTheDocument();
  expect(vi.mocked(sfx)).toHaveBeenCalledWith("soft");
});

it("advances through every pattern round and remembers the sunflower", () => {
  render(<Patterns />);
  expect(screen.getByRole("status")).toHaveTextContent("Візерунок 1 з 4");
  fireEvent.click(screen.getByRole("button", { name: "Тюльпан" }));
  expect(screen.getByText("Спробуй іншу фігуру — візерунок підкаже.")).toBeInTheDocument();
  expect(screen.getByRole("status")).toHaveTextContent("Візерунок 1 з 4");
  fireEvent.click(screen.getByRole("button", { name: "Ромашка" }));
  expect(screen.getByRole("status")).toHaveTextContent("Візерунок 2 з 4");
  fireEvent.click(screen.getByRole("button", { name: "Зірочка" }));
  expect(screen.getByRole("status")).toHaveTextContent("Візерунок 3 з 4");
  fireEvent.click(screen.getByRole("button", { name: "Сакура" }));
  expect(screen.getByRole("status")).toHaveTextContent("Візерунок 4 з 4");
  fireEvent.click(screen.getByRole("button", { name: "Сонечко" }));
  expect(screen.getByText("Усі візерунки склалися! 🧩")).toBeInTheDocument();
  expect(getState().completed["games-pattern"]).toBe(1);
});

it("counts stars softly, accepts only the right number and moves on", () => {
  render(<Counting />);
  expect(screen.getByRole("status")).toHaveTextContent("Пораховано: 0 з 3");
  fireEvent.click(screen.getByRole("button", { name: "Зірочка 1" }));
  fireEvent.click(screen.getByRole("button", { name: "Зірочка 1" }));
  expect(screen.getByRole("status")).toHaveTextContent("Пораховано: 1 з 3");
  fireEvent.click(screen.getByRole("button", { name: "4" }));
  expect(screen.getByText("Порахуй ще раз, торкаючись зірочок.")).toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "3" }));
  expect(screen.getByRole("status")).toHaveTextContent("Пораховано: 0 з 4");
});
