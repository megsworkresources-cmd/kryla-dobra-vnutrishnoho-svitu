import { useEffect, useState, type FormEvent } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Btn, Scene } from "@/components/Scene";
import { supabase } from "@/integrations/supabase/client";
import { safeReturnPath } from "@/lib/caregiver-guard";
import { useT } from "@/lib/i18n";

type Mode = "signin" | "signup" | "forgot";

export const Route = createFileRoute("/caregiver-login")({
  validateSearch: (s: Record<string, unknown>) => ({ redirect: safeReturnPath(s["next"] ?? s["redirect"]) }),
  head: () => ({
    meta: [
      { title: "Вхід для дорослих — Тихе Місце" },
      {
        name: "description",
        content: "Вхід лише для батьків і опікунів. Дітям акаунт не потрібен.",
      },
      { property: "og:title", content: "Вхід для дорослих — Тихе Місце" },
      { property: "og:description", content: "Вхід для батьків і опікунів до панелі прогресу." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: CaregiverLogin,
});

const field =
  "mt-1 block min-h-12 w-full rounded-2xl border-2 border-border bg-background px-4 text-base text-foreground";

function CaregiverLogin() {
  const t = useT();
  const navigate = useNavigate();
  const { redirect } = Route.useSearch();
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

  // Already signed in → go straight back.
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) navigate({ to: redirect as never, replace: true });
    });
  }, [navigate, redirect]);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    try {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate({ to: redirect as never, replace: true });
      } else if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/caregiver-login?redirect=${encodeURIComponent(redirect)}`,
          },
        });
        if (error) throw error;
        setMsg({ kind: "ok", text: t("Перевірте пошту й підтвердьте адресу, потім увійдіть.") });
        setMode("signin");
      } else {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) throw error;
        setMsg({ kind: "ok", text: t("Якщо такий акаунт є, ми надіслали лист для зміни пароля.") });
      }
    } catch (err) {
      setMsg({
        kind: "err",
        text:
          mode === "signin"
            ? t("Не вдалося увійти. Перевірте пошту й пароль.")
            : (err as Error).message,
      });
    } finally {
      setBusy(false);
    }
  }

  const heading = {
    signin: "Вхід для дорослих",
    signup: "Створити акаунт дорослого",
    forgot: "Відновити пароль",
  }[mode];

  return (
    <Scene title="Для дорослих" back="/">
      <div className="mx-auto max-w-md space-y-4">
        <p className="paper-card p-4 text-sm">
          {t(
            "Цей вхід лише для батьків і опікунів. Дітям акаунт не потрібен — уся гра працює без нього. Дані дитини залишаються на цьому пристрої.",
          )}
        </p>
        <form onSubmit={submit} className="paper-card space-y-4 p-5" aria-labelledby="cg-h">
          <h2 id="cg-h" className="font-display text-2xl font-bold">
            {t(heading)}
          </h2>
          <label className="block text-sm font-semibold">
            {t("Електронна пошта дорослого")}
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={field}
            />
          </label>
          {mode !== "forgot" && (
            <label className="block text-sm font-semibold">
              {t("Пароль")}
              <input
                type="password"
                required
                minLength={8}
                autoComplete={mode === "signup" ? "new-password" : "current-password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={field}
              />
            </label>
          )}
          {msg && (
            <p
              role={msg.kind === "err" ? "alert" : "status"}
              className={`text-sm font-semibold ${msg.kind === "err" ? "text-destructive" : "text-primary"}`}
            >
              {msg.text}
            </p>
          )}
          <button
            type="submit"
            disabled={busy}
            className="min-h-12 w-full rounded-full bg-primary px-5 font-bold text-primary-foreground shadow-soft disabled:opacity-40"
          >
            {t({ signin: "Увійти", signup: "Створити акаунт", forgot: "Надіслати лист" }[mode])}
          </button>
          <div className="flex flex-wrap justify-center gap-2 text-sm">
            {mode !== "signin" && (
              <Btn
                variant="ghost"
                onClick={() => {
                  setMode("signin");
                  setMsg(null);
                }}
              >
                {t("Маю акаунт — увійти")}
              </Btn>
            )}
            {mode !== "signup" && (
              <Btn
                variant="ghost"
                onClick={() => {
                  setMode("signup");
                  setMsg(null);
                }}
              >
                {t("Створити акаунт")}
              </Btn>
            )}
            {mode !== "forgot" && (
              <Btn
                variant="ghost"
                onClick={() => {
                  setMode("forgot");
                  setMsg(null);
                }}
              >
                {t("Забули пароль?")}
              </Btn>
            )}
          </div>
        </form>
      </div>
    </Scene>
  );
}
