import { useEffect, useState } from "react";
import { Volume2 } from "lucide-react";
import { CHARACTERS, type CharId } from "@/content/characters";
import { speak } from "@/lib/speak";
import { useStore } from "@/lib/store";
import { useT } from "@/lib/i18n";

export type Mood = "talk" | "listen" | "think" | "cheer" | "calm";
/** Body action the character acts out so the child can copy it. */
export type Action = "squeeze" | "shrug" | "feet" | "settle" | "look" | "breathe";
const MOOD_MARK: Record<Mood, string> = {
  talk: "",
  listen: "👂",
  think: "💭",
  cheer: "✨",
  calm: "🌿",
};

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
  const [pulse, setPulse] = useState(0);
  useEffect(() => {
    setPulse((p) => p + 1);
    if (autoSpeak && voiceOn) speak(text, { who });
  }, [text, autoSpeak, voiceOn, who]);
  const h = { sm: "h-24", md: "h-32 sm:h-40", lg: "h-44 sm:h-56" }[size];
  return (
    <figure
      className={`grid min-w-0 grid-cols-1 items-end gap-3 sm:flex ${side === "right" ? "sm:flex-row-reverse" : ""}`}
    >
      <div className="relative mx-auto shrink-0 sm:mx-0">
        <img
          key={pulse}
          src={c.image}
          alt={c.name}
          className={`${h} w-auto object-contain drop-shadow-md ${action ? `animate-act-${action}` : mood === "cheer" ? "animate-hop" : mood === "think" ? "animate-sway" : "animate-talk"}`}
        />
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
          onClick={() => speak(text, { force: true, who })}
          aria-label={t("Послухати, що каже {n}", { n: t(c.name) })}
          className="absolute -bottom-4 right-4 flex h-11 w-11 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-soft"
        >
          <Volume2 size={16} />
        </button>
      </figcaption>
    </figure>
  );
}
