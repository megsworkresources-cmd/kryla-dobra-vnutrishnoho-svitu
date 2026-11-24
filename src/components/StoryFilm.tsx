import { useEffect, useRef, useState } from "react";
import { Play } from "lucide-react";
import { useT } from "@/lib/i18n";
import { Btn } from "./Scene";
import { useMediaMotion } from "@/hooks/use-media-motion";
import { claimVideo, releaseVideo } from "@/lib/video-focus";
import { primeSilentVideo, whenTouched } from "@/lib/media-unlock";

/**
 * Silent recorded footage; character narration is managed by the story owner.
 * `startAt` gives every beat its own place in the recording (0..1), so the picture
 * moves on with the story instead of showing the same repeating loop.
 */
export function StoryFilm({
  src,
  poster,
  playing,
  onPause,
  startAt,
  part,
  label,
  quiet,
  onError,
}: {
  src: string;
  poster: string;
  playing: boolean;
  onPause: () => void;
  onError?: (() => void) | undefined;
  startAt?: number | undefined;
  /** Show only this slice of the recording, on repeat (0..1), e.g. growth up to a stage. */
  part?: { from: number; to: number } | undefined;
  /** Accessible name for the footage, when it is not a cartoon. */
  label?: string | undefined;
  /** Decorative footage: a blocked autoplay stays silent instead of asking for a tap. */
  quiet?: boolean | undefined;
}) {
  const t = useT();
  const motion = useMediaMotion();
  const video = useRef<HTMLVideoElement>(null);
  const pauseOwner = useRef(onPause);
  pauseOwner.current = onPause;
  const playingNow = useRef(playing);
  playingNow.current = playing;
  const playbackGeneration = useRef(0);
  const [status, setStatus] = useState<"loading" | "ready" | "blocked" | "error">("loading");
  const [duration, setDuration] = useState(0);
  // The child may start footage that reduced motion held back, or that the device refused.
  const [manual, setManual] = useState(false);
  const manualRef = useRef(false);
  const ownerWanted = useRef(playing);
  // Waiting for a gesture outlives the playback effect: a blocked film re-runs it.
  const retryOff = useRef<(() => void) | null>(null);
  // Our own pause() (cleanup, hand-over) must not read as the story owner's pause.
  const ownPause = useRef(false);
  const pauseMedia = (el: HTMLVideoElement | null | undefined) => {
    if (!el) return;
    if (!el.paused) ownPause.current = true;
    el.pause();
  };
  const wantsVideo = motion || manual;
  const shouldPlay = playing || manual;

  useEffect(() => {
    retryOff.current?.();
    retryOff.current = null;
    setStatus("loading");
    setDuration(0);
    manualRef.current = false;
    setManual(false);
  }, [src]);

  // The recording stops when the film leaves the page, not when state changes.
  useEffect(
    () => () => {
      retryOff.current?.();
      retryOff.current = null;
      const el = video.current;
      if (!el) return;
      el.pause();
      releaseVideo(el);
    },
    [],
  );

  // The story owner's own pause still stops footage the child started by hand.
  useEffect(() => {
    if (ownerWanted.current && !playing) {
      manualRef.current = false;
      setManual(false);
    }
    ownerWanted.current = playing;
  }, [playing]);

  const ready = Number.isFinite(duration) && duration > 0;
  const partFrom = part && ready ? Math.min(Math.max(part.from, 0), 0.96) * duration : null;
  const partTo = part && ready ? Math.min(Math.max(part.to, part.from + 0.02), 1) * duration : null;
  const offset =
    partFrom ??
    (startAt !== undefined && ready ? Math.min(Math.max(startAt, 0), 0.95) * duration : null);

  useEffect(() => {
    const media = video.current;
    if (!media) return;
    playbackGeneration.current += 1;
    const generation = playbackGeneration.current;
    let active = true;
    const play = () => {
      claimVideo(media);
      void media
        .play()
        .then(() => {
          const stillWanted =
            (playingNow.current || manualRef.current) &&
            (motion || manualRef.current) &&
            !document.hidden;
          if (!active || generation !== playbackGeneration.current || !stillWanted) media.pause();
        })
        .catch(() => {
          if (!active || generation !== playbackGeneration.current) return;
          setStatus("blocked");
          pauseOwner.current();
          // iPhone Safari only allows the retry inside a real gesture: the child's next touch.
          retryOff.current?.();
          retryOff.current = whenTouched(() => {
            retryOff.current = null;
            if (generation !== playbackGeneration.current) return;
            startByHandRef.current();
          });
        });
    };
    if (shouldPlay && wantsVideo && !document.hidden) play();
    else {
      pauseMedia(media);
      if (shouldPlay && !wantsVideo) pauseOwner.current();
    }
    // No pause on re-run: a retry that starts playback must not be stopped by the
    // cleanup of the very state change that asked for it.
    return () => {
      active = false;
      playbackGeneration.current += 1;
      releaseVideo(media);
    };
    // A hand-started film plays from the click itself, so `manual` stays out of the deps
    // to keep this effect from starting the same recording twice.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playing, src, motion]);

  /** A real gesture always unlocks playback, including under reduced motion. */
  const startByHand = () => {
    const media = video.current;
    manualRef.current = true;
    setManual(true);
    if (!media) return;
    primeSilentVideo(media);
    claimVideo(media);
    setStatus("loading");
    void media.play().catch(() => {
      setStatus("blocked");
      pauseOwner.current();
    });
  };
  const startByHandRef = useRef(startByHand);
  startByHandRef.current = startByHand;

  // A new beat starts its own part of the recording.
  useEffect(() => {
    const media = video.current;
    if (!media || offset === null) return;
    if (Math.abs(media.currentTime - offset) > 0.3) {
      try {
        media.currentTime = offset;
      } catch {
        // Metadata is not ready yet; the duration change re-runs this effect.
      }
    }
  }, [offset]);

  /** A stage keeps its own slice of the recording, so the growth repeats in place. */
  const keepInsidePart = () => {
    const media = video.current;
    if (!media || partFrom === null || partTo === null) return;
    if (media.currentTime >= partTo - 0.08) {
      try {
        media.currentTime = partFrom;
      } catch {
        // ignore a seek the browser refuses mid-teardown
      }
    }
  };

  /** A recording shorter than its beat keeps replaying from the same point. */
  const replay = () => {
    const media = video.current;
    if (!media) return;
    if (offset !== null) {
      try {
        media.currentTime = offset;
      } catch {
        // ignore a seek the browser refuses mid-teardown
      }
    }
    const stillWanted =
      (playingNow.current || manualRef.current) &&
      (motion || manualRef.current) &&
      !document.hidden;
    if (stillWanted) {
      claimVideo(media);
      const generation = playbackGeneration.current;
      void media
        .play()
        .then(() => {
          if (generation !== playbackGeneration.current || !playingNow.current) media.pause();
        })
        .catch(() => {
          if (generation !== playbackGeneration.current || !playingNow.current) return;
          setStatus("blocked");
          pauseOwner.current();
        });
    }
  };

  useEffect(() => {
    const media = video.current;
    const pause = () => {
      playbackGeneration.current += 1;
      playingNow.current = false;
      pauseMedia(media);
      pauseOwner.current();
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

  return (
    <>
      <video
        ref={(el) => {
          video.current = el;
          primeSilentVideo(el);
        }}
        src={src}
        poster={poster}
        muted
        onPause={() => {
          // The flag is cleared by the event it was armed for, not by a timer.
          if (ownPause.current) {
            ownPause.current = false;
            return;
          }
          if (playingNow.current || manualRef.current) pauseOwner.current();
        }}
        onWaiting={() => setStatus("loading")}
        playsInline
        loop={offset === null}
        preload="metadata"
        className="h-full w-full object-cover"
        hidden={!wantsVideo}
        aria-label={t(label ?? "Анімована казка")}
        onTimeUpdate={keepInsidePart}
        onLoadedMetadata={() => {
          const value = video.current?.duration ?? 0;
          setDuration(Number.isFinite(value) ? value : 0);
        }}
        onEnded={replay}
        onCanPlay={() => setStatus("ready")}
        onPlaying={() => {
          const media = video.current;
          if (!media) return;
          ownPause.current = false;
          const stillWanted =
            (playingNow.current || manualRef.current) && (motion || manualRef.current);
          if (!stillWanted || document.hidden) pauseMedia(media);
          else claimVideo(media);
          setStatus("ready");
        }}
        onError={() => {
          setStatus("error");
          pauseOwner.current();
          onError?.();
        }}
      />
      {!wantsVideo && (
        <img
          src={poster}
          alt={t(label ?? "Анімована казка")}
          className="h-full w-full object-cover"
        />
      )}
      {(!wantsVideo || status === "blocked") && (
        <button
          type="button"
          onClick={startByHand}
          aria-label={t("Грати відео")}
          title={t("Грати відео")}
          className="absolute bottom-3 left-1/2 z-20 flex h-12 w-12 -translate-x-1/2 items-center justify-center rounded-full bg-card/90 text-card-foreground shadow-soft transition active:scale-95"
        >
          <Play size={20} aria-hidden />
        </button>
      )}
      {wantsVideo && status !== "ready" && !(quiet && status === "blocked") && (
        <div className="absolute inset-x-0 top-0 z-20 bg-card/95 p-3 text-center text-sm text-card-foreground">
          <p role={status === "error" ? "alert" : "status"}>
            {t(
              status === "loading"
                ? "Відео завантажується…"
                : status === "blocked"
                  ? "Натисни «Грати», щоб продовжити відео."
                  : "Відео недоступне. Можна читати казку або спробувати ще раз.",
            )}
          </p>
          {status === "error" && (
            <Btn
              variant="soft"
              onClick={() => {
                setStatus("loading");
                video.current?.load();
              }}
            >
              {t("Спробувати ще")}
            </Btn>
          )}
        </div>
      )}
    </>
  );
}
