import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import type { ReactNode } from "react";
import { Route } from "@/routes/safe-drawing";
import { addDrawing, markDone } from "@/lib/store";

vi.mock("@/components/Scene", async (original) => ({
  ...(await original<typeof import("@/components/Scene")>()),
  Scene: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));
vi.mock("@/components/Character", () => ({ CharacterSay: () => null }));
vi.mock("@/lib/store", async (original) => ({
  ...(await original<typeof import("@/lib/store")>()),
  addDrawing: vi.fn(),
  markDone: vi.fn(),
}));

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.clearAllMocks();
});

function mount() {
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(null);
  vi.spyOn(HTMLCanvasElement.prototype, "toDataURL").mockReturnValue("data:image/jpeg;base64,test");
  const Component = Route.options.component;
  if (!Component) throw new Error("Safe drawing component missing");
  render(<Component />);
}

it("does not mark the drawing complete when device storage rejects saving", () => {
  vi.mocked(addDrawing).mockReturnValue(false);
  mount();
  fireEvent.click(screen.getByRole("button", { name: "Зберегти в галерею" }));
  expect(addDrawing).toHaveBeenCalledWith("data:image/jpeg;base64,test");
  expect(markDone).not.toHaveBeenCalled();
});

it("marks completion only after the drawing was saved on the device", () => {
  vi.mocked(addDrawing).mockReturnValue(true);
  mount();
  fireEvent.click(screen.getByRole("button", { name: "Зберегти в галерею" }));
  expect(addDrawing).toHaveBeenCalledTimes(1);
  expect(markDone).toHaveBeenCalledExactlyOnceWith("safe-drawing");
});
