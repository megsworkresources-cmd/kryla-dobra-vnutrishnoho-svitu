import { useEffect, useRef, useState } from "react";
import { Pause, Play, RotateCcw } from "lucide-react";
import { CharacterSay } from "@/components/Character";
import { Btn, DoneCard } from "@/components/Scene";
import { TypedExamples } from "@/components/TypeOwn";
import { EMOTIONS, type Emotion } from "@/content/emotions";
import { markDone, pick, useStore } from "@/lib/store";
import { speak, stopSpeaking } from "@/lib/speak";
import { chime, sfx, useAudioUnlocked } from "@/lib/audio";
import { useT } from "@/lib/i18n";

/**
 * The three calming experiences named in the child-wellness brief:
 * square breathing, a magic jar for a worry, and «Як твоє серденько?».
 *
 * They share one rule with the rest of the app: no exercise ever asks a child to
 * hold their breath, nothing a child types is stored, and every timed step also
 * finishes from a tap or a timer rather than an animation.
 */

/** One pauseable clock for the whole square, with a still frame for reduced motion. */
function useStillFrames() {
  const reduced = useStore((s) => s.reduceMotion);
  const [systemReduced, setSystemReduced] = useState(false);
  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setSystemReduced(query.matches);
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);
  return reduced || systemReduced;
}

/** The four sides of the square, so the side being breathed is lit up. */
const SIDES = [
  [30, 30, 210, 30],
  [210, 30, 210, 210],
  [210, 210, 30, 210],
  [30, 210, 30, 30],
] as const;

function squarePoint(index: number, part: number) {
  const u = Math.min(1, Math.max(0, part));
  switch (index) {
    case 0:
      return [30 + 180 * u, 30] as const;
    case 1:
      return [210, 30 + 180 * u] as const;
    case 2:
      return [210 - 180 * u, 210] as const;
    default:
      return [30, 210 - 180 * u] as const;
  }
}

export function SquareBreath() {
  const t = useT();
  const age = useStore((s) => s.age);
  const voice = useStore((s) => s.voice);
  const soundOn = useStore((s) => s.sound);
  const audioReady = useAudioUnlocked();
  const still = useStillFrames();
  // A longer side for older children; every side is one full inhale or exhale.
  const side = age === "young" ? 4 : 5;
  const lap = side * 4;
  const laps = 4;
  const duration = lap * laps;
  const clock = useRef(0);
  const [time, setTime] = useState(0);
  const [started, setStarted] = useState(false);
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const pauseWhenHidden = () => {
      if (document.hidden) setRunning(false);
    };
    document.addEventListener("visibilitychange", pauseWhenHidden);
    return () => document.removeEventListener("visibilitychange", pauseWhenHidden);
  }, []);

  useEffect(() => {
    if (!running) return;
    if (still) {
      // No animation frames at all when motion is reduced: the clock ticks once a second.
      const timer = window.setInterval(() => {
        clock.current += 1;
        setTime(clock.current);
      }, 1000);
      return () => window.clearInterval(timer);
    }
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      clock.current += Math.min(now - last, 120) / 1000;
      last = now;
      setTime(clock.current);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [running, still]);

  const cycle = time % lap;
  const index = Math.min(3, Math.floor(cycle / side));
  const part = (cycle - index * side) / side;
  const inhale = index % 2 === 0;
  const left = Math.max(1, Math.ceil(side - (cycle - index * side)));
  const lapNumber = Math.min(laps, Math.floor(time / lap) + 1);
  const phase = inhale ? t("Вдих") : t("Видих");

  useEffect(() => {
    if (started && time >= duration && !done) {
      setRunning(false);
      setDone(true);
      markDone("meadow-square");
      stopSpeaking();
    }
  }, [time, duration, started, done]);

  useEffect(() => {
    if (!voice || !audioReady) return;
    speak(inhale ? t("М’який вдих") : t("Повільний видих"));
    return stopSpeaking;
  }, [inhale, voice, audioReady, t]);

  // A soft note at each corner lets the square be followed with closed eyes.
  useEffect(() => {
    if (!started || !running || !soundOn) return;
    chime(inhale ? 523 : 392);
  }, [index, started, running, soundOn, inhale]);

  const reset = () => {
    clock.current = 0;
    setTime(0);
    setRunning(false);
    setStarted(false);
    setDone(false);
    stopSpeaking();
  };

  if (done)
    return (
      <DoneCard
        who="olenka"
        text={t("Чотири кола пройдено. Квадрат можна згадати навіть заплющивши очі.")}
        again={reset}
      />
    );

  const [x, y] = squarePoint(index, still ? 0.5 : part);
  const edge = SIDES[index] ?? SIDES[0];

  return (
    <div className="space-y-4 text-center">
      <svg
        viewBox="0 0 240 240"
        className="mx-auto h-32 w-32 max-w-full min-[380px]:h-44 min-[380px]:w-44"
        role="img"
        aria-label={t("Квадрат дихання")}
      >
        <rect x="30" y="30" width="180" height="180" rx="16" fill="var(--paper)" opacity=".55" />
        <rect
          x="30"
          y="30"
          width="180"
          height="180"
          rx="16"
          fill="none"
          stroke="var(--sage)"
          strokeWidth="9"
          opacity=".4"
        />
        {[
          [30, 30],
          [210, 30],
          [210, 210],
          [30, 210],
        ].map(([cx, cy]) => (
          <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="9" fill="var(--honey)" opacity=".85" />
        ))}
        {started && (
          <line
            x1={edge[0]}
            y1={edge[1]}
            x2={edge[2]}
            y2={edge[3]}
            stroke="var(--primary)"
            strokeWidth="7"
            strokeLinecap="round"
            opacity=".45"
          />
        )}
        <circle cx={x} cy={y} r="21" fill="var(--honey)" opacity=".28" />
        <circle cx={x} cy={y} r="12" fill="var(--honey)" stroke="var(--ink)" strokeWidth="1.5" />
        {started ? (
          <text
            x="120"
            y="126"
            textAnchor="middle"
            className="fill-ink font-display"
            fontSize="26"
            fontWeight="600"
          >
            {left}
          </text>
        ) : (
          <text x="120" y="130" textAnchor="middle" className="fill-sage" fontSize="30">
            ✿
          </text>
        )}
      </svg>
      <div className="flex flex-wrap justify-center gap-2">
        <Btn
          onClick={() => {
            setStarted(true);
            setRunning((value) => !value);
          }}
          className="inline-flex items-center gap-2"
        >
          {running ? <Pause size={18} /> : <Play size={18} />}
          {running ? t("Пауза") : started ? t("Продовжити") : t("Почати")}
        </Btn>
        <Btn variant="soft" aria-label={t("Почати спочатку")} onClick={reset}>
          <RotateCcw size={20} />
        </Btn>
        {started && (
          <Btn
            variant="soft"
            onClick={() => {
              setRunning(false);
              setDone(true);
              markDone("meadow-square");
            }}
          >
            {t("На сьогодні досить")}
          </Btn>
        )}
      </div>
      <div className="paper-card mx-auto max-w-sm space-y-1 px-4 py-3" aria-live="polite">
        {started ? (
          <>
            <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
              {t("Коло {i} з {n}", { i: lapNumber, n: laps })}
            </p>
            <p className="font-display text-2xl font-bold">{running ? phase : t("Пауза")}</p>
            <p className="text-sm tabular-nums">
              {running
                ? t("Сторона {i} з 4 · {s} с", { i: index + 1, s: left })
                : t("Натисни, коли будеш готовий.")}
            </p>
          </>
        ) : (
          <>
            <p className="font-display text-lg font-bold">{t("Чотири сторони — чотири подихи")}</p>
            <p className="text-sm">
              {t("Кожна сторона — один спокійний вдих або видих. Подих не затримуй.")}
            </p>
          </>
        )}
      </div>
      <CharacterSay
        who="olenka"
        size="sm"
        mood="calm"
        autoSpeak={!running}
        action={running ? "breathe" : undefined}
        text={t(
          pick(age, {
            young:
              "Веди пальчиком по квадрату. Вдих — рука йде однією стороною, видих — наступною.",
            mid: "Погляд іде по стороні — і подих іде разом із ним. Не поспішай, квадрат нікуди не дінеться.",
            older:
              "Квадрат лише підказує ритм. Комфорт важливіший за точність: якщо хочеться вдихнути раніше — так і роби.",
          }),
        )}
      />
    </div>
  );
}

export function MagicJar() {
  const t = useT();
  const [chosen, setChosen] = useState<string | null>(null);
  const [words, setWords] = useState("");
  const [step, setStep] = useState<"fill" | "rest" | "done">("fill");
  const named = words.trim().length > 0;
  const ready = Boolean(chosen) || named;

  const reset = () => {
    setChosen(null);
    setWords("");
    setStep("fill");
  };

  if (step === "done")
    return (
      <DoneCard
        who="daryna"
        text={t("Банка стоїть тихо й нікуди не поспішає. Повернешся до неї, коли сам захочеш.")}
        again={reset}
      />
    );

  return (
    <div className="space-y-4 text-center">
      <svg
        viewBox="0 0 200 230"
        className="mx-auto h-28 w-auto max-w-full min-[380px]:h-36"
        role="img"
        aria-label={step === "rest" ? t("Банка з турботою") : t("Порожня чарівна банка")}
      >
        <rect x="52" y="16" width="96" height="20" rx="9" fill="var(--honey)" />
        <rect
          x="42"
          y="36"
          width="116"
          height="176"
          rx="30"
          fill="var(--paper)"
          stroke="var(--sage)"
          strokeWidth="5"
        />
        <path d="M60 62 Q66 58 72 62" stroke="var(--paper)" strokeWidth="6" fill="none" />
        {step === "rest" ? (
          <g opacity=".95">
            <ellipse cx="100" cy="126" rx="40" ry="26" fill="var(--lavender)" opacity=".7" />
            <ellipse cx="78" cy="118" rx="22" ry="16" fill="var(--sky)" opacity=".8" />
            <ellipse cx="118" cy="112" rx="18" ry="13" fill="var(--sky)" opacity=".75" />
            <circle cx="88" cy="130" r="2.5" fill="var(--ink)" opacity=".55" />
            <circle cx="106" cy="130" r="2.5" fill="var(--ink)" opacity=".55" />
            <path
              d="M94 138 Q100 143 106 138"
              stroke="var(--ink)"
              strokeWidth="2"
              fill="none"
              opacity=".55"
            />
          </g>
        ) : (
          <g opacity=".35">
            <ellipse cx="100" cy="170" rx="34" ry="8" fill="var(--sage)" />
          </g>
        )}
        <path
          d="M62 70 Q58 120 66 168"
          stroke="var(--paper)"
          strokeWidth="7"
          fill="none"
          opacity=".9"
        />
      </svg>

      {step === "fill" ? (
        <div className="space-y-4 text-left">
          <div className="paper-card space-y-3 p-4">
            <p className="font-display text-xl font-bold">{t("Що сьогодні найважче?")}</p>
            <p className="text-sm text-muted-foreground">
              {t("Обери одне — або скажи своїми словами. Це не збережеться на пристрої.")}
            </p>
            <div className="grid grid-cols-2 gap-2">
              {["Урок", "Сварка", "Страх", "Самотність", "Не знаю"].map((word) => (
                <Btn
                  key={word}
                  variant={chosen === word ? "primary" : "soft"}
                  aria-pressed={chosen === word}
                  onClick={() => {
                    sfx("select");
                    setChosen(chosen === word ? null : word);
                  }}
                  className="h-auto py-3"
                >
                  {t(word)}
                </Btn>
              ))}
            </div>
            <Btn disabled={!ready} onClick={() => setStep("rest")} className="w-full">
              {t("Покласти в банку")}
            </Btn>
            <input
              value={words}
              onChange={(event) => setWords(event.target.value)}
              maxLength={80}
              aria-label={t("Моя турбота своїми словами")}
              placeholder={t("Наприклад: не хочу відповідати біля дошки")}
              className="min-h-12 w-full rounded-full bg-secondary px-4 text-base outline-none focus:ring-2 focus:ring-ring"
            />
            <TypedExamples
              value={words}
              examples={JAR_EXAMPLES}
              onPick={(example) => {
                setChosen(null);
                setWords(example);
              }}
            />
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="paper-card mx-auto max-w-sm space-y-2 p-4">
            <p className="font-display text-2xl font-bold">{t("Банка тримає це для тебе.")}</p>
            <p className="rounded-2xl bg-secondary px-3 py-2 text-base font-bold">
              {t("У банці: {w}", { w: chosen ?? words.trim() })}
            </p>
            <p className="text-base">
              {t(
                "Вона не забирає почуття назавжди — тільки дає перерву. Турбота почекає в банці, поки в тебе є сили на щось інше.",
              )}
            </p>
          </div>
          <p className="font-semibold">{t("Коли відкриємо банку?")}</p>
          <div className="flex flex-wrap justify-center gap-2">
            {["Не сьогодні", "Коли захочу"].map((when) => (
              <Btn
                key={when}
                variant="soft"
                onClick={() => {
                  sfx("confirm");
                  markDone("clouds-jar");
                  setStep("done");
                }}
              >
                {t(when)}
              </Btn>
            ))}
          </div>
          <p className="text-sm text-muted-foreground">
            {t("Обидві відповіді — слушні. Банку можна відкрити й пізніше, і зовсім скоро.")}
          </p>
        </div>
      )}
    </div>
  );
}

/** Bold enough to be worth keeping, gentle enough to be said out loud. */
const JAR_EXAMPLES = [
  "Не хочу відповідати біля дошки",
  "Посварився з другом",
  "Боюся темряви",
  "Багато домашніх завдань",
] as const;

const HEART_CHOICES: { word: string; emotion?: string; token: string }[] = [
  { word: "Радісно", emotion: "joy", token: "var(--honey)" },
  { word: "Спокійно", emotion: "calm", token: "var(--sage)" },
  { word: "Сумно", emotion: "sad", token: "var(--sky)" },
  { word: "Тривожно", emotion: "worry", token: "var(--lavender)" },
  { word: "Злюся", emotion: "anger", token: "var(--rose)" },
  { word: "Не знаю", token: "var(--secondary)" },
];

export function HeartCheck() {
  const t = useT();
  const [chosen, setChosen] = useState<string[]>([]);
  const [done, setDone] = useState(false);
  // A child may pick more than one feeling, as the reference screen invites.
  const picked = HEART_CHOICES.filter((item) => chosen.includes(item.word));
  const emotions = picked
    .map((item) => EMOTIONS.find((emotion) => emotion.id === item.emotion))
    .filter((emotion): emotion is Emotion => Boolean(emotion));
  const helps = [...new Set(emotions.flatMap((emotion) => emotion.helps))].slice(0, 4);
  const face = picked[picked.length - 1]?.token ?? "var(--secondary)";

  if (done)
    return (
      <DoneCard
        who="olenka"
        text={t("Серденько почуте. До нього можна повертатися стільки разів, скільки захочеш.")}
        again={() => {
          setChosen([]);
          setDone(false);
        }}
      />
    );

  return (
    <div className="space-y-4">
      <svg
        viewBox="0 0 200 180"
        className="mx-auto h-32 w-auto max-w-full min-[380px]:h-40"
        role="img"
        aria-label={t("Серце, яке показує, як тобі зараз")}
      >
        <path
          d="M100 168 C36 126 14 96 14 66 C14 40 34 22 58 22 C76 22 92 32 100 48 C108 32 124 22 142 22 C166 22 186 40 186 66 C186 96 164 126 100 168Z"
          fill={face}
          stroke="var(--ink)"
          strokeWidth="3"
          opacity={chosen.length ? "1" : ".9"}
        />
        <path
          d="M58 52 Q46 60 44 76"
          stroke="var(--paper)"
          strokeWidth="6"
          strokeLinecap="round"
          fill="none"
          opacity=".7"
        />
      </svg>
      <div className="paper-card mx-auto max-w-sm p-3 text-center">
        <p className="text-sm text-muted-foreground">
          {t("Немає неправильних почуттів. Можна обрати кілька — і нічого не пояснювати.")}
        </p>
      </div>
      <div className="grid grid-cols-2 gap-2 min-[420px]:grid-cols-3">
        {HEART_CHOICES.map((item) => (
          <Btn
            key={item.word}
            variant={chosen.includes(item.word) ? "primary" : "soft"}
            aria-pressed={chosen.includes(item.word)}
            onClick={() => {
              sfx("select");
              setChosen((list) =>
                list.includes(item.word)
                  ? list.filter((word) => word !== item.word)
                  : [...list, item.word],
              );
            }}
            className="h-auto py-3"
          >
            {t(item.word)}
          </Btn>
        ))}
      </div>
      {chosen.length > 0 && (
        <div className="space-y-3">
          <CharacterSay
            key={chosen.join("-")}
            who="olenka"
            size="sm"
            mood="calm"
            text={
              emotions.length > 1
                ? t("Кілька почуттів одночасно — це нормально. Вони всі справжні й усі твої.")
                : emotions[0]
                  ? t(emotions[0].about)
                  : t(
                      "Не знати — теж відповідь. Іноді почуттю ще потрібен час, щоб отримати назву.",
                    )
            }
          />
          <div className="paper-card space-y-2 p-4">
            <p className="font-bold">{t("Що може допомогти")}</p>
            <ul className="space-y-1">
              {(helps.length > 0
                ? helps
                : ["Побути тихо одну хвилинку", "Розказати дорослому", "Подихати з квіткою"]
              ).map((line) => (
                <li key={line} className="flex items-start gap-2 text-base">
                  <span aria-hidden className="mt-1 text-honey">
                    ✿
                  </span>
                  <span>{t(line)}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="text-center">
            <Btn
              onClick={() => {
                markDone("studio-heart");
                setDone(true);
              }}
            >
              {t("Далі")}
            </Btn>
          </div>
        </div>
      )}
    </div>
  );
}
