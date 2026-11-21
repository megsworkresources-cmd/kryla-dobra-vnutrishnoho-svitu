import { useState } from "react";
import { Btn, Scene } from "@/components/Scene";
import { CharacterSay } from "@/components/Character";
import { placeImage } from "@/content/places";
import { itemAtOr } from "@/content/list";
import type { Bi } from "@/content/adventures.i18n";
import { QUESTS, type QuestId } from "@/content/quests.i18n";
import { chime } from "@/lib/audio";
import { markDone } from "@/lib/store";
import { useLang, useT } from "@/lib/i18n";

const NOTES = [392, 440, 523, 587, 659];

/** Shared illustrated three-chapter adventure: discover, reflect, choose. */
export function QuestView({ id }: { id: QuestId }) {
  const quest = QUESTS[id];
  const t = useT();
  const lang = useLang();
  const L = (x: Bi) => (lang === "en" ? x.en : x.uk);
  const [step, setStep] = useState(0);
  const [found, setFound] = useState<number[]>([]);
  const [said, setSaid] = useState<Bi | null>(null);
  const [choice, setChoice] = useState<number | null>(null);
  const total = quest.chapters.length;
  const ending = step >= total;
  const chapter = ending ? undefined : quest.chapters[step];
  const allFound = chapter ? found.length >= chapter.spots.length : false;

  const tap = (k: number, text: Bi) => {
    chime(NOTES[k % NOTES.length] ?? 523);
    setSaid(text);
    if (!found.includes(k)) setFound([...found, k]);
  };
  const next = () => {
    setStep(step + 1);
    setFound([]);
    setSaid(null);
  };
  const restart = () => {
    setStep(0);
    setFound([]);
    setSaid(null);
    setChoice(null);
  };
  const choose = (k: number) => {
    chime(itemAtOr(NOTES, k, 523));
    setChoice(k);
    markDone(id);
  };

  const lastWho = quest.chapters[total - 1]?.who ?? "olenka";
  return (
    <Scene title={quest.title} back="/world" compact>
      <div className="space-y-4">
        <ol className="flex items-center justify-center gap-2" aria-label={t("Розділи пригоди")}>
          {Array.from({ length: total + 1 }, (_, i) => (
            <li
              key={i}
              aria-current={i === step ? "step" : undefined}
              className={`h-3 rounded-full transition-all ${i === step ? "w-8 bg-primary" : i < step ? "w-3 bg-primary/60" : "w-3 bg-muted"}`}
            >
              <span className="sr-only">{t("Розділ {i} з {n}", { i: i + 1, n: total + 1 })}</span>
            </li>
          ))}
        </ol>

        {chapter ? (
          <>
            <CharacterSay who={chapter.who} text={said ? L(said) : L(chapter.text)} action="look" />
            <div
              key={step}
              className="relative mx-auto aspect-[4/3] w-full max-w-xl animate-fade-in overflow-hidden rounded-3xl shadow-soft"
            >
              <img src={placeImage(chapter.img)} alt="" className="h-full w-full object-cover" />
              {chapter.spots.map((s, k) => {
                const done = found.includes(k);
                return (
                  <button
                    key={k}
                    type="button"
                    onClick={() => tap(k, s.text)}
                    aria-label={done ? L(s.text) : t("Маленьке диво {n}", { n: k + 1 })}
                    aria-pressed={done}
                    style={{ left: `${s.x}%`, top: `${s.y}%` }}
                    className={`absolute flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-card text-3xl shadow-soft transition-transform focus-visible:ring-4 focus-visible:ring-ring ${done ? "scale-110 bg-card" : "bg-card/60"}`}
                  >
                    <span aria-hidden className={done ? "" : "animate-float"}>
                      {done ? s.icon : "✨"}
                    </span>
                  </button>
                );
              })}
            </div>
            <div className="paper-card space-y-3 p-4 text-center">
              <p className="font-semibold">{L(chapter.task)}</p>
              <p className="text-sm text-muted-foreground" aria-live="polite">
                {t("Знайдено див: {n} із {m}", { n: found.length, m: chapter.spots.length })}
              </p>
              {allFound && (
                <Btn onClick={next}>{step + 1 < total ? t("Далі →") : t("До кінця пригоди")}</Btn>
              )}
            </div>
          </>
        ) : (
          <>
            <CharacterSay who={lastWho} text={L(quest.closing)} action="settle" />
            <div className="paper-card space-y-4 p-4 text-center">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3" role="group" aria-label={L(quest.closing)}>
                {quest.choices.map((c, k) => (
                  <button
                    key={k}
                    type="button"
                    onClick={() => choose(k)}
                    aria-pressed={choice === k}
                    className={`flex min-h-16 items-center justify-center gap-2 rounded-2xl border-2 px-4 py-3 text-lg font-bold transition focus-visible:ring-4 focus-visible:ring-ring ${choice === k ? "border-primary bg-primary/15" : "border-border bg-card"}`}
                  >
                    <span aria-hidden className="text-2xl">{c.icon}</span>
                    {L(c.text)}
                  </button>
                ))}
              </div>
              {choice !== null && (
                <p className="animate-fade-in font-semibold" role="status">
                  {t("Чудово. Цей спокій тепер із тобою.")}
                </p>
              )}
              <Btn variant="soft" onClick={restart}>
                {t("Почати спочатку")}
              </Btn>
            </div>
          </>
        )}
      </div>
    </Scene>
  );
}
