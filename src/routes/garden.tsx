import { createFileRoute } from "@tanstack/react-router";
import { Scene } from "@/components/Scene";
import { placeImage } from "@/content/places";
import { pageHead } from "@/content/journeys";
import { growthStage, totalDone, useStore } from "@/lib/store";
import { useT } from "@/lib/i18n";

export const Route = createFileRoute("/garden")({
  head: () => pageHead("Сад соняшників", "Твій соняшник росте з кожною маленькою справою турботи про себе."),
  component: Garden,
});

const WORDS = ["Тут чекає насінинка", "З’явився паросток", "Виросли листочки", "Стебло тягнеться до сонця", "З’явився бутон", "Соняшник розквітнув!"];

function Garden() {
  const t = useT();
  const count = useStore((s) => totalDone(s.completed));
  const stage = growthStage(count);
  const h = [6, 30, 55, 80, 100, 110][stage]!;
  return (
    <Scene image={placeImage("garden")} title="Сад соняшників" back="/world" compact>
      <div className="pt-[18vh]">
        <div className="paper-card p-6 text-center">
          <svg viewBox="0 0 200 220" className="mx-auto h-64" role="img" aria-label={t(WORDS[stage]!)}>
            <ellipse cx="100" cy="205" rx="70" ry="12" fill="var(--sage)" opacity=".5" />
            {stage === 0 && <ellipse cx="100" cy="198" rx="7" ry="10" fill="var(--ink)" />}
            {stage > 0 && <rect x="97" y={200 - h} width="6" height={h} rx="3" fill="var(--sage)" />}
            {stage >= 2 && <><ellipse cx="82" cy={200 - h * 0.45} rx="16" ry="7" fill="var(--sage)" transform={`rotate(-25 82 ${200 - h * 0.45})`} /><ellipse cx="118" cy={200 - h * 0.6} rx="16" ry="7" fill="var(--sage)" transform={`rotate(25 118 ${200 - h * 0.6})`} /></>}
            {stage === 4 && <circle cx="100" cy={200 - h} r="12" fill="var(--sage)" />}
            {stage === 5 && <g transform={`translate(100 ${200 - h})`} className="animate-sway">{Array.from({ length: 14 }, (_, k) => <ellipse key={k} cy="-30" rx="9" ry="20" fill="var(--honey)" transform={`rotate(${k * 26})`} />)}<circle r="20" fill="var(--ink)" /></g>}
          </svg>
          <p className="font-display text-2xl font-bold">{t(WORDS[stage]!)}</p>
          <p className="mt-2 text-muted-foreground">{t("Кожна вправа, казка чи малюнок — крапля води для соняшника. Він ніколи не в’яне, навіть якщо ти довго не заходиш.")}</p>
          <p className="mt-3 text-sm font-semibold">{t("Маленьких справ турботи: {n}", { n: count })}</p>
        </div>
      </div>
    </Scene>
  );
}
