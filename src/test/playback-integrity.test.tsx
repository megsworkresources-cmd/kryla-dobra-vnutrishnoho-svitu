import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { ColorFlower } from "@/activities/studio";
import { getState, update } from "@/lib/store";

vi.mock("@/components/Character", () => ({ CharacterSay: () => null }));
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
