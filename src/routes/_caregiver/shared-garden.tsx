import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Pause, Play, RefreshCw, ShieldCheck, Sprout } from "lucide-react";
import { GrownUpLink } from "@/components/GrownUpLink";
import { GardenOfflineNotice } from "@/components/GardenOfflineNotice";
import { SunflowerStoryLink } from "@/components/SunflowerStoryLink";
import { Btn, Scene } from "@/components/Scene";
import { StoryFilm } from "@/components/StoryFilm";
import { pageHead } from "@/content/journeys";
import { coarseGrowthStage, growthGlyph, growthPart, isFinalGrowthStage } from "@/content/growth";
import { readGarden, shareSunflower } from "@/lib/shared-garden.functions";
import { careCount, growthStage, useStore } from "@/lib/store";
import { pluralUk, useT } from "@/lib/i18n";
import recorded from "@/assets/video/recorded-sunflower-growth.mp4.asset.json";
import meadow from "@/assets/meadow.jpg";
import { useOnline } from "@/hooks/use-online";

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
  const online = useOnline();
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
  const [capped, setCapped] = useState(false);
  const mutation = useMutation({
    // Never let Query pause and replay a sharing action after reconnection.
    networkMode: "always",
    mutationFn: (sharing: boolean) => {
      if (!navigator.onLine) throw new Error("Garden offline");
      return share({ data: { stage: sharing ? localStage : 0, sharing } });
    },
    onSuccess: async (res) => {
      setCapped(Boolean(res.capped));
      setConsent(false);
      await client.invalidateQueries({ queryKey: key });
    },
    retry: false,
  });
  const own = garden.data?.own;
  const flowers = garden.data?.flowers ?? [];
  const ownStage = coarseGrowthStage(Math.max(localStage, own?.stage ?? 0));
  const shown = selected ? flowers.find((f) => f.flower_id === selected) : undefined;
  const shownStage = coarseGrowthStage(shown?.stage ?? ownStage);
  const shownName = shown ? flowers.indexOf(shown) + 1 : null;

  return (
    <Scene title="Спільний сад" back="/parents">
      <div className="min-w-0 space-y-5">
        <p className="text-sm text-muted-foreground">
          {t(
            "Тут ростуть соняшники інших родин. Кожна квітка з’явилася, коли дорослий у родині погодився поділитися лише стадією росту — без імен, малюнків і почуттів.",
          )}
        </p>
        {!online && <GardenOfflineNotice caregiver />}

        <section aria-labelledby="own-sunflower" className="paper-card p-4 sm:p-5">
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
            <div className="min-w-0">
              <h2 id="own-sunflower" className="font-display text-2xl font-bold">
                {t("Мій соняшник")}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {t("Стадія {n} з 5", { n: ownStage })}
              </p>
            </div>
            <ShieldCheck className="h-7 w-7 shrink-0 text-primary" aria-hidden />
          </div>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            {t(
              "Один соняшник на акаунт дорослого. Оновлення надсилаються лише за вашим натисканням; вимкнення приховує квітку, не змінюючи даних дитини.",
            )}
          </p>
          <p role="status" className="mt-3 font-bold text-primary" aria-live="polite">
            {mutation.isPending
              ? t("Зачекайте…")
              : !online || garden.isError || garden.isFetching || mutation.isError
                ? t("Поточний стан поширення не підтверджено.")
                : !own
                  ? t("Сад завантажується…")
                  : t(own.sharing ? "Соняшник поширено" : "Поширення вимкнено")}
          </p>
          {capped && (
            <p
              role="status"
              className="mt-2 rounded-2xl bg-secondary p-3 text-sm text-secondary-foreground"
            >
              {t("Соняшник росте поступово — одна стадія на день. Завтра він підросте ще.")}
            </p>
          )}
          {own && !own.sharing && (
            <label className="mt-4 flex min-h-14 cursor-pointer items-start gap-3 rounded-2xl bg-secondary p-4 text-sm leading-relaxed text-secondary-foreground">
              <input
                type="checkbox"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                className="mt-0.5 h-5 w-5 shrink-0 accent-primary"
              />
              <span>
                {t(
                  "Я погоджуюся поширити лише анонімну стадію росту соняшника. Імена, малюнки, почуття й записи про вправи залишаються на пристрої.",
                )}
              </span>
            </label>
          )}
          <div className="mt-4 grid grid-cols-1 gap-2 sm:max-w-2xl sm:grid-cols-2">
            {own?.sharing ? (
              <>
                <Btn
                  className="w-full"
                  disabled={!online || mutation.isPending}
                  onClick={() => mutation.mutate(true)}
                >
                  <Sprout size={18} />
                  {t("Оновити соняшник")}
                </Btn>
                <Btn
                  className="w-full"
                  variant="soft"
                  disabled={!online || mutation.isPending}
                  onClick={() => mutation.mutate(false)}
                >
                  {t("Припинити поширення")}
                </Btn>
              </>
            ) : (
              <Btn
                className="w-full sm:col-span-2"
                disabled={!online || !consent || !own || mutation.isPending}
                onClick={() => mutation.mutate(true)}
              >
                <Sprout size={18} />
                {t("Поділитися соняшником")}
              </Btn>
            )}
          </div>
          {mutation.isError && (
            <p role="alert" className="mt-3 text-sm text-destructive">
              {t("Сад недоступний. Спробуйте ще раз.")}
            </p>
          )}
        </section>

        <section aria-label={t("Спільний сад")} className="paper-card p-4">
          <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
            <h2 className="min-w-0 font-display text-2xl font-bold">{t("Спільний сад")}</h2>
            <p className="shrink-0 text-sm text-muted-foreground">
              {t(
                pluralUk(
                  flowers.length + 1,
                  "У саду {n} квітка",
                  "У саду {n} квітки",
                  "У саду {n} квіток",
                ),
                { n: flowers.length + 1 },
              )}
            </p>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("Обери квітку, щоб побачити, як вона росла.")}
          </p>
          <ul className="no-scrollbar -mx-4 mt-4 flex snap-x snap-mandatory items-stretch gap-3 overflow-x-auto px-4 pb-2">
            <li className="shrink-0 snap-start">
              <div className="flex w-24 flex-col gap-2">
              <Btn
                variant="soft"
                aria-pressed={selected === null}
                onClick={() => {
                  setSelected(null);
                  setPlaying(true);
                }}
                className="h-full w-full flex-col rounded-lg px-2 py-3"
              >
                <span aria-hidden className="block text-4xl leading-none">
                  {growthGlyph(ownStage)}
                </span>
                <span className="mt-2 block text-xs font-bold">{t("Твій соняшник")}</span>
                <span className="block text-[11px] text-muted-foreground">
                  {t("Стадія {n} з 5", { n: ownStage })}
                </span>
              </Btn>
              <SunflowerStoryLink name={t("Твій соняшник")} />
              </div>
            </li>
            {flowers.map((flower, i) => {
              const stage = coarseGrowthStage(flower.stage);
              return (
                <li key={flower.flower_id} className="shrink-0 snap-start">
                  <div className="flex w-24 flex-col gap-2">
                  <Btn
                    variant="soft"
                    aria-pressed={selected === flower.flower_id}
                    onClick={() => {
                      setSelected(flower.flower_id);
                      setPlaying(true);
                    }}
                    className="h-full w-full flex-col rounded-lg px-2 py-3"
                  >
                    <span
                      aria-hidden
                      className={`block leading-none ${isFinalGrowthStage(stage) ? "animate-sway" : ""}`}
                      style={{ fontSize: `${1.9 + stage * 0.16}rem` }}
                    >
                      {growthGlyph(stage)}
                    </span>
                    <span className="mt-2 block text-xs font-bold">
                      {t("Квітка {n}", { n: i + 1 })}
                    </span>
                    <span className="block text-[11px] text-muted-foreground">
                      {t("Стадія {n} з 5", { n: stage })}
                    </span>
                  </Btn>
                  <SunflowerStoryLink name={t("Квітка {n}", { n: i + 1 })} />
                  </div>
                </li>
              );
            })}
          </ul>
          {garden.isPending && (
            <p role="status" className="mt-3 text-sm">
              {t("Сад завантажується…")}
            </p>
          )}
          {garden.isError && (
            <p role="alert" className="mt-3 text-sm text-destructive">
              {t("Сад недоступний. Спробуйте ще раз.")}
            </p>
          )}
          {garden.data && !flowers.length && (
            <p className="mt-3 text-sm">{t("Поки що немає спільних соняшників.")}</p>
          )}
          <Btn
            className="mt-3 w-full sm:w-auto"
            variant="soft"
            disabled={!online || garden.isFetching || mutation.isPending}
            onClick={() => {
              mutation.reset();
              void garden.refetch();
            }}
          >
            <RefreshCw size={18} />
            {t("Оновити сад")}
          </Btn>
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
          {isFinalGrowthStage(shownStage) && (
            <p
              role="status"
              className="mx-4 mt-4 rounded-2xl bg-secondary p-4 text-center font-bold text-secondary-foreground"
            >
              <span className="mr-2 inline-block text-2xl animate-sway" aria-hidden>
                🌻
              </span>
              {t("Соняшник повністю розквітнув — це остання стадія росту.")}
            </p>
          )}
          <div className="flex flex-wrap justify-center gap-2 p-4">
            <Btn onClick={() => setPlaying(!playing)}>
              {playing ? <Pause size={18} /> : <Play size={18} />}
              {t(playing ? "Пауза" : "Дивитися ріст")}
            </Btn>
          </div>
          <p className="px-4 pb-4 text-xs text-muted-foreground">
            <GrownUpLink href="https://commons.wikimedia.org/wiki/File:Sunflower_growing_time_lapse.gif">
              {t("Відео: Naturenow, CC BY-SA 4.0; перетворено з GIF у MP4.")}
            </GrownUpLink>{" "}
            <GrownUpLink href="https://creativecommons.org/licenses/by-sa/4.0/">
              CC BY-SA 4.0
            </GrownUpLink>
          </p>
        </section>
      </div>
    </Scene>
  );
}
