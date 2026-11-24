import { useEffect, useRef, useState } from "react";
import { Pause, Play, Volume2 } from "lucide-react";
import { CHARACTERS, type CharId } from "@/content/characters";
import { CHARACTER_MEDIA } from "@/content/character-media";
import { getSpeechState, speak, useSpeechState } from "@/lib/speak";
import { useAudioUnlocked } from "@/lib/audio";
import { useStore } from "@/lib/store";
import { useT } from "@/lib/i18n";
import { useMediaMotion } from "@/hooks/use-media-motion";
import { claimVideo, releaseVideo } from "@/lib/video-focus";
import { primeSilentVideo, whenTouched } from "@/lib/media-unlock";

export type Mood = "talk" | "listen" | "think" | "cheer" | "calm";
/** Body action the character acts out so the child can copy it. */
export type Action = "squeeze" | "shrug" | "feet" | "settle" | "look" | "breathe";
const MOOD_MARK: Record<Mood, string> = {
  talk: "",
  // Listening is shown by the character's own pose, not a floating glyph by the head.
  listen: "",
  think: "💭",
  cheer: "✨",
  calm: "🌿",
};

function CharacterLoop({
  who,
  poster,
  className,
  imageClass,
  pulse,
}: {
  who: CharId;
  poster: string;
  className: string;
  imageClass: string;
  pulse: number;
}) {
  const t = useT();
  const c = CHARACTERS[who];
  const motion = useMediaMotion();
  const video = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(true);
  const [failed, setFailed] = useState(false);
  // A child's own tap may start the loop that reduced motion (or the device) held back.
  const [manual, setManual] = useState(false);
  const manualRef = useRef(false);
  // A blocked loop waits for a gesture even while its own playback state changes.
  const retryOff = useRef<(() => void) | null>(null);
  const wantsVideo = motion || manual;

  useEffect(() => {
    setFailed(false);
    setPlaying(true);
    manualRef.current = false;
    setManual(false);
  }, [who]);

  useEffect(
    () => () => {
      retryOff.current?.();
      retryOff.current = null;
    },
    [],
  );

  useEffect(() => {
    const media = video.current;
    if (!media || !wantsVideo || failed) return;
    let active = true;
    if (playing && !document.hidden) {
      claimVideo(media);
      try {
        void media
          .play()
          .then(() => {
            if (!active || document.hidden) media.pause();
          })
          .catch(() => {
            if (!active) return;
            setPlaying(false);
            // Safari only accepts the retry inside a real gesture: the child's next touch.
            retryOff.current?.();
            retryOff.current = whenTouched(() => {
              retryOff.current = null;
              const el = video.current;
              if (!el) return;
              setPlaying(true);
              claimVideo(el);
              void el.play().catch(() => {});
            });
          });
      } catch {
        if (active) setPlaying(false);
      }
    } else media.pause();
    return () => {
      active = false;
      media.pause();
      releaseVideo(media);
    };
  }, [playing, who, wantsVideo, failed]);

  useEffect(() => {
    const pause = () => {
      video.current?.pause();
      setPlaying(false);
    };
    const visibility = () => {
      if (document.hidden) pause();
    };
    window.addEventListener("pagehide", pause);
    document.addEventListener("visibilitychange", visibility);
    return () => {
      window.removeEventListener("pagehide", pause);
      document.removeEventListener("visibilitychange", visibility);
    };
  }, []);

  if (!wantsVideo || failed) {
    return (
      <span className="relative inline-block">
        <img
          key={pulse}
          src={poster}
          alt={c.name}
          className={`${className} w-auto object-contain drop-shadow-md ${imageClass}`}
        />
        {!failed && (
          <button
            type="button"
            aria-label={t("Грати відео")}
            title={t("Грати відео")}
            onClick={() => {
              manualRef.current = true;
              setManual(true);
              setPlaying(true);
            }}
            className="absolute bottom-1 right-1 flex h-11 w-11 items-center justify-center rounded-full bg-card/90 text-card-foreground shadow-soft"
          >
            <Play size={16} aria-hidden />
          </button>
        )}
      </span>
    );
  }

  return (
    <div className={`relative ${className} aspect-[9/16] overflow-hidden rounded-2xl bg-secondary`}>
      <video
        ref={(el) => {
          video.current = el;
          primeSilentVideo(el);
        }}
        src={CHARACTER_MEDIA[who]}
        poster={poster}
        muted
        loop
        playsInline
        preload="metadata"
        aria-hidden="true"
        tabIndex={-1}
        className="h-full w-full object-cover"
        onPlaying={() => {
          const media = video.current;
          if (!media) return;
          if (!playing || document.hidden) media.pause();
          else claimVideo(media);
        }}
        onPause={() => {
          if (playing) setPlaying(false);
        }}
        onError={() => {
          setFailed(true);
          setPlaying(false);
        }}
      />
      <button
        type="button"
        aria-label={t(playing ? "Пауза" : "Грати")}
        title={t(playing ? "Пауза" : "Грати")}
        onClick={() => setPlaying((value) => !value)}
        className="absolute bottom-1 right-1 flex h-11 w-11 items-center justify-center rounded-full bg-card/90 text-card-foreground shadow-soft"
      >
        {playing ? <Pause size={16} aria-hidden /> : <Play size={16} aria-hidden />}
      </button>
    </div>
  );
}

/** A character with a speech bubble. The text is always written (caption) and can be read aloud. */
export function CharacterSay({
  who,
  text,
  mood = "talk",
  night,
  side = "left",
  size = "md",
  autoSpeak = true,
  action,
}: {
  who: CharId;
  text: string;
  mood?: Mood;
  night?: boolean | undefined;
  side?: "left" | "right";
  size?: "sm" | "md" | "lg";
  autoSpeak?: boolean;
  action?: Action | undefined;
}) {
  const c = CHARACTERS[who];
  const t = useT();
  const voiceOn = useStore((s) => s.voice && s.sound);
  const audioReady = useAudioUnlocked();
  const [pulse, setPulse] = useState(0);
  const speechState = useSpeechState();
  const [requested, setRequested] = useState(false);
  useEffect(() => {
    setPulse((p) => p + 1);
    // Nothing is spoken before the first touch, then the greeting can play.
    if (!autoSpeak || !voiceOn || !audioReady) return;
    // Several characters share a page: let the line that already started finish.
    const state = getSpeechState();
    if (state === "loading" || state === "playing") return;
    speak(text, { who });
  }, [text, autoSpeak, voiceOn, who, audioReady]);
  const h = { sm: "h-24", md: "h-32 sm:h-40", lg: "h-44 sm:h-56" }[size];
  const motion = action
    ? `animate-act-${action}`
    : mood === "cheer"
      ? "animate-hop"
      : mood === "think"
        ? "animate-sway"
        : "animate-talk";
  return (
    <figure
      className={`grid min-w-0 grid-cols-1 items-end gap-3 sm:flex ${side === "right" ? "sm:flex-row-reverse" : ""}`}
    >
      <div className="relative mx-auto shrink-0 sm:mx-0">
        <CharacterLoop who={who} poster={c.image} className={h} imageClass={motion} pulse={pulse} />
        {MOOD_MARK[mood] && (
          <span className="absolute -top-1 right-0 text-xl animate-float" aria-hidden>
            {MOOD_MARK[mood]}
          </span>
        )}
      </div>
      <figcaption
        key={`b${pulse}`}
        className={`speech ${night ? "speech-night" : ""} ${side === "right" ? "speech-right" : ""} relative mb-6 min-w-0 flex-1 animate-pop p-4`}
      >
        <span className="block text-xs font-extrabold uppercase tracking-wide opacity-70">
          {t(c.name)}
        </span>
        <span className="mt-1 block text-lg leading-snug">{text}</span>
        <button
          type="button"
          onClick={() => {
            setRequested(true);
            speak(text, { force: true, who });
          }}
          aria-label={t("Послухати, що каже {n}", { n: t(c.name) })}
          className="absolute -bottom-4 right-4 flex h-11 w-11 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-soft"
        >
          <Volume2 size={16} />
        </button>
        {requested && speechState === "unavailable" && (
          <span role="alert" className="mt-2 block text-sm">
            {t("Голос недоступний")}
          </span>
        )}
      </figcaption>
    </figure>
  );
}
