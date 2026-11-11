import { CharacterSay } from "@/components/Character";
import { useEffect, useRef, useState } from "react";
import { Eraser, Trash2 } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Btn } from "@/components/Scene";
import { addDrawing, markDone, removeDrawing, useStore } from "@/lib/store";
import { useT, useLang, localeOf } from "@/lib/i18n";
import { chime, sfx } from "@/lib/audio";

const STAMPS = ["🌻", "⭐", "🦋", "❤️", "🌈", "🐞", "☁️", "🌙"];
const NOTES = [523, 587, 659, 784, 880, 1047];

const COLORS = [
  "var(--ink)",
  "var(--honey)",
  "var(--rose)",
  "var(--sky)",
  "var(--sage)",
  "var(--lavender)",
  "var(--dusk)",
  "var(--paper)",
];
const resolve = (c: string) =>
  getComputedStyle(document.documentElement).getPropertyValue(c.slice(4, -1)).trim() || c;

export function Canvas({ id, prompt }: { id: string; prompt: string }) {
  const t = useT();
  const ref = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const [color, setColor] = useState(COLORS[0]!);
  const [size, setSize] = useState(8);
  const [eraser, setEraser] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveFailed, setSaveFailed] = useState(false);
  const [stamp, setStamp] = useState<string | null>(null);
  const [rainbow, setRainbow] = useState(false);
  const hue = useRef(0);
  const [trail, setTrail] = useState<{ id: number; x: number; y: number; g: string }[]>([]);
  const tid = useRef(0);
  const last = useRef(0);
  const [party, setParty] = useState(0);
  const spark = (e: React.PointerEvent, g: string) => {
    const r = ref.current!.getBoundingClientRect();
    const id = tid.current++;
    setTrail((a) => [...a.slice(-14), { id, x: e.clientX - r.left, y: e.clientY - r.top, g }]);
    setTimeout(() => setTrail((a) => a.filter((q) => q.id !== id)), 700);
  };
  const fill = () => {
    const c = ref.current;
    const g = c?.getContext("2d");
    if (!c || !g) return;
    g.fillStyle = resolve("var(--paper)");
    g.fillRect(0, 0, c.width, c.height);
    setSaved(false);
    setSaveFailed(false);
  };
  useEffect(fill, []);
  const pos = (e: React.PointerEvent) => {
    const c = ref.current!;
    const r = c.getBoundingClientRect();
    return [
      (e.clientX - r.left) * (c.width / r.width),
      (e.clientY - r.top) * (c.height / r.height),
    ] as const;
  };
  const down = (e: React.PointerEvent) => {
    const g = ref.current?.getContext("2d");
    if (!g) return;
    if (stamp) {
      const [x, y] = pos(e);
      g.font = `${size * 9}px serif`;
      g.textAlign = "center";
      g.textBaseline = "middle";
      g.fillText(stamp, x, y);
      chime(NOTES[Math.floor(Math.random() * NOTES.length)]!);
      spark(e, "✨");
      setSaved(false);
      return;
    }
    ref.current!.setPointerCapture(e.pointerId);
    drawing.current = true;
    const [x, y] = pos(e);
    g.beginPath();
    g.moveTo(x, y);
    g.lineTo(x + 0.1, y);
    g.lineCap = "round";
    g.lineJoin = "round";
    g.lineWidth = eraser ? size * 3 : size;
    g.strokeStyle = eraser
      ? resolve("var(--paper)")
      : rainbow
        ? `hsl(${hue.current} 80% 60%)`
        : resolve(color);
    g.stroke();
    setSaved(false);
  };
  const move = (e: React.PointerEvent) => {
    if (!drawing.current) return;
    const g = ref.current!.getContext("2d")!;
    const [x, y] = pos(e);
    if (rainbow && !eraser) {
      hue.current = (hue.current + 6) % 360;
      g.strokeStyle = `hsl(${hue.current} 80% 60%)`;
      g.lineTo(x, y);
      g.stroke();
      g.beginPath();
      g.moveTo(x, y);
    } else {
      g.lineTo(x, y);
      g.stroke();
    }
    const now = Date.now();
    if (!eraser && now - last.current > 120) {
      last.current = now;
      spark(e, rainbow ? "🌈" : "✨");
    }
  };
  return (
    <div className="space-y-3">
      <CharacterSay who="marko" size="sm" mood={saved ? "cheer" : "think"} text={t(prompt)} />
      <div className="relative">
        <canvas
          ref={ref}
          width={900}
          height={700}
          onPointerDown={down}
          onPointerMove={move}
          onPointerUp={() => (drawing.current = false)}
          onPointerCancel={() => (drawing.current = false)}
          className="paper-card aspect-[9/7] w-full touch-none rounded-3xl"
          aria-label={t("Аркуш для малювання")}
        />
        <div
          className="pointer-events-none absolute inset-0 overflow-hidden rounded-3xl"
          aria-hidden
        >
          {trail.map((p) => (
            <span
              key={p.id}
              className="absolute text-lg animate-stagepop"
              style={{ left: p.x - 10, top: p.y - 10 }}
            >
              {p.g}
            </span>
          ))}
          {party > 0 &&
            [8, 20, 34, 50, 64, 78, 90].map((l, k) => (
              <span
                key={`${party}-${l}`}
                className="absolute top-0 text-3xl animate-petal"
                style={{ left: `${l}%`, animationDelay: `${k * 0.12}s` }}
              >
                {STAMPS[k]}
              </span>
            ))}
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2" role="group" aria-label={t("Наліпки")}>
        {STAMPS.map((g) => (
          <button
            key={g}
            type="button"
            onClick={() => {
              sfx("select");
              setStamp(stamp === g ? null : g);
            }}
            aria-pressed={stamp === g}
            aria-label={t("Наліпка")}
            className={`h-11 w-11 rounded-2xl text-2xl transition-transform ${stamp === g ? "scale-125 bg-honey/40 ring-4 ring-ring animate-wiggle" : "bg-secondary active:scale-90"}`}
          >
            {g}
          </button>
        ))}
        <Btn
          variant={rainbow && !stamp ? "primary" : "soft"}
          aria-pressed={rainbow && !stamp}
          onClick={() => {
            setRainbow(!rainbow);
            setStamp(null);
            setEraser(false);
          }}
        >
          {t("🌈 Веселковий пензлик")}
        </Btn>
      </div>
      {stamp && (
        <p className="text-center text-sm font-bold">
          {t("Торкнись аркуша, щоб поставити наліпку")}
        </p>
      )}
      <div className="flex flex-wrap items-center gap-2" role="group" aria-label={t("Кольори")}>
        {COLORS.map((c) => (
          <button
            key={c}
            onClick={() => {
              setColor(c);
              setEraser(false);
              setStamp(null);
              setRainbow(false);
            }}
            aria-label={t("Колір")}
            aria-pressed={color === c && !eraser}
            className={`h-11 w-11 rounded-full border-4 ${color === c && !eraser ? "border-primary" : "border-paper"} shadow-soft`}
            style={{ background: c }}
          />
        ))}
        <Btn
          variant={eraser ? "primary" : "soft"}
          aria-label={t("Гумка")}
          aria-pressed={eraser}
          onClick={() => {
            setEraser(!eraser);
            setStamp(null);
          }}
        >
          <Eraser size={18} />
        </Btn>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {[4, 8, 16].map((s) => (
          <Btn
            key={s}
            variant={size === s ? "primary" : "soft"}
            aria-pressed={size === s}
            onClick={() => setSize(s)}
          >
            {s === 4 ? t("Тонкий") : s === 8 ? t("Середній") : t("Товстий")}
          </Btn>
        ))}
        <Btn variant="soft" onClick={fill}>
          {t("Очистити")}
        </Btn>
        <Btn
          variant="honey"
          onClick={() => {
            const canvas = ref.current;
            if (!canvas || saved) return;
            const persisted = addDrawing(canvas.toDataURL("image/jpeg", 0.7));
            if (persisted) markDone(id);
            setSaved(persisted);
            setSaveFailed(!persisted);
            setParty((n) => n + 1);
            [523, 659, 784, 1047].forEach((f, k) => setTimeout(() => chime(f), k * 140));
          }}
        >
          {t("Зберегти")}
        </Btn>
      </div>
      {saved && (
        <p aria-live="polite" className="font-semibold">
          {t("Збережено лише на цьому пристрої.")}{" "}
          <Link to={"/studio/gallery" as never} className="underline">
            {t("Мої малюнки")}
          </Link>
        </p>
      )}
      {saveFailed && (
        <p role="alert">
          {t(
            "Не вдалося зберегти на пристрої. Малюнок поки доступний тут; перевір вільне місце й спробуй ще раз.",
          )}
        </p>
      )}
    </div>
  );
}

export const Draw = () => (
  <Canvas id="studio-draw" prompt="Малюй усе, що хочеш. Тут немає неправильних ліній." />
);
export const Feel = () => (
  <Canvas
    id="studio-feel"
    prompt="Якби твоє почуття зараз було кольором чи формою — яким би воно було? Намалюй його."
  />
);

export function ColorFlower() {
  const t = useT();
  const [fills, setFills] = useState<string[]>(Array(13).fill("var(--paper)"));
  const [color, setColor] = useState(COLORS[1]!);
  const [popped, setPopped] = useState<number | null>(null);
  const paint = (k: number) => {
    const next = fills.map((f, j) => (j === k ? color : f));
    setFills(next);
    setPopped(k);
    chime(NOTES[k % NOTES.length]!);
    if (!fills.every((f) => f !== "var(--paper)") && next.every((f) => f !== "var(--paper)")) {
      markDone("studio-color");
      [523, 659, 784, 1047].forEach((f, j) => setTimeout(() => chime(f), 300 + j * 140));
    }
  };
  const full = fills.every((f) => f !== "var(--paper)");
  return (
    <div className="space-y-4 text-center">
      <CharacterSay
        who="solomiya"
        size="sm"
        mood={fills[12] !== "var(--paper)" ? "cheer" : "talk"}
        text={t("Обери колір і торкнись пелюстки. Соняшник може бути будь-якого кольору!")}
      />
      <div className="relative mx-auto max-w-sm">
        <svg
          viewBox="-110 -110 220 220"
          className={`paper-card w-full rounded-3xl p-3 ${full ? "animate-[spin_12s_linear_infinite]" : ""}`}
          role="group"
          aria-label={t("Соняшник для розфарбовування")}
        >
          {Array.from({ length: 12 }, (_, k) => (
            <ellipse
              key={k}
              cx="0"
              cy="-62"
              rx="18"
              ry="38"
              transform={`rotate(${k * 30})${popped === k ? " scale(1.12)" : ""}`}
              fill={fills[k]}
              stroke="var(--ink)"
              strokeWidth="2"
              role="button"
              tabIndex={0}
              aria-label={`${t("Соняшник для розфарбовування")} ${k + 1}`}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  paint(k);
                }
              }}
              onClick={() => paint(k)}
              className="cursor-pointer transition-all duration-300"
              style={{ transformOrigin: "0 0" }}
            />
          ))}
          <circle
            r="34"
            fill={fills[12]}
            stroke="var(--ink)"
            strokeWidth="2"
            role="button"
            tabIndex={0}
            aria-label={`${t("Соняшник для розфарбовування")} 13`}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                paint(12);
              }
            }}
            onClick={() => paint(12)}
            className="cursor-pointer"
          />
          {fills[12] !== "var(--paper)" && (
            <text textAnchor="middle" dominantBaseline="middle" fontSize="26" pointerEvents="none">
              😊
            </text>
          )}
        </svg>
        {full && (
          <div className="pointer-events-none absolute inset-0" aria-hidden>
            {["🐝", "🦋", "🐞", "🐝"].map((g, k) => (
              <span
                key={k}
                className="absolute text-3xl animate-float"
                style={{
                  left: `${[5, 80, 10, 75][k]}%`,
                  top: `${[8, 15, 78, 72][k]}%`,
                  animationDelay: `${k * 0.6}s`,
                }}
              >
                {g}
              </span>
            ))}
          </div>
        )}
      </div>
      <p className="text-sm font-bold" aria-live="polite">
        {full
          ? t("Твій соняшник розквіт! 🌻")
          : t("Розфарбовано: {n} з {m}", {
              n: fills.filter((f) => f !== "var(--paper)").length,
              m: 13,
            })}
      </p>
      <div className="flex flex-wrap justify-center gap-2">
        {COLORS.map((c) => (
          <button
            key={c}
            onClick={() => setColor(c)}
            aria-label={t("Колір")}
            aria-pressed={color === c}
            className={`h-11 w-11 rounded-full border-4 ${color === c ? "border-primary" : "border-paper"} shadow-soft`}
            style={{ background: c }}
          />
        ))}
      </div>
      <Btn
        variant="soft"
        onClick={() => {
          setFills(Array(13).fill("var(--paper)"));
          setPopped(null);
        }}
      >
        {t("Почати знову")}
      </Btn>
    </div>
  );
}

export function Gallery() {
  const t = useT();
  const lang = useLang();
  const drawings = useStore((s) => s.drawings);
  if (!drawings.length)
    return (
      <div className="paper-card p-6 text-center">
        <CharacterSay
          who="marko"
          size="sm"
          text={t("Тут поки порожньо. Намалюй щось — і воно з’явиться тут.")}
        />
        <Link
          to={"/studio/draw" as never}
          className="mt-4 inline-flex min-h-12 items-center rounded-full bg-primary px-5 font-bold text-primary-foreground"
        >
          {t("Малювати")}
        </Link>
      </div>
    );
  return (
    <div className="space-y-3">
      <CharacterSay
        who="marko"
        size="sm"
        mood="cheer"
        autoSpeak={false}
        text={t("Ці малюнки зберігаються лише на цьому пристрої.")}
      />
      <ul className="grid grid-cols-2 gap-3">
        {[...drawings].reverse().map((d) => (
          <li key={d.id} className="paper-card overflow-hidden p-2">
            <img
              src={d.data}
              alt={t("Малюнок від {d}", { d: new Date(d.at).toLocaleDateString(localeOf(lang)) })}
              className="w-full rounded-2xl"
            />
            <div className="mt-2 flex items-center justify-between px-1 text-sm">
              <span>{new Date(d.at).toLocaleDateString(localeOf(lang))}</span>
              <button
                onClick={() => removeDrawing(d.id)}
                aria-label={t("Видалити малюнок")}
                className="flex h-11 w-11 items-center justify-center rounded-full bg-secondary"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
