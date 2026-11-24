import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { DoneCard, Scene } from "@/components/Scene";
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
  // The puddle comes first so it is on screen from the start; the spoken
  // introduction folds away after the first drop.
  const [started, setStarted] = useState(false);
  const id = useRef(0);
  const finished = useRef(false);
  const timers = useRef<number[]>([]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);
  const done = drops >= GOAL;

  const addDrop = () => {
    setStarted(true);
    setDrops((d) => {
      const next = d + 1;
      // The ref keeps completion handled once, even if React replays the update.
      if (next === GOAL && !finished.current) {
        finished.current = true;
        markDone("puddles");
      }
      return next;
    });
  };

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
    addDrop();
  };

  const restart = () => {
    finished.current = false;
    setDrops(0);
    setStarted(false);
  };
  // The finish uses the shared celebration card, like every other activity.
  if (done)
    return (
      <Scene title="Калюжки" back="/world" compact>
        <DoneCard who="olenka" text={L(PUDDLES.done)} again={restart} />
      </Scene>
    );

  return (
    <Scene title="Калюжки" back="/world" compact>
      <div className="space-y-3">
        <p
          role="status"
          aria-live="polite"
          className="flex min-h-6 items-center justify-center text-center text-base font-bold leading-snug text-muted-foreground"
        >
          {t("Крапель: {n} із {m}", { n: Math.min(drops, GOAL), m: GOAL })}
        </p>
        <div className="play-split flex flex-col gap-3">
          <div
            role="button"
            tabIndex={0}
            aria-label={t("Калюжка: торкнися, щоб упала крапля")}
            onPointerDown={drop}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                chime(440);
                addDrop();
              }
            }}
            className="play-media play-media-tight relative mx-auto aspect-[4/3] w-full max-w-xl cursor-pointer touch-none overflow-hidden rounded-[45%_55%_50%_50%] shadow-soft focus-visible:ring-4 focus-visible:ring-ring [@media(max-height:600px)]:max-h-[32dvh]"
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
          <div className="space-y-3">
            {!started && <CharacterSay who="olenka" text={L(PUDDLES.intro)} mood="talk" />}
            <section className="paper-card space-y-2 p-4">
              <h2 className="font-display text-lg font-bold">{t("Без екрана")}</h2>
              <p>{L(PUDDLES.away)}</p>
              <p>{L(PUDDLES.indoor)}</p>
            </section>
          </div>
        </div>
      </div>
    </Scene>
  );
}
