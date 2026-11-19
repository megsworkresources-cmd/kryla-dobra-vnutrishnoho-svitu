import { describe, expect, it } from "vitest";
import { caregiverAuthError } from "@/lib/caregiver-auth-error";

describe("caregiver auth errors", () => {
  it("explains an unconfirmed account", () => {
    expect(caregiverAuthError({ code: "email_not_confirmed", status: 400 }, "signin")).toContain(
      "Підтвердьте",
    );
  });

  it("keeps invalid credentials actionable without leaking details", () => {
    expect(caregiverAuthError({ code: "invalid_credentials", status: 400 }, "signin")).toBe(
      "Не вдалося увійти. Перевірте пошту й пароль.",
    );
  });

  it.each(["over_email_send_rate_limit", "over_request_rate_limit"])("explains %s", (code) => {
    expect(caregiverAuthError({ code, status: 429 }, "forgot")).toContain("Забагато");
  });

  it("maps password and redirect failures", () => {
    expect(caregiverAuthError({ code: "weak_password" }, "signup")).toContain("8");
    expect(caregiverAuthError({ code: "same_password" }, "update")).toContain("відрізнятися");
    expect(caregiverAuthError({ code: "redirect_to_not_allowed" }, "forgot")).toContain(
      "налаштоване",
    );
  });

  it("maps an expired email link", () => {
    expect(caregiverAuthError({ code: "otp_expired" }, "update")).toContain("прострочене");
  });

  it("maps a network failure and falls back by mode", () => {
    expect(caregiverAuthError({ status: 0 }, "signin")).toContain("інтернет");
    expect(caregiverAuthError(new Error("offline"), "signin")).toBe(
      "Не вдалося увійти. Перевірте пошту й пароль.",
    );
    expect(caregiverAuthError({}, "update")).toContain("Відкрийте новий лист");
  });
});
