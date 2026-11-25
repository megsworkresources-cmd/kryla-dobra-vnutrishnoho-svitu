import { useEffect, useRef, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Droplets, Pause, Play, RefreshCw } from "lucide-react";
import { GrownUpLink } from "@/components/GrownUpLink";
import { GardenOfflineNotice } from "@/components/GardenOfflineNotice";
import { SunflowerStoryLink } from "@/components/SunflowerStoryLink";
import { Btn, Scene } from "@/components/Scene";
import { StoryFilm } from "@/components/StoryFilm";
import { coarseGrowthStage, growthGlyph, growthPart, isFinalGrowthStage } from "@/content/growth";
import { placeImage } from "@/content/places";
import { pageHead } from "@/content/journeys";
import { readCommunityGarden } from "@/lib/community-garden.functions";
import { readSavedGarden, saveGarden, type SavedGarden } from "@/lib/community-cache";
import { savedGardenNote } from "@/content/community-garden-note";
import { canWater, localDay } from "@/content/watering";
import { sfx } from "@/lib/audio";
import { careCount, growthStage, useStore, waterFlower } from "@/lib/store";
import { pluralUk, useT } from "@/lib/i18n";
import { useOnline } from "@/hooks/use-online";
import recorded from "@/assets/video/recorded-sunflower-growth.mp4.asset.json";
import meadow from "@/assets/meadow.jpg";

export const Route = createFileRoute("/community-garden")({
  head: () =>
    pageHead("Спільний сад", "Соняшники інших родин на стадії росту — без імен і малюнків."),
  component: CommunityGarden,
});

/** Every child can open this page: it carries only coarse stages, never identity. */
function CommunityGarden() {
  const t = useT();
  const online = useOnline();
  const read = useServerFn(readCommunityGarden);
  const garden = useQuery({
    queryKey: ["community-garden"],
    queryFn: () => read(),
    refetchInterval: 60000,
    retry: false,
  });
  const count = useStore((s) => careCount(s));
  const wateredOn = useStore((s) => s.wateredOn);
  const careSteps = useStore((s) => s.careSteps);
  const ownStage = growthStage(count);
  // A transient read failure must not hide flowers this device already saw;
  // only the same coarse stages are kept, never owners or child data.
  const [saved, setSaved] = useState<SavedGarden>({ stages: [], at: null });
  useEffect(() => setSaved(readSavedGarden()), []);
  useEffect(() => {
    if (!garden.data?.ok) return;
    const stages = garden.data.stages ?? [];
    setSaved({ stages, at: Date.now() });
    saveGarden(stages);
  }, [garden.data]);
  const failed = garden.isError || garden.data?.ok === false;
  const usingSaved = failed && saved.stages.length > 0;
  const shared = usingSaved ? saved.stages : (garden.data?.stages ?? []);
  const savedNote = saved.at === null ? null : savedGardenNote(saved.at);
  const [picked, setPicked] = useState<number | null>(null);
  const [playing, setPlaying] = useState(true);
  const filmStart = useRef<(() => void) | null>(null);
  const shownStage = coarseGrowthStage(picked === null ? ownStage : (shared[picked] ?? ownStage));
  const shownName = picked === null || picked >= shared.length ? null : picked + 1;

  return (
    <Scene image={placeImage("garden")} title="Спільний сад" back="/garden" compact>
      <div className="space-y-4 pt-[6vh]">
        {!online && <GardenOfflineNotice />}
        <p className="rounded-2xl bg-paper/85 px-3 py-2 text-sm text-muted-foreground backdrop-blur-sm">
          {t(
            "Тут ростуть соняшники інших родин. Кожна квітка з’явилася, коли дорослий у родині погодився поділитися лише стадією росту — без імен, малюнків і почуттів.",
          )}
        </p>

        <section className="paper-card p-4 text-center">
          <h2 className="font-display text-xl font-bold">{t("Полити соняшник")}</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {t(
              "Одне поливання на день. Кожне поливання додає соняшнику одну сходинку росту — і нічого не в’яне, якщо ти пропустиш день.",
            )}
          </p>
          {canWater(wateredOn) ? (
            <Btn
              className="mt-3"
              onClick={() => {
                waterFlower(localDay());
                sfx("soft");
                setPicked(null);
                setPlaying(true);
              }}
            >
              <Droplets size={18} />
              {t("Полити соняшник")}
            </Btn>
          ) : (
            <p role="status" className="mt-3 font-bold text-primary">
              {t("Сьогодні вже полито. Соняшник підріс 🌱")}
            </p>
          )}
          <p className="mt-2 text-sm text-muted-foreground">
            {t("Поливань: {n}", { n: careSteps })}
          </p>
        </section>

        <section className="paper-card p-4">
          {(!failed || usingSaved) && (
            <p className="text-sm font-bold">
              {t(
                pluralUk(
                  shared.length + 1,
                  "У саду {n} квітка",
                  "У саду {n} квітки",
                  "У саду {n} квіток",
                ),
                { n: shared.length + 1 },
              )}
            </p>
          )}
          <p className="mt-1 text-sm text-muted-foreground">
            {t("Обери квітку, щоб побачити, як вона росла.")}
          </p>
          <ul className="no-scrollbar -mx-4 mt-4 flex snap-x snap-mandatory items-stretch gap-3 overflow-x-auto px-4 pb-2">
            <li className="shrink-0 snap-start">
              <div className="flex w-24 flex-col gap-2">
                <Btn
                  variant="soft"
                  aria-pressed={picked === null}
                  onClick={() => {
                    setPicked(null);
                    setPlaying(true);
                  }}
                  className="w-full flex-col rounded-lg px-2 py-3"
                >
                  <span aria-hidden className="block text-4xl leading-none">
                    {growthGlyph(ownStage)}
                  </span>
                  <span className="mt-2 block text-xs font-bold">{t("Твій соняшник")}</span>
                  <span className="block text-xs text-muted-foreground">
                    {t("Стадія {n} з 5", { n: ownStage })}
                  </span>
                </Btn>
                <SunflowerStoryLink name={t("Твій соняшник")} />
              </div>
            </li>
            {shared.map((stage, i) => (
              <li key={`${i}-${stage}`} className="shrink-0 snap-start">
                <div className="flex w-24 flex-col gap-2">
                  <Btn
                    variant="soft"
                    aria-pressed={picked === i}
                    onClick={() => {
                      setPicked(i);
                      setPlaying(true);
                    }}
                    className="w-full flex-col rounded-lg px-2 py-3"
                  >
                    <span
                      aria-hidden
                      className={`block leading-none ${stage >= 5 ? "animate-sway" : ""}`}
                      style={{ fontSize: `${1.9 + stage * 0.16}rem` }}
                    >
                      {growthGlyph(stage)}
                    </span>
                    <span className="mt-2 block text-xs font-bold">
                      {t("Квітка {n}", { n: i + 1 })}
                    </span>
                    <span className="block text-xs text-muted-foreground">
                      {t("Стадія {n} з 5", { n: stage })}
                    </span>
                  </Btn>
                  <SunflowerStoryLink name={t("Квітка {n}", { n: i + 1 })} />
                </div>
              </li>
            ))}
          </ul>
          {garden.isPending && online && (
            <p role="status" className="mt-3 text-sm">
              {t("Сад завантажується…")}
            </p>
          )}
          {usingSaved && savedNote && (
            <p className="mt-3 text-sm text-muted-foreground" role="status">
              {t(savedNote.key, savedNote.vars)}
            </p>
          )}
          {failed && !usingSaved && online && (
            <div className="mt-3 space-y-1 text-sm" role="status">
              <p className="font-bold">{t("Не вдалося завантажити спільний сад.")}</p>
              <p className="text-muted-foreground">
                {t("Твій соняшник залишається тут. Спробуй оновити сад трохи пізніше.")}
              </p>
            </div>
          )}
          {garden.data?.ok && !shared.length && (
            <>
              <p className="mt-3 text-sm">{t("Поки що немає спільних соняшників.")}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {t("Твій соняшник уже тут. Інші родини приєднаються, коли дорослі погодяться.")}
              </p>
            </>
          )}
          <div className="mt-3 flex flex-wrap gap-2">
            <Btn variant="soft" disabled={garden.isFetching} onClick={() => void garden.refetch()}>
              <RefreshCw size={18} />
              {t("Оновити сад")}
            </Btn>
            <Link
              to="/garden"
              className="flex min-h-12 items-center rounded-full bg-secondary px-5 font-bold text-secondary-foreground shadow-soft"
            >
              {t("Мій соняшник")}
            </Link>
          </div>
        </section>

        <section className="paper-card overflow-hidden">
          <div className="px-4 pt-4">
            <h2 className="font-display text-2xl font-bold">{t("Як росте обрана квітка")}</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {shownName === null ? t("Твій соняшник") : t("Квітка {n}", { n: shownName })} ·{" "}
              {t("Стадія {n} з 5", { n: shownStage })}
            </p>
          </div>
          <div className="relative mx-auto mt-3 aspect-[440/768] w-full max-w-64 overflow-hidden rounded-lg bg-secondary sm:max-w-72">
            <StoryFilm
              key={`${picked ?? "own"}-${shownStage}`}
              src={recorded.url}
              poster={meadow}
              playing={playing}
              onPause={() => setPlaying(false)}
              part={growthPart(shownStage)}
              label="Запис росту соняшника"
              quiet
              startRef={filmStart}
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
            <Btn
              onClick={() => {
                const next = !playing;
                setPlaying(next);
                // Start inside the tap, or Safari drops the play() and the label flips back.
                if (next) filmStart.current?.();
              }}
            >
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
