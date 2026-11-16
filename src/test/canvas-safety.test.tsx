import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { Canvas } from "@/activities/studio";

vi.mock("@/components/Character", () => ({ CharacterSay: () => null }));
vi.mock("@/lib/audio", () => ({ chime: vi.fn(), sfx: vi.fn() }));
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

it("ignores drawing when the canvas context is unavailable", () => {
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(null);
  render(<Canvas id="canvas-safety" prompt="Малюй" />);
  const canvas = screen.getByLabelText("Аркуш для малювання");
  expect(() => {
    fireEvent.pointerDown(canvas, { clientX: 10, clientY: 10 });
    fireEvent.pointerMove(canvas, { clientX: 20, clientY: 20 });
  }).not.toThrow();
  expect(HTMLCanvasElement.prototype.getContext).toHaveBeenCalled();
});

it("names every sticker and paint colour for screen-reader users", () => {
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(null);
  render(<Canvas id="canvas-labels" prompt="Малюй" />);
  expect(screen.getByRole("button", { name: "Наліпка: Соняшник" })).toBeVisible();
  expect(screen.getByRole("button", { name: "Наліпка: Метелик" })).toBeVisible();
  expect(screen.getByRole("button", { name: "Колір: Блакитний" })).toBeVisible();
});
