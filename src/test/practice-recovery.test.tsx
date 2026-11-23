import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { Practice, type PracticeStep } from "@/components/Practice";
import { clearSession, getSession, saveSession } from "@/lib/sessions";

vi.mock("@/components/Character", () => ({ CharacterSay: () => null }));
vi.mock("@/components/MagicStage", () => ({ MagicStage: () => null }));
vi.mock("@/components/Scene", () => ({
  Btn: ({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
    <button {...props}>{children}</button>
  ),
  DoneCard: () => null,
}));
vi.mock("@/lib/audio", () => ({ sfx: vi.fn() }));

const steps: PracticeStep[] = [
  { title: "Перший крок", text: "Обери одне.", options: ["Один"] },
  { title: "Другий крок", text: "Обери одне.", options: ["Два"] },
];

afterEach(() => {
  clearSession("practice-first");
  clearSession("practice-restart");
  cleanup();
  vi.restoreAllMocks();
});

it("offers to restore nonempty work saved on the first step without overwriting it", () => {
  saveSession("practice-first", 0, { 0: "Один" }, {});
  render(<Practice id="practice-first" steps={steps} ending="Готово" />);
  expect(screen.getByRole("button", { name: "Продовжити з кроку 1" })).toBeVisible();
  expect(getSession("practice-first")?.answers["0"]).toBe("Один");
});

it("start over dismisses the resume prompt instead of restoring the old session", () => {
  saveSession("practice-restart", 1, { 0: "Один" }, {});
  render(<Practice id="practice-restart" steps={steps} ending="Готово" />);
  fireEvent.click(screen.getByRole("button", { name: "Почати спочатку" }));
  expect(screen.queryByRole("button", { name: "Продовжити з кроку 2" })).toBeNull();
  expect(screen.getByText("Крок 1 з 2")).toBeVisible();
});
