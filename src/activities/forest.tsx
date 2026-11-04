import { CharacterSay } from '@/components/Character';
import { useState } from "react";
import { Btn, DoneCard } from "@/components/Scene";
import { Face } from "@/components/Face";
import { EMOTIONS, SCENARIOS, SORT_ITEMS } from "@/content/emotions";
import { markDone, pick, useStore } from "@/lib/store";
import { useT } from "@/lib/i18n";
import { CHARACTERS, castFor } from "@/content/characters";

/* 1. Meet the emotions */
export function EmotionGallery() {
  const t = useT();
  const [sel, setSel] = useState(EMOTIONS[0]!);
  const [seen, setSeen] = useState<Set<string>>(new Set([EMOTIONS[0]!.id]));
  const [done, setDone] = useState(false);
  if (done) return <DoneCard text={t("Ти познайомився з багатьма почуттями!")} again={() => setDone(false)} />;
  return (
    <div className="space-y-4">
      <div className="paper-card p-5 text-center">
        <Face {...sel.face} className={`mx-auto h-36 w-36 text-ink`} />
        <h2 className="mt-2 font-display text-3xl font-bold">{t(sel.name)}</h2>
        <div className="mt-3 text-left"><CharacterSay who="lihtaryk" size="sm" autoSpeak={false} text={t(sel.about)} /></div>
        <div className="mt-4 grid gap-3 text-left sm:grid-cols-2">
          <div className="rounded-2xl bg-secondary p-3">
            <p className="text-xs font-extrabold uppercase tracking-wide text-muted-foreground">{t("У тілі може бути")}</p>
            <ul className="mt-1 text-sm">{sel.body.map((b) => <li key={b}>• {t(b)}</li>)}</ul>
          </div>
          <div className="rounded-2xl bg-secondary p-3">
            <p className="text-xs font-extrabold uppercase tracking-wide text-muted-foreground">{t("Що може допомогти")}</p>
            <ul className="mt-1 text-sm">{sel.helps.map((b) => <li key={b}>• {t(b)}</li>)}</ul>
          </div>
        </div>
      </div>
      <div className="flex flex-wrap gap-2" role="listbox" aria-label={t("Список почуттів")}>
        {EMOTIONS.map((e) => (
          <button key={e.id} role="option" aria-selected={sel.id === e.id}
            onClick={() => { setSel(e); setSeen((s) => new Set(s).add(e.id)); }}
            className={`flex min-h-12 items-center gap-2 rounded-full px-4 font-bold transition ${sel.id === e.id ? "bg-primary text-primary-foreground" : "paper-card"}`}>
            <span className={`h-3 w-3 rounded-full ${e.color}`} />{t(e.name)}
          </button>
        ))}
      </div>
      <p className="text-center text-sm text-muted-foreground">{t("Усі почуття потрібні. Немає «поганих» почуттів.")}</p>
      {seen.size >= 5 && <div className="text-center"><Btn onClick={() => { markDone("forest-gallery"); setDone(true); }}>{t("Я познайомився")}</Btn></div>}
    </div>
  );
}

/* 2. Several feelings at once */
export function MixedFeelings() {
  const t = useT();
  const [i, setI] = useState(0);
  const [chosen, setChosen] = useState<string[]>([]);
  const [reveal, setReveal] = useState(false);
  const [done, setDone] = useState(false);
  const sc = SCENARIOS[i]!;
  if (done) return <DoneCard text={t("Почуття можуть змішуватися, як фарби.")} again={() => { setI(0); setDone(false); }} />;
  const toggle = (id: string) => setChosen((c) => (c.includes(id) ? c.filter((x) => x !== id) : [...c, id]));
  const next = () => {
    if (i + 1 >= SCENARIOS.length) { markDone("forest-mixed"); setDone(true); return; }
    setI(i + 1); setChosen([]); setReveal(false);
  };
  return (
    <div className="space-y-4">
      <div className="paper-card p-5">
        <p className="text-xs font-bold text-muted-foreground">{t("Історія {i} з {n}", { i: i + 1, n: SCENARIOS.length })}</p>
        <p className="mt-2 font-display text-xl">{t(sc.text)}</p>
        <p className="mt-3 text-sm text-muted-foreground">{t("Що він або вона може відчувати? Обирай скільки завгодно.")}</p>
      </div>
      {/* the guide holds the chosen feelings like balloons */}
      <div className="paper-card flex min-h-36 items-end gap-3 p-3" aria-label={t("Банка почуттів")} aria-live="polite">
        <img src={CHARACTERS[castFor("forest")[0]].image} alt="" className={`h-32 w-auto shrink-0 object-contain ${chosen.length ? "animate-act-breathe" : "animate-talk"}`} />
        <div className="flex flex-1 flex-wrap content-end items-end gap-2 self-stretch">
          {chosen.length === 0 && <span className="m-auto text-sm text-muted-foreground">{t("Банка почуттів поки порожня")}</span>}
          {chosen.map((id) => { const e = EMOTIONS.find((x) => x.id === id)!; return (
            <span key={id} className="flex animate-pop flex-col items-center">
              <span className={`flex h-14 w-14 items-center justify-center rounded-full ${e.color} shadow-soft animate-float`}><Face {...e.face} className="h-12 w-12" /></span>
              <span className="mt-0.5 text-xs font-bold">{t(e.name)}</span>
            </span>); })}
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {EMOTIONS.map((e) => (
          <button key={e.id} onClick={() => toggle(e.id)} aria-pressed={chosen.includes(e.id)}
            className={`min-h-12 rounded-full px-4 font-bold ${chosen.includes(e.id) ? "bg-primary text-primary-foreground" : "paper-card"}`}>{t(e.name)}</button>
        ))}
      </div>
      {!reveal ? (
        <Btn disabled={!chosen.length} onClick={() => setReveal(true)} className="w-full">{t("Готово")}</Btn>
      ) : (
        <div className="paper-card animate-fade-up p-4">
          <p className="font-bold">{chosen.length > 1 ? t("Так, кілька почуттів одночасно — це звично.") : t("Можливо, є й інші почуття поруч.")}</p>
          <p className="mt-1 text-sm">{t(sc.hint)}</p>
          <Btn onClick={next} className="mt-3">{t("Далі")}</Btn>
        </div>
      )}
    </div>
  );
}

/* 3. Where does the feeling live in the body */
/** Tap spots on the guide's picture (percent of the image box). */
const ZONES = [
  { id: "head", label: "Голова", spots: [[50, 15]] },
  { id: "throat", label: "Горло", spots: [[52, 29]] },
  { id: "chest", label: "Груди", spots: [[50, 39]] },
  { id: "belly", label: "Живіт", spots: [[50, 52]] },
  { id: "arms", label: "Руки", spots: [[12, 50], [88, 30]] },
  { id: "legs", label: "Ноги", spots: [[40, 84], [58, 84]] },
];
export function BodyMap() {
  const t = useT();
  const [emo, setEmo] = useState(EMOTIONS[2]!);
  const [marks, setMarks] = useState<Record<string, string[]>>({});
  const [done, setDone] = useState(false);
  const mine = marks[emo.id] ?? [];
  if (done) return <DoneCard text={t("Тіло часто першим підказує, що ти відчуваєш.")} again={() => { setMarks({}); setDone(false); }} />;
  return (
    <div className="space-y-4">
      <p className="paper-card p-4 text-base">{t("Обери почуття. Потім торкнися місць, де ти його відчуваєш. Правильних відповідей немає — у кожного по-своєму.")}</p>
      <div className="flex gap-2 overflow-x-auto pb-1">
        {EMOTIONS.slice(0, 6).map((e) => (
          <button key={e.id} onClick={() => setEmo(e)} aria-pressed={emo.id === e.id}
            className={`min-h-12 shrink-0 rounded-full px-4 font-bold ${emo.id === e.id ? "bg-primary text-primary-foreground" : "paper-card"}`}>{t(e.name)}</button>
        ))}
      </div>
      <div className="paper-card flex items-center gap-3 p-3">
        <div className="relative h-80 shrink-0" style={{ aspectRatio: "320 / 560" }} role="group" aria-label={t("Тіло")}>
          <img src={CHARACTERS.solomiya.image} alt={t(CHARACTERS.solomiya.name)} className="h-full w-full object-contain" />
          {ZONES.map((z) => {
            const on = mine.includes(z.id);
            const toggle = () => setMarks((m) => ({ ...m, [emo.id]: on ? mine.filter((x) => x !== z.id) : [...mine, z.id] }));
            return z.spots.map(([x, y], k) => (
              <button key={z.id + k} type="button" onClick={toggle} aria-label={t(z.label)} aria-pressed={on}
                className={`absolute h-12 w-12 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 transition active:scale-90 ${on ? `${emo.color} border-paper opacity-80 shadow-lift animate-glow-on` : "border-dashed border-ink/40 bg-paper/30"}`}
                style={{ left: `${x}%`, top: `${y}%` }} />
            ));
          })}
        </div>
        <div className="text-sm">
          <p className="font-display text-xl font-bold">{t(emo.name)}</p>
          <p className="mt-1 text-muted-foreground">{t("Часто відчувається як:")}</p>
          <ul className="mt-1">{emo.body.map((b) => <li key={b}>• {t(b)}</li>)}</ul>
          {mine.length > 0 && <p className="mt-3 font-semibold">{t("Ти позначив: {z}", { z: mine.map((m) => t(ZONES.find((z) => z.id === m)!.label.toLowerCase())).join(", ") })}</p>}
        </div>
      </div>
      {Object.keys(marks).length >= 2 && <Btn onClick={() => { markDone("forest-body"); setDone(true); }} className="w-full">{t("Завершити")}</Btn>}
    </div>
  );
}

/* 4. Thought, feeling or action */
const BASKETS = [
  { kind: "think", label: "Думка", note: "те, що каже голова" },
  { kind: "feel", label: "Почуття", note: "те, що відчуваєш" },
  { kind: "do", label: "Дія", note: "те, що робиш" },
] as const;
export function SortGame() {
  const t = useT();
  const [i, setI] = useState(0);
  const [fb, setFb] = useState<string | null>(null);
  const item = SORT_ITEMS[i]!;
  if (i >= SORT_ITEMS.length) return <DoneCard text={t("Ти вмієш розрізняти думки, почуття й дії!")} again={() => setI(0)} />;
  const choose = (k: string) => {
    const right = k === item.kind;
    setFb((right ? t("Так!") : t("Хм, подумай ще.")) + " " + t(explain(item.kind)));
    setTimeout(() => { setFb(null); const n = i + 1; if (n >= SORT_ITEMS.length) markDone("forest-sort"); setI(n); }, 2200);
  };
  return (
    <div className="space-y-5">
      <p className="text-sm text-muted-foreground">{t("Картка {i} з {n}", { i: i + 1, n: SORT_ITEMS.length })}</p>
      <div className="paper-card animate-fade-up p-8 text-center font-display text-2xl font-bold" key={i}>«{t(item.text)}»</div>
      <div className="grid grid-cols-3 gap-2">
        {BASKETS.map((b) => (
          <button key={b.kind} disabled={!!fb} onClick={() => choose(b.kind)} className="paper-card min-h-24 p-3 text-center active:scale-95">
            <span className="block font-bold">{t(b.label)}</span>
            <span className="block text-xs text-muted-foreground">{t(b.note)}</span>
          </button>
        ))}
      </div>
      {fb && <CharacterSay who="taras" size="sm" mood={fb.startsWith(t("Так!")) ? "cheer" : "think"} text={fb} />}
    </div>
  );
}
function explain(k: string) {
  return k === "feel" ? "Це почуття — його можна назвати одним словом." : k === "think" ? "Це думка — її можна перевірити: чи це точно правда?" : "Це дія — це те, що можна побачити збоку.";
}

/* 5. Saying how I feel */
const WHEN = ["мене перебивають", "щось не виходить", "я граю з друзями", "мене не беруть у гру", "я сам удома", "мене хвалять"];
const NEED = ["обійми", "трохи тиші", "щоб мене вислухали", "допомога", "побути разом", "ще трохи часу"];
export function Express() {
  const t = useT();
  const age = useStore((s) => s.age);
  const [f, setF] = useState<string>();
  const [w, setW] = useState<string>();
  const [n, setN] = useState<string>();
  const [done, setDone] = useState(false);
  if (done) return <DoneCard text={t("Коли ти кажеш про почуття — іншим легше тебе зрозуміти.")} again={() => { setF(undefined); setW(undefined); setN(undefined); setDone(false); }} />;
  const chip = (v: string, cur: string | undefined, set: (x: string) => void) => (
    <button key={v} onClick={() => set(v)} aria-pressed={cur === v} className={`min-h-11 rounded-full px-4 text-sm font-bold ${cur === v ? "bg-primary text-primary-foreground" : "bg-secondary"}`}>{t(v)}</button>
  );
  return (
    <div className="space-y-4">
      <CharacterSay who="taras" size="sm" mood={f && w && n ? "cheer" : "talk"} text={t(pick(age, { young: "Склади речення з трьох частин. Його можна сказати мамі, татові чи вчительці.", mid: "Склади «я-речення». Воно допомагає сказати про почуття без звинувачень.", older: "«Я-повідомлення» — спосіб говорити про себе, а не нападати на іншого. Спробуй скласти своє." }))} />
      <div className="paper-card space-y-3 p-4">
        <p className="font-bold">{t("Я відчуваю…")}</p>
        <div className="flex flex-wrap gap-2">{EMOTIONS.map((e) => chip(e.name.toLowerCase(), f, setF))}</div>
        <p className="font-bold">{t("коли…")}</p>
        <div className="flex flex-wrap gap-2">{WHEN.map((x) => chip(x, w, setW))}</div>
        <p className="font-bold">{t("Мені допоможе…")}</p>
        <div className="flex flex-wrap gap-2">{NEED.map((x) => chip(x, n, setN))}</div>
      </div>
      {f && w && n && (
        <div className="paper-card animate-fade-up p-5 text-center">
          <p className="font-display text-2xl">«{t("Я відчуваю {f}, коли {w}. Мені допоможе {n}.", { f: t(f), w: t(w), n: t(n) })}»</p>
          <Btn onClick={() => { markDone("forest-express"); setDone(true); }} className="mt-4">{t("Чудово сказано")}</Btn>
        </div>
      )}
    </div>
  );
}
