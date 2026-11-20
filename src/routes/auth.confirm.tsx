import { useEffect, useRef, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import type { EmailOtpType } from "@supabase/supabase-js";
import { Btn, Scene } from "@/components/Scene";
import { supabase } from "@/integrations/supabase/client";
import { safeReturnPath } from "@/lib/caregiver-guard";
import { RECOVERY_KEY } from "@/lib/caregiver-session";
import { useT } from "@/lib/i18n";

/**
 * Confirmation links built with `{{ .TokenHash }}` land here, so a caregiver
 * returns to this origin without going through Supabase's redirect allowlist.
 * The token is exchanged in the browser, where the session lives.
 */
const CONFIRM_TYPES: readonly EmailOtpType[] = [
  "signup",
  "invite",
  "magiclink",
  "recovery",
  "email_change",
  "email",
];

const isConfirmType = (value: unknown): value is EmailOtpType =>
  typeof value === "string" && (CONFIRM_TYPES as readonly string[]).includes(value);

export const Route = createFileRoute("/auth/confirm")({
  ssr: false,
  validateSearch: (
    s: Record<string, unknown>,
  ): { token_hash: string; type: EmailOtpType | ""; next: string } => ({
    token_hash: typeof s["token_hash"] === "string" ? s["token_hash"] : "",
    type: isConfirmType(s["type"]) ? s["type"] : "",
    next: safeReturnPath(s["next"]),
  }),
  head: () => ({
    meta: [
      { title: "Підтвердження адреси — Тихе Місце" },
      {
        name: "description",
        content: "Підтвердіть електронну пошту дорослого, щоб увійти до панелі прогресу.",
      },
      { property: "og:title", content: "Підтвердження адреси — Тихе Місце" },
      { property: "og:description", content: "Підтвердження електронної пошти дорослого." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ConfirmEmail,
});

function ConfirmEmail() {
  const t = useT();
  const navigate = useNavigate();
  const { token_hash, type, next } = Route.useSearch();
  const [state, setState] = useState<"checking" | "ok" | "error">("checking");
  // Effects run twice in Strict Mode; keep one exchange per token.
  const attempt = useRef<ReturnType<typeof supabase.auth.verifyOtp> | null>(null);

  useEffect(() => {
    if (!token_hash || !type) {
      setState("error");
      return;
    }
    attempt.current ??= supabase.auth.verifyOtp({ token_hash, type });
    let active = true;
    void attempt.current
      .then(({ error }) => {
        if (!active) return;
        if (error) {
          setState("error");
          return;
        }
        setState("ok");
        if (type === "recovery") {
          try {
            sessionStorage.setItem(RECOVERY_KEY, "1");
          } catch {
            /* optional storage */
          }
          window.dispatchEvent(new Event("caregiver-recovery"));
          void navigate({ to: "/reset-password", replace: true });
          return;
        }
        void navigate({ to: next as never, replace: true });
      })
      .catch(() => {
        if (active) setState("error");
      });
    return () => {
      active = false;
    };
  }, [token_hash, type, next, navigate]);

  return (
    <Scene title="Для дорослих" back="/caregiver-login">
      <div className="paper-card mx-auto max-w-md space-y-4 p-5" aria-busy={state === "checking"}>
        <h2 className="font-display text-2xl font-bold">{t("Підтвердження адреси")}</h2>
        {state === "error" ? (
          <>
            <p role="alert" className="text-sm font-semibold text-destructive">
              {t("Посилання не спрацювало. Увійдіть або надішліть лист ще раз.")}
            </p>
            <Btn
              className="w-full"
              onClick={() =>
                void navigate({
                  to: "/caregiver-login",
                  search: { redirect: next },
                  replace: true,
                })
              }
            >
              {t("Перейти до входу")}
            </Btn>
          </>
        ) : (
          <p role="status" className="text-sm">
            {state === "ok" ? t("Адресу підтверджено. Переходимо далі…") : t("Підтверджуємо адресу…")}
          </p>
        )}
      </div>
    </Scene>
  );
}
