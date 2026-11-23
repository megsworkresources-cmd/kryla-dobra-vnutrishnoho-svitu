import { useEffect, useState, type ReactNode } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { Btn } from "./Scene";
import { CharacterSay } from "./Character";
import { useStore } from "@/lib/store";
import { speak, stopSpeaking, useSpeechState } from "@/lib/speak";
import { sfx } from "@/lib/audio";
import { useT } from "@/lib/i18n";

export function Narration({ text, autoSpeak = true }: { text: string; autoSpeak?: boolean }) {
  const t = useT();
  const enabled = useStore((s) => s.voice && s.sound);
  const speechState = useSpeechState();
  const playing = speechState === "playing" || speechState === "loading";
  const [supported, setSupported] = useState(false);
  useEffect(() => {
    setSupported("speechSynthesis" in window);
  }, []);
  useEffect(() => {
    if (autoSpeak && enabled && supported) {
      speak(text);
    }
    return stopSpeaking;
  }, [text, autoSpeak, enabled, supported]);
  return (
    <Btn
      variant="soft"
      disabled={!supported}
      aria-label={playing ? t("Зупинити голос") : t("Послухати ще раз")}
      onClick={() => {
        if (playing) stopSpeaking();
        else speak(text, { force: true });
      }}
      className="inline-flex items-center gap-2 text-sm"
    >
      <span>{playing ? <VolumeX size={18} /> : <Volume2 size={18} />}</span>
      {supported ? (playing ? t("Зупинити") : t("Послухати")) : t("Голос недоступний")}
    </Btn>
  );
}

export function Choices({
  options,
  value,
  onChange,
  icons,
}: {
  options: readonly string[];
  value: string;
  onChange: (s: string) => void;
  icons?: Record<string, string> | undefined;
}) {
  const t = useT();
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {options.map((option) => (
        <Btn
          key={option}
          variant={value === option ? "primary" : "soft"}
          aria-pressed={value === option}
          onClick={() => {
            sfx("select");
            onChange(option);
          }}
          className={`flex h-auto items-center gap-3 py-3 text-left ${value === option ? "ring-4 ring-ring" : ""}`}
        >
          {icons?.[option] && (
            <span className="text-3xl" aria-hidden>
              {icons[option]}
            </span>
          )}
          {t(option)}
        </Btn>
      ))}
    </div>
  );
}

export function ActivityHeading({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-5">
      <h2 className="font-display text-3xl font-bold">{title}</h2>
      {children}
    </section>
  );
}

/**
 * Every guided exercise now runs on the practice engine in Practice.tsx, which
 * supports checklist taps, private notes, ladders, resume and a recap. The
 * historic name is re-exported so existing activities pick it up unchanged.
 */
export { Practice as Guided } from "./Practice";
export type { PracticeStep as GuidedStep } from "./Practice";
