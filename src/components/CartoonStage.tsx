import type { CSSProperties } from "react";
import { CHARACTERS, type CharId } from "@/content/characters";
import { cn } from "@/lib/utils";

export interface CartoonShot {
  img: string;
  who: CharId;
  text: string;
  fx: string;
}

/**
 * Each shot gets its own light, camera move, actor rhythm and floating things,
 * so a cartoon moves through different scenes instead of one repeating picture.
 */
const MOODS = [
  {
    top: "var(--sky)",
    mid: "var(--paper)",
    ground: "var(--sage)",
    glow: "var(--honey)",
    night: false,
  },
  {
    top: "var(--secondary)",
    mid: "var(--honey)",
    ground: "var(--sage)",
    glow: "var(--paper)",
    night: false,
  },
  {
    top: "var(--lavender)",
    mid: "var(--rose)",
    ground: "var(--sage)",
    glow: "var(--honey)",
    night: false,
  },
  {
    top: "var(--night)",
    mid: "var(--dusk)",
    ground: "var(--ink)",
    glow: "var(--moon)",
    night: true,
  },
] as const;

const CAMERAS = [
  "animate-camera-left",
  "animate-camera-right",
  "animate-camera-in",
  "animate-camera-out",
  "animate-camera-up",
] as const;

const ACTORS = ["animate-talk", "animate-sway", "animate-wiggle", "animate-act-breathe"] as const;

const FLOWERS = ["🌻", "🌼", "🌿", "🌸", "🍃"] as const;

/** Deterministic, so the same beat is drawn the same way on every visit. */
function seedOf(clipId: string, index: number) {
  let seed = index + 1;
  for (let i = 0; i < clipId.length; i += 1) seed = (seed * 31 + clipId.charCodeAt(i)) % 7919;
  return seed;
}

export function CartoonStage({
  clipId,
  index,
  shot,
  playing,
  film,
  onImageError,
}: {
  clipId: string;
  index: number;
  shot: CartoonShot;
  playing: boolean;
  /** The scene sits over recorded footage, so only the moving overlays are drawn. */
  film: boolean;
  onImageError?: (() => void) | undefined;
}) {
  const seed = seedOf(clipId, index);
  const mood = MOODS[(seed + index) % MOODS.length]!;
  const camera = CAMERAS[(seed + index * 2) % CAMERAS.length]!;
  const actor = ACTORS[(seed + index * 3) % ACTORS.length]!;
  const play: CSSProperties = { animationPlayState: playing ? "running" : "paused" };

  if (film)
    return (
      <div className="absolute inset-0 overflow-hidden" data-shot={index}>
        <div className="pointer-events-none absolute inset-0" aria-hidden>
          {[0, 1, 2, 3].map((k) => (
            <span
              key={k}
              className="absolute bottom-0 text-2xl animate-drift"
              style={{
                left: `${10 + k * 24}%`,
                animationDelay: `${k * 0.8 + index * 0.5}s`,
                ...play,
              }}
            >
              {shot.fx}
            </span>
          ))}
          <div className="absolute inset-0 bg-gradient-to-t from-night/75 via-night/10 to-transparent" />
          <img
            src={CHARACTERS[shot.who].image}
            alt=""
            className="absolute bottom-0 left-2 h-[42%] w-auto animate-talk drop-shadow-lg"
            style={play}
          />
        </div>
      </div>
    );

  return (
    <div className="absolute inset-0 overflow-hidden" data-shot={index}>
      {/* the illustration itself, moving with this beat's camera */}
      <div className={cn("absolute inset-0", camera)} style={play}>
        <img
          src={shot.img}
          alt=""
          className="h-full w-full object-cover animate-kenburns"
          style={play}
          onError={onImageError}
        />
      </div>
      {/* this beat's own time of day */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: `linear-gradient(180deg, ${mood.top} 0%, ${mood.mid} 55%, ${mood.ground} 100%)`,
          opacity: 0.3,
        }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute right-6 top-5 h-14 w-14 rounded-full animate-float"
        style={{ background: mood.glow, boxShadow: `0 0 46px ${mood.glow}`, ...play }}
        aria-hidden
      />
      {mood.night &&
        [12, 28, 46, 63, 78, 90].map((left, k) => (
          <span
            key={left}
            className="pointer-events-none absolute h-1.5 w-1.5 rounded-full bg-moon animate-twinkle"
            style={{
              left: `${left}%`,
              top: `${10 + (k % 3) * 12}%`,
              animationDelay: `${k * 0.5}s`,
              ...play,
            }}
            aria-hidden
          />
        ))}
      {!mood.night &&
        [0, 1, 2].map((k) => (
          <span
            key={k}
            className="pointer-events-none absolute h-5 rounded-full bg-paper/80 animate-cloud-sweep"
            style={{
              top: `${12 + k * 11}%`,
              width: `${58 + k * 26}px`,
              animationDelay: `${k * 7 + index * 3}s`,
              ...play,
            }}
            aria-hidden
          />
        ))}
      <svg
        className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 w-full"
        viewBox="0 0 100 50"
        preserveAspectRatio="none"
        aria-hidden
      >
        <path d="M0 33 q18 -12 36 -2 t34 -6 t30 6 V50 H0z" fill="var(--sage)" opacity=".55" />
        <path d="M0 42 q22 -10 44 0 t56 -4 V50 H0z" fill="var(--primary)" opacity=".3" />
      </svg>
      {[0, 1, 2, 3, 4].map((k) => (
        <span
          key={k}
          className="pointer-events-none absolute bottom-0 text-2xl animate-sway"
          style={{ left: `${4 + k * 21}%`, animationDelay: `${k * 0.4}s`, ...play }}
          aria-hidden
        >
          {FLOWERS[(k + index) % FLOWERS.length]}
        </span>
      ))}
      <img
        src={CHARACTERS[shot.who].image}
        alt=""
        className={cn("pointer-events-none absolute bottom-1 left-2 h-[58%] w-auto", actor)}
        style={play}
      />
      {[0, 1, 2].map((k) => (
        <span
          key={k}
          className="pointer-events-none absolute bottom-2 text-2xl animate-drift"
          style={{
            left: `${24 + k * 22}%`,
            animationDelay: `${k * 1.1 + index * 0.5}s`,
            ...play,
          }}
          aria-hidden
        >
          {shot.fx}
        </span>
      ))}
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/50 via-transparent to-transparent"
        aria-hidden
      />
    </div>
  );
}
