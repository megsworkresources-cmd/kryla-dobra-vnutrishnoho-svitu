import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Route as LoginRoute } from "@/routes/caregiver-login";
import { Route as ResetRoute } from "@/routes/reset-password";
import { supabase } from "@/integrations/supabase/client";
import { startResendCooldown } from "@/lib/caregiver-session";

const mocks = vi.hoisted(() => ({ navigate: vi.fn() }));

vi.mock("@tanstack/react-router", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@tanstack/react-router")>();
  return { ...actual, useNavigate: () => mocks.navigate };
});
vi.mock("@/components/Scene", () => ({
  Scene: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Btn: ({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
    <button {...props}>{children}</button>
  ),
}));
vi.mock("@/lib/i18n", () => ({ useT: () => (text: string) => text }));
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    auth: {
      getUser: vi.fn(),
      signInWithPassword: vi.fn(),
      signUp: vi.fn(),
      resetPasswordForEmail: vi.fn(),
      resend: vi.fn(),
      updateUser: vi.fn(),
    },
  },
}));

const Login = LoginRoute.options.component!;
const Reset = ResetRoute.options.component!;
const auth = vi.mocked(supabase.auth, true);

beforeEach(() => {
  vi.clearAllMocks();
  vi.spyOn(LoginRoute, "useSearch").mockReturnValue({ redirect: "/parents" });
  vi.mocked(auth.getUser).mockResolvedValue({ data: { user: null }, error: null } as never);
  window.location.hash = "";
  sessionStorage.clear();
});

afterEach(cleanup);

describe("caregiver form states", () => {
  it("shows an error instead of failing silently when the session check is rejected", async () => {
    vi.mocked(auth.getUser).mockRejectedValue(new Error("offline"));
    render(<Login />);
    expect(
      await screen.findByText("Не вдалося завершити дію. Перевірте дані й спробуйте ще раз."),
    ).toBeInTheDocument();
    expect(mocks.navigate).not.toHaveBeenCalled();
  });

  it("announces pending sign-in and prevents duplicate submissions", async () => {
    let finish: ((value: { error: null }) => void) | undefined;
    vi.mocked(auth.signInWithPassword).mockImplementation(
      () =>
        new Promise((resolve) => {
          finish = resolve;
        }) as never,
    );
    render(<Login />);
    fireEvent.change(screen.getByLabelText("Електронна пошта дорослого"), {
      target: { value: "adult@example.com" },
    });
    fireEvent.change(screen.getByLabelText("Пароль"), { target: { value: "password1" } });
    fireEvent.click(screen.getByRole("button", { name: "Увійти" }));
    const pending = screen.getByRole("button", { name: "Входимо…" });
    expect(pending).toBeDisabled();
    fireEvent.click(pending);
    expect(auth.signInWithPassword).toHaveBeenCalledTimes(1);
    await act(async () => finish!({ error: null }));
    expect(mocks.navigate).toHaveBeenCalledWith({ to: "/parents", replace: true });
  });

  it("shows a sign-in failure without losing the adult's email", async () => {
    vi.mocked(auth.signInWithPassword).mockResolvedValue({
      error: new Error("invalid login"),
    } as never);
    render(<Login />);
    fireEvent.change(screen.getByLabelText("Електронна пошта дорослого"), {
      target: { value: "adult@example.com" },
    });
    fireEvent.change(screen.getByLabelText("Пароль"), { target: { value: "wrong-password" } });
    fireEvent.click(screen.getByRole("button", { name: "Увійти" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Не вдалося увійти");
    expect(screen.getByLabelText("Електронна пошта дорослого")).toHaveValue("adult@example.com");
    expect(mocks.navigate).not.toHaveBeenCalled();
  });

  it("offers a resend when sign-in says the email is not confirmed", async () => {
    vi.mocked(auth.signInWithPassword).mockResolvedValue({
      error: { code: "email_not_confirmed", status: 400 },
    } as never);
    vi.mocked(auth.resend).mockResolvedValue({ error: null } as never);
    render(<Login />);
    fireEvent.change(screen.getByLabelText("Електронна пошта дорослого"), {
      target: { value: "adult@example.com" },
    });
    fireEvent.change(screen.getByLabelText("Пароль"), { target: { value: "password1" } });
    fireEvent.click(screen.getByRole("button", { name: "Увійти" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Підтвердьте");
    fireEvent.click(screen.getByRole("button", { name: "Надіслати лист ще раз" }));
    expect(await screen.findByRole("status")).toHaveTextContent("Лист надіслано ще раз");
    expect(auth.resend).toHaveBeenCalledWith({
      type: "signup",
      email: "adult@example.com",
      options: {
        emailRedirectTo: `${window.location.origin}/caregiver-login?redirect=%2Fparents`,
      },
    });
    const resendButton = screen.getByRole("button", { name: /Надіслати лист ще раз/ });
    expect(resendButton).toBeDisabled();
    fireEvent.click(resendButton);
    expect(auth.resend).toHaveBeenCalledTimes(1);
  });

  it("keeps the resend cooldown after the page reloads", async () => {
    vi.mocked(auth.signInWithPassword).mockResolvedValue({
      error: { code: "email_not_confirmed", status: 400 },
    } as never);
    vi.mocked(auth.resend).mockResolvedValue({ error: null } as never);
    startResendCooldown();
    render(<Login />);
    fireEvent.change(screen.getByLabelText("Електронна пошта дорослого"), {
      target: { value: "adult@example.com" },
    });
    fireEvent.change(screen.getByLabelText("Пароль"), { target: { value: "password1" } });
    fireEvent.click(screen.getByRole("button", { name: "Увійти" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Підтвердьте");
    const resendButton = screen.getByRole("button", { name: /Надіслати лист ще раз/ });
    expect(resendButton).toBeDisabled();
    fireEvent.click(resendButton);
    expect(auth.resend).not.toHaveBeenCalled();
  });

  it("offers a resend after sign-up while confirmation is pending", async () => {
    vi.mocked(auth.signUp).mockResolvedValue({ error: null } as never);
    render(<Login />);
    fireEvent.click(screen.getByRole("button", { name: "Створити акаунт" }));
    fireEvent.change(screen.getByLabelText("Електронна пошта дорослого"), {
      target: { value: "adult@example.com" },
    });
    fireEvent.change(screen.getByLabelText("Пароль"), { target: { value: "password1" } });
    fireEvent.click(screen.getByRole("button", { name: "Створити акаунт" }));
    expect(await screen.findByRole("status")).toHaveTextContent("Перевірте пошту");
    expect(screen.getByRole("button", { name: /Надіслати лист ще раз/ })).toBeDisabled();
  });

  it("requests recovery with the local reset address and shows the safe success message", async () => {
    vi.mocked(auth.resetPasswordForEmail).mockResolvedValue({ error: null } as never);
    render(<Login />);
    fireEvent.click(screen.getByRole("button", { name: "Забули пароль?" }));
    fireEvent.change(screen.getByLabelText("Електронна пошта дорослого"), {
      target: { value: "adult@example.com" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Надіслати лист" }));
    expect(await screen.findByRole("status")).toHaveTextContent("Якщо такий акаунт є");
    expect(auth.resetPasswordForEmail).toHaveBeenCalledWith("adult@example.com", {
      redirectTo: `${window.location.origin}/reset-password`,
    });
  });

  it("keeps the recovery link state pending until session validation finishes", () => {
    vi.mocked(auth.getUser).mockImplementation(() => new Promise(() => {}) as never);
    window.location.hash = "#type=recovery&access_token=example";
    render(<Reset />);
    expect(screen.getByRole("status")).toHaveTextContent("Перевіряємо посилання…");
    expect(screen.queryByText("Відкрийте це посилання з листа для зміни пароля.")).toBeNull();
  });

  it("rejects a recovery link without a valid authenticated session", async () => {
    window.location.hash = "#type=recovery";
    render(<Reset />);
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Відкрийте це посилання з листа для зміни пароля.",
    );
    expect(screen.queryByLabelText("Пароль")).toBeNull();
  });

  it("shows a recovery update failure and allows a retry", async () => {
    vi.mocked(auth.getUser).mockResolvedValue({
      data: { user: { id: "adult" } },
      error: null,
    } as never);
    vi.mocked(auth.updateUser).mockResolvedValue({ error: new Error("offline") } as never);
    window.location.hash = "#type=recovery";
    render(<Reset />);
    const input = await screen.findByLabelText("Пароль");
    fireEvent.change(input, { target: { value: "newpassword1" } });
    fireEvent.click(screen.getByRole("button", { name: "Зберегти пароль" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Не вдалося зберегти пароль");
    expect(screen.getByRole("button", { name: "Зберегти пароль" })).toBeEnabled();
  });
});
