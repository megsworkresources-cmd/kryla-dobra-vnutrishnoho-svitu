import { useEffect, useRef, useState } from "react";
import { useT } from "@/lib/i18n";
import { Btn } from "./Scene";

/** Silent recorded footage; character narration is managed by the story owner. */
export function StoryFilm({
  src,
  poster,
  playing,
  onPause,
}: {
  src: string;
  poster: string;
  playing: boolean;
  onPause: () => void;
}) {
  const t = useT();
  const video = useRef<HTMLVideoElement>(null);
  const pauseOwner = useRef(onPause);
  pauseOwner.current = onPause;
  const [status, setStatus] = useState<"loading" | "ready" | "blocked" | "error">("loading");
  useEffect(() => setStatus("loading"), [src]);
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
        loop
        preload="metadata"
        className="h-full w-full object-cover"
        aria-label={t("Анімована казка")}
        onCanPlay={() => setStatus("ready")}
        onPlaying={() => setStatus("ready")}
        onError={() => {
          setStatus("error");
          pauseOwner.current();
        }}
      />
      {status !== "ready" && (
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
