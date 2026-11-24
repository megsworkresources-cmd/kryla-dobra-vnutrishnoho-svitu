import { useMemo, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { CharacterSay } from "@/components/Character";
import { Btn } from "@/components/Scene";
import { careCount, growthStage, moveStar, setStarName, setStarWish, useStore } from "@/lib/store";
import { FINAL_GROWTH_STAGE } from "@/content/growth";
import { JOURNEYS } from "@/content/journeys";
import { chime, sfx } from "@/lib/audio";
import { useT } from "@/lib/i18n";

/**
 * The Night Sky: the child's own star and one star for each story they have
 * walked through. Everything here lives on this device — no other child's star
 * is ever published, because this app never sends child-written words away.
 */

const STORY_IDS = ["lantern", "bridge", "seed", "rain", "sleep"] as const;
type StoryId = (typeof STORY_IDS)[number];

const STORIES = STORY_IDS.map((id) => {
  const row = JOURNEYS.sky.activities.find((activity) => activity[0] === id);
  return { id, title: row?.[1] ?? id, line: row?.[2] ?? "" };
});

/** A fixed field, so server markup and the browser paint the same stars. */
const FIELD = [
  { x: 12, y: 10 },
  { x: 28, y: 6 },
  { x: 46, y: 14 },
  { x: 62, y: 8 },
  { x: 78, y: 16 },
  { x: 88, y: 6 },
  { x: 8, y: 26 },
  { x: 22, y: 34 },
  { x: 40, y: 26 },
  { x: 60, y: 30 },
  { x: 74, y: 42 },
  { x: 90, y: 34 },
  { x: 14, y: 46 },
  { x: 30, y: 56 },
  { x: 48, y: 46 },
  { x: 66, y: 60 },
  { x: 86, y: 48 },
  { x: 20, y: 74 },
  { x: 44, y: 70 },
  { x: 70, y: 78 },
  { x: 92, y: 72 },
];

/** Story stars sit on these five places; "refresh" rotates them. */
const SLOTS = [
  { x: 18, y: 24 },
  { x: 76, y: 20 },
  { x: 28, y: 66 },
  { x: 82, y: 58 },
  { x: 58, y: 84 },
];

export function MyStar() {
  const t = useT();
  const name = useStore((s) => s.starName);
  const wish = useStore((s) => s.starWish);
  const x = useStore((s) => s.starX);
  const y = useStore((s) => s.starY);
  const completed = useStore((s) => s.completed);
  const stage = growthStage(useStore((s) => careCount(s)));
  const myLight = Math.max(15, Math.round((stage / FINAL_GROWTH_STAGE) * 100));
  const sky = useRef<HTMLDivElement>(null);
  const start = useRef<{ x: number; y: number } | null>(null);
  const [drag, setDrag] = useState<{ dx: number; dy: number } | null>(null);
  const [picked, setPicked] = useState<"me" | StoryId>("me");
  const [seed, setSeed] = useState(0);
  const [litSent, setLitSent] = useState<StoryId[]>([]);

  const lit = useMemo(
    () => STORIES.filter((story) => (completed[`sky-${story.id}`] ?? 0) > 0),
    [completed],
  );
  const story = STORIES.find((s) => s.id === picked);
  const storyReads = story ? (completed[`sky-${story.id}`] ?? 0) : 0;
  const light = story ? Math.min(100, 45 + 15 * storyReads) : myLight;

  /** The star lands exactly where the finger let go. */
  const place = (clientX: number, clientY: number) => {
    const rect = sky.current?.getBoundingClientRect();
    setDrag(null);
    start.current = null;
    if (!rect || rect.width === 0 || rect.height === 0) return;
    moveStar(
      ((clientX - rect.left) / rect.width) * 100,
      ((clientY - rect.top) / rect.height) * 100,
    );
    sfx("soft");
  };

  return (
    <div className="space-y-4">
      <p className="text-center text-sm font-bold text-moon">
        {t("Тягни свою зорю пальцем. Торкнись будь-якої — побачиш її світло.")}
      </p>

      <div
        ref={sky}
        className="night-card relative h-[min(54svh,28rem)] min-h-64 touch-none overflow-hidden bg-night"
        data-no-tap
      >
        <div
          className="pointer-events-none absolute inset-0"
          aria-hidden
          style={{
            background:
              "radial-gradient(120% 80% at 50% 0%, color-mix(in srgb, var(--lavender) 45%, transparent), transparent 72%)",
          }}
        />
        {FIELD.map((dot) => (
          <span
            key={`${dot.x}-${dot.y}`}
            aria-hidden
            className="absolute h-1 w-1 rounded-full bg-moon/70 animate-twinkle"
            style={{ left: `${dot.x}%`, top: `${dot.y}%` }}
          />
        ))}

        <div className="absolute right-2 top-2 z-10 flex items-center gap-1 rounded-full bg-night/70 px-2 py-1">
          <span className="text-xs font-bold text-moon">
            {t("{n} зірок світиться", { n: lit.length + 1 })}
          </span>
          <button
            type="button"
            aria-label={t("Оновити небо")}
            onClick={() => {
              setSeed((s) => s + 1);
              chime(587);
            }}
            className="grid h-11 w-11 place-items-center rounded-full text-moon press"
          >
            <span aria-hidden className="text-base">
              ↻
            </span>
          </button>
        </div>

        {STORIES.map((item, index) => {
          const slot = SLOTS[(index + seed) % SLOTS.length] ?? { x: 50, y: 50 };
          const isLit = (completed[`sky-${item.id}`] ?? 0) > 0;
          const isPicked = picked === item.id;
          return (
            <button
              key={item.id}
              type="button"
              aria-pressed={isPicked}
              aria-label={t("{name}: торкнись, щоб побачити її світло", { name: t(item.title) })}
              onClick={() => {
                setPicked(item.id);
                chime(isLit ? 698 : 440);
              }}
              className="absolute grid h-11 w-11 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full"
              style={{ left: `${slot.x}%`, top: `${slot.y}%` }}
            >
              <span
                aria-hidden
                className={`block rounded-full transition-transform ${isPicked ? "h-5 w-5" : "h-3 w-3"} ${
                  isLit ? "bg-moon" : "bg-moon/40"
                }`}
                style={{
                  boxShadow: isLit
                    ? `0 0 ${isPicked ? 26 : 18}px ${isPicked ? 8 : 5}px color-mix(in srgb, var(--moon) 50%, transparent)`
                    : undefined,
                }}
              />
              {isPicked && (
                <span className="pointer-events-none absolute left-1/2 top-full -translate-x-1/2 whitespace-nowrap rounded-full bg-night/70 px-2 text-xs font-bold text-moon">
                  {t(item.title)}
                </span>
              )}
            </button>
          );
        })}

        <button
          type="button"
          aria-pressed={picked === "me"}
          aria-label={t("Моя зоря: тягни, щоб посунути, або пересувай стрілками")}
          onPointerDown={(event) => {
            event.currentTarget.setPointerCapture(event.pointerId);
            start.current = { x: event.clientX, y: event.clientY };
            setDrag({ dx: 0, dy: 0 });
          }}
          onPointerMove={(event) => {
            if (!start.current) return;
            setDrag({
              dx: event.clientX - start.current.x,
              dy: event.clientY - start.current.y,
            });
          }}
          onPointerUp={(event) => {
            if (!start.current) return;
            const travelled =
              Math.abs(event.clientX - start.current.x) + Math.abs(event.clientY - start.current.y);
            if (travelled > 8) place(event.clientX, event.clientY);
            else {
              setDrag(null);
              start.current = null;
              setPicked("me");
              chime(659);
            }
          }}
          onPointerCancel={() => {
            setDrag(null);
            start.current = null;
          }}
          onKeyDown={(event) => {
            const step = 3;
            const moves: Record<string, [number, number]> = {
              ArrowLeft: [-step, 0],
              ArrowRight: [step, 0],
              ArrowUp: [0, -step],
              ArrowDown: [0, step],
            };
            const move = moves[event.key];
            if (!move) return;
            event.preventDefault();
            moveStar(x + move[0], y + move[1]);
            chime(523);
          }}
          className="absolute grid h-11 w-11 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full"
          style={{ left: `${x}%`, top: `${y}%` }}
        >
          <span
            aria-hidden
            className="block rounded-full bg-honey transition-transform"
            style={{
              width: 26,
              height: 26,
              transform: drag ? `translate(${drag.dx}px, ${drag.dy}px)` : undefined,
              boxShadow: `0 0 34px ${Math.round(8 + myLight / 4)}px color-mix(in srgb, var(--honey) 60%, transparent)`,
            }}
          />
          <span className="pointer-events-none absolute left-1/2 top-full -translate-x-1/2 whitespace-nowrap rounded-full bg-night/70 px-2 text-xs font-bold text-moon">
            {name.trim() || t("Моя зоря")}
          </span>
        </button>
      </div>

      <div data-star-card className="night-card space-y-2 p-4">
        <p className="text-xs font-extrabold uppercase tracking-wide text-honey">
          {story ? t("Зоря казки") : t("Твоя зоря")}
        </p>
        <p className="font-display text-3xl font-bold text-moon">
          {story ? t(story.title) : name.trim() || t("Ще без імені")}
        </p>
        <p className="border-l-4 border-honey/60 pl-3 text-lg italic text-moon/90">
          {story
            ? storyReads > 0
              ? t(story.line)
              : t("Ця казка ще чекає на тебе.")
            : wish.trim()
              ? `«${wish.trim()}»`
              : t("Тут з’явиться твоє бажання.")}
        </p>
        <p className="text-sm font-semibold text-moon/85">
          {story
            ? t("Світло: {n}% · казка прочитана {k} разів", { n: light, k: storyReads })
            : t("Світло: {n}% · росте, коли ти поливаєш соняшник", { n: light })}
        </p>
        {story && (
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <Btn
              variant="primary"
              onClick={() => {
                if (!litSent.includes(story.id)) setLitSent((list) => [...list, story.id]);
                chime(784);
              }}
            >
              {t("Надіслати трохи світла")}
            </Btn>
            <Link
              to="/sky/$id"
              params={{ id: story.id }}
              className="press min-h-11 rounded-full bg-night/60 px-4 py-2 text-sm font-bold text-moon"
            >
              {storyReads > 0 ? t("Повернутись до казки") : t("Послухати казку")}
            </Link>
          </div>
        )}
        {story && litSent.includes(story.id) && (
          <p className="text-sm text-moon/80">{t("Світло поруч. Воно нікуди не зникає.")}</p>
        )}
      </div>

      <div className="night-card space-y-3 p-4">
        <label className="block space-y-1">
          <span className="block text-sm font-bold text-moon">{t("Ім’я зорі")}</span>
          <input
            value={name}
            maxLength={24}
            onChange={(event) => setStarName(event.target.value)}
            placeholder={t("Наприклад: Мрія")}
            className="min-h-12 w-full rounded-full bg-night/60 px-4 text-base text-moon outline-none placeholder:text-moon/50 focus:ring-2 focus:ring-ring"
          />
        </label>
        <label className="block space-y-1">
          <span className="block text-sm font-bold text-moon">{t("Моє бажання")}</span>
          <input
            value={wish}
            maxLength={90}
            onChange={(event) => setStarWish(event.target.value)}
            placeholder={t("Напиши кілька слів — це бачить лише ти")}
            className="min-h-12 w-full rounded-full bg-night/60 px-4 text-base text-moon outline-none placeholder:text-moon/50 focus:ring-2 focus:ring-ring"
          />
        </label>
        <p className="text-sm text-moon/70">
          {t("Небо живе лише на цьому пристрої. Тут тільки твої зорі.")}
        </p>
      </div>

      <CharacterSay
        who="solomiya"
        size="sm"
        mood="calm"
        text={t(
          "Кожна зоря — це чиясь надія. Твоя теж тут. Бажання не обов’язково має бути великим.",
        )}
      />
    </div>
  );
}
