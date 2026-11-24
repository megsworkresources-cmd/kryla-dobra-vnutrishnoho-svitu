import { useRef, useState } from "react";
import { CharacterSay } from "@/components/Character";
import { careCount, growthStage, moveStar, setStarName, setStarWish, useStore } from "@/lib/store";
import { FINAL_GROWTH_STAGE } from "@/content/growth";
import { chime, sfx } from "@/lib/audio";
import { useT } from "@/lib/i18n";

/**
 * The child's own star: a name, a wish and a place in the sky.
 * It belongs to this device only — the shared sky is a separate, adult-gated decision.
 */

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
  { x: 58, y: 30 },
  { x: 74, y: 40 },
  { x: 90, y: 30 },
  { x: 14, y: 58 },
  { x: 30, y: 68 },
  { x: 48, y: 62 },
  { x: 66, y: 74 },
  { x: 84, y: 62 },
  { x: 20, y: 84 },
  { x: 44, y: 86 },
  { x: 70, y: 88 },
  { x: 92, y: 84 },
];

export function MyStar() {
  const t = useT();
  const name = useStore((s) => s.starName);
  const wish = useStore((s) => s.starWish);
  const x = useStore((s) => s.starX);
  const y = useStore((s) => s.starY);
  const stage = growthStage(useStore((s) => careCount(s)));
  const light = Math.max(15, Math.round((stage / FINAL_GROWTH_STAGE) * 100));
  const sky = useRef<HTMLDivElement>(null);
  const start = useRef<{ x: number; y: number } | null>(null);
  const [drag, setDrag] = useState<{ dx: number; dy: number } | null>(null);

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
        {t("Тягни зорю пальцем — вона посунеться.")}
      </p>
      <div
        ref={sky}
        className="night-card relative h-[min(50svh,26rem)] min-h-60 touch-none overflow-hidden bg-night"
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
        {FIELD.map((star) => (
          <span
            key={`${star.x}-${star.y}`}
            aria-hidden
            className="absolute h-1 w-1 rounded-full bg-moon/70 animate-twinkle"
            style={{ left: `${star.x}%`, top: `${star.y}%` }}
          />
        ))}
        <button
          type="button"
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
          className="absolute grid -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full"
          style={{ left: `${x}%`, top: `${y}%` }}
        >
          <span
            aria-hidden
            className="block rounded-full bg-honey transition-transform"
            style={{
              width: 26,
              height: 26,
              transform: drag ? `translate(${drag.dx}px, ${drag.dy}px)` : undefined,
              boxShadow: `0 0 34px ${Math.round(8 + light / 4)}px color-mix(in srgb, var(--honey) 60%, transparent)`,
            }}
          />
          <span className="mt-1 whitespace-nowrap rounded-full bg-night/70 px-2 text-xs font-bold text-moon">
            {name.trim() || t("Моя зоря")}
          </span>
        </button>
      </div>

      <div className="night-card space-y-2 p-4">
        <p className="text-xs font-extrabold uppercase tracking-wide text-honey">
          {t("Твоя зоря")}
        </p>
        <p className="font-display text-3xl font-bold text-moon">
          {name.trim() || t("Ще без імені")}
        </p>
        <p className="border-l-4 border-honey/60 pl-3 text-lg italic text-moon/90">
          {wish.trim() ? `«${wish.trim()}»` : t("Тут з’явиться твоє бажання.")}
        </p>
        <p className="text-sm font-semibold text-moon/85">
          {t("Світло: {n}%", { n: light })} · {t("росте, коли ти поливаєш соняшник")}
        </p>
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
          {t("Зоря живе лише на цьому пристрої. Ніхто інший її не бачить.")}
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
