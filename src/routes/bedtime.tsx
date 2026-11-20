import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Btn, Scene } from "@/components/Scene";
import { CharacterSay } from "@/components/Character";
import { placeImage } from "@/content/places";
import { pageHead } from "@/content/journeys";
import { BEDTIME, type Bi } from "@/content/adventures.i18n";
import { markDone } from "@/lib/store";
import { useLang, useT } from "@/lib/i18n";

export const Route = createFileRoute("/bedtime")({
  head: () => pageHead("Казка на ніч", "Затишна історія про спокійну ніч, вечірній ритуал і сміливість."),
  component: Bedtime,
});

function Bedtime() {
  const t = useT();
  const lang = useLang();
  const L = (x: Bi) => (lang === "en" ? x.en : x.uk);
  const [i, setI] = useState(0);
  const last = BEDTIME.beats.length - 1;
  const beat = BEDTIME.beats[Math.min(i, last)]!;
  const end = i > last;
  return (
    <Scene image={placeImage("sky")} night title="Казка на ніч" back="/world" compact>
      <div className="space-y-5 pt-[14vh]">
        <h2 className="night-card p-4 font-display text-2xl font-bold">{L(BEDTIME.title)}</h2>
        {!end ? (
          <>
            <CharacterSay who={beat.who} text={L(beat.text)} night action="settle" />
            <p className="text-center text-sm" aria-live="polite">
              {t("Крок {i} з {n}", { i: i + 1, n: last + 1 })}
            </p>
            <div className="flex justify-center gap-3">
              <Btn variant="soft" disabled={i === 0} onClick={() => setI(i - 1)}>{t("Назад")}</Btn>
              <Btn onClick={() => { if (i === last) markDone("bedtime"); setI(i + 1); }}>{t("Далі")}</Btn>
            </div>
          </>
        ) : (
          <section className="night-card space-y-3 p-5">
            <h3 className="font-display text-xl font-bold">{t("Поговорімо разом")}</h3>
            <ul className="list-disc space-y-2 pl-5">
              {BEDTIME.talk.map((q) => <li key={q.en}>{L(q)}</li>)}
            </ul>
            <Btn onClick={() => setI(0)}>{t("Ще раз")}</Btn>
          </section>
        )}
      </div>
    </Scene>
  );
}
