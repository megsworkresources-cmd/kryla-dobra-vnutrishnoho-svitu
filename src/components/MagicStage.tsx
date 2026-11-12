import { useState } from "react";
import { RotateCcw } from "lucide-react";
import { sfx } from "@/lib/audio";
import { useT } from "@/lib/i18n";
import { Btn } from "./Scene";

const FLOWERS = ["🌻", "🌼", "🌷", "🌸"];
const PATH = [
  [12, 72],
  [27, 50],
  [42, 68],
  [57, 36],
  [72, 52],
  [87, 24],
];
const PAIRS = ["🌻", "🦋", "🍃", "🌻", "🍃", "🦋"];

/** Optional purposeful play: no scores, deadlines or exercise-completion gate. */
export function MagicStage({
  theme,
  label,
  night = false,
  count: _count,
  variant,
}: {
  theme: string;
  label?: string;
  night?: boolean | undefined;
  count?: number;
  variant?: "trail" | "memory" | "garden";
}) {
  const t = useT();
  const mode =
    variant ??
    (["clouds", "studio"].includes(theme)
      ? "memory"
      : ["garden", "safe"].includes(theme)
        ? "garden"
        : "trail");
  const [progress, setProgress] = useState(0);
  const [chosen, setChosen] = useState(0);
  const [planted, setPlanted] = useState<Record<number, number>>({});
  const [open, setOpen] = useState<number[]>([]);
  const [matched, setMatched] = useState<number[]>([]);
  const [miss, setMiss] = useState(false);
  const [dragging, setDragging] = useState(false);
  const reset = () => {
    setProgress(0);
    setPlanted({});
    setOpen([]);
    setMatched([]);
    setMiss(false);
  };
  const trace = (n: number) => {
    if (n === progress) {
      setProgress(n + 1);
      sfx("soft");
    }
  };
  const reveal = (n: number) => {
    if (matched.includes(n) || open.includes(n)) return;
    const next = miss ? [n] : [...open, n];
    setMiss(false);
    setOpen(next);
    if (next.length === 2) {
      const [a, b] = next;
      if (a !== undefined && b !== undefined && PAIRS[a] === PAIRS[b]) {
        setMatched([...matched, a, b]);
        setOpen([]);
        sfx("confirm");
      } else setMiss(true);
    }
  };
  const complete =
    mode === "trail"
      ? progress === 6
      : mode === "memory"
        ? matched.length === 6
        : Object.keys(planted).length === 6;
  return (
    <div
      role="group"
      aria-label={label ?? t("Маленька пригода")}
      className={`space-y-3 rounded-lg bg-sky/30 p-3 ${night ? "text-moon" : "text-foreground"}`}
    >
      <div className="flex items-center justify-between gap-2">
        <h3 className="font-display text-lg font-bold">
          {t(
            mode === "trail"
              ? "Стежка уваги"
              : mode === "memory"
                ? "Знайди друзів"
                : "Мій маленький сад",
          )}
        </h3>
        <Btn
          variant="soft"
          onClick={reset}
          aria-label={t("Почати спочатку")}
          className="shrink-0 px-3"
        >
          <RotateCcw size={18} />
        </Btn>
      </div>
      {mode === "trail" ? (
        <div
          className="relative h-48 touch-none overflow-hidden rounded-lg bg-sage/30"
          onPointerDown={() => setDragging(true)}
          onPointerUp={() => setDragging(false)}
          onPointerCancel={() => setDragging(false)}
          onPointerLeave={() => setDragging(false)}
          onPointerMove={(event) => {
            if (!dragging) return;
            const rect = event.currentTarget.getBoundingClientRect();
            const x = ((event.clientX - rect.left) / rect.width) * 100;
            const y = ((event.clientY - rect.top) / rect.height) * 100;
            const point = PATH[progress];
            if (point && Math.abs(x - (point[0] ?? 0)) < 9 && Math.abs(y - (point[1] ?? 0)) < 13)
              trace(progress);
          }}
        >
          <svg
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            className="absolute inset-0 h-full w-full"
            aria-hidden
          >
            <polyline
              points={PATH.map((p) => p.join(",")).join(" ")}
              fill="none"
              stroke="var(--sage)"
              strokeWidth="2"
              strokeDasharray="3 3"
            />
            <polyline
              points={PATH.slice(0, progress)
                .map((p) => p.join(","))
                .join(" ")}
              fill="none"
              stroke="var(--honey)"
              strokeWidth="3"
            />
          </svg>
          {PATH.map(([x, y], n) => (
            <div
              key={n}
              className="absolute -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${x}%`, top: `${y}%` }}
            >
              <Btn
                variant={n < progress ? "honey" : "soft"}
                aria-label={t("Крок стежки {n}", { n: n + 1 })}
                disabled={n > progress}
                onClick={() => trace(n)}
                className={`h-11 min-h-11 w-11 p-0 ${n === progress ? "ring-2 ring-ring" : ""}`}
              >
                {n < progress ? "🌼" : n + 1}
              </Btn>
            </div>
          ))}
        </div>
      ) : mode === "memory" ? (
        <div className="grid grid-cols-3 gap-2">
          {PAIRS.map((icon, n) => (
            <Btn
              key={n}
              variant={matched.includes(n) ? "honey" : "soft"}
              aria-label={t("Картка {n}", { n: n + 1 })}
              aria-pressed={open.includes(n) || matched.includes(n)}
              onClick={() => reveal(n)}
              className="h-20 text-3xl"
            >
              {open.includes(n) || matched.includes(n) ? icon : "🍀"}
            </Btn>
          ))}
        </div>
      ) : (
        <>
          <div className="flex justify-center gap-2">
            {FLOWERS.map((flower, n) => (
              <Btn
                key={flower}
                variant={chosen === n ? "honey" : "soft"}
                aria-label={t("Обрати квітку {n}", { n: n + 1 })}
                aria-pressed={chosen === n}
                onClick={() => setChosen(n)}
                className="px-3 text-2xl"
              >
                {flower}
              </Btn>
            ))}
          </div>
          <div className="grid grid-cols-3 gap-2 rounded-lg bg-sage/30 p-2">
            {Array.from({ length: 6 }, (_, n) => (
              <Btn
                key={n}
                variant="ghost"
                aria-label={t("Посадити квітку {n}", { n: n + 1 })}
                onClick={() => {
                  setPlanted({ ...planted, [n]: chosen });
                  sfx("soft");
                }}
                className="h-16 border-sage/40 p-0 text-3xl"
              >
                {planted[n] === undefined ? "🌱" : FLOWERS[planted[n] ?? 0]}
              </Btn>
            ))}
          </div>
        </>
      )}
      <p role="status" className="min-h-12 text-center text-sm">
        {t(
          complete
            ? "Готово. Можна відпочити або спробувати знову."
            : mode === "trail"
              ? "Веди пальцем від 1 до 6 або обирай кроки по черзі."
              : mode === "memory"
                ? miss
                  ? "Ці картинки різні. Запам’ятай їх і обери іншу картку."
                  : "Відкрий дві картки й знайди однакові картинки."
                : "Обери квітку й посади її на вільному місці.",
        )}
      </p>
    </div>
  );
}
