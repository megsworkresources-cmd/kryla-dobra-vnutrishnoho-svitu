import { createFileRoute, redirect } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Btn, Scene } from "@/components/Scene";
import { pageHead } from "@/content/journeys";
import { useT } from "@/lib/i18n";

export const Route = createFileRoute("/.lovable/oauth/consent")({
  ssr: false,
  validateSearch: (s: Record<string, unknown>) => ({ authorization_id: typeof s["authorization_id"] === "string" ? s["authorization_id"] : "" }),
  head: () => pageHead("Підключення помічника", "Дозвіл дорослого на читання каталогу вправ."),
  beforeLoad: async ({ search, location }) => {
    if (!search.authorization_id) throw new Error("Missing authorization ID");
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    if (!data.session) throw redirect({ to: "/caregiver-login", search: { redirect: location.pathname + location.searchStr + location.hash } });
  },
  loader: async ({ location }) => {
    const id = new URLSearchParams(location.searchStr).get("authorization_id");
    if (!id) throw new Error("Missing authorization ID");
    const { data, error } = await supabase.auth.oauth.getAuthorizationDetails(id);
    if (error) throw error;
    if (data && "redirect_url" in data) throw redirect({ href: data.redirect_url });
    if (!data) throw new Error("No authorization details");
    const { data: user, error: userError } = await supabase.auth.getUser();
    if (userError || !user.user) throw new Error("Sign-in expired");
    return { details: data, email: user.user.email ?? "" };
  },
  component: Consent,
  errorComponent: ConsentError,
});

function ConsentError() {
  const t = useT();
  return <Scene title="Підключення помічника" back="/parents"><p role="alert" className="paper-card p-5">{t("Цей запит недійсний або вже завершився. Почніть підключення знову у своєму помічнику.")}</p></Scene>;
}

function Consent() {
  const t = useT();
  const { details, email } = Route.useLoaderData();
  const { authorization_id } = Route.useSearch();
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);
  async function decide(approve: boolean) {
    if (busy) return;
    setBusy(true);
    setFailed(false);
    try {
      const { data, error } = approve
        ? await supabase.auth.oauth.approveAuthorization(authorization_id)
        : await supabase.auth.oauth.denyAuthorization(authorization_id);
      if (error || !data?.redirect_url) throw new Error("Authorization failed");
      window.location.assign(data.redirect_url);
    } catch { setFailed(true); setBusy(false); }
  }
  const scopes = details.scope.split(" ").filter(Boolean);
  return <Scene title="Підключення помічника" back="/parents">
    <section className="paper-card mx-auto max-w-lg space-y-4 p-5">
      <h2 className="font-display text-2xl font-bold">{t("Підключити {client} до Тихого Місця", { client: details.client.name })}</h2>
      <p className="break-all text-sm">{email}</p>
      <p className="break-all text-sm">{details.redirect_uri}</p>
      <p>{t("Помічник зможе читати назви, описи та адреси вправ. Малюнки, почуття й прогрес дитини залишаються на пристрої та недоступні помічнику.")}</p>
      <ul className="list-disc space-y-2 pl-5">{scopes.map((scope) => <li key={scope}>{scope === "email" ? t("Поділитися адресою пошти") : scope === "profile" ? t("Поділитися основним профілем") : scope === "openid" ? t("Підтвердити особу дорослого") : t("Додатковий дозвіл: {scope}", { scope })}</li>)}</ul>
      <p className="text-sm text-muted-foreground">{t("Це не скасовує дозволи застосунку та захист даних.")}</p>
      {failed && <p role="alert">{t("Не вдалося завершити дію. Спробуйте ще раз або скасуйте підключення.")}</p>}
      <div className="flex flex-wrap gap-3">
        <Btn disabled={busy} onClick={() => void decide(true)}>{t("Дозволити підключення")}</Btn>
        <Btn variant="soft" disabled={busy} onClick={() => void decide(false)}>{t("Скасувати підключення")}</Btn>
      </div>
      {busy && <p role="status">{t("Зачекайте…")}</p>}
    </section>
  </Scene>;
}