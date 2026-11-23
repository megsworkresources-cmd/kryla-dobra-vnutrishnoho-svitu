import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Btn, Scene } from "@/components/Scene";
import { CharacterSay } from "@/components/Character";
import { placeImage } from "@/content/places";
import { pageHead } from "@/content/journeys";
import { PUDDLES, type Bi } from "@/content/adventures.i18n";
import { chime } from "@/lib/audio";
import { markDone } from "@/lib/store";
import { useLang, useT } from "@/lib/i18n";

export const Route = createFileRoute("/puddles")({
  head: () =>
    pageHead("Калюжки", "Торкайся калюжок і складай тиху дощову пісню. Є варіанти без екрана."),
  component: Puddles,
});

const GOAL = 12;
const NOTES = [330, 392, 440, 523, 587, 659];

function Puddles() {
  const t = useT();
  const lang = useLang();
  const L = (x: Bi) => (lang === "en" ? x.en : x.uk);
  const [rings, setRings] = useState<{ id: number; x: number; y: number }[]>([]);
  const [drops, setDrops] = useState(0);
  const id = useRef(0);
  const timers = useRef<number[]>([]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);
  const done = drops >= GOAL;

  const drop = (e: React.PointerEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * 100;
    const y = ((e.clientY - r.top) / r.height) * 100;
    chime(NOTES[Math.min(5, Math.floor((x / 100) * 6))] ?? 440);
    const ring = { id: ++id.current, x, y };
    setRings((rs) => [...rs.slice(-8), ring]);
    // Rings leave by timer, so reduced motion never blocks the game.
    timers.current.push(
      window.setTimeout(() => setRings((rs) => rs.filter((q) => q.id !== ring.id)), 1200),
    );
    setDrops((d) => {
      if (d + 1 === GOAL) markDone("puddles");
      return d + 1;
    });
  };

  return (
    <Scene title="Калюжки" back="/world" compact>
      <div className="space-y-4">
        <CharacterSay
          who="olenka"
          text={done ? L(PUDDLES.done) : L(PUDDLES.intro)}
          mood={done ? "cheer" : "talk"}
        />
        <div
          role="button"
          tabIndex={0}
          aria-label={t("Калюжка: торкнися, щоб упала крапля")}
          onPointerDown={drop}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              chime(440);
              setDrops((d) => {
                if (d + 1 === GOAL) markDone("puddles");
                return d + 1;
              });
            }
          }}
          className="relative mx-auto aspect-[4/3] w-full max-w-xl cursor-pointer touch-none overflow-hidden rounded-[45%_55%_50%_50%] shadow-soft focus-visible:ring-4 focus-visible:ring-ring"
        >
          <img
            src={placeImage("clouds")}
            alt=""
            className="h-full w-full object-cover opacity-80"
          />
          {rings.map((r) => (
            <span
              key={r.id}
              aria-hidden
              style={{ left: `${r.x}%`, top: `${r.y}%` }}
              className="absolute h-24 w-24 -translate-x-1/2 -translate-y-1/2 animate-ping rounded-full border-4 border-card"
            />
          ))}
        </div>
        <p className="text-center text-sm" aria-live="polite">
          {t("Крапель: {n} із {m}", { n: Math.min(drops, GOAL), m: GOAL })}
        </p>
        {done && (
          <div className="flex justify-center">
            <Btn variant="soft" onClick={() => setDrops(0)}>
              {t("Ще раз")}
            </Btn>
          </div>
        )}
        <section className="paper-card space-y-2 p-4">
          <h2 className="font-display text-lg font-bold">{t("Без екрана")}</h2>
          <p>{L(PUDDLES.away)}</p>
          <p>{L(PUDDLES.indoor)}</p>
        </section>
      </div>
    </Scene>
  );
}
