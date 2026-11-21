import { CharacterSay } from "@/components/Character";
import { useEffect, useRef, useState } from "react";
import { Pause, Play, RotateCcw } from "lucide-react";
import { Btn, DoneCard } from "@/components/Scene";
import { Guided, Narration } from "@/components/Activity";
import { markDone, pick, useStore } from "@/lib/store";
import { speak, stopSpeaking } from "@/lib/speak";
import { useAudioUnlocked } from "@/lib/audio";
import { useT } from "@/lib/i18n";

export function Breathing({ kind }: { kind: "flower" | "wave" }) {
  const t = useT();
  const age = useStore((s) => s.age);
  const voice = useStore((s) => s.voice);
  const audioReady = useAudioUnlocked();
  const [duration, setDuration] = useState(60);
  const [elapsed, setElapsed] = useState(0);
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
  const inhale = age === "young" ? 3 : 4;
  const exhale = kind === "flower" ? inhale + 2 : inhale;
  const period = inhale + exhale;
  const isInhale = elapsed % period < inhale;
  const phase = isInhale ? t("Вдих") : t("Видих");
  const phaseLeft = isInhale ? inhale - (elapsed % period) : period - (elapsed % period);
  useEffect(() => {
    if (!running) return;
    const timer = window.setInterval(() => setElapsed((x) => x + 1), 1000);
    return () => window.clearInterval(timer);
  }, [running]);
  useEffect(() => {
    if (started && elapsed >= duration && !done) {
      setRunning(false);
      setDone(true);
      markDone(`meadow-${kind}`);
      stopSpeaking();
    }
  }, [elapsed, duration, started, done, kind]);
  useEffect(() => {
    if (running && voice && audioReady) speak(isInhale ? t("М’який вдих") : t("Повільний видих"));
    return stopSpeaking;
  }, [phase, running, voice, audioReady, isInhale, t]);
  const reset = () => {
    setElapsed(0);
    setRunning(false);
    setStarted(false);
    setDone(false);
    stopSpeaking();
  };
  if (done)
    return (
      <DoneCard text={t("Дякую, що побув на лузі. Далі можна дихати звичайно.")} again={reset} />
    );
  return (
    <div className="space-y-4 text-center">
      {!started && (
        <div className="flex justify-center gap-2" aria-label={t("Тривалість")}>
          {[60, 120, 180].map((seconds) => (
            <Btn
              key={seconds}
              variant={duration === seconds ? "primary" : "soft"}
              aria-pressed={duration === seconds}
              onClick={() => setDuration(seconds)}
            >
              {seconds / 60} {t("хв")}
            </Btn>
          ))}
        </div>
      )}
      <BreathVisual
        key={`${kind}-${started}-${duration}`}
        kind={kind}
        running={running}
        inhale={inhale}
        exhale={exhale}
      />
      <div aria-live="polite">
        <p className="font-display text-3xl font-bold">
          {started ? (running ? phase : t("Пауза")) : t("У своєму темпі")}
        </p>
        <p className="mt-1 text-lg tabular-nums">
          {running ? phaseLeft : t("Без затримки дихання")}
        </p>
      </div>
      <p className="text-sm tabular-nums" role="timer">
        {Math.floor(Math.max(0, duration - elapsed) / 60)}:
        {String(Math.max(0, duration - elapsed) % 60).padStart(2, "0")}
      </p>
      <div className="flex flex-wrap justify-center gap-2">
        <Btn
          onClick={() => {
            setStarted(true);
            setRunning(!running);
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
              markDone(`meadow-${kind}`);
            }}
          >
            {t("На сьогодні досить")}
          </Btn>
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
            young: "Нюхай квітку. Потім легко подуй на пелюстки. Дихай так, як зручно тобі.",
            mid: "Дихай м’яко, без затримок. Якщо цей ритм незручний — зроби паузу й дихай звичайно.",
            older:
              "Не намагайся вдихати надто глибоко. Орієнтир — комфорт, а не точне потрапляння в ритм.",
          }),
        )}
      />
    </div>
  );
}

export function RelaxBody() {
  return (
    <Guided
      id="meadow-relax"
      ending="Твоє тіло заслуговує на відпочинок."
      steps={[
        {
          title: "Влаштуйся зручно",
          action: "settle",
          text: "Сядь або ляж так, щоб тілу було добре. Очі можна не заплющувати. Поміть, на що спираються ноги й спина.",
          options: ["Сиджу зручно", "Лежу зручно", "Хочу просто послухати"],
        },
        {
          title: "Долоні відпочивають",
          action: "squeeze",
          text: "Якщо зручно, легко стисни долоні, а потім розкрий. Не треба сильно напружуватися. Яка різниця?",
          options: ["Стали тепліші", "Стали м’якші", "Не помічаю різниці"],
        },
        {
          title: "Плечі опускаються",
          action: "shrug",
          text: "Підніми плечі зовсім трішки й відпусти. Дозволь щелепі розслабитися. Зроби звичайний видих.",
        },
        {
          title: "Ноги мають опору",
          action: "feet",
          text: "Поміть, як ноги торкаються підлоги чи ліжка. Можеш поворушити пальцями. Уяви, що вся зайва напруга повільно стікає вниз.",
        },
        {
          title: "Повертаємося",
          action: "look",
          text: "Озирнися. Знайди одну приємну річ поруч. Не потрібно почуватися інакше — ця пауза вже була турботою про себе.",
          options: ["Ще побуду тут", "Готовий рухатися далі"],
        },
      ]}
    />
  );
}

/** All visual motion shares one pauseable clock; reduced motion leaves a quiet still scene. */
function BreathVisual({
  kind,
  running,
  inhale,
  exhale,
}: {
  kind: "flower" | "wave";
  running: boolean;
  inhale: number;
  exhale: number;
}) {
  const t = useT();
  const reduced = useStore((s) => s.reduceMotion);
  const [systemReduced, setSystemReduced] = useState(false);
  const [time, setTime] = useState(0);
  const clock = useRef(0);
  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setSystemReduced(query.matches);
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);
  const still = reduced || systemReduced;
  useEffect(() => {
    if (!running || still) return;
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      clock.current += Math.min(now - last, 100) / 1000;
      last = now;
      setTime(clock.current);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [running, still]);
  const cycle = time % (inhale + exhale);
  const progress = cycle < inhale ? cycle / inhale : 1 - (cycle - inhale) / exhale;
  const open = still ? 0.45 : (1 - Math.cos(Math.PI * progress)) / 2;
  const drift = still ? 0 : Math.sin(time * 0.35);
  return kind === "wave" ? (
    <svg
      viewBox="0 0 320 210"
      className="mx-auto h-56 w-full max-w-sm overflow-hidden rounded-3xl"
      role="img"
      aria-label={t("Хвиля дихання")}
    >
      <rect width="320" height="210" fill="var(--sky)" opacity=".25" />
      <circle cx="256" cy="44" r="22" fill="var(--honey)" />
      <path
        d="M25 58 q12 -9 24 0 M53 42 q10 -8 20 0"
        fill="none"
        stroke="var(--paper)"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path d="M0 124 Q65 89 132 121 T320 118 V210 H0Z" fill="var(--sage)" opacity=".25" />
      <g transform={`translate(0 ${-38 * open})`}>
        <path
          d={`M-100 146 Q-60 124 -20 146 T60 146 T140 146 T220 146 T300 146 T380 146 T460 146 V260 H-100Z`}
          transform={`translate(${18 * drift} 0)`}
          fill="var(--sky)"
        />
        <g transform={`translate(${145 + 7 * drift} ${137 - 2 * open}) rotate(${3 * drift})`}>
          <path
            d="M-20 0 H20 L12 11 H-12Z"
            fill="var(--accent)"
            stroke="var(--ink)"
            strokeWidth="1.5"
          />
          <path d="M0 -3 V-35" stroke="var(--ink)" strokeWidth="2" />
          <path d="M-3 -33 L-3 -7 H-18Z" fill="var(--paper)" />
          <path d="M3 -30 L19 -7 H3Z" fill="var(--honey)" />
        </g>
        <path
          d="M-100 168 Q-60 150 -20 168 T60 168 T140 168 T220 168 T300 168 T380 168 T460 168 V260 H-100Z"
          transform={`translate(${-14 * drift} 0)`}
          fill="var(--primary)"
          opacity=".65"
        />
        <path
          d="M-100 168 Q-60 150 -20 168 T60 168 T140 168 T220 168 T300 168 T380 168 T460 168"
          transform={`translate(${-14 * drift} 0)`}
          fill="none"
          stroke="var(--paper)"
          strokeWidth="2"
          opacity=".65"
        />
        <path
          d="M-100 195 Q-60 180 -20 195 T60 195 T140 195 T220 195 T300 195 T380 195 T460 195 V270 H-100Z"
          transform={`translate(${10 * drift} 0)`}
          fill="var(--sky)"
          opacity=".7"
        />
      </g>
    </svg>
  ) : (
    <svg
      viewBox="0 0 260 260"
      className="mx-auto h-64 w-64 max-w-full"
      role="img"
      aria-label={t("Квітка дихання")}
    >
      <path
        d="M130 253 Q124 219 130 153"
        fill="none"
        stroke="var(--sage)"
        strokeWidth="7"
        strokeLinecap="round"
      />
      <path
        d="M128 216 Q89 217 83 184 Q118 181 128 216Z M129 232 Q168 231 179 203 Q145 199 129 232Z"
        fill="var(--sage)"
      />
      <path
        d="M89 190 L125 213 M170 210 L133 230"
        stroke="var(--primary)"
        strokeWidth="1.5"
        fill="none"
      />
      <g transform={`translate(130 113) scale(${0.72 + 0.28 * open})`}>
        {[0, 1].map((layer) => (
          <g key={layer} transform={`rotate(${layer * 12 + 2 * drift})`}>
            {Array.from({ length: 14 }, (_, i) => (
              <g key={i} transform={`rotate(${(i * 360) / 14})`}>
                <path
                  d="M-9 -21 C-28 -47 -20 -77 0 -91 C20 -77 28 -47 9 -21Z"
                  transform={`scale(${layer ? 0.86 : 1} ${0.72 + 0.28 * open})`}
                  fill={layer ? "var(--honey)" : "var(--accent)"}
                  stroke="var(--honey)"
                  strokeWidth="1.5"
                />
                <path
                  d="M0 -30 Q-3 -49 0 -73"
                  fill="none"
                  stroke="var(--accent-foreground)"
                  strokeWidth="1"
                  opacity=".22"
                />
              </g>
            ))}
          </g>
        ))}
        <circle r="30" fill="var(--accent-foreground)" />
        <circle r="25" fill="var(--ink)" />
        {Array.from({ length: 32 }, (_, i) => {
          const angle = i * 2.39996;
          const radius = 3.6 * Math.sqrt(i);
          return (
            <ellipse
              key={i}
              cx={Math.cos(angle) * radius}
              cy={Math.sin(angle) * radius}
              rx="1.8"
              ry="2.4"
              fill="var(--honey)"
              opacity=".7"
              transform={`rotate(${(angle * 180) / Math.PI} ${Math.cos(angle) * radius} ${Math.sin(angle) * radius})`}
            />
          );
        })}
      </g>
    </svg>
  );
}
