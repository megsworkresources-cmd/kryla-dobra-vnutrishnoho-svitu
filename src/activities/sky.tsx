import { CharacterSay } from "@/components/Character";
import { useEffect, useRef, useState } from "react";
import { Pause, Play, SkipBack, SkipForward } from "lucide-react";
import night from "@/assets/night.jpg";
import { Btn, DoneCard } from "@/components/Scene";
import { Guided } from "@/components/Activity";
import { StoryFilm } from "@/components/StoryFilm";
import { STORY_MEDIA } from "@/content/story-media";
import { markDone, useStore } from "@/lib/store";
import { speak, stopSpeaking } from "@/lib/speak";
import { useT } from "@/lib/i18n";
import { chime, sfx } from "@/lib/audio";
import { CHARACTERS, castFor } from "@/content/characters";

const FIREFLIES = [
  [12, 30],
  [30, 55],
  [48, 22],
  [64, 48],
  [80, 30],
  [88, 62],
] as const;

const STORIES: Record<string, string[]> = {
  lantern: [
    "У долині жив маленький ліхтарик Світлик. Усі ліхтарики мерехтіли швидко-швидко, а він — повільно й тихо.",
    "«Поспішай!» — казали йому. Світлик старався, але від поспіху його вогник тремтів і гас.",
    "Якось уночі в лісі заблукав зайчик. Швидкі вогники миготіли так, що він не міг роздивитися дорогу.",
    "А Світлик світив рівно й спокійно. Зайчик пішов за ним — крок за кроком — і знайшов дім.",
    "Відтоді Світлик знав: його тихий темп — теж дарунок. Кожен світить по-своєму.",
  ],
  bridge: [
    "По два боки струмка жили їжачок і білочка. Їм хотілося дружити, але між ними текла вода.",
    "Вони почали будувати місток. Їжачок хотів з гілок, білочка — з листя. Вони посварилися.",
    "Тоді білочка сказала: «Розкажи, чому гілки?» Їжачок пояснив: вони міцні.",
    "«А листя м’яке для лапок», — відповіла білочка. І вони поклали листя на гілки.",
    "Місток вийшов міцним і м’яким. Бо його збудували двоє, які вміли слухати.",
  ],
  seed: [
    "Маленька насінина соняшника сиділа в теплій квітці й боялася вітру.",
    "«Куди він мене понесе?» — думала вона. Але одного ранку вітер таки підхопив її.",
    "Було страшно й весело водночас. Насінина летіла над полем, над хатками й лелеками.",
    "Нарешті вона опустилася в м’яку землю. Там було темно й тихо, і вона трохи поплакала.",
    "А навесні з неї виріс новий соняшник. Сміливість — це не відсутність страху, а крок уперед разом із ним.",
  ],
  rain: [
    "Одного дня до лисички прийшов дощ і не захотів іти. Лисичці стало сумно.",
    "Вона сиділа біля вікна й не хотіла гратися. Друзі не знали, що сказати.",
    "Прийшов ведмедик. Він не казав «не сумуй». Просто сів поруч і поділився ковдрою.",
    "Вони пили теплий чай і слухали, як дощ стукає по даху. Сум трохи зменшився.",
    "Дощ пішов наступного ранку. А лисичка запам’ятала: у сумі добре, коли хтось поруч.",
  ],
  sleep: [
    "Сонце сховалося за пагорбом. Долина вдягає вечірню ковдру.",
    "Лелеки складають крила в гніздах. Соняшники тихенько опускають голівки.",
    "Світлячки запалюють маленькі вогники. Цвіркуни співають колискову.",
    "Твоє тіло стає важким і теплим. Плечі відпочивають, долоні м’якшають.",
    "Місяць дивиться згори й береже сон усієї долини. І твій теж. На добраніч.",
  ],
};

/** Floating things for each story scene, like the cartoons. */
const STORY_FX: Record<string, string[][]> = {
  lantern: [
    ["💡", "🌲"],
    ["💨", "💡"],
    ["🐰", "🌲", "✨"],
    ["💡", "🐰", "👣"],
    ["💡", "💛", "✨"],
  ],
  bridge: [
    ["🦔", "💧", "🐿️"],
    ["🌿", "🍂", "💢"],
    ["🐿️", "💬"],
    ["🍂", "🌿", "🦔"],
    ["🌉", "💛", "✨"],
  ],
  seed: [
    ["🌻", "🌰"],
    ["💨", "🌰"],
    ["🌰", "🕊️", "🏡"],
    ["🌱", "💧"],
    ["🌻", "☀️", "✨"],
  ],
  rain: [
    ["🌧️", "🦊"],
    ["🪟", "🦊", "💧"],
    ["🐻", "🧣"],
    ["🍵", "🌧️"],
    ["🌤️", "🦊", "🐻"],
  ],
  sleep: [
    ["🌅", "⛰️"],
    ["🕊️", "🌻"],
    ["✨", "🦗", "🎶"],
    ["🌙", "💤"],
    ["🌙", "⭐", "💤"],
  ],
};
const STAR_NOTES = [523, 587, 659, 784, 880, 1047];
const EMPTY_SCENES: string[] = [];

/** Guided video story: illustrated scenes that play on their own, with narration and controls. */
export function Story({ id }: { id: keyof typeof STORIES }) {
  const t = useT();
  const scenes = STORIES[id] ?? EMPTY_SCENES;
  const voice = useStore((s) => s.voice && s.sound);
  const [i, setI] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [t2, setT] = useState(0);
  const [done, setDone] = useState(false);
  useEffect(() => {
    const pauseWhenHidden = () => {
      if (document.hidden) setPlaying(false);
    };
    document.addEventListener("visibilitychange", pauseWhenHidden);
    return () => document.removeEventListener("visibilitychange", pauseWhenHidden);
  }, []);
  const effects = useRef<ReturnType<typeof setTimeout>[]>([]);
  useEffect(() => () => effects.current.forEach(clearTimeout), []);
  const [lit, setLit] = useState<number[]>([]);
  const [hop, setHop] = useState<string | null>(null);
  const fx = STORY_FX[id]?.[i] ?? ["✨"];
  const narrator = CHARACTERS[castFor("sky")[i % 2] ?? "solomiya"];
  const film = STORY_MEDIA[id];
  const len = Math.max(6, Math.round((scenes[i]?.length ?? 0) / 14));
  const finish = () => {
    setPlaying(false);
    stopSpeaking();
    markDone(`sky-${id}`);
    setDone(true);
  };
  const fin = useRef(finish);
  fin.current = finish;
  useEffect(() => {
    if (!playing) return;
    const timer = window.setInterval(() => setT((x) => x + 0.25), 250);
    return () => window.clearInterval(timer);
  }, [playing]);
  useEffect(() => {
    if (t2 < len) return;
    if (i >= scenes.length - 1) fin.current();
    else {
      setI(i + 1);
      setT(0);
    }
  }, [t2, len, i, scenes.length]);
  useEffect(() => {
    if (playing && voice && scenes[i]) speak(t(scenes[i]));
    return stopSpeaking;
  }, [i, playing, voice, scenes, t]);
  if (done)
    return (
      <DoneCard
        night
        text={t("Казка закінчилась. Вона залишиться з тобою.")}
        again={() => {
          setI(0);
          setT(0);
          setDone(false);
        }}
      />
    );
  const go = (n: number) => {
    setI(Math.min(Math.max(n, 0), scenes.length - 1));
    setT(0);
  };
  return (
    <div className="space-y-4">
      <div
        className="night-card relative overflow-hidden p-0"
        role="region"
        aria-label={t("Відео-казка")}
      >
        <div className="relative aspect-[4/3] overflow-hidden">
          {film ? (
            <StoryFilm
              src={film}
              poster={night}
              playing={playing}
              onPause={() => setPlaying(false)}
            />
          ) : (
            <img
              key={i}
              src={night}
              alt=""
              className={`h-full w-full object-cover ${playing ? "animate-kenburns" : ""}`}
              style={{ objectPosition: `${20 + i * 15}% 50%` }}
            />
          )}
          {[10, 30, 55, 72, 88].map((l, k) => (
            <span
              key={l}
              className="absolute h-1.5 w-1.5 rounded-full bg-moon animate-twinkle"
              style={{ left: `${l}%`, top: `${8 + k * 6}%`, animationDelay: `${k * 0.5}s` }}
              aria-hidden
            />
          ))}
          {FIREFLIES.map(([x, y], k) => {
            const on = lit.includes(k);
            return (
              <button
                key={k}
                type="button"
                aria-label={t("Засвітити світлячка")}
                aria-pressed={on}
                onClick={() => {
                  if (!on) {
                    chime(STAR_NOTES[lit.length % STAR_NOTES.length]!);
                    if (lit.length + 1 === FIREFLIES.length)
                      [523, 659, 784, 1047, 1319].forEach((f, j) =>
                        effects.current.push(setTimeout(() => chime(f), 250 + j * 130)),
                      );
                    setLit([...lit, k]);
                  } else sfx("select");
                }}
                className="absolute flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full"
                style={{ left: `${x}%`, top: `${y}%` }}
              >
                <span
                  className={`block rounded-full ${on ? "h-4 w-4 bg-honey shadow-lift animate-glow-on" : "h-2.5 w-2.5 bg-moon/60 animate-twinkle"}`}
                />
              </button>
            );
          })}
          {fx.map((g, k) => {
            const key = `${i}-${k}`;
            return (
              <button
                key={key}
                type="button"
                aria-label={t("Торкнутися")}
                onClick={() => {
                  setHop(key);
                  chime(STAR_NOTES[(k + i) % STAR_NOTES.length]!);
                  effects.current.push(setTimeout(() => setHop(null), 600));
                }}
                className={`absolute flex h-14 w-14 items-center justify-center text-4xl drop-shadow-lg ${hop === key ? "animate-pop" : "animate-float"}`}
                style={{
                  left: `${35 + k * 22}%`,
                  top: `${45 + (k % 2) * 18}%`,
                  animationDelay: `${k * 0.7}s`,
                }}
              >
                <span className={hop === key ? "animate-wiggle" : ""}>{g}</span>
              </button>
            );
          })}
          {lit.length === FIREFLIES.length && (
            <svg
              className="pointer-events-none absolute inset-0 h-full w-full"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              aria-hidden
            >
              <polyline
                points={FIREFLIES.map(([x, y]) => `${x},${y}`).join(" ")}
                fill="none"
                stroke="var(--honey)"
                strokeWidth="0.6"
                strokeDasharray="2 1.5"
                className="animate-fade-up"
              />
            </svg>
          )}
          <img
            key={`n${i}`}
            src={narrator.image}
            alt={t(narrator.name)}
            className={`absolute bottom-1 left-2 h-28 w-auto drop-shadow-lg sm:h-36 ${playing ? "animate-talk" : "animate-pop"}`}
          />
        </div>
        <p
          key={`t${i}`}
          className="min-h-28 animate-fade-up px-5 pt-4 text-lg leading-relaxed"
          aria-live="polite"
        >
          {t(scenes[i] ?? "")}
        </p>
        <div className="flex gap-1 p-3" aria-hidden>
          {scenes.map((_, k) => (
            <span key={k} className="h-1.5 flex-1 overflow-hidden rounded-full bg-dusk">
              <span
                className="block h-full bg-honey transition-all"
                style={{ width: k < i ? "100%" : k === i ? `${(t2 / len) * 100}%` : "0%" }}
              />
            </span>
          ))}
        </div>
      </div>
      <div className="flex items-center justify-center gap-2">
        <Btn
          variant="soft"
          aria-label={t("Попередня сцена")}
          onClick={() => go(i - 1)}
          disabled={i === 0}
        >
          <SkipBack size={20} />
        </Btn>
        <Btn
          variant="honey"
          onClick={() => setPlaying(!playing)}
          className="inline-flex items-center gap-2 px-8"
        >
          {playing ? <Pause size={20} /> : <Play size={20} />}
          {playing ? t("Пауза") : t("Дивитися")}
        </Btn>
        <Btn
          variant="soft"
          aria-label={t("Наступна сцена")}
          onClick={() => (i === scenes.length - 1 ? finish() : go(i + 1))}
        >
          <SkipForward size={20} />
        </Btn>
      </div>
      <p className="text-center text-sm font-bold">
        {lit.length < FIREFLIES.length
          ? t("Торкнись світлячків на картинці: {n} з {m}", { n: lit.length, m: FIREFLIES.length })
          : t("Усі світлячки світять для тебе ✨")}
      </p>
      <p className="text-center text-sm opacity-75">
        {t("Сцена {i} з {n}. Увімкни голос у налаштуваннях, щоб казку читали вголос.", {
          i: i + 1,
          n: scenes.length,
        })}
      </p>
    </div>
  );
}

export const Reflect = () => (
  <Guided
    night
    id="sky-reflect"
    ending="Твоя зірочка засвітилась на небі."
    steps={[
      { title: "Згадай свій день", text: "Подумай про сьогодні — без оцінок, просто згадай." },
      {
        title: "Маленька мить",
        text: "Яка мить була теплою або цікавою?",
        options: ["Щось смачне", "Хтось усміхнувся", "Я щось зробив сам", "Просто тиша"],
        response: "Нехай ця мить стане твоєю зірочкою.",
      },
      { title: "Дякую", text: "Кому або чому хочеться сказати «дякую» сьогодні?" },
    ]}
  />
);

type Sound = "rain" | "wind" | "crickets";
export function Sounds() {
  const t = useT();
  const sound = useStore((s) => s.sound);
  const volume = useStore((s) => s.volume);
  const ctx = useRef<AudioContext | null>(null);
  const nodes = useRef<{ stop: () => void } | null>(null);
  const [on, setOn] = useState<Sound | null>(null);
  const stop = () => {
    nodes.current?.stop();
    nodes.current = null;
    setOn(null);
  };
  useEffect(
    () => () => {
      nodes.current?.stop();
      void ctx.current?.close();
    },
    [],
  );
  const gainRef = useRef<GainNode | null>(null);
  useEffect(() => {
    if (!sound || volume === 0) {
      nodes.current?.stop();
      nodes.current = null;
      setOn(null);
    }
    if (gainRef.current && ctx.current?.state !== "closed")
      gainRef.current.gain.value = volume * 0.25;
  }, [sound, volume]);
  const play = (kind: Sound) => {
    stop();
    if (!sound || volume === 0 || !("AudioContext" in window)) return;
    const ac = ctx.current ?? new AudioContext();
    ctx.current = ac;
    void ac.resume().catch(() => stop());
    const gain = ac.createGain();
    gainRef.current = gain;
    gain.gain.value = volume * 0.25;
    gain.connect(ac.destination);
    if (kind === "crickets") {
      const osc = ac.createOscillator();
      osc.frequency.value = 4200;
      const amp = ac.createGain();
      amp.gain.value = 0;
      const lfo = ac.createOscillator();
      lfo.frequency.value = 18;
      const lg = ac.createGain();
      lg.gain.value = 0.08;
      lfo.connect(lg).connect(amp.gain);
      osc.connect(amp).connect(gain);
      osc.start();
      lfo.start();
      nodes.current = {
        stop: () => {
          osc.stop();
          lfo.stop();
          gain.disconnect();
        },
      };
    } else {
      const buf = ac.createBuffer(1, ac.sampleRate * 2, ac.sampleRate);
      const d = buf.getChannelData(0);
      for (let k = 0; k < d.length; k++) d[k] = Math.random() * 2 - 1;
      const src = ac.createBufferSource();
      src.buffer = buf;
      src.loop = true;
      const f = ac.createBiquadFilter();
      f.type = kind === "rain" ? "highpass" : "lowpass";
      f.frequency.value = kind === "rain" ? 1200 : 400;
      src.connect(f).connect(gain);
      src.start();
      let lfo: OscillatorNode | null = null;
      if (kind === "wind") {
        lfo = ac.createOscillator();
        lfo.frequency.value = 0.15;
        const lg = ac.createGain();
        lg.gain.value = 250;
        lfo.connect(lg).connect(f.frequency);
        lfo.start();
      }
      nodes.current = {
        stop: () => {
          src.stop();
          lfo?.stop();
          gain.disconnect();
        },
      };
    }
    setOn(kind);
    markDone("sky-sounds");
  };
  const items: [Sound, string, string][] = [
    ["rain", "Дощ", "☂"],
    ["wind", "Вітер", "≋"],
    ["crickets", "Цвіркуни", "♪"],
  ];
  return (
    <div className="space-y-4 text-center">
      <CharacterSay
        who="lihtaryk"
        night
        size="sm"
        mood={on ? "calm" : "talk"}
        action={on ? "settle" : undefined}
        text={t("Обери звук і просто послухай. Можна заплющити очі.")}
      />
      <div className="grid grid-cols-3 gap-3">
        {items.map(([k, label, m]) => (
          <Btn
            key={k}
            disabled={!sound || volume === 0}
            variant={on === k ? "honey" : "soft"}
            aria-pressed={on === k}
            onClick={() => (on === k ? stop() : play(k))}
            className="flex h-28 min-w-0 flex-col items-center justify-center gap-1 rounded-3xl px-2"
          >
            <span className="text-3xl" aria-hidden>
              {m}
            </span>
            {t(label)}
          </Btn>
        ))}
      </div>
      {on && (
        <Btn variant="ghost" onClick={stop}>
          {t("Тиша")}
        </Btn>
      )}
    </div>
  );
}
