import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { DoneCard, Scene } from "@/components/Scene";
import { CharacterSay } from "@/components/Character";
import { placeImage } from "@/content/places";
import { pageHead } from "@/content/journeys";
import { STROLL, type Bi } from "@/content/adventures.i18n";
import { chime } from "@/lib/audio";
import { speak } from "@/lib/speak";
import { markDone } from "@/lib/store";
import { useLang, useT } from "@/lib/i18n";

export const Route = createFileRoute("/stroll")({
  head: () =>
    pageHead(
      "Повільна прогулянка",
      "Знаходь маленькі дива на лузі й помічай звуки, запахи й дотики.",
    ),
  component: Stroll,
});

const NOTES = [392, 440, 523, 587, 659, 784];

function Stroll() {
  const t = useT();
  const lang = useLang();
  const L = (x: Bi) => (lang === "en" ? x.en : x.uk);
  const [found, setFound] = useState<number[]>([]);
  const [open, setOpen] = useState<number | null>(null);
  const all = found.length === STROLL.spots.length;
  const tap = (k: number) => {
    chime(NOTES[k] ?? 523);
    setOpen(k);
    const s = STROLL.spots[k];
    const next = found.includes(k) ? found : [...found, k];
    const complete = next.length === STROLL.spots.length;
    if (s) speak(L(s.text), { who: "marko" });
    if (!found.includes(k)) {
      setFound(next);
      if (complete) markDone("stroll");
    }
  };
  const spot = open !== null ? STROLL.spots[open] : undefined;
  const restart = () => {
    setFound([]);
    setOpen(null);
  };
  // The finish uses the shared celebration card, like every other activity.
  if (all)
    return (
      <Scene title="Повільна прогулянка" back="/world" compact>
        <DoneCard who="marko" text={L(STROLL.reflect)} again={restart} />
      </Scene>
    );
  return (
    <Scene title="Повільна прогулянка" back="/world" compact>
      <div className="space-y-3">
        {found.length > 0 && (
          <p
            role="status"
            aria-live="polite"
            className="flex min-h-6 items-center justify-center text-center text-base font-bold leading-snug text-muted-foreground"
          >
            {spot ? L(spot.text) : ""}
          </p>
        )}
        <div className="relative mx-auto aspect-[4/3] w-full max-w-xl overflow-hidden rounded-3xl shadow-soft [@media(max-height:600px)]:max-h-[32dvh]">
          <img src={placeImage("meadow")} alt="" className="h-full w-full object-cover" />
          {STROLL.spots.map((s, k) => (
            <button
              key={k}
              type="button"
              onClick={() => tap(k)}
              aria-label={t("Маленьке диво {n}", { n: k + 1 })}
              aria-pressed={found.includes(k)}
              style={{ left: `${s.x}%`, top: `${s.y}%` }}
              className={`absolute flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-card text-2xl transition ${found.includes(k) ? "bg-card" : "bg-card/50"}`}
            >
              <span aria-hidden className={found.includes(k) ? "" : "animate-float"}>
                {found.includes(k) ? s.icon : "✨"}
              </span>
            </button>
          ))}
        </div>
        <p className="text-center text-sm" aria-live="polite">
          {t("Знайдено див: {n} із {m}", { n: found.length, m: STROLL.spots.length })}
        </p>
        {found.length === 0 && <CharacterSay who="marko" text={L(STROLL.intro)} action="look" />}
        <div className="paper-card space-y-2 p-4">
          <p>{L(STROLL.move)}</p>
        </div>
      </div>
    </Scene>
  );
}
