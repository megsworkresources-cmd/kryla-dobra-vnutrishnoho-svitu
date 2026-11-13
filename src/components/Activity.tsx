import { useEffect, useRef, useState, type ReactNode } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { Btn, DoneCard } from "./Scene";
import { CharacterSay, type Action } from "./Character";
import { markDone, useStore } from "@/lib/store";
import { speak, stopSpeaking } from "@/lib/speak";
import { sfx } from "@/lib/audio";
import { useT } from "@/lib/i18n";
import { MagicStage } from "./MagicStage";
import { castFor, CHARACTERS, type CharId } from "@/content/characters";

export function Narration({ text }: { text: string }) {
  const t = useT();
  const enabled = useStore((s) => s.voice && s.sound);
  const [playing, setPlaying] = useState(false);
  const [supported, setSupported] = useState(false);
  useEffect(() => {
    setSupported("speechSynthesis" in window);
  }, []);
  useEffect(() => {
    setPlaying(false);
    if (enabled && supported) {
      speak(text);
      setPlaying(true);
    }
    return stopSpeaking;
  }, [text, enabled, supported]);
  return (
    <Btn
      variant="soft"
      disabled={!supported}
      aria-label={playing ? t("Зупинити голос") : t("Послухати ще раз")}
      onClick={() => {
        if (playing) stopSpeaking();
        else speak(text, { force: true });
        setPlaying(!playing);
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

export interface GuidedStep {
  title: string;
  text: string;
  options?: readonly string[];
  /** Same reply whatever is chosen. */
  response?: string;
  /** Personal reply for each choice. */
  responses?: Record<string, string>;
  /** Which character speaks this step (defaults to the place's guide). */
  who?: CharId;
  /** The character acts this out, so the child can copy it. */
  action?: Action;
  /** A picture for each option. */
  icons?: Record<string, string>;
  /** Show the chosen pictures as an imagined scene before the reply. */
  vision?: boolean;
}

/** True when the OS or the in-app "less motion" toggle asks for calm. */
const calm = () =>
  document.documentElement.classList.contains("reduce-motion") ||
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export function Guided({
  id,
  steps,
  ending,
  night = false,
}: {
  id: string;
  steps: readonly GuidedStep[];
  ending: string;
  night?: boolean;
}) {
  const t = useT();
  const [index, setIndex] = useState(0);
  const [choices, setChoices] = useState<Record<number, string>>({});
  const [done, setDone] = useState(false);
  const [guide, friend] = castFor(id);
  const step = steps[index];
  const stepRef = useRef<HTMLElement | null>(null);
  const doneRef = useRef<HTMLDivElement | null>(null);
  const replyRef = useRef<HTMLDivElement | null>(null);
  const mounted = useRef(false);

  // A new step renders above wherever the page was scrolled to, so the child
  // would land in the middle of it. Bring the step (or the ending card) back
  // to the top. Skipped on first mount so the page keeps its normal entry.
  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return;
    }
    const target = stepRef.current ?? doneRef.current;
    target?.scrollIntoView({ block: "start", behavior: calm() ? "auto" : "smooth" });
  }, [index, done]);

  // The character's answer to a choice can land under the bottom bar. Pull it
  // into view only when it is actually off-screen, so nothing jumps needlessly.
  useEffect(() => {
    if (!choices[index]) return;
    const el = replyRef.current;
    if (!el) return;
    const id = window.setTimeout(() => {
      el.scrollIntoView({ block: "nearest", behavior: calm() ? "auto" : "smooth" });
    }, 120);
    return () => window.clearTimeout(id);
  }, [choices, index]);

  if (done)
    return (
      <div ref={doneRef} className="scroll-mt-4">
        <DoneCard
          text={t(ending)}
          night={night}
          who={guide}
          again={() => {
            setIndex(0);
            setChoices({});
            setDone(false);
          }}
        />
      </div>
    );
  if (!step) return null;
  const selected = choices[index] ?? "";
  const speaker = step.who ?? (step.options ? friend : guide);
  const reply = selected ? (step.responses?.[selected] ?? step.response) : undefined;
  return (
    <section
      key={index}
      ref={stepRef}
      className="space-y-4 animate-step scroll-mt-4"
      aria-label={t(step.title)}
    >
      <div className="flex items-center gap-3">
        <div
          className="h-2.5 flex-1 overflow-hidden rounded-full bg-secondary"
          role="progressbar"
          aria-valuemin={1}
          aria-valuemax={steps.length}
          aria-valuenow={index + 1}
          aria-label={t("Прогрес вправи")}
        >
          <div
            className="h-full rounded-full bg-honey transition-all duration-500"
            style={{ width: `${((index + 1) / steps.length) * 100}%` }}
          />
        </div>
        <p className="shrink-0 text-sm font-bold">
          {t("Крок {i} з {n}", { i: index + 1, n: steps.length })}
        </p>
      </div>
      <CharacterSay
        who={speaker}
        night={night}
        text={`${t(step.title)}. ${t(step.text)}`}
        mood={step.options ? "think" : "talk"}
        action={step.action}
      />
      <MagicStage theme={id.split("-")[0] ?? "meadow"} night={night} />
      {step.action && (
        <p className="text-center text-sm font-bold">
          {t("Повторюй разом зі мною, якщо хочеш 🙂")}
        </p>
      )}
      {step.options && (
        <div className={`space-y-3 p-4 ${night ? "night-card" : "paper-card"}`}>
          <p className="font-bold">{t("Обери, що тобі ближче:")}</p>
          <Choices
            icons={step.icons}
            options={step.options}
            value={selected}
            onChange={(value) => setChoices({ ...choices, [index]: value })}
          />
        </div>
      )}
      {selected && step.vision && (
        <Vision
          items={steps.flatMap((st, k) =>
            st.vision && choices[k] && st.icons?.[choices[k]!]
              ? [{ icon: st.icons[choices[k]!]!, label: choices[k]! }]
              : [],
          )}
          night={night}
        />
      )}
      {reply && (
        <div
          ref={replyRef}
          aria-live="polite"
          className={step.vision ? "animate-fade-up [animation-delay:900ms]" : ""}
        >
          <CharacterSay
            who={speaker === guide ? friend : guide}
            side="right"
            size="sm"
            night={night}
            mood="cheer"
            text={t(reply)}
          />
        </div>
      )}
      <div className="flex flex-wrap justify-between gap-3">
        <Btn variant="soft" disabled={index === 0} onClick={() => setIndex(index - 1)}>
          {t("← Попередній крок")}
        </Btn>
        <Btn
          onClick={() => {
            if (index === steps.length - 1) {
              markDone(id);
              setDone(true);
            } else {
              sfx("soft");
              setIndex(index + 1);
            }
          }}
        >
          {index === steps.length - 1 ? t("Завершити ✓") : t("Далі →")}
        </Btn>
      </div>
      <p className="text-center text-sm opacity-75">
        {t(CHARACTERS[guide].comfort)} {t("Можна пропустити будь-яке запитання.")}
      </p>
    </section>
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

/** The imagined place, built from the child's choices. */
function Vision({ items, night }: { items: { icon: string; label: string }[]; night: boolean }) {
  const t = useT();
  return (
    <div
      className={`${night ? "night-card" : "paper-card"} relative h-44 overflow-hidden bg-gradient-to-b from-sky/40 to-sage/40 p-0`}
      role="img"
      aria-label={t("Твоя уявна картина: {l}", { l: items.map((i) => t(i.label)).join(", ") })}
    >
      <div className="absolute inset-x-0 bottom-0 h-1/3 rounded-t-[50%] bg-sage/50" />
      <span className="absolute right-6 top-4 text-3xl animate-float" aria-hidden>
        ☀️
      </span>
      <span
        className="absolute left-6 top-6 text-2xl animate-float [animation-delay:1s]"
        aria-hidden
      >
        ☁️
      </span>
      {items.map((it, k) => (
        <span
          key={it.label}
          className="absolute bottom-6 text-6xl animate-pop"
          style={{ left: `${15 + ((k * 30) % 70)}%`, animationDelay: `${k * 0.15}s` }}
          aria-hidden
        >
          {it.icon}
        </span>
      ))}
      {[20, 45, 70, 85].map((l, k) => (
        <span
          key={l}
          className="absolute h-1.5 w-1.5 rounded-full bg-honey animate-twinkle"
          style={{ left: `${l}%`, top: `${30 + k * 8}%`, animationDelay: `${k * 0.4}s` }}
          aria-hidden
        />
      ))}
    </div>
  );
}
