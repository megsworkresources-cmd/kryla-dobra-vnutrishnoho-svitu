import { useCallback, useEffect, useRef, useState } from "react";
import { RotateCcw, Volume2 } from "lucide-react";
import { Btn } from "@/components/Scene";
import { CharacterSay } from "@/components/Character";
import { Glyph } from "@/components/Glyph";
import { chime, sfx, useAudioUnlocked } from "@/lib/audio";
import { useT } from "@/lib/i18n";
import { markDone } from "@/lib/store";
import { COUNT_ROUNDS, PATTERN_ROUNDS } from "@/content/game-rounds";

/* ---------- 1. Repeat the melody ---------- */
const MELODY_PADS = [
  { icon: "🌻", name: "Соняшник", note: 523 },
  { icon: "🌼", name: "Ромашка", note: 587 },
  { icon: "🌷", name: "Тюльпан", note: 659 },
  { icon: "🌸", name: "Сакура", note: 784 },
];
const FIRST_MELODY = [0, 2];
const MELODY_MAX = 6;

export function Melody() {
  const t = useT();
  const audioReady = useAudioUnlocked();
  const [sequence, setSequence] = useState<number[]>(FIRST_MELODY);
  const [input, setInput] = useState<number[]>([]);
  const [phase, setPhase] = useState<"listen" | "repeat" | "done">("listen");
  const [message, setMessage] = useState("");
  const timers = useRef<number[]>([]);

  const stop = useCallback(() => {
    timers.current.forEach((id) => window.clearTimeout(id));
    timers.current = [];
  }, []);

  const playSequence = useCallback(
    (next: number[]) => {
      if (!audioReady) return;
      stop();
      setInput([]);
      setMessage("");
      setPhase("listen");
      next.forEach((pad, k) => {
        timers.current.push(
          window.setTimeout(() => chime(MELODY_PADS[pad]?.note ?? 523), 500 + k * 640),
        );
      });
      timers.current.push(window.setTimeout(() => setPhase("repeat"), 520 + next.length * 640));
    },
    [audioReady, stop],
  );

  // Safari blocks audio until a real tap. Start the opening melody only after
  // the shared audio controller confirms that the gesture unlocked playback.
  useEffect(() => {
    if (!audioReady) return;
    playSequence(FIRST_MELODY);
    return stop;
  }, [audioReady, playSequence, stop]);

  // A hidden tab must not keep playing or leave the pads half-way through a melody.
  useEffect(() => {
    const pause = () => {
      if (!document.hidden) return;
      stop();
      setInput([]);
      setPhase("listen");
    };
    document.addEventListener("visibilitychange", pause);
    return () => document.removeEventListener("visibilitychange", pause);
  }, [stop]);

  const tap = (pad: number) => {
    if (phase !== "repeat") return;
    chime(MELODY_PADS[pad]?.note ?? 523);
    const next = [...input, pad];
    if (sequence[next.length - 1] !== pad) {
      sfx("soft");
      setInput([]);
      setPhase("listen");
      setMessage(t("Майже! Послухай мелодію ще раз."));
      timers.current.push(window.setTimeout(() => playSequence(sequence), 700));
      return;
    }
    if (next.length < sequence.length) {
      setInput(next);
      return;
    }
    sfx("confirm");
    if (sequence.length >= MELODY_MAX) {
      stop();
      setPhase("done");
      setMessage(t("Чудова мелодія! Ти повторив шість нот."));
      markDone("games-melody");
      return;
    }
    const grown = [...sequence, Math.floor(Math.random() * MELODY_PADS.length)];
    setSequence(grown);
    setPhase("listen");
    timers.current.push(window.setTimeout(() => playSequence(grown), 900));
  };

  const reset = () => {
    setSequence(FIRST_MELODY);
    playSequence(FIRST_MELODY);
  };

  if (phase === "done") {
    return (
      <div className="paper-card space-y-4 p-6 text-center">
        <CharacterSay who="solomiya" mood="cheer" size="sm" text={message} />
        <p className="font-display text-2xl font-bold">{t("Чудова мелодія!")}</p>
        <p>{t("🌻 Твій соняшник у саду трохи підріс.")}</p>
        <Btn onClick={reset}>
          <RotateCcw size={18} />
          {t("Грати ще раз")}
        </Btn>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <CharacterSay
        who="solomiya"
        size="sm"
        text={t("Послухай мелодію й повтори її, торкаючись квіток. Поспішати не треба.")}
      />
      <p role="status" className="text-center text-sm font-bold">
        {t("Нот у мелодії: {n} з {m}", { n: sequence.length, m: MELODY_MAX })}
      </p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {MELODY_PADS.map((pad, i) => (
          <Btn
            key={pad.name}
            aria-label={t("Квітка {n}", { n: i + 1 })}
            disabled={phase !== "repeat"}
            variant={input.includes(i) ? "honey" : "soft"}
            onClick={() => tap(i)}
            className="flex h-28 min-w-0 flex-col items-center justify-center gap-1 rounded-3xl"
          >
            <Glyph emoji={pad.icon} className="h-10 w-10" />
            <span className="text-sm">{t(pad.name)}</span>
          </Btn>
        ))}
      </div>
      <div className="flex flex-wrap justify-center gap-2">
        <Btn
          variant="soft"
          onClick={() => playSequence(sequence)}
          disabled={!audioReady}
          className="inline-flex items-center gap-2"
        >
          <Volume2 size={18} />
          {t("Послухати")}
        </Btn>
        <Btn
          variant="soft"
          aria-label={t("Почати спочатку")}
          onClick={reset}
          disabled={!audioReady}
        >
          <RotateCcw size={18} />
        </Btn>
      </div>
      <p aria-live="polite" className="min-h-6 text-center font-bold">
        {message}
      </p>
    </div>
  );
}

/* ---------- 2. Quiet patterns ---------- */
export function Patterns() {
  const t = useT();
  const [round, setRound] = useState(0);
  const [message, setMessage] = useState("");
  const [done, setDone] = useState(false);
  const current = PATTERN_ROUNDS[round];
  const total = PATTERN_ROUNDS.length;

  const choose = (name: string) => {
    if (!current || done) return;
    if (name === current.answer.name) {
      sfx("confirm");
      setMessage(t("Так! Візерунок продовжується."));
      if (round + 1 >= total) {
        setDone(true);
        markDone("games-pattern");
        return;
      }
      setRound(round + 1);
      return;
    }
    sfx("soft");
    setMessage(t("Спробуй іншу фігуру — візерунок підкаже."));
  };

  if (done)
    return (
      <div className="paper-card space-y-3 p-6 text-center">
        <p className="font-display text-2xl font-bold">{t("Усі візерунки склалися! 🧩")}</p>
        <p>{t("🌻 Твій соняшник у саду трохи підріс.")}</p>
        <Btn
          onClick={() => {
            setRound(0);
            setDone(false);
            setMessage("");
          }}
        >
          {t("Ще раз")}
        </Btn>
      </div>
    );

  if (!current) return null;
  return (
    <div className="space-y-4">
      <CharacterSay
        who="marko"
        size="sm"
        text={t("Подивись на візерунок і обери, яка фігура буде далі.")}
      />
      <p role="status" className="text-center text-sm font-bold">
        {t("Візерунок {n} з {m}", { n: round + 1, m: total })}
      </p>
      <div className="paper-card flex flex-wrap items-center justify-center gap-2 p-5">
        {current.pattern.map((shape, k) => (
          <span
            key={`${round}-${k}`}
            className="text-3xl animate-pop"
            style={{ animationDelay: `${k * 60}ms` }}
            aria-hidden
          >
            <Glyph emoji={shape.icon} className="h-9 w-9" />
          </span>
        ))}
        <span className="opacity-60" aria-hidden>
          <Glyph name="chat" className="h-9 w-9" />
        </span>
      </div>
      <p className="text-center font-bold">{t("Яка фігура буде далі?")}</p>
      <div className="grid grid-cols-3 gap-2">
        {current.options.map((shape) => (
          <Btn
            key={shape.name}
            variant="soft"
            aria-label={t(shape.name)}
            onClick={() => choose(shape.name)}
            className="flex h-24 min-w-0 flex-col items-center justify-center gap-1 rounded-3xl"
          >
            <Glyph emoji={shape.icon} className="h-9 w-9" />
            <span className="text-sm">{t(shape.name)}</span>
          </Btn>
        ))}
      </div>
      <p aria-live="polite" className="min-h-6 text-center font-bold">
        {message}
      </p>
    </div>
  );
}

/* ---------- 3. Count the stars ---------- */
const NUMBER_CHOICES = [1, 2, 3, 4, 5, 6];

export function Counting() {
  const t = useT();
  const [round, setRound] = useState(0);
  const [tapped, setTapped] = useState<number[]>([]);
  const [message, setMessage] = useState("");
  const [done, setDone] = useState(false);
  const current = COUNT_ROUNDS[round];
  const total = current?.stars.length ?? 0;

  const choose = (n: number) => {
    if (!current || done) return;
    if (n === total) {
      sfx("confirm");
      setMessage(t("Правильно!"));
      if (round + 1 >= COUNT_ROUNDS.length) {
        setDone(true);
        markDone("games-count");
        return;
      }
      setRound(round + 1);
      setTapped([]);
      return;
    }
    sfx("soft");
    setMessage(t("Порахуй ще раз, торкаючись зірочок."));
  };

  if (done)
    return (
      <div className="paper-card space-y-3 p-6 text-center">
        <p className="font-display text-2xl font-bold">{t("Усі зірочки пораховано! 🌠")}</p>
        <p>{t("🌻 Твій соняшник у саду трохи підріс.")}</p>
        <Btn
          onClick={() => {
            setRound(0);
            setDone(false);
            setTapped([]);
            setMessage("");
          }}
        >
          {t("Ще раз")}
        </Btn>
      </div>
    );

  if (!current) return null;
  return (
    <div className="space-y-4">
      <CharacterSay who="taras" size="sm" text={t("Порахуй зірочки й обери число.")} />
      <div className="night-card relative h-64 overflow-hidden">
        {current.stars.map(([x, y], k) => (
          <button
            key={`${round}-${k}`}
            type="button"
            aria-label={t("Зірочка {n}", { n: k + 1 })}
            onClick={() => {
              chime(523 + k * 70);
              setTapped((seen) => (seen.includes(k) ? seen : [...seen, k]));
            }}
            className="absolute flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full"
            style={{ left: `${x}%`, top: `${y}%` }}
          >
            <span
              className={`text-3xl ${tapped.includes(k) ? "text-honey" : "animate-twinkle"}`}
              aria-hidden
            >
              ⭐
            </span>
          </button>
        ))}
      </div>
      <p role="status" className="text-center text-sm font-bold">
        {t("Пораховано: {n} з {m}", { n: tapped.length, m: total })}
      </p>
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
        {NUMBER_CHOICES.map((n) => (
          <Btn key={n} variant="soft" onClick={() => choose(n)} className="tabular-nums">
            {n}
          </Btn>
        ))}
      </div>
      <p aria-live="polite" className="min-h-6 text-center font-bold">
        {message}
      </p>
    </div>
  );
}
