import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { RotateCcw, Undo2, Pause } from "lucide-react";
import { Btn, Scene } from "@/components/Scene";
import { CharacterSay } from "@/components/Character";
import { Glyph, type GlyphName } from "@/components/Glyph";
import { CHARACTERS, type CharId } from "@/content/characters";
import { PAIR_IDS, initialCards, deal } from "@/content/game-cards";
import { pageHead } from "@/content/journeys";
import { chime, sfx } from "@/lib/audio";
import { useT } from "@/lib/i18n";
import { useStore } from "@/lib/store";
import { isTap, startPress, type Press } from "@/lib/press";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Counting, Melody, Patterns } from "@/activities/games";
import { CloudCreatures, Fireflies, SunflowerPuzzle } from "@/activities/playful";

export const Route = createFileRoute("/games")({
  head: () =>
    pageHead(
      "Ігри",
      "Дев’ять спокійних ігор для сенсорного екрана: музика, пам'ять, візерунки, лічба, світлячки, хмаринки й мозаїка.",
    ),
  component: Games,
});

const GAMES = [
  { id: "bubbles", icon: "bubble", name: "Мильні бульбашки" },
  { id: "pairs", icon: "cards", name: "Пари друзів" },
  { id: "stars", icon: "star", name: "Зоряна музика" },
  { id: "melody", icon: "music", name: "Повтори мелодію" },
  { id: "patterns", icon: "puzzle", name: "Тихі візерунки" },
  { id: "counting", icon: "star", name: "Порахуй зірочки" },
  { id: "fireflies", icon: "firefly", name: "Світлячки" },
  { id: "clouds", icon: "cloud", name: "Хмарні звірята" },
  { id: "puzzle", icon: "sunflower", name: "Соняшникова мозаїка" },
] as const satisfies readonly { id: string; icon: GlyphName; name: string }[];
type GameId = (typeof GAMES)[number]["id"];

function Games() {
  const t = useT();
  const [game, setGame] = useState<GameId>("bubbles");
  const listRef = useRef<HTMLDivElement>(null);

  // The strip is wider than the phone, so the game that is playing has to be
  // scrolled into view or the child cannot see which one is chosen.
  useEffect(() => {
    const list = listRef.current;
    const active = list?.querySelector<HTMLElement>('[data-state="active"]');
    if (!list || !active) return;
    const lr = list.getBoundingClientRect();
    const ar = active.getBoundingClientRect();
    if (ar.left >= lr.left - 1 && ar.right <= lr.right + 1) return;
    list.scrollTo({ left: list.scrollLeft + ar.left - lr.left - 8, behavior: "smooth" });
  }, [game]);

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
            ref={listRef}
            className="no-scrollbar flex h-auto w-full items-stretch justify-start gap-2 overflow-x-auto bg-transparent p-0 pb-1"
            aria-label={t("Ігри")}
          >
            {GAMES.map((g) => (
              <TabsTrigger
                key={g.id}
                value={g.id}
                className={`paper-card flex h-full w-24 shrink-0 flex-col items-center justify-center gap-1 whitespace-normal p-2 text-xs leading-tight font-bold transition active:scale-95 ${game === g.id ? "ring-4 ring-ring" : ""}`}
              >
                <Glyph name={g.icon} className="h-7 w-7 sm:h-8 sm:w-8" />
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
          <TabsContent value="melody">
            <Melody />
          </TabsContent>
          <TabsContent value="patterns">
            <Patterns />
          </TabsContent>
          <TabsContent value="counting">
            <Counting />
          </TabsContent>
          <TabsContent value="fireflies">
            <Fireflies />
          </TabsContent>
          <TabsContent value="clouds">
            <CloudCreatures />
          </TabsContent>
          <TabsContent value="puzzle">
            <SunflowerPuzzle />
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

/**
 * A 3×3 set of places keeps bubbles apart. With random spots a bubble's round box
 * (not just its glass) covered its neighbours, so a finger landed on an invisible
 * corner and a different bubble popped — or none did.
 */
const GRID = 3;
const SLOTS = GRID * GRID;
const BUBBLE_MIN = 52;
const BUBBLE_MAX = 68;

interface Bubble {
  id: number;
  slot: number;
  left: number;
  top: number;
  size: number;
  dur: number;
  hue: number;
  note: number;
  born: number;
}

function makeBubble(id: number, slot: number, note: number): Bubble {
  return {
    id,
    slot,
    // A little jitter inside the place, so nine bubbles never look like a table.
    left: 6 + (slot % GRID) * 30 + Math.random() * 4,
    top: 6 + Math.floor(slot / GRID) * 28 + Math.random() * 5,
    size: BUBBLE_MIN + Math.random() * (BUBBLE_MAX - BUBBLE_MIN),
    dur: 7 + Math.random() * 5,
    hue: Math.floor(Math.random() * 4),
    note,
    born: Date.now(),
  };
}

/* 1. Pop drifting bubbles — each pop is a soft note. */
export function Bubbles() {
  const t = useT();
  const calm = useStore((s) => s.reduceMotion);
  const [list, setList] = useState<Bubble[]>([]);
  const [popped, setPopped] = useState(0);
  const id = useRef(0);
  const [round, setRound] = useState(0);
  useEffect(() => {
    if (calm) {
      setList(
        Array.from({ length: SLOTS }, (_, slot) => ({
          ...makeBubble(++id.current, slot, slot % SCALE.length),
          size: 64,
          dur: 0,
        })),
      );
      return;
    }
    setList(
      Array.from({ length: SLOTS }, (_, slot) =>
        makeBubble(++id.current, slot, slot % SCALE.length),
      ),
    );
    // A popped bubble is replaced in the place that just emptied: there is always
    // something to catch, and breathing places never pile up into one another.
    const spawn = () => {
      if (document.hidden) return;
      const now = Date.now();
      setList((live) => {
        const alive = live.filter((b) => now - b.born < b.dur * 1000);
        const taken = new Set(alive.map((b) => b.slot));
        const fresh = Array.from({ length: SLOTS }, (_, slot) => slot)
          .filter((slot) => !taken.has(slot))
          .map((slot) => makeBubble(++id.current, slot, Math.floor(Math.random() * SCALE.length)));
        if (!fresh.length && alive.length === live.length) return live;
        return [...alive, ...fresh];
      });
    };
    const iv = window.setInterval(spawn, 900);
    return () => window.clearInterval(iv);
  }, [calm, round]);
  const tints = ["bg-sky/40", "bg-rose/40", "bg-honey/40", "bg-sage/40"];
  return (
    <div className="space-y-3">
      <CharacterSay
        who="olenka"
        size="sm"
        text={t("Лови бульбашки пальчиком! Кожна співає свою ноту.")}
      />
      {/* The score sits in its own strip: on the glass it covered the top-right
          bubble, so that one could not be popped at all. */}
      <div className="paper-card relative flex h-[min(60svh,34rem)] min-h-80 flex-col overflow-hidden bg-gradient-to-b from-sky/30 to-sage/30">
        <p role="status" className="flex justify-end px-3 pt-2">
          <span className="flex items-center gap-1 rounded-full bg-card/85 px-3 py-1 text-sm font-bold text-card-foreground">
            <Glyph name="ball" className="h-4 w-4" /> {popped}
          </span>
        </p>
        <div
          className={`relative min-h-0 flex-1 ${calm ? "grid grid-cols-3 place-items-center gap-3 p-4" : ""}`}
          data-no-tap
        >
          {list.map((b) => (
            <span
              key={b.id}
              className={calm ? "relative" : "absolute animate-float"}
              style={{
                // Places and sizes are bounded so even a 288px-wide phone keeps
                // every glass whole inside the card, never half behind the edge.
                ...(calm ? {} : { left: `${b.left}%`, top: `${b.top}%` }),
                width: b.size,
                height: b.size,
                animationDuration: `${b.dur}s`,
                animationDelay: `-${(b.id % 5) * 0.9}s`,
              }}
            >
              {/* The drift lives on this wrapper, so the tap target travels with the
                  glass instead of staying behind while the bubble bobs away. */}
              <Btn
                aria-label={t("Бульбашка")}
                onClick={() => {
                  chime(SCALE[b.note] ?? 523);
                  setPopped((p) => p + 1);
                  setList((l) =>
                    calm
                      ? l.map((x) =>
                          x.id === b.id ? { ...x, id: ++id.current, hue: (x.hue + 1) % 4 } : x,
                        )
                      : l.filter((x) => x.id !== b.id),
                  );
                }}
                variant="soft"
                className="relative h-full w-full rounded-full border-2 border-primary bg-transparent p-0 shadow-soft"
              >
                <span
                  aria-hidden
                  className={`pointer-events-none absolute inset-0 rounded-full ${tints[b.hue]}`}
                >
                  <span className="absolute left-[22%] top-[18%] h-1/4 w-1/4 rounded-full bg-card/80" />
                </span>
              </Btn>
            </span>
          ))}
        </div>
      </div>
      <div className="text-center">
        <Btn
          variant="soft"
          onClick={() => {
            setPopped(0);
            setRound((r) => r + 1);
          }}
        >
          <RotateCcw size={18} className="mr-2 inline" />
          {t("Грати ще раз")}
        </Btn>
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
  const [peek, setPeek] = useState(false);
  const timer = useRef<number | undefined>(undefined);
  useEffect(() => {
    setCards(deal());
    return () => window.clearTimeout(timer.current);
  }, []);
  const reset = () => {
    window.clearTimeout(timer.current);
    setOpen([]);
    setFound([]);
    setPeek(false);
    setCards(deal());
  };
  const flip = (i: number) => {
    const card = cards[i];
    if (!card || peek || open.length === 2 || open.includes(i) || found.includes(card.who)) return;
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
          const shown = peek || open.includes(i) || found.includes(c.who);
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
                  loading="lazy"
                  decoding="async"
                  src={CHARACTERS[c.who].image}
                  alt=""
                  className="mx-auto h-full w-auto object-contain p-1"
                />
              ) : (
                <Glyph name="sunflower" className="mx-auto h-9 w-9" />
              )}
            </Btn>
          );
        })}
      </div>
      <div className="text-center">
        <Btn
          variant="soft"
          disabled={peek || open.length > 0 || all}
          onClick={() => {
            window.clearTimeout(timer.current);
            setPeek(true);
            timer.current = window.setTimeout(() => setPeek(false), 3000);
          }}
        >
          {t("Підглянути картки")}
        </Btn>{" "}
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
  const press = useRef<Press>(null);
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
        onPointerDown={(e) => {
          press.current = startPress(e);
        }}
        onPointerUp={(e) => {
          const from = press.current;
          press.current = null;
          // A finger that travelled was scrolling the page, not drawing a constellation.
          if (!isTap(from, e)) return;
          add(e);
        }}
        onPointerCancel={() => {
          press.current = null;
        }}
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
        className="night-card touch-no-callout relative h-[50vh] cursor-crosshair touch-pan-y-zoom select-none overflow-hidden bg-night"
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
