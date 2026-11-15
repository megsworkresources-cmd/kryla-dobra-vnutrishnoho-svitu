import { createFileRoute } from "@tanstack/react-router";
import { Scene } from "@/components/Scene";
import { placeImage } from "@/content/places";
import { pageHead } from "@/content/journeys";
import { growthStage, totalDone, useStore } from "@/lib/store";
import { useT } from "@/lib/i18n";
import { useEffect, useState } from "react";

const NEXT: readonly number[] = [1, 3, 7, 12, 20];

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
  const count = useStore((s) => totalDone(s.completed));
  const stage = growthStage(count);
  const h = ([6, 40, 70, 100, 125, 135] as const)[stage] ?? 6;
  const words = WORDS[stage] ?? WORDS[0];
  const next = NEXT[stage] ?? count;
  const previous = NEXT[stage - 1] ?? 0;
  const [grown, setGrown] = useState(0);
  useEffect(() => {
    const id = requestAnimationFrame(() => setGrown(1));
    return () => cancelAnimationFrame(id);
  }, [stage]);
  const left = stage < 5 ? next - count : 0;
  return (
    <Scene image={placeImage("garden")} title="Сад соняшників" back="/world" compact>
      <div className="pt-[18vh]">
        <div className="paper-card p-6 text-center">
          <svg viewBox="0 0 200 220" className="mx-auto h-72" role="img" aria-label={t(words)}>
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
            {stage < 5 &&
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
          <p className="font-display text-2xl font-bold">{t(words)}</p>
          <p className="mt-2 text-muted-foreground">
            {t(
              "Кожна вправа, казка чи малюнок — крапля води для соняшника. Він ніколи не в’яне, навіть якщо ти довго не заходиш.",
            )}
          </p>
          <p className="mt-3 text-sm font-semibold">
            {t("Маленьких справ турботи: {n}", { n: count })}
          </p>
          {stage < 5 && (
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
        </div>
      </div>
    </Scene>
  );
}
