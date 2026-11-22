import { createFileRoute, Link } from "@tanstack/react-router";
import { Pause, Play, Sprout } from "lucide-react";
import { useEffect, useState } from "react";
import { GrownUpLink } from "@/components/GrownUpLink";
import { Btn, Scene } from "@/components/Scene";
import { StoryFilm } from "@/components/StoryFilm";
import { GROWTH_THRESHOLDS, growthPart, nextGrowthThreshold } from "@/content/growth";
import { placeImage } from "@/content/places";
import { pageHead } from "@/content/journeys";
import { careCount, growthStage, useStore } from "@/lib/store";
import { useT } from "@/lib/i18n";
import recorded from "@/assets/video/recorded-sunflower-growth.mp4.asset.json";
import meadow from "@/assets/meadow.jpg";
import { useOnline } from "@/hooks/use-online";

export const Route = createFileRoute("/garden")({
  head: () =>
    pageHead("Сад соняшників", "Твій соняшник росте з кожною маленькою справою турботи про себе."),
  component: Garden,
});

const WORDS = [
  "Тут чекає насінинка",
  "З’явився паросток",
  "Виросли листочки",
  "Стебло тягнеться до сонця",
  "З’явився бутон",
  "Соняшник розквітнув!",
] as const;

function Garden() {
  const t = useT();
  const online = useOnline();
  const count = useStore((s) => careCount(s));
  const stage = growthStage(count);
  const h = ([6, 40, 70, 100, 125, 135] as const)[stage] ?? 6;
  const words = WORDS[stage] ?? WORDS[0];
  const next = nextGrowthThreshold(stage);
  const previous = stage > 0 ? (GROWTH_THRESHOLDS[stage - 1] ?? 0) : 0;
  const [grown, setGrown] = useState(0);
  const [playing, setPlaying] = useState(true);
  useEffect(() => {
    const id = requestAnimationFrame(() => setGrown(1));
    return () => cancelAnimationFrame(id);
  }, [stage]);
  const left = next === null ? 0 : Math.max(0, next - count);
  // Saved progress lives on the device, so the server can only draw a seed.
  // Stay invisible until the real stage is read, then fade in — no seed flash.
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);
  return (
    <Scene image={placeImage("garden")} title="Сад соняшників" back="/world" compact>
      <div
        className={`space-y-4 pt-3 transition-opacity duration-500 sm:pt-[10vh] ${ready ? "opacity-100" : "opacity-0"}`}
      >
        {!online && (
          <p role="status" className="paper-card p-3 text-sm font-semibold">
            {t("Твій сад збережено на цьому пристрої. Інтернет для нього не потрібен.")}
          </p>
        )}
        <section className="paper-card overflow-hidden">
          <p className="px-4 pb-3 pt-4 text-center font-display text-lg font-bold">{t(words)}</p>
          <div
            className="relative mx-auto aspect-[440/768] w-[min(100%,22svh)] max-w-64 bg-secondary"
            role="group"
            aria-label={t("Запис росту соняшника")}
          >
            <StoryFilm
              src={recorded.url}
              poster={meadow}
              playing={playing}
              onPause={() => setPlaying(false)}
              part={growthPart(stage)}
              label="Запис росту соняшника"
              quiet
            />
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2 p-4">
            <p className="text-sm font-bold">{t("Твоя стадія: {n} з 5", { n: stage })}</p>
            <Btn variant="soft" onClick={() => setPlaying(!playing)}>
              {playing ? <Pause size={18} /> : <Play size={18} />}
              {t(playing ? "Пауза" : "Дивитися ріст")}
            </Btn>
          </div>
          <p className="px-4 pb-3 text-xs text-muted-foreground">
            <GrownUpLink href="https://commons.wikimedia.org/wiki/File:Sunflower_growing_time_lapse.gif">
              {t("Відео: Naturenow, CC BY-SA 4.0; перетворено з GIF у MP4.")}
            </GrownUpLink>{" "}
            <GrownUpLink href="https://creativecommons.org/licenses/by-sa/4.0/">
              CC BY-SA 4.0
            </GrownUpLink>
          </p>
        </section>

        <section className="paper-card p-5 text-center">
          <h2 className="font-display text-xl font-bold">{t("Твій соняшник сьогодні")}</h2>
          <svg viewBox="0 0 200 220" className="mx-auto h-44" role="img" aria-label={t(words)}>
            <ellipse cx="100" cy="205" rx="70" ry="12" fill="var(--sage)" opacity=".5" />
            <g
              style={{
                transform: `scaleY(${0.15 + grown * 0.85})`,
                transformOrigin: "100px 205px",
                transition: "transform 1.8s cubic-bezier(.3,1.4,.5,1)",
              }}
            >
              {stage === 0 && <ellipse cx="100" cy="198" rx="7" ry="10" fill="var(--ink)" />}
              {stage > 0 && (
                <rect x="97" y={200 - h} width="6" height={h} rx="3" fill="var(--sage)" />
              )}
              {stage >= 2 && (
                <>
                  <ellipse
                    cx="82"
                    cy={200 - h * 0.45}
                    rx="16"
                    ry="7"
                    fill="var(--sage)"
                    transform={`rotate(-25 82 ${200 - h * 0.45})`}
                  />
                  <ellipse
                    cx="118"
                    cy={200 - h * 0.6}
                    rx="16"
                    ry="7"
                    fill="var(--sage)"
                    transform={`rotate(25 118 ${200 - h * 0.6})`}
                  />
                </>
              )}
              {stage === 4 && <circle cx="100" cy={200 - h} r="12" fill="var(--sage)" />}
              {stage === 5 && (
                <g transform={`translate(100 ${200 - h})`} className="animate-sway">
                  {Array.from({ length: 14 }, (_, k) => (
                    <ellipse
                      key={k}
                      cy="-30"
                      rx="9"
                      ry="20"
                      fill="var(--honey)"
                      transform={`rotate(${k * 26})`}
                    />
                  ))}
                  <circle r="20" fill="var(--ink)" />
                </g>
              )}
              {stage === 3 && <circle cx="100" cy={200 - h} r="7" fill="var(--sage)" />}
            </g>
            {next !== null &&
              [40, 100, 160].map((x, k) => (
                <circle
                  key={x}
                  cx={x}
                  cy={20 + k * 6}
                  r="2.5"
                  fill="var(--sky)"
                  className="animate-twinkle"
                  style={{ animationDelay: `${k * 0.6}s` }}
                />
              ))}
          </svg>
          <p className="mt-2 text-muted-foreground">
            {t(
              "Кожна вправа, казка чи малюнок — крапля води для соняшника. Він ніколи не в’яне, навіть якщо ти довго не заходиш.",
            )}
          </p>
          <p className="mt-3 text-sm font-semibold">
            {t("Маленьких справ турботи: {n}", { n: count })}
          </p>
          {next !== null && (
            <>
              <div
                className="mx-auto mt-3 h-3 max-w-xs overflow-hidden rounded-full bg-secondary"
                aria-hidden
              >
                <div
                  className="h-full rounded-full bg-honey transition-all duration-1000"
                  style={{
                    width: `${Math.min(100, (1 - left / Math.max(1, next - previous)) * 100 * grown)}%`,
                  }}
                />
              </div>
              <p className="mt-2 text-sm">
                {t("Ще {n} — і соняшник виросте далі 🌱", { n: left })}
              </p>
            </>
          )}
        </section>

        <Link
          to="/community-garden"
          className="paper-card flex items-center justify-between gap-3 p-4"
        >
          <span className="min-w-0">
            <span className="block font-display text-lg font-bold">🌻 {t("Спільний сад")}</span>
            <span className="mt-1 block text-sm text-muted-foreground">
              {t("Подивися, як ростуть соняшники інших родин.")}
            </span>
          </span>
          <Sprout className="h-6 w-6 shrink-0 text-primary" aria-hidden />
        </Link>
      </div>
    </Scene>
  );
}
