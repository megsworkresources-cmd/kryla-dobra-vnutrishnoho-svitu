import { useEffect, useRef, useState } from "react";
import { RotateCcw } from "lucide-react";
import { CharacterSay } from "@/components/Character";
import { Btn } from "@/components/Scene";
import { chime, sfx } from "@/lib/audio";
import { useT } from "@/lib/i18n";
import { useStore } from "@/lib/store";
import welcome from "@/assets/welcome.jpg";

/**
 * The three gentle games from the playful-planet screen: fireflies to wake,
 * clouds to slide aside and a picture to rebuild from pieces.
 * None of them keeps score, runs a timer or can be lost.
 */

const SCALE = [392, 440, 523, 587, 659, 784, 880];

/* 1. Firefly Catcher — touch a warm light in the night forest and it stays lit. */
const FLIES = [
  { x: 12, y: 20 },
  { x: 36, y: 12 },
  { x: 64, y: 18 },
  { x: 86, y: 30 },
  { x: 20, y: 48 },
  { x: 46, y: 42 },
  { x: 72, y: 54 },
  { x: 10, y: 74 },
  { x: 56, y: 76 },
  { x: 84, y: 72 },
];

export function Fireflies() {
  const t = useT();
  const calm = useStore((s) => s.reduceMotion);
  const [lit, setLit] = useState<number[]>([]);
  const all = lit.length === FLIES.length;
  return (
    <div className="space-y-3">
      <p role="status" className="text-center text-sm font-bold">
        {t("Світиться {n} з {total}", { n: lit.length, total: FLIES.length })}
      </p>
      <div
        className="night-card relative h-[min(52svh,28rem)] min-h-64 overflow-hidden bg-night"
        data-no-tap
      >
        <div
          className="pointer-events-none absolute inset-0"
          aria-hidden
          style={{
            background:
              "radial-gradient(120% 80% at 50% 0%, color-mix(in srgb, var(--dusk) 75%, transparent), transparent 70%)",
          }}
        />
        <svg
          className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 w-full"
          viewBox="0 0 100 30"
          preserveAspectRatio="none"
          aria-hidden
        >
          <path
            d="M0 30 V20 L10 12 L20 20 L30 10 L42 20 L54 13 L66 21 L78 12 L90 20 L100 15 V30Z"
            fill="var(--forest)"
            opacity=".55"
          />
          <path
            d="M0 30 V25 L14 19 L28 25 L44 18 L60 26 L76 19 L92 25 L100 22 V30Z"
            fill="var(--ink)"
            opacity=".35"
          />
        </svg>
        {[
          { x: 8, y: 12 },
          { x: 52, y: 6 },
          { x: 92, y: 16 },
          { x: 30, y: 88 },
          { x: 68, y: 92 },
        ].map((s) => (
          <span
            key={`${s.x}-${s.y}`}
            aria-hidden
            className="absolute h-1 w-1 rounded-full bg-moon/70 animate-twinkle"
            style={{ left: `${s.x}%`, top: `${s.y}%` }}
          />
        ))}
        {FLIES.map((fly, index) => {
          const on = lit.includes(index);
          return (
            <button
              key={`${fly.x}-${fly.y}`}
              type="button"
              aria-label={t("Світлячок {n}", { n: index + 1 })}
              aria-pressed={on}
              onClick={() => {
                if (on) return;
                chime(SCALE[index % SCALE.length] ?? 523);
                setLit((list) => [...list, index]);
              }}
              className="absolute flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full"
              style={{ left: `${fly.x}%`, top: `${fly.y}%` }}
            >
              <span
                aria-hidden
                className={`block rounded-full transition-all duration-500 ${
                  on ? "bg-honey" : "bg-honey/55"
                } ${on || calm ? "" : "animate-float"}`}
                style={{
                  width: on ? 22 : 12,
                  height: on ? 22 : 12,
                  boxShadow: on
                    ? "0 0 32px 14px color-mix(in srgb, var(--honey) 65%, transparent)"
                    : "0 0 14px 5px color-mix(in srgb, var(--honey) 30%, transparent)",
                  animationDelay: `${index * 0.4}s`,
                }}
              />
            </button>
          );
        })}
        {all && (
          <div className="pointer-events-none absolute inset-0" aria-hidden>
            {[16, 34, 52, 70, 88].map((left, i) => (
              <span
                key={left}
                className="absolute text-lg animate-petal"
                style={{ left: `${left}%`, top: "-2rem", animationDelay: `${i * 0.3}s` }}
              >
                ✨
              </span>
            ))}
          </div>
        )}
      </div>
      <div className="text-center">
        <Btn variant="soft" onClick={() => setLit([])}>
          <RotateCcw size={18} className="mr-2 inline" />
          {t("Запалити спочатку")}
        </Btn>
      </div>
      <CharacterSay
        who="lihtaryk"
        size="sm"
        mood={all ? "cheer" : "calm"}
        text={
          all
            ? t("Усе небо світиться. Ти нікуди не поспішав — і встиг скрізь.")
            : t("Теплі вогники в нічному лісі. Торкайся й дивись, як вони світяться.")
        }
      />
    </div>
  );
}

/* 2. Cloud Creatures — slide a cloud aside and wake whoever lives inside. */
const CREATURES = [
  { id: "turtle", face: "🐢", line: "Я черепашка. Мені добре в тишині." },
  { id: "fox", face: "🦊", line: "Я лисичка. Люблю гратися в хованки." },
  { id: "bee", face: "🐝", line: "Я бджілка. Люблю квіти й тихе гудіння." },
  { id: "squirrel", face: "🐿️", line: "Я білочка. Збираю зернятка на зиму." },
];

export function CloudCreatures() {
  const t = useT();
  const calm = useStore((s) => s.reduceMotion);
  const [moved, setMoved] = useState<Record<string, boolean>>({});
  const awake = CREATURES.filter((c) => moved[c.id]).length;
  const all = awake === CREATURES.length;
  const drag = useRef<{ id: string; x: number; y: number } | null>(null);
  const [offset, setOffset] = useState<Record<string, { x: number; y: number }>>({});
  const clear = () => {
    drag.current = null;
    setOffset({});
    setMoved({});
  };

  return (
    <div className="space-y-3">
      <p role="status" className="text-center text-sm font-bold">
        {t("Прокинулося {n} з {total}", { n: awake, total: CREATURES.length })}
      </p>
      <div
        className="night-card touch-no-callout relative h-[min(56svh,30rem)] min-h-72 touch-pan-y-zoom select-none overflow-hidden bg-gradient-to-b from-sky/40 via-paper to-honey/30"
        data-no-tap
      >
        <div className="absolute inset-0 grid grid-cols-2 grid-rows-2">
          {CREATURES.map((creature) => {
            const dx = offset[creature.id]?.x ?? 0;
            const dy = offset[creature.id]?.y ?? 0;
            const isMoved = moved[creature.id];
            return (
              <div key={creature.id} className="relative grid place-items-center">
                <span
                  className={`text-5xl sm:text-6xl ${isMoved ? "animate-pop" : "opacity-0"}`}
                  aria-hidden
                >
                  {creature.face}
                </span>
                {isMoved && (
                  <p className="mt-1 max-w-[10rem] px-2 text-center text-xs font-semibold leading-tight text-ink">
                    {t(creature.line)}
                  </p>
                )}
                <button
                  type="button"
                  aria-label={t("Хмарка {n}", { n: CREATURES.indexOf(creature) + 1 })}
                  aria-pressed={isMoved}
                  onPointerDown={(event) => {
                    if (event.isPrimary === false) return;
                    event.currentTarget.setPointerCapture(event.pointerId);
                    drag.current = {
                      id: creature.id,
                      x: event.clientX,
                      y: event.clientY,
                    };
                  }}
                  onPointerMove={(event) => {
                    const start = drag.current;
                    if (!start || start.id !== creature.id || event.isPrimary === false) return;
                    const dxLive = event.clientX - start.x;
                    const dyLive = event.clientY - start.y;
                    if (Math.abs(dxLive) + Math.abs(dyLive) < 12) return;
                    setOffset((map) => ({ ...map, [creature.id]: { x: dxLive, y: dyLive } }));
                  }}
                  onPointerUp={(event) => {
                    const start = drag.current;
                    drag.current = null;
                    if (!start || start.id !== creature.id || event.isPrimary === false) return;
                    const travelled =
                      Math.abs(event.clientX - start.x) + Math.abs(event.clientY - start.y);
                    if (travelled > 24) {
                      sfx("soft");
                      setMoved((map) => ({ ...map, [creature.id]: true }));
                    } else {
                      setOffset((map) => ({ ...map, [creature.id]: { x: 0, y: 0 } }));
                    }
                  }}
                  onPointerCancel={() => {
                    drag.current = null;
                    setOffset((map) => ({ ...map, [creature.id]: { x: 0, y: 0 } }));
                  }}
                  onClick={() => {
                    // A plain tap or the keyboard slides the cloud aside too.
                    if (isMoved) return;
                    sfx("soft");
                    setMoved((map) => ({ ...map, [creature.id]: true }));
                    setOffset((map) => ({ ...map, [creature.id]: { x: 0, y: 0 } }));
                  }}
                  className={`absolute grid h-24 w-32 place-items-center transition-transform sm:h-28 sm:w-40 ${
                    isMoved ? "pointer-events-none" : ""
                  }`}
                  style={{
                    // The cloud is the drag handle, so it claims both axes; the card
                    // around it still scrolls the page.
                    touchAction: "none",
                    transform: isMoved
                      ? "translate(0, -160%) scale(.9)"
                      : `translate(${dx}px, ${dy}px)`,
                    opacity: isMoved ? 0.35 : 1,
                  }}
                >
                  <svg
                    viewBox="0 0 120 72"
                    aria-hidden
                    className={`h-full w-full drop-shadow-md ${calm ? "" : "animate-drift"}`}
                  >
                    <g fill="var(--paper)">
                      <ellipse cx="40" cy="46" rx="30" ry="19" />
                      <ellipse cx="66" cy="34" rx="26" ry="24" />
                      <ellipse cx="92" cy="48" rx="22" ry="16" />
                      <rect x="18" y="45" width="82" height="18" rx="9" />
                    </g>
                  </svg>
                </button>
              </div>
            );
          })}
        </div>
      </div>
      <div className="text-center">
        <Btn variant="soft" onClick={clear}>
          <RotateCcw size={18} className="mr-2 inline" />
          {t("Знову сховати")}
        </Btn>
      </div>
      <CharacterSay
        who="taras"
        size="sm"
        mood={all ? "cheer" : "listen"}
        text={
          all
            ? t("Ти розбудив(-ла) всіх, хто ховався в хмарках. Їм було приємно познайомитися.")
            : t("Розсувай хмарки — під ними хтось спить. Можна тягнути пальцем або торкнутися.")
        }
      />
    </div>
  );
}

/* 3. The Sunflower Puzzle — rebuild the sunflower field from four or nine pieces. */
function shuffled(pieces: number) {
  const order = Array.from({ length: pieces }, (_, i) => i);
  let solved = true;
  do {
    for (let i = order.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      const a = order[i] ?? 0;
      const b = order[j] ?? 0;
      order[i] = b;
      order[j] = a;
    }
    solved = order.every((piece, slot) => piece === slot);
  } while (solved);
  return order;
}

export function SunflowerPuzzle() {
  const t = useT();
  const [size, setSize] = useState(3);
  const [order, setOrder] = useState(() => shuffled(9));
  const [picked, setPicked] = useState<number | null>(null);
  const solved = order.every((piece, slot) => piece === slot);
  const total = size * size;
  const start = (next: number) => {
    setSize(next);
    setOrder(shuffled(next * next));
    setPicked(null);
    sfx("page");
  };
  useEffect(() => {
    if (solved) sfx("complete");
  }, [solved]);
  const choose = (slot: number) =>
    setPicked((current) => {
      if (current === null) {
        sfx("tap");
        return slot;
      }
      if (current === slot) return null;
      setOrder((list) => {
        const next = [...list];
        const a = next[current] ?? 0;
        const b = next[slot] ?? 0;
        next[current] = b;
        next[slot] = a;
        return next;
      });
      sfx("select");
      return null;
    });

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap justify-center gap-2">
        {[2, 3].map((n) => (
          <Btn
            key={n}
            variant={size === n ? "primary" : "soft"}
            aria-pressed={size === n}
            onClick={() => start(n)}
          >
            {n === 2 ? t("Чотири частини") : t("Дев'ять частин")}
          </Btn>
        ))}
      </div>
      <p role="status" className="text-center text-sm font-bold">
        {solved
          ? t("Складно! 🌻")
          : t("Правильно складено: {n} з {total}", {
              n: order.filter((piece, slot) => piece === slot).length,
              total,
            })}
      </p>
      <div
        className="paper-card mx-auto max-w-md overflow-hidden p-1"
        style={{ display: "grid", gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))`, gap: 2 }}
      >
        {order.map((piece, slot) => {
          const row = Math.floor(piece / size);
          const col = piece % size;
          return (
            <button
              key={slot}
              type="button"
              aria-label={t("Частина {n}", { n: piece + 1 })}
              aria-pressed={picked === slot}
              onClick={() => choose(slot)}
              className={`aspect-square min-w-0 rounded-md bg-cover transition active:scale-95 ${
                picked === slot ? "ring-4 ring-ring ring-offset-2" : ""
              }`}
              style={{
                backgroundImage: `url(${welcome})`,
                backgroundSize: `${size * 100}% ${size * 100}%`,
                backgroundPosition: `${(col * 100) / (size - 1)}% ${(row * 100) / (size - 1)}%`,
              }}
            />
          );
        })}
      </div>
      <div className="text-center">
        <Btn variant="soft" onClick={() => start(size)}>
          <RotateCcw size={18} className="mr-2 inline" />
          {t("Перемішати знову")}
        </Btn>
      </div>
      <CharacterSay
        who="marko"
        size="sm"
        mood={solved ? "cheer" : "think"}
        text={
          solved
            ? t("Картина зійшлася! Кожна частинка знайшла своє місце.")
            : t(
                "Торкнися двох частин — і вони поміняються місцями. Можна будь-коли почати спочатку.",
              )
        }
      />
    </div>
  );
}
