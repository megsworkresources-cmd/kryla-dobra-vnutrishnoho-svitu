import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { BodyMap, MixedFeelings, SortGame } from "@/activities/forest";
import { EMOTIONS, SCENARIOS, SORT_ITEMS } from "@/content/emotions";
import { update } from "@/lib/store";
import type { ReactNode } from "react";

vi.mock("@tanstack/react-router", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@tanstack/react-router")>();
  return {
    ...actual,
    // DoneCard links to the garden with <Link>; rendering it in isolation needs an anchor.
    Link: ({
      to = "#",
      children,
      ...rest
    }: { to?: string; children?: ReactNode } & Record<string, unknown>) => (
      <a href={to} {...rest}>
        {children}
      </a>
    ),
  };
});

vi.mock("@/components/Character", () => ({ CharacterSay: () => null }));
vi.mock("@/lib/audio", () => ({ chime: vi.fn(), sfx: vi.fn() }));
afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

it("finishes safely when the scenario list is empty", () => {
  const saved = SCENARIOS.splice(0);
  try {
    render(<MixedFeelings />);
    expect(screen.getByRole("button", { name: /Ще раз/ })).toBeEnabled();
  } finally {
    SCENARIOS.push(...saved);
  }
});

it("ignores a chosen emotion that is no longer in the list", () => {
  update((s) => ({ ...s, lang: "uk" }));
  render(<MixedFeelings />);
  fireEvent.click(screen.getByRole("button", { name: "Радість" }));
  const saved = EMOTIONS.splice(0, 1);
  try {
    fireEvent.click(screen.getByRole("button", { name: "Готово" }));
    expect(screen.getByRole("button", { name: "Далі" })).toBeEnabled();
  } finally {
    EMOTIONS.unshift(...saved);
  }
});

it("keeps body zone selections distinct across emotions", () => {
  render(<BodyMap />);
  fireEvent.click(screen.getByRole("button", { name: "Голова" }));
  expect(screen.getByRole("button", { name: "Голова" })).toHaveAttribute("aria-pressed", "true");
  fireEvent.click(screen.getByRole("button", { name: "Радість" }));
  expect(screen.getByRole("button", { name: "Голова" })).toHaveAttribute("aria-pressed", "false");
});

it("handles an empty sort list and replay resets its round", () => {
  vi.useFakeTimers();
  const saved = SORT_ITEMS.splice(0);
  try {
    render(<SortGame />);
    SORT_ITEMS.push({ text: "Мені сумно", kind: "feel" });
    fireEvent.click(screen.getByRole("button", { name: /Ще раз/ }));
    fireEvent.click(screen.getByRole("button", { name: /Почуття/ }));
    act(() => vi.advanceTimersByTime(2600));
    fireEvent.click(screen.getByRole("button", { name: /Ще раз/ }));
    expect(screen.getByRole("button", { name: /Почуття/ })).toBeEnabled();
  } finally {
    SORT_ITEMS.splice(0, SORT_ITEMS.length, ...saved);
  }
});
