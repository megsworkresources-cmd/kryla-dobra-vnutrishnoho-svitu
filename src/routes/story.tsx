import { ReportAi } from "@/components/GrownUpLink";
import { useEffect, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { BookOpen, Sparkles, Square, Volume2 } from "lucide-react";
import night from "@/assets/night.jpg";
import { Btn, Scene } from "@/components/Scene";
import { CharacterSay } from "@/components/Character";
import { MagicStage } from "@/components/MagicStage";
import { Motif } from "@/components/Motif";
import { CHARACTERS, type CharId } from "@/content/characters";
import { PLACES } from "@/content/places";
import { pageHead } from "@/content/journeys";
import { makeStory } from "@/lib/story.functions";
import { markDone, useStore, type AgeBand } from "@/lib/store";
import { useLang, useT } from "@/lib/i18n";
import { speak, stopSpeaking, useSpeechState } from "@/lib/speak";
import { useServerFn } from "@tanstack/react-start";
import { readyStory } from "@/content/ready-story";
import { composedStory } from "@/content/story-builder";

export const Route = createFileRoute("/story")({
  head: () =>
    pageHead(
      "Казка для мене",
      "Обери друга, місце й настрій — Claude створить лагідну казку саме для тебе.",
    ),
  component: StoryCompanion,
});

const AGE_ASK: Record<AgeBand, "5-7" | "8-10" | "11-13"> = {
  young: "5-7",
  mid: "8-10",
  older: "11-13",
};
const FEELINGS = [
  ["calm", "Хочу спокою", "🌙"],
  ["sad", "Мені сумно", "💧"],
  ["worried", "Я хвилююся", "☁️"],
  ["angry", "Я злюся", "🔥"],
  ["proud", "Я пишаюся собою", "🌻"],
  ["curious", "Мені цікаво", "✨"],
] as const;
type Feeling = (typeof FEELINGS)[number][0];
type StoryPlace = "garden" | "forest" | "meadow" | "clouds" | "sky" | "studio" | "path" | "safe";
const isStoryPlace = (id: string): id is StoryPlace =>
  ["garden", "forest", "meadow", "clouds", "sky", "studio", "path", "safe"].includes(id);
type Story = { title: string; scenes: { text: string }[]; closing: string };

function Choice({
  selected,
  onClick,
  children,
  label,
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
  label: string;
}) {
  return (
    <Btn
      variant="soft"
      aria-label={label}
      aria-pressed={selected}
      onClick={onClick}
      className={`min-h-12 rounded-2xl bg-secondary px-3 py-2 text-sm font-bold text-secondary-foreground transition active:scale-95 ${selected ? "ring-4 ring-ring" : ""}`}
    >
      {children}
    </Btn>
  );
}

function StoryCompanion() {
  const t = useT();
  const lang = useLang();
  const age = useStore((s) => s.age);
  const [who, setWho] = useState<CharId>("solomiya");
  const [place, setPlace] = useState<StoryPlace>("sky");
  const [feeling, setFeeling] = useState<Feeling>("calm");
  const [story, setStory] = useState<Story | null>(null);
  const [loading, setLoading] = useState(false);
  const [source, setSource] = useState<"ai" | "ready" | "app">("ai");
  const [hasRead, setHasRead] = useState(false);
  const request = useRef(0);
  const told = useRef(0);
  const createStory = useServerFn(makeStory);
  const speech = useSpeechState();
  const speaking = speech === "loading" || speech === "playing";

  useEffect(
    () => () => {
      request.current += 1;
      stopSpeaking();
    },
    [],
  );

  const show = (next: Story, from: "ai" | "app") => {
    setSource(from);
    setStory(next);
    setHasRead(false);
    markDone("story");
  };

  const generate = async () => {
    const mine = ++request.current;
    const variant = told.current++;
    stopSpeaking();
    setLoading(true);
    try {
      const res = await createStory({ data: { who, place, feeling, age: AGE_ASK[age], lang } });
      if (mine !== request.current) return;
      // The app can always write a story itself, so creating one never dead-ends.
      show(
        res.ok ? res.story : composedStory({ who, place, feeling, lang, variant }),
        res.ok ? "ai" : "app",
      );
    } catch {
      if (mine === request.current) show(composedStory({ who, place, feeling, lang, variant }), "app");
    } finally {
      if (mine === request.current) setLoading(false);
    }
  };

  const reset = () => {
    request.current += 1;
    stopSpeaking();
    setStory(null);
    setSource("ai");
    setHasRead(false);
    setLoading(false);
  };
  const openPrepared = () => {
    request.current += 1;
    stopSpeaking();
    setLoading(false);
    setSource("ready");
    setHasRead(false);
    setStory(readyStory(lang));
  };

  return (
    <Scene image={night} night title="Казка для мене" back="/world">
      <div className="space-y-4">
        <CharacterSay
          who={who}
          night
          mood="listen"
          size="md"
          autoSpeak={false}
          text={
            story
              ? t("Ось історія, яку ми створили разом. Можна читати в своєму темпі.")
              : t("Обери друга, чарівне місце й настрій. Я допоможу скласти нову казку!")
          }
        />

        {!story ? (
          <div className="paper-card space-y-5 p-5 text-card-foreground">
            <fieldset>
              <legend className="font-display text-xl font-bold">{t("1. Хто буде героєм?")}</legend>
              <div className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-6">
                {(Object.keys(CHARACTERS) as CharId[]).map((id) => (
                  <Choice
                    key={id}
                    selected={who === id}
                    onClick={() => setWho(id)}
                    label={t("Обрати {n}", { n: t(CHARACTERS[id].name) })}
                  >
                    <img
                      loading="lazy"
                      decoding="async"
                      src={CHARACTERS[id].image}
                      alt=""
                      className="mx-auto h-14 w-14 object-contain"
                    />
                    <span className="mt-1 block truncate text-xs">{t(CHARACTERS[id].name)}</span>
                  </Choice>
                ))}
              </div>
            </fieldset>
            <fieldset>
              <legend className="font-display text-xl font-bold">{t("2. Куди вирушимо?")}</legend>
              <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
                {PLACES.map((p) => (
                  <Choice
                    key={p.id}
                    selected={place === p.id}
                    onClick={() => {
                      if (isStoryPlace(p.id)) setPlace(p.id);
                    }}
                    label={t("Обрати місце: {n}", { n: t(p.name) })}
                  >
                    <span className="block leading-tight">{t(p.name)}</span>
                  </Choice>
                ))}
              </div>
            </fieldset>
            <fieldset>
              <legend className="font-display text-xl font-bold">
                {t("3. Який настрій у казки?")}
              </legend>
              <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
                {FEELINGS.map(([id, label, icon]) => (
                  <Choice
                    key={id}
                    selected={feeling === id}
                    onClick={() => setFeeling(id)}
                    label={t("Обрати настрій: {n}", { n: t(label) })}
                  >
                    <span className="mr-1" aria-hidden>
                      {icon}
                    </span>
                    {t(label)}
                  </Choice>
                ))}
              </div>
            </fieldset>
            <p className="rounded-2xl bg-secondary p-3 text-sm text-secondary-foreground">
              {t(
                "До Claude надсилаються лише твій вік, мова й три вибори вище. Без імені, власних слів і збереження казки.",
              )}
            </p>
            <Btn onClick={() => void generate()} disabled={loading} className="w-full">
              <span className="inline-flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                {loading ? t("Claude складає казку…") : t("Створити мою казку")}
              </span>
            </Btn>
            <Btn variant="soft" onClick={openPrepared} className="w-full">
              {t("Обрати готову казку")}
            </Btn>
          </div>
        ) : (
          <article className="animate-fade-up space-y-4" aria-live="polite">
            <Motif place={place} id="story" night />
            <div className="paper-card overflow-hidden p-5 text-card-foreground sm:p-6">
              <p className="text-xs font-extrabold uppercase tracking-wide text-muted-foreground">
                {t(
                  source === "ai"
                    ? "Нова казка з Claude"
                    : source === "ready"
                      ? "Готова казка"
                      : "Складено в застосунку",
                )}
              </p>
              <h2 className="mt-1 font-display text-3xl font-bold">{story.title}</h2>
              <div className="mt-5 space-y-5">
                {story.scenes.map((scene, i) => (
                  <section
                    key={`${i}-${scene.text.slice(0, 20)}`}
                    className="animate-step"
                    style={{ animationDelay: `${i * 120}ms` }}
                  >
                    <h3 className="text-sm font-extrabold uppercase tracking-wide text-primary">
                      {t("Сцена {n}", { n: i + 1 })}
                    </h3>
                    <p className="mt-1 text-lg leading-relaxed">{scene.text}</p>
                  </section>
                ))}
              </div>
              {source === "ai" && (
                <div className="mt-4">
                  <ReportAi
                    kind="story"
                    content={[story.title, ...story.scenes.map((x) => x.text)].join("\n")}
                  />
                </div>
              )}
              <p className="mt-6 rounded-2xl bg-secondary p-4 font-bold">{story.closing}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Btn
                  variant="soft"
                  aria-label={speaking ? t("Зупинити читання") : t("Слухати голосом пристрою")}
                  onClick={() => {
                    if (speaking) {
                      stopSpeaking();
                      return;
                    }
                    setHasRead(true);
                    speak(
                      [story.title, ...story.scenes.map((s) => s.text), story.closing].join(". "),
                      { force: true, localOnly: true, who },
                    );
                  }}
                >
                  <span className="inline-flex items-center gap-2">
                    {speaking ? <Square className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                    {speaking
                      ? t("Зупинити читання")
                      : hasRead
                        ? t("Слухати ще раз")
                        : t("Слухати голосом пристрою")}
                  </span>
                </Btn>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                {t(
                  "Читання відбувається на цьому пристрої; текст казки нікуди не надсилається для озвучення.",
                )}
              </p>
            </div>
            <MagicStage
              theme={place}
              night
              count={7}
              label={t("Торкайся чарівних символів після казки")}
            />
            <div className="grid gap-2 sm:grid-cols-2">
              <Btn onClick={() => void generate()} disabled={loading}>
                <span className="inline-flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  {loading ? t("Claude складає казку…") : t("Інша казка")}
                </span>
              </Btn>
              <Btn variant="soft" onClick={reset}>
                {t("Змінити вибір")}
              </Btn>
            </div>
          </article>
        )}
      </div>
    </Scene>
  );
}
