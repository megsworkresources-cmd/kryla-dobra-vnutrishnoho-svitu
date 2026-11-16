import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { Helper } from "@/routes/helper";
import { askHelper } from "@/lib/suggest.functions";

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    auth: {
      getSession: () =>
        Promise.resolve({
          data: {
            session: (globalThis as { __noSession?: boolean }).__noSession ? null : { user: {} },
          },
        }),
    },
  },
}));
vi.mock("@/lib/suggest.functions", () => ({ askHelper: vi.fn() }));
vi.mock("@/lib/audio", () => ({ sfx: vi.fn() }));
vi.mock("@/components/Character", () => ({ CharacterSay: () => null }));
vi.mock("@/components/Scene", () => ({
  Scene: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Btn: ({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
    <button {...props}>{children}</button>
  ),
}));
vi.mock("@tanstack/react-router", () => ({
  createFileRoute: () => () => ({}),
  Link: ({ children }: { children: React.ReactNode }) => <a>{children}</a>,
  useNavigate: () => vi.fn(),
}));

beforeEach(() => {
  vi.mocked(askHelper).mockReset();
});
afterEach(cleanup);

it("shows a useful validation error instead of sending a one-character request", () => {
  render(<Helper />);
  fireEvent.change(screen.getByRole("textbox"), { target: { value: "я" } });
  fireEvent.click(screen.getByRole("button", { name: "Підказати вправу" }));
  expect(screen.getByRole("alert")).toHaveTextContent("Додай ще хоча б одну літеру");
  expect(askHelper).not.toHaveBeenCalled();
});

it("clears loading and restores the form after a rejected request", async () => {
  vi.mocked(askHelper).mockRejectedValue(new Error("offline"));
  render(<Helper />);
  fireEvent.change(screen.getByRole("textbox"), { target: { value: "мені сумно" } });
  fireEvent.click(screen.getByRole("button", { name: "Підказати вправу" }));
  expect(await screen.findByRole("alert")).toHaveTextContent("тимчасово недоступні");
  expect(screen.getByRole("button", { name: "Підказати вправу" })).toBeEnabled();
});

it("disables quick choices while one request is in flight", async () => {
  let rejectRequest: (reason: Error) => void = () => undefined;
  vi.mocked(askHelper).mockImplementation(
    () =>
      new Promise((_, reject) => {
        rejectRequest = reject;
      }),
  );
  render(<Helper />);
  fireEvent.click(screen.getByRole("button", { name: "я сумую" }));
  await vi.waitFor(() => expect(askHelper).toHaveBeenCalledTimes(1));
  const other = screen.getByRole("button", { name: "мені страшно" });
  expect(other).toBeDisabled();
  fireEvent.click(other);
  expect(askHelper).toHaveBeenCalledTimes(1);
  rejectRequest(new Error("offline"));
  expect(await screen.findByRole("alert")).toBeVisible();
  expect(screen.getByRole("button", { name: "мені страшно" })).toBeEnabled();
});

it("asks for a grown-up to sign in instead of calling the AI when signed out", async () => {
  (globalThis as { __noSession?: boolean }).__noSession = true;
  render(<Helper />);
  fireEvent.change(screen.getByRole("textbox"), { target: { value: "мені сумно" } });
  fireEvent.click(screen.getByRole("button", { name: "Підказати вправу" }));
  expect(await screen.findByRole("alert")).toHaveTextContent("Попроси дорослого увійти");
  expect(askHelper).not.toHaveBeenCalled();
  (globalThis as { __noSession?: boolean }).__noSession = false;
});
