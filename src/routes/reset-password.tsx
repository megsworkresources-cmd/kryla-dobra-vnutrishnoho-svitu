import { useEffect, useState, type FormEvent } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Btn, Scene } from "@/components/Scene";
import { supabase } from "@/integrations/supabase/client";
import { useT } from "@/lib/i18n";
import { RECOVERY_KEY, recoveryRequested } from "@/lib/caregiver-session";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Новий пароль для дорослих — Тихе Місце" },
      { name: "description", content: "Встановіть новий пароль для акаунта дорослого." },
      { property: "og:title", content: "Новий пароль — Тихе Місце" },
      { property: "og:description", content: "Відновлення пароля для батьків і опікунів." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ResetPassword,
});

function ResetPassword() {
  const t = useT();
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [checking, setChecking] = useState(true);
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;
    const check = async () => {
      setChecking(true);
      let saved: string | null = null;
      try {
        saved = sessionStorage.getItem(RECOVERY_KEY);
      } catch {
        /* optional storage */
      }
      if (!recoveryRequested(window.location.hash, saved)) {
        if (active) setChecking(false);
        return;
      }
      try {
        const { data, error } = await supabase.auth.getUser();
        if (!active) return;
        const valid = !error && !!data.user;
        setReady(valid);
        if (valid) {
          try {
            sessionStorage.setItem(RECOVERY_KEY, "1");
          } catch {
            /* optional storage */
          }
        }
      } catch {
        if (active) setReady(false);
      } finally {
        if (active) setChecking(false);
      }
    };
    void check();
    window.addEventListener("caregiver-recovery", check);
    return () => {
      active = false;
      window.removeEventListener("caregiver-recovery", check);
    };
  }, []);

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!ready || busy) return;
    setBusy(true);
    setErr("");
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      try {
        sessionStorage.removeItem(RECOVERY_KEY);
      } catch {
        /* optional storage */
      }
      await navigate({ to: "/parents", replace: true });
    } catch {
      setErr(t("Не вдалося зберегти пароль. Відкрийте новий лист відновлення й спробуйте ще раз."));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Scene title="Для дорослих" back="/">
      <form
        onSubmit={submit}
        className="paper-card mx-auto max-w-md space-y-4 p-5"
        aria-busy={busy || checking}
      >
        <h2 className="font-display text-2xl font-bold">{t("Новий пароль")}</h2>
        {checking ? (
          <p role="status" className="text-sm">
            {t("Перевіряємо посилання…")}
          </p>
        ) : ready ? (
          <>
            <label className="block text-sm font-semibold">
              {t("Пароль")}
              <input
                type="password"
                required
                minLength={8}
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block min-h-12 w-full rounded-2xl border-2 border-border bg-background px-4 text-base text-foreground"
              />
            </label>
            {err && (
              <p role="alert" className="text-sm font-semibold text-destructive">
                {err}
              </p>
            )}
            <Btn type="submit" disabled={busy} className="w-full">
              {busy ? t("Зберігаємо…") : t("Зберегти пароль")}
            </Btn>
          </>
        ) : (
          <p role="alert" className="text-sm">
            {t("Відкрийте це посилання з листа для зміни пароля.")}
          </p>
        )}
      </form>
    </Scene>
  );
}
