import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Pause, Play, RotateCcw } from "lucide-react";
import { Btn, Scene } from "@/components/Scene";
import { StoryFilm } from "@/components/StoryFilm";
import { STORY_MEDIA } from "@/content/story-media";
import { CHARACTERS, type CharId } from "@/content/characters";
import { pageHead } from "@/content/journeys";
import { useStore } from "@/lib/store";
import { speak, stopSpeaking } from "@/lib/speak";
import { useT, useLang } from "@/lib/i18n";
import welcome from "@/assets/welcome.jpg";
import meadow from "@/assets/meadow.jpg";
import night from "@/assets/night.jpg";
import forest from "@/assets/forest.jpg";
import clouds from "@/assets/clouds.jpg";
import path from "@/assets/path.jpg";
import studio from "@/assets/studio.jpg";
import safe from "@/assets/safe.jpg";

export const Route = createFileRoute("/watch")({
  head: () => pageHead("Мультики", "Короткі анімовані українські мультики з героями Тихого Місця."),
  component: Watch,
});

interface Shot {
  img: string;
  who: CharId;
  text: string;
  fx: string;
}
interface Clip {
  id: string;
  title: string;
  icon: string;
  shots: Shot[];
}

/** Original animated clips made from the app's own artwork — free of any third-party licence. */
const CLIPS: Clip[] = [
  {
    id: "sunflower",
    title: "Соняшник, що шукав сонце",
    icon: "🌻",
    shots: [
      { img: welcome, who: "solomiya", text: "Біля білої хатки ріс маленький соняшник.", fx: "🌻" },
      { img: meadow, who: "solomiya", text: "Щоранку він повертав голівку до сонця.", fx: "☀️" },
      { img: welcome, who: "daryna", text: "Одного дня хмарка сховала сонечко.", fx: "☁️" },
      {
        img: meadow,
        who: "solomiya",
        text: "Соняшник зачекав, подихав спокійно — і сонце повернулося.",
        fx: "🌼",
      },
    ],
  },
  {
    id: "hedgehog",
    title: "Ліхтарик і світлячки",
    icon: "🦔",
    shots: [
      {
        img: forest,
        who: "lihtaryk",
        text: "У нічному лісі їжачок Ліхтарик засвітив свій ліхтарик.",
        fx: "🏮",
      },
      {
        img: forest,
        who: "lihtaryk",
        text: "До нього злетілися світлячки — кожен зі своїм почуттям.",
        fx: "✨",
      },
      { img: night, who: "olenka", text: "Разом вони освітили стежку додому.", fx: "🌙" },
    ],
  },
  {
    id: "kite",
    title: "Повітряний змій Тараса",
    icon: "🪁",
    shots: [
      {
        img: clouds,
        who: "taras",
        text: "Тарас змайстрував повітряного змія у синьо-жовту смужку.",
        fx: "🪁",
      },
      { img: clouds, who: "taras", text: "Вітер підхопив його високо-високо до хмар.", fx: "💨" },
      {
        img: meadow,
        who: "marko",
        text: "Марко намалював змія в блокноті, щоб запам'ятати цей день.",
        fx: "✏️",
      },
    ],
  },
  {
    id: "bridge",
    title: "Сміливий місток",
    icon: "🌉",
    shots: [
      { img: path, who: "daryna", text: "Дарина побачила місток над струмком.", fx: "🌉" },
      {
        img: path,
        who: "daryna",
        text: "Було трохи страшно. Вона зробила один маленький крок.",
        fx: "👣",
      },
      {
        img: path,
        who: "taras",
        text: "А потім ще один. І ось вона вже на іншому березі!",
        fx: "🎉",
      },
    ],
  },
  {
    id: "paints",
    title: "Чарівні фарби Марка",
    icon: "🎨",
    shots: [
      { img: studio, who: "marko", text: "Марко відкрив коробку чарівних фарб.", fx: "🎨" },
      {
        img: studio,
        who: "marko",
        text: "Синя фарба — для спокою, жовта — для радості.",
        fx: "💙",
      },
      {
        img: safe,
        who: "olenka",
        text: "Разом з Оленкою вони розмалювали затишну кімнату.",
        fx: "🏡",
      },
    ],
  },
  {
    id: "lullaby",
    title: "Колискова для зірок",
    icon: "🌙",
    shots: [
      {
        img: night,
        who: "solomiya",
        text: "Коли настає ніч, Соломія співає зіркам колискову.",
        fx: "🌙",
      },
      { img: night, who: "olenka", text: "Зірки мерехтять повільніше й повільніше.", fx: "⭐" },
      { img: safe, who: "olenka", text: "На добраніч, Тихе Місце. На добраніч, друже.", fx: "💤" },
    ],
  },
];

const SHOT_MS = 7000;

function Watch() {
  const t = useT();
  const [clip, setClip] = useState<Clip | null>(null);
  return (
    <Scene title="Мультики" back="/world">
      {clip ? (
        <Player clip={clip} onClose={() => setClip(null)} />
      ) : (
        <div className="space-y-4">
          <p className="text-muted-foreground">
            {t("Короткі мультики з нашими друзями. Обери, що подивитися!")}
          </p>
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {CLIPS.map((c) => (
              <li key={c.id}>
                <button
                  onClick={() => setClip(c)}
                  className="paper-card group w-full overflow-hidden p-0 text-left transition active:scale-95"
                >
                  <div className="relative aspect-video overflow-hidden">
                    <img
                      src={c.shots[0]?.img}
                      alt=""
                      className="h-full w-full object-cover transition group-hover:scale-105"
                      loading="lazy"
                    />
                    <span className="absolute inset-0 flex items-center justify-center">
                      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-card/90 shadow-soft">
                        <Play className="h-6 w-6" />
                      </span>
                    </span>
                    <span className="absolute left-2 top-2 text-2xl" aria-hidden>
                      {c.icon}
                    </span>
                  </div>
                  <p className="p-3 text-sm font-bold">{t(c.title)}</p>
                </button>
              </li>
            ))}
          </ul>
          <Link
            to="/story"
            className="paper-card flex min-h-16 items-center justify-between gap-3 p-4 font-bold transition active:scale-[0.98]"
          >
            <span>
              <span className="block font-display text-xl">{t("Казка для мене")}</span>
              <span className="block text-sm font-normal text-muted-foreground">
                {t("Обери героя, місце й настрій — Claude створить нову історію.")}
              </span>
            </span>
            <span className="text-3xl" aria-hidden>
              ✨
            </span>
          </Link>
        </div>
      )}
    </Scene>
  );
}

export function Player({ clip, onClose }: { clip: Clip; onClose: () => void }) {
  const t = useT();
  const voice = useStore((s) => s.voice && s.sound);
  const lang = useLang();
  const [i, setI] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [failedShot, setFailedShot] = useState<number | null>(null);
  const shot = clip.shots[i];
  const film = STORY_MEDIA[clip.id];
  const mediaFailed = failedShot === i;
  const done = i >= clip.shots.length;
  useEffect(() => {
    const pauseWhenHidden = () => {
      if (document.hidden) setPlaying(false);
    };
    document.addEventListener("visibilitychange", pauseWhenHidden);
    return () => document.removeEventListener("visibilitychange", pauseWhenHidden);
  }, []);
  useEffect(() => {
    if (!playing || done) return;
    if (voice && shot) speak(t(shot.text), { who: shot.who });
    const id = window.setTimeout(() => setI((x) => x + 1), SHOT_MS);
    return () => {
      window.clearTimeout(id);
      stopSpeaking();
    };
  }, [i, playing, done, voice, lang]); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <div className="space-y-3">
      <h2 className="font-display text-2xl font-bold">{t(clip.title)}</h2>
      <div
        className="relative aspect-video overflow-hidden rounded-3xl bg-night shadow-soft"
        data-playing={playing && !done}
        role="img"
        aria-label={t(clip.title)}
      >
        {shot ? (
          <div key={i} className="absolute inset-0 animate-fade-up">
            {mediaFailed && (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-night p-6 text-center text-moon">
                <p role="alert">{t("Не вдалося завантажити ілюстрацію. Спробуй інший мультик.")}</p>
              </div>
            )}
            {film ? (
              <StoryFilm
                src={film}
                poster={shot.img}
                playing={playing}
                onPause={() => setPlaying(false)}
              />
            ) : (
              <img
                src={shot.img}
                alt=""
                className="h-full w-full object-cover animate-kenburns"
                onError={() => setFailedShot(i)}
                style={{ animationPlayState: playing ? "running" : "paused" }}
              />
            )}
            {[12, 30, 52, 70, 88].map((l, k) => (
              <span
                key={l}
                className="absolute text-2xl animate-float"
                style={{
                  left: `${l}%`,
                  top: `${15 + (k % 3) * 18}%`,
                  animationDelay: `${k * 0.5}s`,
                  animationPlayState: playing ? "running" : "paused",
                }}
                aria-hidden
              >
                {shot.fx}
              </span>
            ))}
            <img
              src={CHARACTERS[shot.who].image}
              alt=""
              className="absolute bottom-0 left-2 h-[62%] w-auto animate-talk drop-shadow-lg"
              style={{ animationPlayState: playing ? "running" : "paused" }}
            />
          </div>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-moon">
            <span className="text-5xl animate-pop" aria-hidden>
              🌟
            </span>
            <p className="font-display text-2xl">{t("Кінець")}</p>
          </div>
        )}
      </div>
      {shot && (
        <p className="paper-card p-4 font-bold text-card-foreground" aria-live="polite">
          {t(shot.text)}
        </p>
      )}
      <div className="flex gap-1" aria-hidden>
        {clip.shots.map((_, k) => (
          <span
            key={k}
            className={`h-2 flex-1 rounded-full ${k <= i ? "bg-honey" : "bg-secondary"}`}
          />
        ))}
      </div>
      <div className="flex flex-wrap justify-center gap-2">
        <Btn variant="soft" onClick={onClose}>
          {t("← Усі мультики")}
        </Btn>
        {done ? (
          <Btn
            onClick={() => {
              setI(0);
              setPlaying(true);
            }}
            className="inline-flex items-center gap-2"
          >
            <RotateCcw size={18} />
            {t("Ще раз")}
          </Btn>
        ) : (
          <Btn
            onClick={() => setPlaying(!playing)}
            className="inline-flex items-center gap-2"
            aria-label={playing ? t("Пауза") : t("Грати")}
          >
            {playing ? <Pause size={18} /> : <Play size={18} />}
            {playing ? t("Пауза") : t("Грати")}
          </Btn>
        )}
        {!done && (
          <Btn variant="soft" onClick={() => setI(i + 1)}>
            {t("Далі →")}
          </Btn>
        )}
      </div>
    </div>
  );
}
