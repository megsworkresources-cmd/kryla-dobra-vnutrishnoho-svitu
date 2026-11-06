import { useEffect, useState, type FormEvent } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Scene } from "@/components/Scene";
import { supabase } from "@/integrations/supabase/client";
import { useT } from "@/lib/i18n";

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
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");

  useEffect(() => {
    if (window.location.hash.includes("type=recovery")) setReady(true);
    const { data } = supabase.auth.onAuthStateChange((ev) => { if (ev === "PASSWORD_RECOVERY") setReady(true); });
    return () => data.subscription.unsubscribe();
  }, []);

  async function submit(e: FormEvent) {
    e.preventDefault();
    const { error } = await supabase.auth.updateUser({ password });
    if (error) return setErr(error.message);
    navigate({ to: "/parents", replace: true });
  }

  return (
    <Scene title="Для дорослих" back="/">
      <form onSubmit={submit} className="paper-card mx-auto max-w-md space-y-4 p-5">
        <h2 className="font-display text-2xl font-bold">{t("Новий пароль")}</h2>
        {ready ? (
          <>
            <label className="block text-sm font-semibold">
              {t("Пароль")}
              <input type="password" required minLength={8} autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block min-h-12 w-full rounded-2xl border-2 border-border bg-background px-4 text-base text-foreground" />
            </label>
            {err && <p role="alert" className="text-sm font-semibold text-destructive">{err}</p>}
            <button type="submit" className="min-h-12 w-full rounded-full bg-primary px-5 font-bold text-primary-foreground shadow-soft">{t("Зберегти пароль")}</button>
          </>
        ) : <p className="text-sm">{t("Відкрийте це посилання з листа для зміни пароля.")}</p>}
      </form>
    </Scene>
  );
}
