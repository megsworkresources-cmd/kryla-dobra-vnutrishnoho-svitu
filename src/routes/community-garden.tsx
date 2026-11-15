import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Droplets, Pause, Play, RefreshCw } from "lucide-react";
import { Btn, Scene } from "@/components/Scene";
import { StoryFilm } from "@/components/StoryFilm";
import { growthPart } from "@/content/growth";
import { placeImage } from "@/content/places";
import { pageHead } from "@/content/journeys";
import { readCommunityGarden } from "@/lib/community-garden.functions";
import { canWater, localDay } from "@/content/watering";
import { sfx } from "@/lib/audio";
import { careCount, growthStage, useStore, waterFlower } from "@/lib/store";
import { useT } from "@/lib/i18n";
import recorded from "@/assets/video/recorded-sunflower-growth.mp4.asset.json";
import meadow from "@/assets/meadow.jpg";

const GLYPHS = ["🌰", "🌱", "🌿", "🌿", "🌼", "🌻"] as const;

export const Route = createFileRoute("/community-garden")({
  head: () =>
    pageHead("Спільний сад", "Соняшники інших родин на стадії росту — без імен і малюнків."),
  component: CommunityGarden,
});

/** Every child can open this page: it carries only coarse stages, never identity. */
function CommunityGarden() {
  const t = useT();
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
  const shared = garden.data?.stages ?? [];
  const [picked, setPicked] = useState<number | null>(null);
  const [playing, setPlaying] = useState(true);
  const shownStage = picked === null ? ownStage : (shared[picked] ?? ownStage);
  const shownName = picked === null ? null : picked + 1;
  const unavailable = garden.isError || garden.data?.ok === false;

  return (
    <Scene image={placeImage("garden")} title="Спільний сад" back="/garden" compact>
      <div className="space-y-4 pt-[10vh]">
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
          <p className="text-sm text-muted-foreground">
            {t(
              "Тут ростуть соняшники інших родин. Кожна квітка з’явилася, коли дорослий у родині погодився поділитися лише стадією росту — без імен, малюнків і почуттів.",
            )}
          </p>
          <div className="mt-3 flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="font-display text-2xl font-bold">{t("Спільний сад")}</h2>
            {!unavailable && (
              <p className="text-sm text-muted-foreground">
                {t("У саду {n} квіток", { n: shared.length + 1 })}
              </p>
            )}
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("Обери квітку, щоб побачити, як вона росла.")}
          </p>
          <ul className="mt-3 flex flex-wrap items-end justify-center gap-2">
            <li>
              <Btn
                variant="soft"
                aria-pressed={picked === null}
                onClick={() => {
                  setPicked(null);
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
            {shared.map((stage, i) => (
              <li key={`${i}-${stage}`}>
                <Btn
                  variant="soft"
                  aria-pressed={picked === i}
                  onClick={() => {
                    setPicked(i);
                    setPlaying(true);
                  }}
                  className="w-24 flex-col rounded-lg px-2 py-3"
                >
                  <span
                    aria-hidden
                    className={`block leading-none ${stage >= 5 ? "animate-sway" : ""}`}
                    style={{ fontSize: `${1.9 + stage * 0.16}rem` }}
                  >
                    {GLYPHS[stage] ?? "🌻"}
                  </span>
                  <span className="mt-2 block text-xs font-bold">
                    {t("Квітка {n}", { n: i + 1 })}
                  </span>
                  <span className="block text-[11px] text-muted-foreground">
                    {t("Стадія {n} з 5", { n: stage })}
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
          {unavailable && (
            <p role="alert" className="mt-3 text-sm">
              {t("Сад зараз відпочиває. Спробуй пізніше.")}
            </p>
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
      </div>
    </Scene>
  );
}
