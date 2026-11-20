import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Btn, Scene } from "@/components/Scene";
import { CharacterSay } from "@/components/Character";
import { placeImage } from "@/content/places";
import { pageHead } from "@/content/journeys";
import { STROLL, type Bi } from "@/content/adventures.i18n";
import { chime } from "@/lib/audio";
import { markDone } from "@/lib/store";
import { useLang, useT } from "@/lib/i18n";

export const Route = createFileRoute("/stroll")({
  head: () => pageHead("Повільна прогулянка", "Знаходь маленькі дива на лузі й помічай звуки, запахи й дотики."),
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
    if (!found.includes(k)) {
      const next = [...found, k];
      setFound(next);
      if (next.length === STROLL.spots.length) markDone("stroll");
    }
  };
  const spot = open !== null ? STROLL.spots[open] : undefined;
  return (
    <Scene title="Повільна прогулянка" back="/world" compact>
      <div className="space-y-4">
        <CharacterSay who="marko" text={spot ? L(spot.text) : all ? L(STROLL.reflect) : L(STROLL.intro)} action="look" />
        <div className="relative mx-auto aspect-[4/3] w-full max-w-xl overflow-hidden rounded-3xl shadow-soft">
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
              <span aria-hidden className={found.includes(k) ? "" : "animate-float"}>{found.includes(k) ? s.icon : "✨"}</span>
            </button>
          ))}
        </div>
        <p className="text-center text-sm" aria-live="polite">
          {t("Знайдено див: {n} із {m}", { n: found.length, m: STROLL.spots.length })}
        </p>
        <div className="paper-card space-y-2 p-4">
          <p>{L(STROLL.move)}</p>
          {all && <Btn variant="soft" onClick={() => { setFound([]); setOpen(null); }}>{t("Ще раз")}</Btn>}
        </div>
      </div>
    </Scene>
  );
}
