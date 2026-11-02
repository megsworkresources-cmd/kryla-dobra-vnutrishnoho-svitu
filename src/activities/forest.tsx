import { useState } from "react";
import { Btn, DoneCard } from "@/components/Scene";
import { Face } from "@/components/Face";
import { EMOTIONS, SCENARIOS, SORT_ITEMS } from "@/content/emotions";
import { markDone, pick, useStore } from "@/lib/store";

/* 1. Meet the emotions */
export function EmotionGallery() {
  const [sel, setSel] = useState(EMOTIONS[0]);
  const [seen, setSeen] = useState<Set<string>>(new Set([EMOTIONS[0].id]));
  const [done, setDone] = useState(false);
  if (done) return <DoneCard text="Ти познайомився з багатьма почуттями!" again={() => setDone(false)} />;
  return (
    <div className="space-y-4">
      <div className="paper-card p-5 text-center">
        <Face {...sel.face} className={`mx-auto h-36 w-36 text-ink`} />
        <h2 className="mt-2 font-display text-3xl font-bold">{sel.name}</h2>
        <p className="mt-2 text-base">{sel.about}</p>
        <div className="mt-4 grid gap-3 text-left sm:grid-cols-2">
          <div className="rounded-2xl bg-secondary p-3">
            <p className="text-xs font-extrabold uppercase tracking-wide text-muted-foreground">У тілі може бути</p>
            <ul className="mt-1 text-sm">{sel.body.map((b) => <li key={b}>• {b}</li>)}</ul>
          </div>
          <div className="rounded-2xl bg-secondary p-3">
            <p className="text-xs font-extrabold uppercase tracking-wide text-muted-foreground">Що може допомогти</p>
            <ul className="mt-1 text-sm">{sel.helps.map((b) => <li key={b}>• {b}</li>)}</ul>
          </div>
        </div>
      </div>
      <div className="flex flex-wrap gap-2" role="listbox" aria-label="Почуття">
        {EMOTIONS.map((e) => (
          <button key={e.id} role="option" aria-selected={sel.id === e.id}
            onClick={() => { setSel(e); setSeen((s) => new Set(s).add(e.id)); }}
            className={`flex min-h-12 items-center gap-2 rounded-full px-4 font-bold transition ${sel.id === e.id ? "bg-primary text-primary-foreground" : "paper-card"}`}>
            <span className={`h-3 w-3 rounded-full ${e.color}`} />{e.name}
          </button>
        ))}
      </div>
      <p className="text-center text-sm text-muted-foreground">Усі почуття потрібні. Немає «поганих» почуттів.</p>
      {seen.size >= 5 && <div className="text-center"><Btn onClick={() => { markDone("forest-gallery"); setDone(true); }}>Я познайомився</Btn></div>}
    </div>
  );
}

/* 2. Several feelings at once */
export function MixedFeelings() {
  const [i, setI] = useState(0);
  const [chosen, setChosen] = useState<string[]>([]);
  const [reveal, setReveal] = useState(false);
  const [done, setDone] = useState(false);
  const sc = SCENARIOS[i];
  if (done) return <DoneCard text="Почуття можуть змішуватися, як фарби." again={() => { setI(0); setDone(false); }} />;
  const toggle = (id: string) => setChosen((c) => (c.includes(id) ? c.filter((x) => x !== id) : [...c, id]));
  const next = () => {
    if (i + 1 >= SCENARIOS.length) { markDone("forest-mixed"); setDone(true); return; }
    setI(i + 1); setChosen([]); setReveal(false);
  };
  return (
    <div className="space-y-4">
      <div className="paper-card p-5">
        <p className="text-xs font-bold text-muted-foreground">Історія {i + 1} з {SCENARIOS.length}</p>
        <p className="mt-2 font-display text-xl">{sc.text}</p>
        <p className="mt-3 text-sm text-muted-foreground">Що він або вона може відчувати? Обирай скільки завгодно.</p>
      </div>
      {/* the feelings jar */}
      <div className="paper-card flex h-20 items-end gap-1 overflow-hidden p-2" aria-label="Банка почуттів">
        {chosen.length === 0 && <span className="m-auto text-sm text-muted-foreground">Банка почуттів поки порожня</span>}
        {chosen.map((id) => { const e = EMOTIONS.find((x) => x.id === id)!; return <span key={id} className={`flex-1 rounded-t-xl ${e.color} animate-fade-up`} style={{ height: "100%" }} title={e.name} />; })}
      </div>
      <div className="flex flex-wrap gap-2">
        {EMOTIONS.map((e) => (
          <button key={e.id} onClick={() => toggle(e.id)} aria-pressed={chosen.includes(e.id)}
            className={`min-h-12 rounded-full px-4 font-bold ${chosen.includes(e.id) ? "bg-primary text-primary-foreground" : "paper-card"}`}>{e.name}</button>
        ))}
      </div>
      {!reveal ? (
        <Btn disabled={!chosen.length} onClick={() => setReveal(true)} className="w-full">Готово</Btn>
      ) : (
        <div className="paper-card animate-fade-up p-4">
          <p className="font-bold">{chosen.length > 1 ? "Так, кілька почуттів одночасно — це звично." : "Можливо, є й інші почуття поруч."}</p>
          <p className="mt-1 text-sm">{sc.hint}</p>
          <Btn onClick={next} className="mt-3">Далі</Btn>
        </div>
      )}
    </div>
  );
}

/* 3. Where does the feeling live in the body */
const ZONES = [
  { id: "head", label: "Голова", d: "M50 6 a14 14 0 1 1 -0.1 0z" },
  { id: "throat", label: "Горло", d: "M44 34 h12 v8 h-12z" },
  { id: "chest", label: "Груди", d: "M30 44 h40 v22 h-40z" },
  { id: "belly", label: "Живіт", d: "M32 66 h36 v20 h-36z" },
  { id: "arms", label: "Руки", d: "M14 46 h14 v40 h-14z M72 46 h14 v40 h-14z" },
  { id: "legs", label: "Ноги", d: "M33 88 h14 v44 h-14z M53 88 h14 v44 h-14z" },
];
export function BodyMap() {
  const [emo, setEmo] = useState(EMOTIONS[2]);
  const [marks, setMarks] = useState<Record<string, string[]>>({});
  const [done, setDone] = useState(false);
  const mine = marks[emo.id] ?? [];
  if (done) return <DoneCard text="Тіло часто першим підказує, що ти відчуваєш." again={() => { setMarks({}); setDone(false); }} />;
  return (
    <div className="space-y-4">
      <p className="paper-card p-4 text-base">Обери почуття. Потім торкнися місць, де ти його відчуваєш. Правильних відповідей немає — у кожного по-своєму.</p>
      <div className="flex gap-2 overflow-x-auto pb-1">
        {EMOTIONS.slice(0, 6).map((e) => (
          <button key={e.id} onClick={() => setEmo(e)} aria-pressed={emo.id === e.id}
            className={`min-h-12 shrink-0 rounded-full px-4 font-bold ${emo.id === e.id ? "bg-primary text-primary-foreground" : "paper-card"}`}>{e.name}</button>
        ))}
      </div>
      <div className="paper-card flex items-center gap-4 p-4">
        <svg viewBox="0 0 100 136" className="h-80 w-auto shrink-0" role="group" aria-label="Тіло">
          {ZONES.map((z) => {
            const on = mine.includes(z.id);
            return (
              <path key={z.id} d={z.d} role="button" aria-label={z.label} aria-pressed={on} tabIndex={0}
                onClick={() => setMarks((m) => ({ ...m, [emo.id]: on ? mine.filter((x) => x !== z.id) : [...mine, z.id] }))}
                className={`cursor-pointer transition ${on ? emo.color.replace("bg-", "fill-") : "fill-muted"} stroke-border`} strokeWidth="1.5" rx="6" />
            );
          })}
        </svg>
        <div className="text-sm">
          <p className="font-display text-xl font-bold">{emo.name}</p>
          <p className="mt-1 text-muted-foreground">Часто відчувається як:</p>
          <ul className="mt-1">{emo.body.map((b) => <li key={b}>• {b}</li>)}</ul>
          {mine.length > 0 && <p className="mt-3 font-semibold">Ти позначив: {mine.map((m) => ZONES.find((z) => z.id === m)!.label.toLowerCase()).join(", ")}</p>}
        </div>
      </div>
      {Object.keys(marks).length >= 2 && <Btn onClick={() => { markDone("forest-body"); setDone(true); }} className="w-full">Завершити</Btn>}
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
  const [i, setI] = useState(0);
  const [fb, setFb] = useState<string | null>(null);
  const item = SORT_ITEMS[i];
  if (i >= SORT_ITEMS.length) return <DoneCard text="Ти вмієш розрізняти думки, почуття й дії!" again={() => setI(0)} />;
  const choose = (k: string) => {
    const right = k === item.kind;
    setFb(right ? "Так! " + explain(item.kind) : "Хм, подумай ще. " + explain(item.kind));
    setTimeout(() => { setFb(null); const n = i + 1; if (n >= SORT_ITEMS.length) markDone("forest-sort"); setI(n); }, 2200);
  };
  return (
    <div className="space-y-5">
      <p className="text-sm text-muted-foreground">Картка {i + 1} з {SORT_ITEMS.length}</p>
      <div className="paper-card animate-fade-up p-8 text-center font-display text-2xl font-bold" key={i}>«{item.text}»</div>
      <div className="grid grid-cols-3 gap-2">
        {BASKETS.map((b) => (
          <button key={b.kind} disabled={!!fb} onClick={() => choose(b.kind)} className="paper-card min-h-24 p-3 text-center active:scale-95">
            <span className="block font-bold">{b.label}</span>
            <span className="block text-xs text-muted-foreground">{b.note}</span>
          </button>
        ))}
      </div>
      {fb && <p className="paper-card animate-fade-up p-4 text-center font-semibold">{fb}</p>}
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
  const age = useStore((s) => s.age);
  const [f, setF] = useState<string>();
  const [w, setW] = useState<string>();
  const [n, setN] = useState<string>();
  const [done, setDone] = useState(false);
  if (done) return <DoneCard text="Коли ти кажеш про почуття — іншим легше тебе зрозуміти." again={() => { setF(undefined); setW(undefined); setN(undefined); setDone(false); }} />;
  const chip = (v: string, cur: string | undefined, set: (x: string) => void) => (
    <button key={v} onClick={() => set(v)} aria-pressed={cur === v} className={`min-h-11 rounded-full px-4 text-sm font-bold ${cur === v ? "bg-primary text-primary-foreground" : "bg-secondary"}`}>{v}</button>
  );
  return (
    <div className="space-y-4">
      <p className="paper-card p-4">{pick(age, { young: "Склади речення з трьох частин. Його можна сказати мамі, татові чи вчительці.", mid: "Склади «я-речення». Воно допомагає сказати про почуття без звинувачень.", older: "«Я-повідомлення» — спосіб говорити про себе, а не нападати на іншого. Спробуй скласти своє." })}</p>
      <div className="paper-card space-y-3 p-4">
        <p className="font-bold">Я відчуваю…</p>
        <div className="flex flex-wrap gap-2">{EMOTIONS.map((e) => chip(e.name.toLowerCase(), f, setF))}</div>
        <p className="font-bold">коли…</p>
        <div className="flex flex-wrap gap-2">{WHEN.map((x) => chip(x, w, setW))}</div>
        <p className="font-bold">Мені допоможе…</p>
        <div className="flex flex-wrap gap-2">{NEED.map((x) => chip(x, n, setN))}</div>
      </div>
      {f && w && n && (
        <div className="paper-card animate-fade-up p-5 text-center">
          <p className="font-display text-2xl">«Я відчуваю {f}, коли {w}. Мені допоможе {n}.»</p>
          <Btn onClick={() => { markDone("forest-express"); setDone(true); }} className="mt-4">Чудово сказано</Btn>
        </div>
      )}
    </div>
  );
}
