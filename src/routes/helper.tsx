import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";
import night from "@/assets/night.jpg";
import { Btn, Scene } from "@/components/Scene";
import { CharacterSay } from "@/components/Character";
import { findActivity } from "@/content/catalog";
import { EMOTIONS } from "@/content/emotions";
import { askHelper } from "@/lib/suggest.functions";
import { markDone, useStore, type AgeBand } from "@/lib/store";
import { useT, useLang } from "@/lib/i18n";
import { sfx } from "@/lib/audio";
import { pageHead } from "@/content/journeys";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/helper")({
  head: () =>
    pageHead("Помічник почуттів", "Розкажи, як ти почуваєшся — персонажі підкажуть вправу."),
  component: Helper,
});

const AGE_ASK: Record<AgeBand, "5-7" | "8-10" | "11-13"> = {
  young: "5-7",
  mid: "8-10",
  older: "11-13",
};
type Reply = {
  activity: string;
  guide: "solomiya" | "taras" | "olenka" | "marko" | "daryna" | "lihtaryk";
  mood: "calm" | "cheer" | "listen" | "think";
  feeling: string;
  reply: string;
  why: string;
};
const QUICK = [
  "я сумую",
  "мені страшно",
  "я злюся",
  "мене кривдять",
  "мені нудно",
  "я радію",
  "у мене багато думок",
  "я не можу заснути",
];

/** The only child-text feature: one request, with no app-side text persistence. */
export function Helper() {
  const t = useT();
  const navigate = useNavigate();
  const age = useStore((s) => s.age);
  const lang = useLang();
  const [text, setText] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "error" | "short" | "signin">("idle");
  const [reply, setReply] = useState<Reply | null>(null);
  const request = useRef(0);
  const inFlight = useRef(false);
  const busy = state === "loading";

  useEffect(
    () => () => {
      request.current += 1;
    },
    [],
  );

  const ask = async (input: string) => {
    const clean = input.trim();
    if (inFlight.current || !clean) return;
    if (clean.length < 2) {
      setState("short");
      return;
    }
    inFlight.current = true;
    const mine = ++request.current;
    sfx("select");
    setState("loading");
    try {
      const { supabase } = await import("@/integrations/supabase/client");
      const { data: auth } = await supabase.auth.getSession();
      if (!auth.session) {
        setState("signin");
        return;
      }
      const res = await askHelper({ data: { text: clean, age: AGE_ASK[age], lang } });
      if (mine !== request.current) return;
      if (res.ok) {
        setReply(res.suggestion);
        setState("idle");
      } else setState("error");
    } catch {
      if (mine === request.current) setState("error");
    } finally {
      if (mine === request.current) inFlight.current = false;
    }
  };
  const act = reply && findActivity(reply.activity);
  return (
    <Scene image={night} night title="Помічник почуттів" back="/world">
      <div className="space-y-4">
        <div className="night-card p-5 text-center">
          <span
            className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-honey text-2xl"
            aria-hidden
          >
            <Sparkles />
          </span>
          <h2 className="mt-2 font-display text-2xl font-bold">{t("Розкажи, як ти")}</h2>
          <p className="mt-1 text-sm opacity-80">
            {t(
              "Це єдине місце, де твої слова надсилаються для обробки, щоб підібрати вправу. Застосунок не зберігає твій текст.",
            )}
          </p>
        </div>
        {!reply && (
          <div className="space-y-3">
            <p className="font-bold">{t("Або обери:")}</p>
            <div className="flex flex-wrap gap-2">
              {QUICK.map((q) => (
                <Btn
                  key={q}
                  variant="soft"
                  disabled={busy}
                  onClick={() => {
                    setText(q);
                    void ask(q);
                  }}
                  className="min-h-11 rounded-full bg-secondary px-4 text-sm font-bold"
                >
                  {t(q)}
                </Btn>
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              {EMOTIONS.slice(0, 6).map((e) => (
                <Btn
                  key={e.id}
                  variant="soft"
                  disabled={busy}
                  onClick={() => {
                    const q = t(e.name).toLowerCase();
                    setText(q);
                    void ask(q);
                  }}
                  className="flex min-h-11 items-center gap-2 rounded-full bg-secondary px-4 text-sm font-bold text-secondary-foreground"
                >
                  <span className={`h-3 w-3 rounded-full ${e.color}`} />
                  {t(e.name)}
                </Btn>
              ))}
            </div>
            <div className="night-card p-4">
              <label htmlFor="feeling" className="block font-bold">
                {t("Або напиши своїми словами")}
              </label>
              <textarea
                id="feeling"
                value={text}
                onChange={(e) => {
                  setText(e.target.value);
                  if (state === "error" || state === "short" || state === "signin")
                    setState("idle");
                }}
                rows={3}
                maxLength={300}
                placeholder={t("Наприклад: мені сумно, бо…")}
                className="mt-2 w-full resize-none rounded-2xl bg-secondary p-3 text-base text-secondary-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-ring"
              />
              <Btn onClick={() => void ask(text)} className="mt-3 w-full" disabled={busy}>
                {busy ? t("Персонажі думають…") : t("Підказати вправу")}
              </Btn>
            </div>
            {state === "short" && (
              <p className="paper-card p-4 text-center" role="alert">
                {t("Додай ще хоча б одну літеру, щоб персонажі зрозуміли.")}
              </p>
            )}
            {state === "signin" && (
              <p className="paper-card p-4 text-center" role="alert">
                {t("Попроси дорослого увійти, щоб персонажі могли підказати.")}{" "}
                <Link
                  to="/caregiver-login"
                  search={{ redirect: "/helper" }}
                  className="font-bold underline"
                >
                  {t("Для дорослих")}
                </Link>
              </p>
            )}
            {state === "error" && (
              <p className="paper-card p-4 text-center" role="alert">
                {t("Персонажі тимчасово недоступні. Спробуй пізніше.")}
              </p>
            )}
          </div>
        )}
        {reply && (
          <div className="animate-fade-up space-y-4">
            <CharacterSay
              who={reply.guide}
              night
              mood={reply.mood as never}
              size="lg"
              text={reply.reply}
            />
            {act && (
              <div className="night-card p-5">
                <p className="text-xs font-extrabold uppercase tracking-wide text-moon">
                  {t("Спробуй це")}
                </p>
                <div className="mt-2 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-2xl bg-secondary p-3 text-secondary-foreground">
                  <span className="font-bold">
                    {t(act.title)}
                    <span className="block text-xs font-normal opacity-75">{t(act.desc)}</span>
                  </span>
                  <Btn
                    onClick={() => {
                      markDone("helper");
                      navigate({ to: `/${act.place}/${act.id}` as never });
                    }}
                    aria-label={t("Далі: {l}", { l: t(act.title) })}
                  >
                    {t("Далі")}
                  </Btn>
                </div>
                <p className="mt-3 text-sm">
                  {t("Чому це може допомогти")} — {reply.why}
                </p>
              </div>
            )}
            <Btn
              variant="soft"
              onClick={() => {
                request.current += 1;
                inFlight.current = false;
                setReply(null);
                setText("");
                setState("idle");
              }}
              className="w-full"
            >
              {t("Розказати ще раз")}
            </Btn>
          </div>
        )}
        <p className="text-center text-sm opacity-70">
          {t(
            "Твої почуття — важливі. Якщо тобі страшно чи боляче, розкажи дорослому, якому довіряєш.",
          )}
          <br />
          <Link to="/parents" className="inline-flex min-h-11 items-center underline">
            {t("Інформація для дорослих")}
          </Link>
        </p>
      </div>
    </Scene>
  );
}
