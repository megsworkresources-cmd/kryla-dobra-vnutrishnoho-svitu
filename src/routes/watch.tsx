import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Pause, Play, RotateCcw, Volume2, VolumeX } from "lucide-react";
import { Btn, Scene } from "@/components/Scene";
import { CartoonStage } from "@/components/CartoonStage";
import { StoryFilm } from "@/components/StoryFilm";
import { Glyph } from "@/components/Glyph";
import { STORY_MEDIA } from "@/content/story-media";
import { WATCH_CLIPS, watchFilmId, type WatchClip } from "@/content/watch-clips";
import { pageHead } from "@/content/journeys";
import { setWatchPosition, useStore } from "@/lib/store";
import { useAudioUnlocked } from "@/lib/audio";
import { speak, stopSpeaking, useSpeechState } from "@/lib/speak";
import { useT, useLang } from "@/lib/i18n";

export const Route = createFileRoute("/watch")({
  validateSearch: (search: Record<string, unknown>) => ({ film: watchFilmId(search["film"]) }),
  head: () => pageHead("Мультики", "Короткі анімовані українські мультики з героями Тихого Місця."),
  component: Watch,
});

const SHOT_MS = 7000;

function Watch() {
  const t = useT();
  const { film } = Route.useSearch();
  const [clip, setClip] = useState<WatchClip | null>(
    () => WATCH_CLIPS.find((candidate) => candidate.id === film) ?? null,
  );
  const positions = useStore((s) => s.watch);
  useEffect(() => {
    setClip(WATCH_CLIPS.find((candidate) => candidate.id === film) ?? null);
  }, [film]);
  return (
    <Scene title="Мультики" back="/world">
      {clip ? (
        <Player
          key={clip.id}
          clip={clip}
          initialScene={positions[clip.id] ?? 0}
          onClose={() => setClip(null)}
        />
      ) : (
        <div className="space-y-4">
          <p className="text-muted-foreground">
            {t("Короткі мультики з нашими друзями. Обери, що подивитися!")}
          </p>
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {WATCH_CLIPS.map((c) => (
              <li key={c.id}>
                <button
                  onClick={() => setClip(c)}
                  aria-label={t("Грати: {title}", { title: t(c.title) })}
                  className="paper-card group flex h-full w-full flex-col overflow-hidden rounded-lg p-0 text-left transition active:scale-95"
                >
                  <div className="relative aspect-video w-full shrink-0 overflow-hidden">
                    <img
                      src={c.shots[0]?.img}
                      alt=""
                      className="h-full w-full object-cover transition group-hover:scale-105"
                      loading="lazy"
                    />
                    <span className="absolute inset-0 flex items-center justify-center">
                      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-card/90 shadow-soft">
                        <Play className="h-6 w-6" aria-hidden />
                      </span>
                    </span>
                    <Glyph emoji={c.icon} className="absolute left-2 top-2 h-7 w-7" />
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
            <Glyph name="sparkle" className="h-9 w-9" />
          </Link>
        </div>
      )}
    </Scene>
  );
}

export function Player({
  clip,
  onClose,
  initialScene = 0,
}: {
  clip: WatchClip;
  onClose: () => void;
  initialScene?: number;
}) {
  const t = useT();
  const voice = useStore((s) => s.voice && s.sound);
  const lang = useLang();
  const [i, setI] = useState(() =>
    Math.max(0, Math.min(Math.trunc(initialScene), Math.max(0, clip.shots.length - 1))),
  );
  const [playing, setPlaying] = useState(true);
  const [failedShot, setFailedShot] = useState<number | null>(null);
  const [filmFailed, setFilmFailed] = useState(false);
  const audioReady = useAudioUnlocked();
  const speech = useSpeechState();
  const speaking = speech === "loading" || speech === "playing";
  const shot = clip.shots[i];
  const film = STORY_MEDIA[clip.id];
  const mediaFailed = failedShot === i;
  const done = i >= clip.shots.length;
  // Remember the scene so leaving and coming back continues where the child stopped.
  useEffect(() => {
    if (i < clip.shots.length) setWatchPosition(clip.id, i);
  }, [clip.id, clip.shots.length, i]);
  useEffect(() => {
    const pauseWhenHidden = () => {
      if (document.hidden) setPlaying(false);
    };
    document.addEventListener("visibilitychange", pauseWhenHidden);
    return () => document.removeEventListener("visibilitychange", pauseWhenHidden);
  }, []);
  // Without footage the captions keep their own gentle pace. With footage the recording
  // decides when the next part starts, so the words always match the picture.
  useEffect(() => {
    if (film || !playing || done) return;
    const id = window.setTimeout(() => setI((x) => x + 1), SHOT_MS);
    return () => window.clearTimeout(id);
  }, [film, i, playing, done]);

  const followFilm = (fraction: number) => {
    if (!film || done) return;
    const next = Math.min(clip.shots.length - 1, Math.floor(fraction * clip.shots.length));
    if (next !== i) setI(next);
  };
  useEffect(() => {
    if (done || !playing || !voice || !shot || !audioReady) {
      stopSpeaking();
      return;
    }
    speak(t(shot.text), { who: shot.who });
    return stopSpeaking;
  }, [i, playing, done, voice, lang, audioReady]); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <div className="space-y-3">
      <h2 className="font-display text-2xl font-bold">{t(clip.title)}</h2>
      <div
        className="relative aspect-video overflow-hidden rounded-3xl bg-night shadow-soft"
        data-playing={playing && !done}
        role="region"
        aria-label={t(clip.title)}
      >
        {film && shot && !filmFailed && (
          <StoryFilm
            src={film}
            poster={clip.shots[0]?.img ?? shot.img}
            playing={playing && !done}
            onPause={() => setPlaying(false)}
            onError={() => setFilmFailed(true)}
            startAt={i / Math.max(1, clip.shots.length)}
            onProgress={followFilm}
          />
        )}
        {shot ? (
          <div
            key={i}
            className={`absolute inset-0 animate-fade-up ${film && !filmFailed ? "pointer-events-none" : ""}`}
          >
            {/* The recording is the picture: no illustration is stacked above it, where
                only its cropped edge would show. The still scene stands in on its own. */}
            {!(film && !filmFailed) && (
              <CartoonStage
                clipId={clip.id}
                index={i}
                shot={shot}
                playing={playing && !done}
                film={false}
                onImageError={() => setFailedShot(i)}
              />
            )}
            {mediaFailed && (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-night p-6 text-center text-moon">
                <p role="alert">{t("Не вдалося завантажити ілюстрацію. Спробуй інший мультик.")}</p>
              </div>
            )}
          </div>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-moon">
            <Glyph name="star" className="h-12 w-12 animate-pop" />
            <p className="font-display text-2xl">{t("Кінець")}</p>
          </div>
        )}
      </div>
      {filmFailed && (
        <div className="paper-card flex flex-col items-center gap-3 p-4 text-center sm:flex-row sm:text-left">
          <p role="alert" className="flex-1 text-sm font-bold">
            {t("Відео не вдалося відтворити. Казка з картинками готова — натисни «Грати».")}
          </p>
          <Btn
            variant="soft"
            onClick={() => {
              setFilmFailed(false);
              setPlaying(true);
            }}
          >
            {t("Спробувати відео ще")}
          </Btn>
        </div>
      )}
      {shot && (
        <p className="paper-card p-4 font-bold text-card-foreground" aria-live="polite">
          {t(shot.text)}
        </p>
      )}
      <p className="text-center text-sm font-bold text-muted-foreground" aria-live="polite">
        {t("Сцена {n}", { n: Math.min(i + 1, clip.shots.length) })} · {clip.shots.length}
      </p>
      <div className="flex gap-1" role="group" aria-label={t("Сцени")}>
        {clip.shots.map((_, k) => (
          <button
            key={k}
            type="button"
            onClick={() => {
              setI(k);
              setPlaying(true);
            }}
            aria-label={t("Сцена {n}", { n: k + 1 })}
            aria-current={k === i ? "step" : undefined}
            className="flex min-h-11 flex-1 items-center rounded-full px-0.5"
          >
            <span className={`h-2 w-full rounded-full ${k <= i ? "bg-honey" : "bg-secondary"}`} />
          </button>
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
          <>
            <Btn
              onClick={() => setPlaying(!playing)}
              className="inline-flex items-center gap-2"
              aria-label={playing ? t("Пауза") : t("Грати")}
            >
              {playing ? <Pause size={18} /> : <Play size={18} />}
              {playing ? t("Пауза") : t("Грати")}
            </Btn>
            {shot && (
              <Btn
                variant="soft"
                onClick={() =>
                  speaking ? stopSpeaking() : speak(t(shot.text), { force: true, who: shot.who })
                }
                className="inline-flex items-center gap-2"
                aria-label={speaking ? t("Зупинити голос") : t("Послухати")}
              >
                {speaking ? <VolumeX size={18} /> : <Volume2 size={18} />}
                {speaking ? t("Зупинити") : t("Послухати")}
              </Btn>
            )}
          </>
        )}
        {!done && (
          <Btn
            variant="soft"
            aria-label={t("Попередня сцена")}
            disabled={i === 0}
            onClick={() => setI((n) => Math.max(0, n - 1))}
          >
            {t("Назад")}
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
