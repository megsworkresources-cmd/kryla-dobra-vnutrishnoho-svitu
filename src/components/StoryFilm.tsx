import { useEffect, useRef, useState } from "react";
import { useT } from "@/lib/i18n";
import { Btn } from "./Scene";

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
}: {
  src: string;
  poster: string;
  playing: boolean;
  onPause: () => void;
  startAt?: number | undefined;
  /** Show only this slice of the recording, on repeat (0..1), e.g. growth up to a stage. */
  part?: { from: number; to: number } | undefined;
  /** Accessible name for the footage, when it is not a cartoon. */
  label?: string | undefined;
  /** Decorative footage: a blocked autoplay stays silent instead of asking for a tap. */
  quiet?: boolean | undefined;
}) {
  const t = useT();
  const video = useRef<HTMLVideoElement>(null);
  const pauseOwner = useRef(onPause);
  pauseOwner.current = onPause;
  const playingNow = useRef(playing);
  playingNow.current = playing;
  const [status, setStatus] = useState<"loading" | "ready" | "blocked" | "error">("loading");
  const [duration, setDuration] = useState(0);
  useEffect(() => setStatus("loading"), [src]);

  const ready = Number.isFinite(duration) && duration > 0;
  const partFrom = part && ready ? Math.min(Math.max(part.from, 0), 0.96) * duration : null;
  const partTo = part && ready ? Math.min(Math.max(part.to, part.from + 0.02), 1) * duration : null;
  const offset =
    partFrom ??
    (startAt !== undefined && ready ? Math.min(Math.max(startAt, 0), 0.95) * duration : null);

  useEffect(() => {
    const media = video.current;
    if (!media) return;
    let active = true;
    if (playing) {
      void media
        .play()
        .then(() => {
          if (!active) media.pause();
        })
        .catch(() => {
          if (active) {
            setStatus("blocked");
            pauseOwner.current();
          }
        });
    } else media.pause();
    return () => {
      active = false;
      media.pause();
    };
  }, [playing, src]);

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
    if (playingNow.current) void media.play().catch(() => setStatus("blocked"));
  };

  useEffect(() => {
    const media = video.current;
    const pause = () => {
      media?.pause();
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
        ref={video}
        src={src}
        poster={poster}
        muted
        onPause={() => {
          if (playing) pauseOwner.current();
        }}
        onWaiting={() => setStatus("loading")}
        playsInline
        loop={offset === null}
        preload="metadata"
        className="h-full w-full object-cover"
        aria-label={t(label ?? "Анімована казка")}
        onTimeUpdate={keepInsidePart}
        onLoadedMetadata={() => {
          const value = video.current?.duration ?? 0;
          setDuration(Number.isFinite(value) ? value : 0);
        }}
        onEnded={replay}
        onCanPlay={() => setStatus("ready")}
        onPlaying={() => setStatus("ready")}
        onError={() => {
          setStatus("error");
          pauseOwner.current();
        }}
      />
      {status !== "ready" && !(quiet && status === "blocked") && (
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
