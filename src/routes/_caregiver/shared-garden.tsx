import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Pause, Play, RefreshCw, Sprout } from "lucide-react";
import { Btn, Scene } from "@/components/Scene";
import { StoryFilm } from "@/components/StoryFilm";
import { pageHead } from "@/content/journeys";
import { growthPart } from "@/content/growth";
import { readGarden, shareSunflower } from "@/lib/shared-garden.functions";
import { careCount, growthStage, useStore } from "@/lib/store";
import { useT } from "@/lib/i18n";
import recorded from "@/assets/video/recorded-sunflower-growth.mp4.asset.json";
import meadow from "@/assets/meadow.jpg";

const GLYPHS = ["🌰", "🌱", "🌿", "🌿", "🌼", "🌻"] as const;

export const Route = createFileRoute("/_caregiver/shared-garden")({
  head: () =>
    pageHead(
      "Спільний сад",
      "Анонімні соняшники з добровільною згодою дорослих. Малюнки й почуття залишаються приватними.",
    ),
  component: SharedGarden,
});

function SharedGarden() {
  const t = useT();
  const { caregiver } = Route.useRouteContext();
  const client = useQueryClient();
  const read = useServerFn(readGarden);
  const share = useServerFn(shareSunflower);
  const localStage = growthStage(useStore((s) => careCount(s)));
  const key = ["shared-garden", caregiver.userId];
  const garden = useQuery({
    queryKey: key,
    queryFn: () => read(),
    refetchInterval: 30000,
    retry: false,
  });
  const [consent, setConsent] = useState(false);
  const [playing, setPlaying] = useState(true);
  const [selected, setSelected] = useState<string | null>(null);
  const mutation = useMutation({
    mutationFn: (sharing: boolean) => share({ data: { stage: sharing ? localStage : 0, sharing } }),
    onSuccess: async () => {
      setConsent(false);
      await client.invalidateQueries({ queryKey: key });
    },
    retry: false,
  });
  const own = garden.data?.own;
  const flowers = garden.data?.flowers ?? [];
  const ownStage = Math.max(localStage, own?.stage ?? 0);
  const shown = selected ? flowers.find((f) => f.flower_id === selected) : undefined;
  const shownStage = shown?.stage ?? ownStage;
  const shownName = shown ? flowers.indexOf(shown) + 1 : null;

  return (
    <Scene title="Спільний сад" back="/parents">
      <div className="space-y-5">
        <p className="text-sm text-muted-foreground">
          {t(
            "Тут ростуть соняшники інших родин. Кожна квітка з’явилася, коли дорослий у родині погодився поділитися лише стадією росту — без імен, малюнків і почуттів.",
          )}
        </p>

        <section aria-label={t("Спільний сад")} className="paper-card p-4">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="font-display text-2xl font-bold">{t("Спільний сад")}</h2>
            <p className="text-sm text-muted-foreground">
              {t("У саду {n} квіток", { n: flowers.length + 1 })}
            </p>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("Обери квітку, щоб побачити, як вона росла.")}
          </p>
          <ul className="mt-3 flex flex-wrap items-end justify-center gap-2">
            <li>
              <Btn
                variant="soft"
                aria-pressed={selected === null}
                onClick={() => {
                  setSelected(null);
                  setPlaying(true);
                }}
                className="w-24 flex-col rounded-lg px-2 py-3"
              >
                <span aria-hidden className="block text-4xl leading-none">
                  {GLYPHS[ownStage] ?? "🌻"}
                </span>
                <span className="mt-2 block text-xs font-bold">{t("Твій соняшник")}</span>
                <span className="block text-[11px] text-muted-foreground">
                  {t("Стадія {n} з 5", { n: ownStage })}
                </span>
              </Btn>
            </li>
            {flowers.map((flower, i) => (
              <li key={flower.flower_id}>
                <Btn
                  variant="soft"
                  aria-pressed={selected === flower.flower_id}
                  onClick={() => {
                    setSelected(flower.flower_id);
                    setPlaying(true);
                  }}
                  className="w-24 flex-col rounded-lg px-2 py-3"
                >
                  <span
                    aria-hidden
                    className={`block leading-none ${flower.stage >= 5 ? "animate-sway" : ""}`}
                    style={{ fontSize: `${1.9 + flower.stage * 0.16}rem` }}
                  >
                    {GLYPHS[flower.stage] ?? "🌻"}
                  </span>
                  <span className="mt-2 block text-xs font-bold">
                    {t("Квітка {n}", { n: i + 1 })}
                  </span>
                  <span className="block text-[11px] text-muted-foreground">
                    {t("Стадія {n} з 5", { n: flower.stage })}
                  </span>
                </Btn>
              </li>
            ))}
          </ul>
          {garden.isPending && (
            <p role="status" className="mt-3 text-sm">
              {t("Сад завантажується…")}
            </p>
          )}
          {(garden.isError || mutation.isError) && (
            <p role="alert" className="mt-3 text-sm text-destructive">
              {t("Сад недоступний. Спробуйте ще раз.")}
            </p>
          )}
          {garden.data && !flowers.length && (
            <p className="mt-3 text-sm">{t("Поки що немає спільних соняшників.")}</p>
          )}
          <div className="mt-3 flex flex-wrap gap-2">
            <Btn variant="soft" disabled={garden.isFetching} onClick={() => void garden.refetch()}>
              <RefreshCw size={18} />
              {t("Оновити сад")}
            </Btn>
          </div>
        </section>

        <section className="paper-card overflow-hidden">
          <div className="px-4 pt-4">
            <h2 className="font-display text-2xl font-bold">{t("Як росте обрана квітка")}</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {shownName ? t("Квітка {n}", { n: shownName }) : t("Твій соняшник")} ·{" "}
              {t("Стадія {n} з 5", { n: shownStage })}
            </p>
          </div>
          <div className="relative mx-auto mt-3 aspect-[440/768] w-full max-w-64 overflow-hidden rounded-lg bg-secondary sm:max-w-72">
            <StoryFilm
              key={`${shown?.flower_id ?? "own"}-${shownStage}`}
              src={recorded.url}
              poster={meadow}
              playing={playing}
              onPause={() => setPlaying(false)}
              part={growthPart(shownStage)}
              label="Запис росту соняшника"
            />
          </div>
          <div className="flex flex-wrap justify-center gap-2 p-4">
            <Btn onClick={() => setPlaying(!playing)}>
              {playing ? <Pause size={18} /> : <Play size={18} />}
              {t(playing ? "Пауза" : "Дивитися ріст")}
            </Btn>
          </div>
          <p className="px-4 pb-4 text-xs text-muted-foreground">
            <a
              href="https://commons.wikimedia.org/wiki/File:Sunflower_growing_time_lapse.gif"
              target="_blank"
              rel="noreferrer"
              className="underline"
            >
              {t("Відео: Naturenow, CC BY-SA 4.0; перетворено з GIF у MP4.")}
            </a>{" "}
            <a
              href="https://creativecommons.org/licenses/by-sa/4.0/"
              target="_blank"
              rel="noreferrer"
              className="underline"
            >
              CC BY-SA 4.0
            </a>
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-2xl font-bold">{t("Мій соняшник")}</h2>
          <p className="text-sm text-muted-foreground">
            {t(
              "Один соняшник на акаунт дорослого. Оновлення надсилаються лише за вашим натисканням; вимкнення приховує квітку, не змінюючи даних дитини.",
            )}
          </p>
          <p>{t("Стадія {n} з 5", { n: ownStage })}</p>
          <p role="status" className="font-bold text-primary">
            {t(own?.sharing ? "Соняшник поширено" : "Поширення вимкнено")}
          </p>
          {own && !own.sharing && (
            <label className="flex items-start gap-3 text-sm leading-relaxed">
              <input
                type="checkbox"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                className="mt-1 h-5 w-5 shrink-0 accent-primary"
              />
              <span>
                {t(
                  "Я погоджуюся поширити лише анонімну стадію росту соняшника. Імена, малюнки, почуття й записи про вправи залишаються на пристрої.",
                )}
              </span>
            </label>
          )}
          <div className="flex flex-wrap gap-2">
            {own?.sharing ? (
              <>
                <Btn disabled={mutation.isPending} onClick={() => mutation.mutate(true)}>
                  <Sprout size={18} />
                  {t("Оновити соняшник")}
                </Btn>
                <Btn
                  variant="soft"
                  disabled={mutation.isPending}
                  onClick={() => mutation.mutate(false)}
                >
                  {t("Припинити поширення")}
                </Btn>
              </>
            ) : (
              <Btn
                disabled={!consent || !own || mutation.isPending}
                onClick={() => mutation.mutate(true)}
              >
                {t("Поділитися соняшником")}
              </Btn>
            )}
          </div>
        </section>
      </div>
    </Scene>
  );
}
