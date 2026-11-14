import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { Compass, Image as ImageIcon, ListChecks, Sparkles } from "lucide-react";
import { Btn, Scene } from "@/components/Scene";
import { PLACES } from "@/content/places";
import { CATALOG } from "@/content/catalog";
import { resetProgress, totalDone, useStore } from "@/lib/store";
import { localeOf, useLang, useT } from "@/lib/i18n";
import { signOutCaregiver } from "@/lib/caregiver-session";

export const Route = createFileRoute("/_caregiver/parents")({
  head: () => ({
    meta: [
      { title: "Для дорослих — прогрес дитини — Тихе Місце" },
      {
        name: "description",
        content: "Відвідані місця, виконані вправи та малюнки дитини — лише на цьому пристрої.",
      },
      { property: "og:title", content: "Для дорослих — Тихе Місце" },
      {
        property: "og:description",
        content: "Панель для батьків: місця, вправи й малюнки дитини.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Parents,
});

const hrefOf = (place: string, id: string) => `/${place}/${id}`;

function Parents() {
  const t = useT();
  const lang = useLang();
  const visits = useStore((s) => s.visits);
  const completed = useStore((s) => s.completed);
  const lastDone = useStore((s) => s.lastDone);
  const drawings = useStore((s) => s.drawings);
  const [confirm, setConfirm] = useState(false);
  const { caregiver } = Route.useRouteContext();
  const { queryClient } = Route.useRouteContext();
  const navigate = useNavigate();
  const [signingOut, setSigningOut] = useState(false);
  const [signOutError, setSignOutError] = useState(false);
  const signOut = async () => {
    if (signingOut) return;
    setSigningOut(true);
    setSignOutError(false);
    try {
      await signOutCaregiver({
        cancel: () => queryClient.cancelQueries(),
        clear: () => queryClient.clear(),
        signOut: () => supabase.auth.signOut(),
        navigate: () =>
          navigate({ to: "/caregiver-login", search: { redirect: "/parents" }, replace: true }),
      });
    } catch {
      setSignOutError(true);
    } finally {
      setSigningOut(false);
    }
  };
  const date = (ms?: number) =>
    ms ? new Date(ms).toLocaleDateString(localeOf(lang), { day: "numeric", month: "short" }) : "—";

  const visited = PLACES.filter((p) => visits[p.id]);
  const tried = CATALOG.filter((a) => completed[a.key]);
  const recent = Object.entries(lastDone)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([k, at]) => ({ at, item: CATALOG.find((c) => c.key === k), k }));

  const stats = [
    { icon: Compass, n: `${visited.length}/${PLACES.length}`, l: "Відвідані місця" },
    { icon: ListChecks, n: `${tried.length}/${CATALOG.length}`, l: "Спробувані вправи" },
    { icon: Sparkles, n: String(totalDone(completed)), l: "Усього завершень" },
    { icon: ImageIcon, n: String(drawings.length), l: "Збережені малюнки" },
  ];

  return (
    <Scene title="Для дорослих" back="/">
      <div className="space-y-5">
        <div className="paper-card flex flex-wrap items-center justify-between gap-3 p-4 text-sm">
          <span>{t("Ви увійшли як дорослий: {e}", { e: caregiver.email ?? "—" })}</span>
          <Btn variant="soft" disabled={signingOut} onClick={signOut}>
            {t("Вийти")}
          </Btn>
        </div>
        {signOutError && (
          <p role="alert" className="text-destructive">
            {t("Не вдалося вийти. Спробуйте ще раз.")}
          </p>
        )}
        <p className="paper-card p-4 text-sm font-semibold">
          {t(
            "Дані про заняття дитини залишаються лише на цьому пристрої й не завантажуються у ваш акаунт.",
          )}
        </p>
        <p className="paper-card p-4 text-sm">
          {t(
            "Місцеві записи залишаються приватними. Лише у спільному саду дорослий може окремо поширити анонімну стадію соняшника.",
          )}
        </p>
        <Link to="/shared-garden" className="paper-card block p-4 font-bold text-primary underline">🌻 {t("Спільний сад")}</Link>

        <section aria-label={t("Підсумок")} className="grid grid-cols-2 gap-3">
          {stats.map(({ icon: I, n, l }) => (
            <div key={l} className="paper-card flex flex-col items-start gap-1 p-4">
              <I className="h-5 w-5 text-primary" aria-hidden />
              <span className="font-display text-3xl font-bold tabular-nums">{n}</span>
              <span className="text-sm text-muted-foreground">{t(l)}</span>
            </div>
          ))}
        </section>

        <section className="paper-card p-4">
          <h2 className="font-display text-2xl font-bold">{t("Останні вправи")}</h2>
          {recent.length ? (
            <ul className="mt-2 divide-y divide-border">
              {recent.map(({ k, at, item }) => (
                <li key={k} className="flex items-center justify-between gap-3 py-2 text-sm">
                  <span className="font-semibold">
                    {item ? t(item.title) : k === "helper" ? t("Розкажи, як ти") : k}
                  </span>
                  <span className="shrink-0 text-muted-foreground">{date(at)}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-sm text-muted-foreground">
              {t("Поки що жодної завершеної вправи.")}
            </p>
          )}
        </section>

        <section className="paper-card p-4">
          <h2 className="font-display text-2xl font-bold">{t("Місця")}</h2>
          <ul className="mt-3 grid grid-cols-2 gap-2">
            {PLACES.map((p) => {
              const v = visits[p.id];
              return (
                <li
                  key={p.id}
                  className={`flex items-center gap-2 rounded-2xl p-2 ${v ? "bg-secondary" : "opacity-60"}`}
                >
                  <img
                    src={p.image}
                    alt=""
                    className="h-10 w-10 shrink-0 rounded-xl object-cover"
                  />
                  <div className="min-w-0 text-xs">
                    <p className="truncate font-bold">{t(p.name)}</p>
                    <p className="text-muted-foreground">
                      {v ? t("Востаннє: {d}", { d: date(v.last) }) : t("Ще не відвідано")}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>

        <section className="paper-card p-4">
          <h2 className="font-display text-2xl font-bold">{t("Вправи")}</h2>
          {PLACES.filter((p) => CATALOG.some((a) => a.place === p.id)).map((p) => {
            const items = CATALOG.filter((a) => a.place === p.id);
            const n = items.filter((a) => completed[a.key]).length;
            return (
              <details key={p.id} className="mt-2 rounded-2xl bg-secondary p-3">
                <summary className="flex min-h-10 cursor-pointer items-center justify-between gap-2 font-bold">
                  <span>{t(p.name)}</span>
                  <span className="text-sm tabular-nums text-muted-foreground">
                    {n}/{items.length}
                  </span>
                </summary>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-background" aria-hidden>
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${(n / items.length) * 100}%` }}
                  />
                </div>
                <ul className="mt-2 space-y-1 text-sm">
                  {items.map((a) => (
                    <li key={a.key} className="flex items-center justify-between gap-2">
                      <Link
                        to={hrefOf(a.place, a.id) as never}
                        className="underline-offset-2 hover:underline"
                      >
                        {completed[a.key] ? "✓ " : "○ "}
                        {t(a.title)}
                      </Link>
                      <span className="shrink-0 text-xs text-muted-foreground">
                        {completed[a.key] ? `×${completed[a.key]} · ${date(lastDone[a.key])}` : ""}
                      </span>
                    </li>
                  ))}
                </ul>
              </details>
            );
          })}
        </section>

        <section className="paper-card p-4">
          <div className="flex items-center justify-between gap-2">
            <h2 className="font-display text-2xl font-bold">{t("Малюнки")}</h2>
            {drawings.length > 0 && (
              <Link to={"/studio/gallery" as never} className="text-sm font-bold underline">
                {t("Усі малюнки")}
              </Link>
            )}
          </div>
          {drawings.length ? (
            <ul className="mt-3 grid grid-cols-3 gap-2">
              {[...drawings]
                .reverse()
                .slice(0, 9)
                .map((d) => (
                  <li key={d.id}>
                    <img
                      src={d.data}
                      alt={t("Малюнок від {d}", { d: date(d.at) })}
                      className="aspect-[9/7] w-full rounded-xl object-cover"
                    />
                    <p className="mt-1 text-center text-xs text-muted-foreground">{date(d.at)}</p>
                  </li>
                ))}
            </ul>
          ) : (
            <p className="mt-2 text-sm text-muted-foreground">{t("Малюнків поки немає.")}</p>
          )}
        </section>

        <section className="paper-card space-y-3 p-5 text-base">
          <p>
            {t("Тихе Місце допомагає дітям 5–13 років пізнавати почуття й вчитися заспокоюватися.")}
          </p>
          <p>
            {t(
              "Без акаунтів, реклами й повідомлень. Усе, що робить дитина, зберігається лише на цьому пристрої.",
            )}
          </p>
          <p>
            {t(
              "Застосунок не ставить діагнозів і не замінює допомогу фахівця. Якщо дитині важко тривалий час — зверніться до психолога.",
            )}
          </p>
        </section>

        <div className="text-center">
          {confirm ? (
            <div className="paper-card space-y-3 p-4">
              <p className="text-sm">
                {t("Стерти записи про місця й вправи? Малюнки та налаштування залишаться.")}
              </p>
              <div className="flex justify-center gap-2">
                <Btn variant="soft" onClick={() => setConfirm(false)}>
                  {t("Скасувати")}
                </Btn>
                <Btn
                  onClick={() => {
                    resetProgress();
                    setConfirm(false);
                  }}
                >
                  {t("Стерти")}
                </Btn>
              </div>
            </div>
          ) : (
            <Btn variant="ghost" onClick={() => setConfirm(true)}>
              {t("Очистити прогрес")}
            </Btn>
          )}
        </div>
      </div>
    </Scene>
  );
}
