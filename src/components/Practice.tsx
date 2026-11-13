import { useEffect, useRef, useState } from "react";
import { Btn, DoneCard } from "./Scene";
import { CharacterSay, type Action } from "./Character";
import { MagicStage } from "./MagicStage";
import { clearSession, getSession, saveSession, type Session } from "@/lib/sessions";
import { markDone } from "@/lib/store";
import { sfx } from "@/lib/audio";
import { useExtraT } from "@/lib/i18n.extras";
import { castFor, CHARACTERS, type CharId } from "@/content/characters";

/** Option grid shared by every practice step. */
function Choices({
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
  const t = useExtraT();
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
          className={`flex h-auto items-center gap-3 py-3 text-left ${
            value === option ? "ring-4 ring-ring" : ""
          }`}
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

export interface PracticeStep {
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
  /** Practice: tap each thing once, when the child actually notices it. */
  checklist?: readonly string[];
  /** Practice: a private note that stays on this device. */
  write?: { label: string; placeholder?: string; rows?: number };
  /** Show options as a numbered ladder, for "how much / how strong?" answers. */
  ladder?: boolean;
}

/** True when the OS or the in-app "less motion" toggle asks for calm. */
const calm = () =>
  document.documentElement.classList.contains("reduce-motion") ||
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * A multi-stage exercise the child does, not reads: each step can ask them to
 * tap what they notice, write a private line, or pick a rung, and progress is
 * kept on the device so an interrupted exercise can be resumed.
 */
export function Practice({
  id,
  steps,
  ending,
  night = false,
}: {
  id: string;
  steps: readonly PracticeStep[];
  ending: string;
  night?: boolean;
}) {
  const t = useExtraT();
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [checks, setChecks] = useState<Record<number, string[]>>({});
  const [done, setDone] = useState(false);
  const [offer, setOffer] = useState<Session | null>(null);
  const [guide, friend] = castFor(id);
  const step = steps[index];
  const card = night ? "night-card" : "paper-card";
  const stepRef = useRef<HTMLElement | null>(null);
  const doneRef = useRef<HTMLDivElement | null>(null);
  const replyRef = useRef<HTMLDivElement | null>(null);
  const mounted = useRef(false);
  const lastSaved = useRef("");

  // Offer to carry on where the child stopped. Read after mount: no storage on the server.
  useEffect(() => {
    const saved = getSession(id);
    if (saved && saved.step > 0 && steps.length > 1) setOffer(saved);
  }, [id, steps.length]);

  useEffect(() => {
    if (done || offer) return;
    const payload = JSON.stringify([index, answers, checks]);
    if (payload === lastSaved.current) return;
    lastSaved.current = payload;
    saveSession(
      id,
      index,
      Object.fromEntries(Object.entries(answers).map(([k, v]) => [String(k), v])),
      Object.fromEntries(Object.entries(checks).map(([k, v]) => [String(k), v])),
    );
  }, [id, index, answers, checks, done, offer]);

  // A new step renders above the current scroll position. Bring the step — or
  // the ending — back to the top. Skipped on first mount.
  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return;
    }
    const target = stepRef.current ?? doneRef.current;
    target?.scrollIntoView({
      block: "start",
      behavior: calm() ? "auto" : "smooth",
    });
  }, [index, done]);

  // A reply can land under the fixed bottom bar; centre it only when unreadable.
  useEffect(() => {
    const answered = !!answers[index] || checks[index]?.length === step?.checklist?.length;
    if (!answered) return;
    const el = replyRef.current;
    if (!el) return;
    const timer = window.setTimeout(() => {
      const rect = el.getBoundingClientRect();
      const barClearance = 88;
      const readable = rect.top >= 0 && rect.bottom <= window.innerHeight - barClearance;
      if (readable) return;
      el.scrollIntoView({
        block: "center",
        behavior: calm() ? "auto" : "smooth",
      });
    }, 120);
    return () => window.clearTimeout(timer);
  }, [answers, checks, index, step]);

  const recap = steps.flatMap((s, k) => {
    const answer = answers[k];
    const checked = checks[k] ?? [];
    if (answer) return [{ q: s.title, a: answer }];
    if (checked.length) return [{ q: s.title, a: checked.join(" · ") }];
    return [];
  });

  const restart = () => {
    clearSession(id);
    lastSaved.current = "";
    setIndex(0);
    setAnswers({});
    setChecks({});
    setDone(false);
  };

  if (done)
    return (
      <div ref={doneRef} className="scroll-mt-4 space-y-4">
        <DoneCard text={t(ending)} night={night} who={guide} again={restart} />
        {recap.length > 0 && (
          <div className={`space-y-2 p-4 ${card}`}>
            <p className="font-bold">{t("Твоя стежка сьогодні")}</p>
            <ul className="space-y-1.5">
              {recap.map((item) => (
                <li key={item.q} className="rounded-xl bg-secondary/70 px-3 py-2 text-sm">
                  <span className="block font-bold">{t(item.q)}</span>
                  <span className="opacity-90">{item.a}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );

  if (offer) {
    const at = Math.min(offer.step, steps.length - 1);
    return (
      <section className={`space-y-4 p-6 ${card}`} aria-live="polite">
        <CharacterSay
          who={guide}
          night={night}
          mood="think"
          text={t("Ти вже почав цю вправу. Продовжити з кроку {i}?", {
            i: at + 1,
          })}
        />
        <div className="flex flex-wrap justify-center gap-2">
          <Btn
            onClick={() => {
              setAnswers(
                Object.fromEntries(Object.entries(offer.answers).map(([k, v]) => [Number(k), v])),
              );
              setChecks(
                Object.fromEntries(Object.entries(offer.checks).map(([k, v]) => [Number(k), v])),
              );
              setIndex(at);
              setOffer(null);
            }}
          >
            {t("Продовжити з кроку {i}", { i: at + 1 })}
          </Btn>
          <Btn variant="soft" onClick={restart}>
            {t("Почати спочатку")}
          </Btn>
        </div>
      </section>
    );
  }

  if (!step) return null;
  const selected = answers[index] ?? "";
  const checked = checks[index] ?? [];
  const allChecked = !!step.checklist && checked.length === step.checklist.length;
  const speaker = step.who ?? (step.options ? friend : guide);
  const reply = selected
    ? (step.responses?.[selected] ?? step.response)
    : allChecked
      ? step.response
      : undefined;
  const finish = index === steps.length - 1;
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
      <nav aria-label={t("Кроки вправи")} className="flex flex-wrap justify-center gap-1">
        {steps.map((s, k) => (
          <button
            key={s.title}
            type="button"
            disabled={k > index}
            aria-current={k === index ? "step" : undefined}
            aria-label={t("Крок {i} з {n}", { i: k + 1, n: steps.length })}
            onClick={() => {
              if (k >= index) return;
              sfx("page");
              setIndex(k);
            }}
            className={`grid h-11 w-11 place-items-center rounded-full text-sm font-bold transition ${
              k === index
                ? "bg-honey text-accent-foreground shadow-soft"
                : k < index
                  ? "bg-secondary text-secondary-foreground"
                  : "bg-secondary/50 text-muted-foreground opacity-60"
            }`}
          >
            {k < index ? "✓" : k + 1}
          </button>
        ))}
      </nav>
      <CharacterSay
        who={speaker}
        night={night}
        text={`${t(step.title)}. ${t(step.text)}`}
        mood={step.options || step.checklist ? "think" : "talk"}
        action={step.action}
      />
      <MagicStage theme={id.split("-")[0] ?? "meadow"} night={night} />
      {step.action && (
        <p className="text-center text-sm font-bold">
          {t("Повторюй разом зі мною, якщо хочеш 🙂")}
        </p>
      )}
      {step.checklist && (
        <div className={`space-y-3 p-4 ${card}`}>
          <p className="font-bold">{t("Торкайся, коли помітиш — можна в будь-якому порядку.")}</p>
          <div className="grid gap-2 sm:grid-cols-2">
            {step.checklist.map((item) => {
              const on = checked.includes(item);
              return (
                <Btn
                  key={item}
                  variant={on ? "honey" : "soft"}
                  aria-pressed={on}
                  onClick={() => {
                    sfx(on ? "soft" : "select");
                    // Functional update: two fast taps must both land.
                    setChecks((previous) => {
                      const current = previous[index] ?? [];
                      return {
                        ...previous,
                        [index]: on
                          ? current.filter((value) => value !== item)
                          : [...current, item],
                      };
                    });
                  }}
                  className={`flex h-auto items-center gap-3 py-3 text-left ${on ? "ring-2 ring-ring" : ""}`}
                >
                  <span className="text-xl" aria-hidden>
                    {on ? "✅" : "⭕"}
                  </span>
                  {t(item)}
                </Btn>
              );
            })}
          </div>
          <p role="status" className="text-sm opacity-80">
            {t("Позначено {i} з {n}", {
              i: checked.length,
              n: step.checklist.length,
            })}
          </p>
        </div>
      )}
      {step.write && (
        <div className={`space-y-2 p-4 ${card}`}>
          <label className="block font-bold" htmlFor={`${id}-${index}-note`}>
            {t(step.write.label)}
          </label>
          <textarea
            id={`${id}-${index}-note`}
            rows={step.write.rows ?? 3}
            value={selected}
            maxLength={280}
            placeholder={step.write.placeholder ? t(step.write.placeholder) : undefined}
            onChange={(event) =>
              setAnswers((previous) => ({ ...previous, [index]: event.target.value }))
            }
            className="w-full resize-none rounded-2xl bg-secondary p-3 text-base outline-none focus:ring-2 focus:ring-ring"
          />
          <p className="text-sm opacity-75">
            {t("Це бачиш лише ти — текст не залишає цей пристрій.")}
          </p>
        </div>
      )}
      {step.options && (
        <div className={`space-y-3 p-4 ${card}`}>
          <p className="font-bold">
            {t(step.ladder ? "Наскільки сильно? Обери сходинку:" : "Обери, що тобі ближче:")}
          </p>
          {step.ladder ? (
            <div className="space-y-2">
              {step.options.map((option, k) => {
                const on = selected === option;
                return (
                  <Btn
                    key={option}
                    variant={on ? "primary" : "soft"}
                    aria-pressed={on}
                    onClick={() => {
                      sfx("select");
                      setAnswers((previous) => ({ ...previous, [index]: option }));
                    }}
                    className={`flex h-auto w-full items-center gap-3 py-3 text-left ${on ? "ring-4 ring-ring" : ""}`}
                  >
                    <span
                      className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-honey text-accent-foreground"
                      aria-hidden
                    >
                      {k + 1}
                    </span>
                    <span className="flex-1">{t(option)}</span>
                    <span
                      className="h-2 shrink-0 rounded-full bg-honey/60"
                      style={{ width: `${24 + k * 18}px` }}
                      aria-hidden
                    />
                  </Btn>
                );
              })}
            </div>
          ) : (
            <Choices
              icons={step.icons}
              options={step.options}
              value={selected}
              onChange={(value) => setAnswers((previous) => ({ ...previous, [index]: value }))}
            />
          )}
        </div>
      )}
      {selected && step.vision && (
        <Vision
          items={steps.flatMap((st, k) =>
            st.vision && answers[k] && st.icons?.[answers[k]!]
              ? [{ icon: st.icons[answers[k]!]!, label: answers[k]! }]
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
            if (finish) {
              clearSession(id);
              markDone(id);
              setDone(true);
            } else {
              sfx("soft");
              setIndex(index + 1);
            }
          }}
        >
          {finish ? t("Завершити ✓") : t("Далі →")}
        </Btn>
      </div>
      <p className="text-center text-sm opacity-75">
        {t(CHARACTERS[guide].comfort)} {t("Можна пропустити будь-яке запитання.")}
      </p>
    </section>
  );
}

/** The imagined place, built from the child's choices. */
function Vision({ items, night }: { items: { icon: string; label: string }[]; night: boolean }) {
  const t = useExtraT();
  return (
    <div
      className={`${night ? "night-card" : "paper-card"} relative h-44 overflow-hidden bg-gradient-to-b from-sky/40 to-sage/40 p-0`}
      role="img"
      aria-label={t("Твоя уявна картина: {l}", {
        l: items.map((i) => t(i.label)).join(", "),
      })}
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
          style={{
            left: `${15 + ((k * 30) % 70)}%`,
            animationDelay: `${k * 0.15}s`,
          }}
          aria-hidden
        >
          {it.icon}
        </span>
      ))}
      {[20, 45, 70, 85].map((l, k) => (
        <span
          key={l}
          className="absolute h-1.5 w-1.5 rounded-full bg-honey animate-twinkle"
          style={{
            left: `${l}%`,
            top: `${30 + k * 8}%`,
            animationDelay: `${k * 0.4}s`,
          }}
          aria-hidden
        />
      ))}
    </div>
  );
}
