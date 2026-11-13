import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { RotateCcw, Undo2, Pause } from "lucide-react";
import { Btn, Scene } from "@/components/Scene";
import { CharacterSay } from "@/components/Character";
import { CHARACTERS, type CharId } from "@/content/characters";
import { PAIR_IDS, initialCards, deal } from "@/content/game-cards";
import { pageHead } from "@/content/journeys";
import { chime, sfx } from "@/lib/audio";
import { useT } from "@/lib/i18n";
import { useStore } from "@/lib/store";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export const Route = createFileRoute("/games")({
  head: () =>
    pageHead(
      "Ігри",
      "Спокійні ігри для сенсорного екрана: бульбашки, пари друзів і зоряна музика.",
    ),
  component: Games,
});

const GAMES = [
  { id: "bubbles", icon: "🫧", name: "Мильні бульбашки" },
  { id: "pairs", icon: "🃏", name: "Пари друзів" },
  { id: "stars", icon: "🌟", name: "Зоряна музика" },
] as const;
type GameId = (typeof GAMES)[number]["id"];

function Games() {
  const t = useT();
  const [game, setGame] = useState<GameId>("bubbles");
  return (
    <Scene title="Ігри" back="/world">
      <div className="space-y-4">
        <Tabs
          value={game}
          onValueChange={(v) => {
            if (GAMES.some((g) => g.id === v)) {
              sfx("select");
              setGame(v as GameId);
            }
          }}
        >
          <TabsList
            className="grid h-auto grid-cols-3 gap-2 bg-transparent p-0"
            aria-label={t("Ігри")}
          >
            {GAMES.map((g) => (
              <TabsTrigger
                key={g.id}
                value={g.id}
                className={`paper-card flex min-w-0 flex-col items-center gap-1 whitespace-normal p-3 font-bold transition active:scale-95 ${game === g.id ? "ring-4 ring-ring" : ""}`}
              >
                <span className="text-3xl" aria-hidden>
                  {g.icon}
                </span>
                <span className="text-sm">{t(g.name)}</span>
              </TabsTrigger>
            ))}
          </TabsList>
          <TabsContent value="bubbles">
            <Bubbles />
          </TabsContent>
          <TabsContent value="pairs">
            <Pairs />
          </TabsContent>
          <TabsContent value="stars">
            <Stars />
          </TabsContent>
        </Tabs>
        <p className="text-center text-sm text-muted-foreground">
          {t("Тут немає переможців і переможених — просто грайся, скільки хочеш.")}
        </p>
      </div>
    </Scene>
  );
}

const SCALE = [392, 440, 523, 587, 659, 784, 880];

/* 1. Pop drifting bubbles — each pop is a soft note. */
export function Bubbles() {
  const t = useT();
  const calm = useStore((s) => s.reduceMotion);
  const [list, setList] = useState<
    { id: number; x: number; size: number; dur: number; hue: number; born: number }[]
  >([]);
  const [popped, setPopped] = useState(0);
  const id = useRef(0);
  useEffect(() => {
    if (calm) {
      setList(
        Array.from({ length: 9 }, (_, n) => ({
          id: ++id.current,
          x: n,
          size: 64,
          dur: 0,
          hue: n % 4,
          born: 0,
        })),
      );
      return;
    }
    const spawn = () => {
      if (document.hidden) return;
      setList((l) => [
        ...l.filter((b) => Date.now() - b.born < b.dur * 1000).slice(-14),
        {
          id: ++id.current,
          x: 5 + Math.random() * 65,
          size: 48 + Math.random() * 40,
          dur: 7 + Math.random() * 5,
          hue: Math.floor(Math.random() * 4),
          born: Date.now(),
        },
      ]);
    };
    spawn();
    const iv = window.setInterval(spawn, 900);
    return () => window.clearInterval(iv);
  }, [calm]);
  const tints = ["bg-sky/40", "bg-rose/40", "bg-honey/40", "bg-sage/40"];
  return (
    <div className="space-y-3">
      <CharacterSay
        who="olenka"
        size="sm"
        text={t("Лови бульбашки пальчиком! Кожна співає свою ноту.")}
      />
      <div
        className={`paper-card relative h-[55vh] min-h-80 overflow-hidden bg-gradient-to-b from-sky/30 to-sage/30 ${calm ? "grid grid-cols-3 place-items-center gap-3 p-6 pt-14" : "p-0"}`}
        data-no-tap
      >
        {list.map((b) => (
          <Btn
            key={b.id}
            aria-label={t("Бульбашка")}
            onClick={() => {
              chime(SCALE[b.id % SCALE.length] ?? 523);
              setPopped((p) => p + 1);
              setList((l) =>
                calm
                  ? l.map((x) =>
                      x.id === b.id ? { ...x, id: ++id.current, hue: (x.hue + 1) % 4 } : x,
                    )
                  : l.filter((x) => x.id !== b.id),
              );
            }}
            className={`${calm ? "relative" : "absolute -bottom-24 animate-bubble"} rounded-full border-2 border-card/80 p-0 shadow-soft ${tints[b.hue]}`}
            style={{
              ...(calm ? {} : { left: `${b.x}%` }),
              width: b.size,
              height: b.size,
              animationDuration: `${b.dur}s`,
            }}
          >
            <span className="absolute left-[22%] top-[18%] h-1/4 w-1/4 rounded-full bg-card/80" />
          </Btn>
        ))}
        <p className="absolute right-3 top-3 rounded-full bg-card/80 px-3 py-1 text-sm font-bold">
          🫧 {popped}
        </p>
      </div>
    </div>
  );
}

/* 2. Memory pairs with the character friends. */
export function Pairs() {
  const t = useT();
  const [cards, setCards] = useState(initialCards);
  const [open, setOpen] = useState<number[]>([]);
  const [found, setFound] = useState<CharId[]>([]);
  const timer = useRef<number | undefined>(undefined);
  useEffect(() => {
    setCards(deal());
    return () => window.clearTimeout(timer.current);
  }, []);
  const reset = () => {
    window.clearTimeout(timer.current);
    setOpen([]);
    setFound([]);
    setCards(deal());
  };
  const flip = (i: number) => {
    const card = cards[i];
    if (!card || open.length === 2 || open.includes(i) || found.includes(card.who)) return;
    sfx("select");
    const next = [...open, i];
    setOpen(next);
    if (next.length === 2) {
      const first = cards[next[0] ?? -1],
        second = cards[next[1] ?? -1];
      if (!first || !second) return;
      if (first.who === second.who) {
        timer.current = window.setTimeout(() => {
          sfx("confirm");
          setFound((f) => [...f, first.who]);
          setOpen([]);
        }, 400);
      } else timer.current = window.setTimeout(() => setOpen([]), 1000);
    }
  };
  const all = found.length === PAIR_IDS.length;
  const last = found[found.length - 1];
  return (
    <div className="space-y-3">
      <CharacterSay
        who={last ?? "taras"}
        size="sm"
        mood={last ? "cheer" : "talk"}
        text={
          all
            ? t("Ти знайшов(-ла) усіх друзів! Чудова пам'ять.")
            : last
              ? t("Привіт! Це я, {n}!", { n: t(CHARACTERS[last].name) })
              : t("Відкривай картки й шукай однакових друзів.")
        }
      />
      <p role="status" className="text-center text-sm font-bold">
        {t("Знайдено пар: {n} із {total}", { n: found.length, total: PAIR_IDS.length })}
      </p>
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4" data-no-tap>
        {cards.map((c, i) => {
          const shown = open.includes(i) || found.includes(c.who);
          return (
            <Btn
              key={c.key}
              onClick={() => flip(i)}
              aria-label={t("Картка {n}: {name}", {
                n: i + 1,
                name: shown ? t(CHARACTERS[c.who].name) : t("Закрита картка"),
              })}
              aria-pressed={shown}
              disabled={found.includes(c.who)}
              className={`aspect-[3/4] min-w-0 overflow-hidden rounded-2xl p-0 shadow-soft transition active:scale-95 ${shown ? "bg-card animate-flip" : "bg-primary"} ${found.includes(c.who) ? "ring-2 ring-honey" : ""}`}
            >
              {shown ? (
                <img
                  src={CHARACTERS[c.who].image}
                  alt=""
                  className="mx-auto h-full w-auto object-contain p-1"
                />
              ) : (
                <span className="text-2xl" aria-hidden>
                  🌻
                </span>
              )}
            </Btn>
          );
        })}
      </div>
      <div className="text-center">
        <Btn variant="soft" onClick={reset}>
          <RotateCcw size={18} className="mr-2 inline" />
          {t(all ? "Грати ще раз" : "Почати спочатку")}
        </Btn>
      </div>
    </div>
  );
}

/* 3. Touch the night sky to place singing stars; lines join them into a constellation. */
export function Stars() {
  const t = useT();
  const [stars, setStars] = useState<{ x: number; y: number }[]>([]);
  const box = useRef<HTMLDivElement>(null);
  const timers = useRef<number[]>([]);
  const [active, setActive] = useState<number | null>(null);
  const stop = () => {
    timers.current.forEach(window.clearTimeout);
    timers.current = [];
  };
  useEffect(() => {
    const pause = () => {
      stop();
      setActive(null);
    };
    const hidden = () => {
      if (document.hidden) pause();
    };
    window.addEventListener("pagehide", pause);
    document.addEventListener("visibilitychange", hidden);
    return () => {
      stop();
      window.removeEventListener("pagehide", pause);
      document.removeEventListener("visibilitychange", hidden);
    };
  }, []);
  const add = (e: React.PointerEvent) => {
    const r = box.current?.getBoundingClientRect();
    if (!r) return;
    stop();
    setActive(null);
    const x = Math.max(5, Math.min(95, ((e.clientX - r.left) / r.width) * 100)),
      y = Math.max(5, Math.min(95, ((e.clientY - r.top) / r.height) * 100));
    chime(SCALE[Math.min(6, Math.floor(((100 - y) / 100) * 7))] ?? 523);
    setStars((s) => [...s.slice(-24), { x, y }]);
  };
  const play = () => {
    stop();
    setActive(0);
    timers.current = stars.map((s, i) =>
      window.setTimeout(() => {
        setActive(i);
        chime(SCALE[Math.min(6, Math.floor(((100 - s.y) / 100) * 7))] ?? 523);
      }, i * 300),
    );
    timers.current.push(window.setTimeout(() => setActive(null), stars.length * 300));
  };
  return (
    <div className="space-y-3">
      <CharacterSay
        who="solomiya"
        size="sm"
        text={t("Торкайся неба, щоб запалити зірки. Вище — вища нота. Склади своє сузір'я!")}
      />
      <div
        ref={box}
        onPointerDown={add}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            stop();
            setActive(null);
            chime(523);
            setStars((s) => [...s.slice(-24), { x: 50, y: 50 }]);
          }
        }}
        tabIndex={0}
        data-no-tap
        role="button"
        aria-label={t("Нічне небо для зірок")}
        className="night-card relative h-[50vh] cursor-crosshair touch-none overflow-hidden bg-night"
      >
        <svg
          className="absolute inset-0 h-full w-full"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          aria-hidden
        >
          <polyline
            points={stars.map((s) => `${s.x},${s.y}`).join(" ")}
            fill="none"
            stroke="currentColor"
            strokeOpacity=".35"
            strokeWidth=".4"
            className="text-moon"
          />
        </svg>
        {stars.map((s, i) => (
          <span
            key={i}
            className="absolute -translate-x-1/2 -translate-y-1/2 text-2xl animate-pop"
            style={{ left: `${s.x}%`, top: `${s.y}%` }}
            aria-hidden
          >
            <span className={`block ${active === i ? "scale-150 text-honey" : "animate-twinkle"}`}>
              ⭐
            </span>
          </span>
        ))}
        {stars.length === 0 && (
          <p className="absolute inset-0 flex items-center justify-center text-moon/80">
            {t("Торкнися тут ✨")}
          </p>
        )}
      </div>
      <div className="flex flex-wrap justify-center gap-2">
        <Btn
          variant="soft"
          disabled={!stars.length}
          aria-label={t("Прибрати останню зірку")}
          onClick={() => {
            stop();
            setActive(null);
            setStars((s) => s.slice(0, -1));
          }}
        >
          <span title={t("Прибрати останню зірку")}>
            <Undo2 size={20} />
          </span>
        </Btn>
        <Btn variant="honey" disabled={!stars.length} onClick={play}>
          {t("▶ Заграти сузір'я")}
        </Btn>
        {active !== null && (
          <Btn
            variant="soft"
            aria-label={t("Пауза")}
            onClick={() => {
              stop();
              setActive(null);
            }}
          >
            <Pause size={20} />
          </Btn>
        )}
        <Btn
          variant="soft"
          disabled={!stars.length}
          onClick={() => {
            stop();
            setActive(null);
            setStars([]);
          }}
        >
          {t("Очистити небо")}
        </Btn>
      </div>
    </div>
  );
}
