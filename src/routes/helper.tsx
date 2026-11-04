import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Scene, Btn } from "@/components/Scene";
import { CharacterSay } from "@/components/Character";
import { CHARACTERS } from "@/content/characters";
import { findActivity } from "@/content/catalog";
import { pageHead } from "@/content/journeys";
import { askHelper } from "@/lib/suggest.functions";
import { useStore } from "@/lib/store";
import { sfx } from "@/lib/audio";

export const Route = createFileRoute("/helper")({
  head: () => pageHead("Розкажи, як ти", "Опиши своє почуття, і друзі з Тихого Місця лагідно підкажуть вправу."),
  component: Helper,
});

const AGE = { young: "5-7", mid: "8-10", older: "11-13" } as const;
const CHIPS = ["Мені сумно", "Я злюся", "Мені страшно", "Я хвилююся", "Мені радісно", "Я втомився", "Не знаю"];
const ERR: Record<string, string> = {
  busy: "Друзі зараз трохи зайняті. Спробуй ще раз за хвилинку.",
  credits: "Помічник зараз відпочиває. Можна вибрати вправу на мапі.",
};

type Result = Awaited<ReturnType<typeof askHelper>>;

function Helper() {
  const ask = useServerFn(askHelper);
  const age = useStore((s) => s.age);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [res, setRes] = useState<Result | null>(null);

  async function send() {
    if (text.trim().length < 2 || busy) return;
    sfx("confirm"); setBusy(true); setRes(null);
    try { setRes(await ask({ data: { text, age: AGE[age] } })); }
    catch { setRes({ ok: false, error: "fail" }); }
    finally { setBusy(false); }
  }

  const s = res?.ok ? res.suggestion : null;
  const act = s ? findActivity(s.activity) : undefined;

  return (
    <Scene title="Розкажи, як ти" back="/world">
      <div className="space-y-5">
        {!s && (
          <div className="paper-card p-5">
            <CharacterSay who="lihtaryk" mood={busy ? "think" : "listen"}
              text={busy ? "Я уважно слухаю… Шукаю для тебе щось лагідне." : "Привіт! Розкажи своїми словами, як ти зараз. Можна одним словом. Можна нічого не писати."} />
          </div>
        )}

        {!s && (
          <div className="paper-card space-y-4 p-5 animate-fade-up">
            <div className="flex flex-wrap gap-2">
              {CHIPS.map((c) => (
                <button key={c} type="button" onClick={() => { sfx("select"); setText((t) => (t ? `${t} ${c.toLowerCase()}` : c)); }}
                  className="rounded-full bg-secondary px-4 py-2 font-bold text-secondary-foreground transition active:scale-95">{c}</button>
              ))}
            </div>
            <label className="block">
              <span className="sr-only">Як ти почуваєшся?</span>
              <textarea value={text} onChange={(e) => setText(e.target.value.slice(0, 500))} rows={3} placeholder="Сьогодні я…"
                className="w-full rounded-2xl border-2 border-border bg-background p-4 text-lg focus:outline-none focus:ring-4 focus:ring-ring" />
            </label>
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm text-muted-foreground">Слова не зберігаються. Їх читає Lovable AI, щоб підібрати вправу.</p>
              <Btn onClick={send} disabled={busy || text.trim().length < 2}>{busy ? "Думаю…" : "Підкажи"}</Btn>
            </div>
            {busy && (
              <div className="flex justify-center gap-2" aria-hidden>
                {[0, 1, 2].map((i) => <span key={i} className="h-3 w-3 rounded-full bg-honey animate-hop" style={{ animationDelay: `${i * 0.15}s` }} />)}
              </div>
            )}
            {res && !res.ok && (
              <p role="alert" className="rounded-2xl bg-secondary p-3 font-bold">{ERR[res.error] ?? "Щось не вийшло. Спробуй ще раз або обери вправу на мапі."}</p>
            )}
          </div>
        )}

        {s && (
          <div className="space-y-5">
            <div className="paper-card p-5 animate-pop">
              <p className="mb-3 text-center text-sm font-extrabold uppercase tracking-wide text-muted-foreground">Схоже на: {s.feeling}</p>
              <CharacterSay who={s.guide} mood={s.mood} size="lg" text={s.reply} />
            </div>
            {act && (
              <div className="paper-card space-y-3 p-5 animate-fade-up" style={{ animationDelay: ".3s" }}>
                <div className="flex items-center gap-4">
                  <img src={CHARACTERS[s.guide].image} alt="" className="h-20 w-auto animate-float" />
                  <div>
                    <p className="text-sm font-bold text-muted-foreground">{CHARACTERS[s.guide].name} пропонує:</p>
                    <p className="font-display text-2xl">{act.title}</p>
                    <p className="text-muted-foreground">{s.why}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Link to={`/${act.place}/$id` as "/meadow/$id"} params={{ id: act.id }} onClick={() => sfx("page")}
                    className="min-h-12 rounded-full bg-primary px-6 py-3 font-bold text-primary-foreground shadow-soft transition active:scale-95">Спробувати разом</Link>
                  <Btn variant="soft" onClick={() => { setRes(null); setText(""); }}>Розповісти ще</Btn>
                </div>
                <p className="text-sm text-muted-foreground">Це лише пропозиція. Можна обрати будь-що інше або просто відпочити.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </Scene>
  );
}
